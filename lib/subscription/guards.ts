/**
 * Premium 권한 가드 — Sprint V2 P3.E + P5 (CA2-I3).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §6.5
 *
 * NextAuth session.user.tier 또는 Firestore users.{uid}.tier 검증.
 *
 * shouldShowAds 우선순위 (높은 → 낮음):
 *  1. anonymous (no session)           → no_consent (PIPA: 미동의 사용자 광고 금지)
 *  2. banned                            → banned    (페널티 사용자에게 광고 송출 → 모더레이션 정책 위배)
 *  3. admin                             → admin     (운영자는 광고 무관)
 *  4. premium                           → premium   (구독자 광고 제거)
 *  5. !advertisingConsent               → no_consent (PIPA 5번째 동의 미체크)
 *  6. show
 */

import type { Session } from 'next-auth';

export function isPremium(session: Session | null): boolean {
  if (!session?.user) return false;
  // session.user.tier (JWT hydrate에서 채움)
  return (session.user as unknown as { tier?: string }).tier === 'premium';
}

export type AdsBlockReason =
  | 'anonymous'
  | 'banned'
  | 'admin'
  | 'premium'
  | 'no_consent';

export interface ShouldShowAdsResult {
  readonly show: boolean;
  readonly reason?: AdsBlockReason;
}

export function shouldShowAds(session: Session | null): ShouldShowAdsResult {
  // CA2-I3: anonymous는 'no_consent'가 아닌 명시적 'anonymous' 분기 — 로그 분석 / GA4 분기 가능.
  if (!session?.user) return { show: false, reason: 'anonymous' };

  // CA2-I3: banned 사용자는 광고/수익화 대상 제외 (모더레이션 정책).
  const role = session.user.role;
  if (role === 'banned') return { show: false, reason: 'banned' };
  if (role === 'admin') return { show: false, reason: 'admin' };

  if (isPremium(session)) return { show: false, reason: 'premium' };
  if (!session.user.advertisingConsent) return { show: false, reason: 'no_consent' };
  return { show: true };
}
