/**
 * F3.6 프리미엄 구독 — Toss Payments + Firestore subscriptions.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §6
 */

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'pending';
export type SubscriptionPlan = 'premium_monthly';
export type PaymentProvider = 'toss';

export interface SubscriptionDoc {
  readonly id: string;
  readonly uid: string;
  readonly plan: SubscriptionPlan;
  readonly status: SubscriptionStatus;
  readonly provider: PaymentProvider;
  readonly tossCustomerKey: string;
  readonly tossBillingKey?: string; // 자동결제용 (Toss SuperPay)
  readonly startedAtMs: number;
  readonly currentPeriodStartMs: number;
  readonly currentPeriodEndMs: number;
  readonly canceledAtMs?: number;
  readonly nextChargeAtMs?: number;
  readonly amount: number; // 4900
  readonly currency: 'KRW';
}

export interface PaymentHistoryDoc {
  readonly id: string;
  readonly uid: string;
  readonly subscriptionId: string;
  readonly orderId: string;
  readonly paymentKey: string;
  readonly status: 'completed' | 'failed' | 'canceled';
  readonly amount: number;
  readonly currency: 'KRW';
  readonly method?: string; // card / virtual_account / etc
  readonly paidAtMs: number;
  readonly failureReason?: string;
}

export const SUBSCRIPTION_PRICE: { readonly [K in SubscriptionPlan]: { amount: number; currency: 'KRW' } } = {
  premium_monthly: { amount: 4900, currency: 'KRW' },
};

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: '구독 중',
  canceled: '취소 (기간 만료까지 유지)',
  expired: '만료',
  pending: '결제 진행 중',
};

export const SUBSCRIPTION_STATUS_COLOR: Record<
  SubscriptionStatus,
  'jade' | 'bronze' | 'muted' | 'vermilion'
> = {
  active: 'jade',
  canceled: 'bronze',
  expired: 'muted',
  pending: 'bronze',
};

/** premium 권한 확인 */
export function isActivePremium(
  status: SubscriptionStatus | undefined,
  periodEndMs: number | undefined,
): boolean {
  if (!status) return false;
  if (status === 'active') return true;
  if (status === 'canceled' && periodEndMs && periodEndMs > Date.now()) return true;
  return false;
}
