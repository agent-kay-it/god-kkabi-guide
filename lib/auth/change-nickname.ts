/**
 * 닉네임 변경 Server Action — 마스터 V2 F3.6.
 * 출처: docs/sprint/21-sprint-coverage-master-v2-qa/design.md §5
 *
 * 정책:
 *  - 30일 1회 변경 (cooldown)
 *  - 2-12자, 한글/영문/숫자/언더스코어
 *  - users.nickname unique (간단한 client-side check + 트랜잭션 race)
 *  - nickname_history 컬렉션 기록 (이전 닉네임 + 변경 시각)
 *  - claim 재발급 (RTDB rules 의 nickname token 동기화)
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from './auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { setUserClaimsWithRetry } from '@/lib/firebase/claims-retry-queue';

export const NICKNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30일

const NicknameInputSchema = z
  .object({
    newNickname: z
      .string()
      .trim()
      .min(2, '닉네임은 2자 이상')
      .max(12, '닉네임은 최대 12자')
      .regex(/^[가-힣a-zA-Z0-9_]+$/, '한글/영문/숫자/_ 만 허용'),
  })
  .strict();

export type ChangeNicknameResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'ADMIN_NOT_CONFIGURED'
        | 'VALIDATION_FAILED'
        | 'COOLDOWN'
        | 'DUPLICATE'
        | 'INTERNAL';
      message?: string;
      cooldownRemainingMs?: number;
    };

export async function changeNickname(
  input: { newNickname: string },
): Promise<ChangeNicknameResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'UNAUTHENTICATED' };
  if (!session.user.registered) return { ok: false, error: 'NOT_REGISTERED' };
  if (!hasAdminCredentials()) return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };

  const parsed = NicknameInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_FAILED',
      message: parsed.error.issues[0]?.message ?? '입력 오류',
    };
  }
  const newNickname = parsed.data.newNickname;

  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(session.user.id);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return { ok: false, error: 'NOT_REGISTERED' };

    const userData = userSnap.data() as {
      nickname?: string;
      nicknameChangedAtMs?: number;
      serverId?: string;
      munpa?: string;
    };
    const oldNickname = userData.nickname ?? '';

    // 같은 닉네임 시도 → VALIDATION_FAILED (변경 의미 없음)
    if (oldNickname === newNickname) {
      return { ok: false, error: 'VALIDATION_FAILED', message: '현재 닉네임과 동일' };
    }

    // 30일 cooldown 검증
    const lastChangedMs = userData.nicknameChangedAtMs ?? 0;
    const elapsed = Date.now() - lastChangedMs;
    if (lastChangedMs > 0 && elapsed < NICKNAME_COOLDOWN_MS) {
      return {
        ok: false,
        error: 'COOLDOWN',
        cooldownRemainingMs: NICKNAME_COOLDOWN_MS - elapsed,
      };
    }

    // duplicate 검사 (users 컬렉션에서 같은 nickname 보유자 확인)
    const dupSnap = await db
      .collection('users')
      .where('nickname', '==', newNickname)
      .limit(1)
      .get();
    if (!dupSnap.empty && dupSnap.docs[0]?.id !== session.user.id) {
      return { ok: false, error: 'DUPLICATE' };
    }

    // 트랜잭션: users.nickname update + nickname_history 기록
    await db.runTransaction(async (tx) => {
      tx.update(userRef, {
        nickname: newNickname,
        nicknameChangedAtMs: Date.now(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const historyRef = db.collection('nickname_history').doc();
      tx.set(historyRef, {
        id: historyRef.id,
        uid: session.user.id,
        oldNickname,
        newNickname,
        changedAtMs: Date.now(),
        changedAt: FieldValue.serverTimestamp(),
      });
    });

    // claim 재발급 (RTDB rules 동기화)
    await setUserClaimsWithRetry(session.user.id, {
      role: (session.user.role as 'admin' | 'user' | 'banned' | undefined) ?? 'user',
      registered: true,
      ...(userData.serverId ? { serverId: userData.serverId } : { serverId: '' }),
      ...(userData.serverId && userData.munpa
        ? { munpaId: `${userData.serverId}_${userData.munpa}` }
        : { munpaId: '' }),
    });

    revalidatePath('/me');
    return { ok: true };
  } catch (err) {
    console.error('[lib/auth/change-nickname] failed', err);
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}
