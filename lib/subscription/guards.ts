/**
 * Premium 권한 가드 — Sprint V2 P3.E.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §6.5
 *
 * NextAuth session.user.tier 또는 Firestore users.{uid}.tier 검증.
 */

import type { Session } from 'next-auth';

export function isPremium(session: Session | null): boolean {
  if (!session?.user) return false;
  // session.user.tier (JWT hydrate에서 채움)
  return (session.user as unknown as { tier?: string }).tier === 'premium';
}

export function shouldShowAds(session: Session | null): {
  show: boolean;
  reason?: 'admin' | 'premium' | 'no_consent';
} {
  if (!session?.user) return { show: false, reason: 'no_consent' }; // 로그아웃 사용자: 동의 모름 → 안전하게 차단 (PIPA)
  const role = session.user.role;
  if (role === 'admin') return { show: false, reason: 'admin' };
  if (isPremium(session)) return { show: false, reason: 'premium' };
  if (!session.user.advertisingConsent) return { show: false, reason: 'no_consent' };
  return { show: true };
}
