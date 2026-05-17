/**
 * 회원 탈퇴 Server Action — PIPA 30일 cooldown 패턴.
 * 출처: docs/sprint/10-sprint-launch/prd.md §F1.5 + 개인정보 보호법 30조
 *
 * 흐름:
 *  1. 세션 + 등록 상태 검증
 *  2. 확인 토큰 검증 (사용자가 닉네임 + "탈퇴" 키워드 정확히 입력했는지)
 *  3. Firestore 트랜잭션:
 *     - users/{uid}: status='pending_deletion', deletionRequestedAt, anonymized 표시
 *     - 닉네임/사진은 즉시 익명화 ("삭제된 사용자", null)
 *     - 카운트 감소: servers, munpas, chat_channels memberCount--
 *  4. Firebase Auth custom claims revoke (registered=false)
 *  5. NextAuth signOut (client에서 수행)
 *  6. 30일 cron job (별도) — pending_deletion 상태 + 30일 경과 시 hard delete
 *
 * 즉시 익명화 vs Hard delete의 trade-off:
 *  - 즉시 익명화: 사용자 프로필은 보호하되, 게시물/댓글은 익명 표시로 보존 → 커뮤니티 가치 유지
 *  - 30일 후 hard delete: 복구 의사 확인 + 분쟁 대비 → 완전 삭제
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { auth, signOut } from '@/lib/auth/auth';
import {
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import { setUserClaimsWithRetry } from '@/lib/firebase/claims-retry-queue';

export type DeleteAccountResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'CONFIRMATION_FAILED'
        | 'ADMIN_NOT_CONFIGURED'
        | 'INTERNAL';
      message?: string;
    };

export interface DeleteAccountInput {
  /** 사용자가 입력한 닉네임 — Firestore 닉네임과 일치해야 함 */
  readonly nicknameConfirm: string;
  /** 사용자가 입력한 "탈퇴" 키워드 */
  readonly keywordConfirm: string;
}

const REQUIRED_KEYWORD = '탈퇴';

export async function requestAccountDeletion(
  input: DeleteAccountInput,
): Promise<DeleteAccountResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return { ok: false, error: 'UNAUTHENTICATED' };
  }
  if (!session.user?.registered) {
    return { ok: false, error: 'NOT_REGISTERED' };
  }

  if (!hasAdminCredentials()) {
    return {
      ok: false,
      error: 'ADMIN_NOT_CONFIGURED',
      message:
        'Firebase Admin SDK 자격증명 미설정. 운영자에게 문의해주세요.',
    };
  }

  const db = getAdminFirestore();

  try {
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    if (!snap.exists) {
      return {
        ok: false,
        error: 'NOT_REGISTERED',
        message: '사용자 문서가 없습니다.',
      };
    }
    const data = snap.data() ?? {};
    const currentNickname = (data.nickname as string | undefined) ?? '';
    const serverId = (data.serverId as string | undefined) ?? '';
    const munpa = (data.munpa as string | undefined) ?? '';

    // 2) 2단계 확인
    if (input.nicknameConfirm.trim() !== currentNickname) {
      return {
        ok: false,
        error: 'CONFIRMATION_FAILED',
        message: '닉네임이 일치하지 않습니다.',
      };
    }
    if (input.keywordConfirm.trim() !== REQUIRED_KEYWORD) {
      return {
        ok: false,
        error: 'CONFIRMATION_FAILED',
        message: `"${REQUIRED_KEYWORD}" 를 정확히 입력해주세요.`,
      };
    }

    // 이미 탈퇴 진행 중인 경우 (idempotent)
    if (data.status === 'pending_deletion') {
      return { ok: true };
    }

    // 3) Firestore 트랜잭션
    const munpaDocId = serverId && munpa ? `${serverId}_${munpa}` : null;
    const serverChannelId = serverId ? `server:${serverId}` : null;
    const munpaChannelId = serverId && munpa ? `munpa:${serverId}:${munpa}` : null;

    await db.runTransaction(async (tx) => {
      const refs = {
        user: userRef,
        server: serverId ? db.collection('servers').doc(serverId) : null,
        munpa: munpaDocId ? db.collection('munpas').doc(munpaDocId) : null,
        serverChannel: serverChannelId
          ? db.collection('chat_channels').doc(serverChannelId)
          : null,
        munpaChannel: munpaChannelId
          ? db.collection('chat_channels').doc(munpaChannelId)
          : null,
      };

      // ── READS (PIPA 30일 cooldown 사용 시 필요한 doc만 확인)
      if (refs.server) await tx.get(refs.server);
      if (refs.munpa) await tx.get(refs.munpa);
      if (refs.serverChannel) await tx.get(refs.serverChannel);
      if (refs.munpaChannel) await tx.get(refs.munpaChannel);

      const now = FieldValue.serverTimestamp();

      // ── WRITES — users 익명화 + pending_deletion 상태
      tx.update(refs.user, {
        status: 'pending_deletion',
        deletionRequestedAt: now,
        // 익명화 — 닉네임/사진/게임 정보 보존하되 표시는 마스킹.
        // hard-delete 는 30일 cron job 에서 수행.
        nickname: '삭제된 사용자',
        photoURL: null,
        registered: false,
        updatedAt: now,
      });

      // 카운트 감소
      if (refs.server) {
        tx.update(refs.server, {
          userCount: FieldValue.increment(-1),
          updatedAt: now,
        });
      }
      if (refs.munpa) {
        tx.update(refs.munpa, {
          memberCount: FieldValue.increment(-1),
          updatedAt: now,
        });
      }
      if (refs.serverChannel) {
        tx.update(refs.serverChannel, {
          memberCount: FieldValue.increment(-1),
        });
      }
      if (refs.munpaChannel) {
        tx.update(refs.munpaChannel, {
          memberCount: FieldValue.increment(-1),
        });
      }
    });

    // 4) Firebase Auth claims revoke — RTDB / Firestore rules 에서 즉시 차단
    await setUserClaimsWithRetry(uid, { role: 'user', registered: false });

    // 5) NextAuth signOut (server-side) — JWT cookie 즉시 삭제
    await signOut({ redirect: false });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN';
    return { ok: false, error: 'INTERNAL', message };
  }
}
