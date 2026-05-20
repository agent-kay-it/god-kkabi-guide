/**
 * 사용자 보유 진령 조회 — Sprint 23 F23-A (F3.5 owned source).
 *
 * Firestore `users/{uid}.ownedJinryeong` 필드를 읽음.
 * 미설정 시 빈 배열 반환 (recommendBuilds 의 익명 fallback 동일).
 */
import 'server-only';

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import type { WikiJinryeongId } from '@/types/wiki';

interface UserOwnedDoc {
  readonly ownedJinryeong?: readonly WikiJinryeongId[];
}

export async function getUserOwnedJinryeong(
  uid: string | undefined | null,
): Promise<readonly WikiJinryeongId[]> {
  if (!uid || !hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('users').doc(uid).get();
    if (!snap.exists) return [];
    const data = snap.data() as UserOwnedDoc | undefined;
    return data?.ownedJinryeong ?? [];
  } catch (err) {
    console.error('[lib/auth/user-owned] getUserOwnedJinryeong:', err);
    return [];
  }
}
