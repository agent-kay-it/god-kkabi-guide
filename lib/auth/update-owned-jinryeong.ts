/**
 * Server Action — 사용자 보유 진령 갱신 (Sprint 26 F26-B).
 *
 * Firestore `users/{uid}.ownedJinryeong` 배열 + `ownedJinryeongUpdatedAt` 기록.
 * Sprint 23 F23-A `getUserOwnedJinryeong` 와 짝.
 *
 * 보안:
 *  - NextAuth session 필수
 *  - registered=true 사용자만 (Sprint 25 정책)
 *  - banned 사용자 거부
 *  - Zod validate (uid format + max 20)
 *  - 진령 id 화이트리스트 (data/wiki/jinryeong WIKI_JINRYEONG_SEED 의 11 id)
 */
'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { WIKI_JINRYEONG_SEED } from '@/data/wiki/jinryeong';
import type { WikiJinryeongId } from '@/types/wiki';

const VALID_JINRYEONG_IDS = new Set<string>(WIKI_JINRYEONG_SEED.map((j) => j.id));

const InputSchema = z.object({
  uids: z
    .array(z.string())
    .max(20, '진령 id 는 최대 20개')
    .refine(
      (arr) => arr.every((id) => VALID_JINRYEONG_IDS.has(id)),
      '유효하지 않은 진령 id 가 포함됨',
    ),
});

export type UpdateOwnedResult =
  | { ok: true; saved: readonly WikiJinryeongId[] }
  | { ok: false; error: string };

export async function updateOwnedJinryeong(
  input: { uids: string[] },
): Promise<UpdateOwnedResult> {
  // 1. 인증
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'UNAUTHENTICATED' };
  if (!session?.user?.registered) {
    return { ok: false, error: 'NOT_REGISTERED' };
  }
  if (session.user.role === 'banned') {
    return { ok: false, error: 'BANNED' };
  }

  // 2. Zod 검증
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'INVALID_INPUT' };
  }

  // 3. 자격증명 가드
  if (!hasAdminCredentials()) {
    return { ok: false, error: 'NO_CREDENTIALS' };
  }

  // 4. 중복 제거 + 정렬
  const dedup = Array.from(new Set(parsed.data.uids)).sort();

  // 5. Firestore set merge
  try {
    const db = getAdminFirestore();
    await db.collection('users').doc(uid).set(
      {
        ownedJinryeong: dedup,
        ownedJinryeongUpdatedAt: Date.now(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error('[updateOwnedJinryeong] Firestore set 실패:', err);
    return { ok: false, error: 'INTERNAL' };
  }

  // 6. /me + /simulator 캐시 무효화
  revalidatePath('/me');
  revalidatePath('/simulator');

  return { ok: true, saved: dedup as readonly WikiJinryeongId[] };
}
