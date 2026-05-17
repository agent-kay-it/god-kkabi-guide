/**
 * 사용자 프로필 수정 Server Action — Firestore 트랜잭션.
 * 출처: docs/sprint/10-sprint-launch/prd.md §F1.4 + register.ts 패턴 재사용
 *
 * 흐름:
 *  1. 세션 + 등록 상태 검증
 *  2. Zod 검증 (4필드)
 *  3. 닉네임 변경 시 server-scope unique 검증
 *  4. Firestore 트랜잭션:
 *     - users/{uid} update (4 필드 + updatedAt)
 *     - serverId 변경 시: servers/{old} userCount--, servers/{new} userCount++
 *     - munpa 변경 또는 serverId 변경 시: munpas/{old}.memberCount--, munpas/{new} memberCount++
 *     - chat_channels: 동일하게 server/munpa 채널 memberCount 갱신
 *  5. 신규 munpa인 경우 servers/{new}.munpaCount++
 *  6. (client에서) /api/auth/session?update=true 호출하여 JWT 재-hydrate
 *
 * 수정 불가 필드:
 *  - gameUid (게임 식별자 — 변경 시 데이터 정합성 깨짐)
 *  - email / displayName / photoURL (Google OAuth 출처)
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { auth } from '@/lib/auth/auth';
import {
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import { setUserClaimsWithRetry } from '@/lib/firebase/claims-retry-queue';
import {
  ProfileEditSchema,
  type ProfileEditInput,
  type ProfileEditResult,
} from './profile-schema';

export async function updateProfile(
  raw: unknown,
): Promise<ProfileEditResult> {
  // 1) 세션
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return { ok: false, error: 'UNAUTHENTICATED' };
  }
  if (!session.user?.registered) {
    return { ok: false, error: 'NOT_REGISTERED' };
  }

  // 2) Zod
  const parsed = ProfileEditSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ProfileEditInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ProfileEditInput | undefined;
      if (key) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: 'VALIDATION_FAILED', fieldErrors };
  }
  const input = parsed.data;

  // 3) Admin SDK
  if (!hasAdminCredentials()) {
    return {
      ok: false,
      error: 'ADMIN_NOT_CONFIGURED',
      message:
        'Firebase Admin SDK 자격증명 미설정. 운영자가 FIREBASE_SERVICE_ACCOUNT_JSON 환경변수 설정 후 재시도',
    };
  }

  const db = getAdminFirestore();

  try {
    // 4) 현재 doc 읽기 (변경 감지용)
    const userRef = db.collection('users').doc(uid);
    const currentSnap = await userRef.get();
    if (!currentSnap.exists) {
      return {
        ok: false,
        error: 'NOT_REGISTERED',
        message: '사용자 문서가 없습니다. 다시 로그인해주세요.',
      };
    }
    const current = currentSnap.data() ?? {};
    const prevServerId = (current.serverId as string | undefined) ?? '';
    const prevMunpa = (current.munpa as string | undefined) ?? '';
    const prevNickname = (current.nickname as string | undefined) ?? '';

    const serverChanged = prevServerId !== input.serverId;
    const munpaChanged = prevMunpa !== input.munpa;
    const nicknameChanged = prevNickname !== input.nickname;

    // 5) 닉네임 변경 시 server-scope unique 검증
    if (nicknameChanged || serverChanged) {
      const dupSnap = await db
        .collection('users')
        .where('serverId', '==', input.serverId)
        .where('nickname', '==', input.nickname)
        .limit(1)
        .get();
      const isOnlyMe =
        dupSnap.empty ||
        (dupSnap.size === 1 && dupSnap.docs[0]?.id === uid);
      if (!isOnlyMe) {
        return {
          ok: false,
          error: 'NICKNAME_TAKEN_IN_SERVER',
          fieldErrors: { nickname: '해당 서버에 이미 사용 중인 닉네임' },
        };
      }
    }

    // 6) 트랜잭션
    const prevMunpaDocId = prevServerId && prevMunpa ? `${prevServerId}_${prevMunpa}` : null;
    const nextMunpaDocId = `${input.serverId}_${input.munpa}`;
    const prevMunpaChannelId = prevServerId && prevMunpa ? `munpa:${prevServerId}:${prevMunpa}` : null;
    const nextMunpaChannelId = `munpa:${input.serverId}:${input.munpa}`;

    await db.runTransaction(async (tx) => {
      const prevServerRef = serverChanged && prevServerId
        ? db.collection('servers').doc(prevServerId)
        : null;
      const nextServerRef = db.collection('servers').doc(input.serverId);
      const prevMunpaRef = prevMunpaDocId && (prevMunpaDocId !== nextMunpaDocId)
        ? db.collection('munpas').doc(prevMunpaDocId)
        : null;
      const nextMunpaRef = db.collection('munpas').doc(nextMunpaDocId);
      const prevMunpaChannelRef =
        prevMunpaChannelId && (prevMunpaChannelId !== nextMunpaChannelId)
          ? db.collection('chat_channels').doc(prevMunpaChannelId)
          : null;
      const nextMunpaChannelRef = db
        .collection('chat_channels')
        .doc(nextMunpaChannelId);
      const nextServerChannelRef = db
        .collection('chat_channels')
        .doc(`server:${input.serverId}`);
      const prevServerChannelRef =
        serverChanged && prevServerId
          ? db.collection('chat_channels').doc(`server:${prevServerId}`)
          : null;

      // ── READS (트랜잭션 규칙: 모든 read는 write 이전).
      // 명시적 Promise.all + 개별 변수로 타입 narrowing 보장.
      const [
        nextServerSnap,
        nextMunpaSnap,
        nextMunpaChSnap,
        nextServerChSnap,
      ] = await Promise.all([
        tx.get(nextServerRef),
        tx.get(nextMunpaRef),
        tx.get(nextMunpaChannelRef),
        tx.get(nextServerChannelRef),
      ]);
      if (prevServerRef) await tx.get(prevServerRef);
      if (prevMunpaRef) await tx.get(prevMunpaRef);
      if (prevMunpaChannelRef) await tx.get(prevMunpaChannelRef);
      if (prevServerChannelRef) await tx.get(prevServerChannelRef);

      const now = FieldValue.serverTimestamp();

      // ── WRITES — users 업데이트
      tx.update(userRef, {
        serverId: input.serverId,
        munpa: input.munpa,
        nickname: input.nickname,
        classId: input.classId,
        updatedAt: now,
      });

      // server 이동 (decrement old, increment new)
      if (serverChanged && prevServerRef) {
        tx.update(prevServerRef, {
          userCount: FieldValue.increment(-1),
          updatedAt: now,
        });
      }
      tx.set(
        nextServerRef,
        {
          id: input.serverId,
          userCount: nextServerSnap.exists ? FieldValue.increment(serverChanged ? 1 : 0) : 1,
          munpaCount: nextServerSnap.exists ? nextServerSnap.data()?.munpaCount ?? 0 : 0,
          createdAt: nextServerSnap.exists ? nextServerSnap.data()?.createdAt ?? now : now,
          updatedAt: now,
        },
        { merge: true },
      );

      // munpa 이동
      if (prevMunpaRef) {
        tx.update(prevMunpaRef, {
          memberCount: FieldValue.increment(-1),
          updatedAt: now,
        });
      }
      const munpaShouldIncrement = munpaChanged || serverChanged;
      tx.set(
        nextMunpaRef,
        {
          id: nextMunpaDocId,
          serverId: input.serverId,
          name: input.munpa,
          memberCount: nextMunpaSnap.exists
            ? FieldValue.increment(munpaShouldIncrement ? 1 : 0)
            : 1,
          createdAt: nextMunpaSnap.exists ? nextMunpaSnap.data()?.createdAt ?? now : now,
          updatedAt: now,
        },
        { merge: true },
      );

      // 신규 munpa 생성 → server.munpaCount++
      if (!nextMunpaSnap.exists) {
        tx.update(nextServerRef, { munpaCount: FieldValue.increment(1) });
      }

      // chat_channels — server (serverId 변경 시만 이동)
      if (prevServerChannelRef) {
        tx.update(prevServerChannelRef, {
          memberCount: FieldValue.increment(-1),
        });
      }
      tx.set(
        nextServerChannelRef,
        {
          id: `server:${input.serverId}`,
          type: 'server',
          serverId: input.serverId,
          memberCount: nextServerChSnap.exists
            ? FieldValue.increment(serverChanged ? 1 : 0)
            : 1,
          isActive: true,
          createdAt: nextServerChSnap.exists
            ? nextServerChSnap.data()?.createdAt ?? now
            : now,
        },
        { merge: true },
      );

      // chat_channels — munpa
      if (prevMunpaChannelRef) {
        tx.update(prevMunpaChannelRef, {
          memberCount: FieldValue.increment(-1),
        });
      }
      tx.set(
        nextMunpaChannelRef,
        {
          id: nextMunpaChannelId,
          type: 'munpa',
          serverId: input.serverId,
          munpaName: input.munpa,
          memberCount: nextMunpaChSnap.exists
            ? FieldValue.increment(munpaShouldIncrement ? 1 : 0)
            : 1,
          isActive: true,
          createdAt: nextMunpaChSnap.exists
            ? nextMunpaChSnap.data()?.createdAt ?? now
            : now,
        },
        { merge: true },
      );
    });

    // Sprint 10 Phase E (Task #23): 서버/문파 변경 시 Firebase custom claims도
    // 갱신해야 RTDB chat 채널 권한이 즉시 새 위치로 이동한다. JWT는 다음 session
    // refresh 시 jwt() 콜백에서 hydrate되지만, Firebase Auth claims는 별도 sync.
    if (serverChanged || munpaChanged) {
      await setUserClaimsWithRetry(uid, {
        role: 'user',
        registered: true,
        serverId: input.serverId,
        munpaId: `${input.serverId}_${input.munpa}`,
      });
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN';
    return { ok: false, error: 'INTERNAL', message };
  }
}
