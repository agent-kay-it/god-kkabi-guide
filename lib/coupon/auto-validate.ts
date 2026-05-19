/**
 * 쿠폰 자동 검증 정책 — Sprint 19 F19-H (마스터 V2 F3.4 1차).
 * 출처: docs/sprint/19-sprint-coverage-deploy/design.md §6
 *
 * 목적: pending 쿠폰의 vote 누적 / 시간 경과를 보고
 *       자동으로 verified / disabled / noop 결정을 내림.
 *
 * 본 모듈은 pure function 만 export — Server Action 또는 cron worker 가 호출.
 * Firestore 의존 없음 (테스트 용이성).
 */

import type { CouponStatus } from '@/types/coupon';

/** 자동 검증 결정 결과 */
export type CouponValidationDecision =
  | { readonly type: 'auto_disable'; readonly reason: AutoDisableReason }
  | { readonly type: 'auto_enable'; readonly reason: 'majority_upvote' }
  | { readonly type: 'noop'; readonly reason: NoopReason };

export type AutoDisableReason = 'majority_downvote' | 'expired' | 'stale_pending';
export type NoopReason = 'insufficient_votes' | 'within_grace_period' | 'already_terminal';

export interface CouponValidationInput {
  readonly votesUp: number;
  readonly votesDown: number;
  readonly status: CouponStatus;
  readonly createdAtMs: number;
  /** 무한 만료는 undefined */
  readonly expiresAtMs?: number;
  /** 현재 시각 (테스트 결정성을 위해 명시 입력) */
  readonly nowMs: number;
}

/**
 * 임계값 — Sprint 19 design.md §6.2.
 *
 * - DOWNVOTE_FACTOR=2: downvote 가 upvote 의 2배 초과
 * - MIN_DOWNVOTES=5: 최소 5표 누적 (noise 차단)
 * - MIN_UPVOTES=3: 최소 3표 (small sample 도 신뢰)
 * - GRACE_PERIOD_MS=1h: 최초 1시간은 vote 누적기간 보장
 * - STALE_AFTER_MS=24h: 24시간 vote 없으면 stale
 */
export const COUPON_AUTO_VALIDATE_THRESHOLDS = {
  DOWNVOTE_FACTOR: 2,
  MIN_DOWNVOTES: 5,
  UPVOTE_FACTOR: 2,
  MIN_UPVOTES: 3,
  GRACE_PERIOD_MS: 1000 * 60 * 60, // 1시간
  STALE_AFTER_MS: 1000 * 60 * 60 * 24, // 24시간
} as const;

/**
 * 자동 검증 결정.
 *
 * 우선순위 (먼저 매칭되는 분기가 결정):
 *  1. expired — expiresAtMs < nowMs → auto_disable
 *  2. already_terminal — verified / rejected / disabled 는 noop
 *  3. within_grace_period — createdAt 으로부터 1시간 이내 → noop
 *  4. majority_downvote — downvotes > upvotes*2 AND downvotes >= 5 → auto_disable
 *  5. majority_upvote — upvotes >= 3 AND upvotes > downvotes*2 → auto_enable
 *  6. stale_pending — 24시간 경과 + votes 0 → auto_disable
 *  7. insufficient_votes — 그 외 → noop
 */
export function decideCouponValidation(
  input: CouponValidationInput,
): CouponValidationDecision {
  const T = COUPON_AUTO_VALIDATE_THRESHOLDS;
  const totalVotes = input.votesUp + input.votesDown;
  const elapsed = input.nowMs - input.createdAtMs;

  // 1. expired
  if (input.expiresAtMs !== undefined && input.expiresAtMs < input.nowMs) {
    return { type: 'auto_disable', reason: 'expired' };
  }

  // 2. terminal status (verified / rejected / disabled / expired)
  if (input.status !== 'pending') {
    return { type: 'noop', reason: 'already_terminal' };
  }

  // 3. grace period
  if (elapsed < T.GRACE_PERIOD_MS) {
    return { type: 'noop', reason: 'within_grace_period' };
  }

  // 4. majority downvote
  if (
    input.votesDown >= T.MIN_DOWNVOTES &&
    input.votesDown > input.votesUp * T.DOWNVOTE_FACTOR
  ) {
    return { type: 'auto_disable', reason: 'majority_downvote' };
  }

  // 5. majority upvote
  if (
    input.votesUp >= T.MIN_UPVOTES &&
    input.votesUp > input.votesDown * T.UPVOTE_FACTOR
  ) {
    return { type: 'auto_enable', reason: 'majority_upvote' };
  }

  // 6. stale pending — 24시간 + votes 0
  if (totalVotes === 0 && elapsed > T.STALE_AFTER_MS) {
    return { type: 'auto_disable', reason: 'stale_pending' };
  }

  // 7. fall-through: insufficient
  return { type: 'noop', reason: 'insufficient_votes' };
}

/**
 * Bulk batch 처리용 helper — 다수 쿠폰 일괄 결정.
 * cron worker 의 진입점 (Firestore 의존 분리).
 */
export interface BulkValidationItem {
  readonly couponId: string;
  readonly decision: CouponValidationDecision;
}

export function bulkDecideValidation(
  inputs: ReadonlyArray<CouponValidationInput & { couponId: string }>,
): readonly BulkValidationItem[] {
  return inputs.map((i) => ({
    couponId: i.couponId,
    decision: decideCouponValidation(i),
  }));
}

/**
 * 결정 결과를 Firestore update 페이로드로 변환.
 * Server Action 에서 직접 사용.
 */
export function decisionToCouponUpdate(
  decision: CouponValidationDecision,
):
  | { readonly status: CouponStatus; readonly autoValidationReason: string }
  | null {
  if (decision.type === 'noop') return null;
  const nextStatus: CouponStatus =
    decision.type === 'auto_enable' ? 'verified' : 'rejected';
  return {
    status: nextStatus,
    autoValidationReason: decision.reason,
  };
}
