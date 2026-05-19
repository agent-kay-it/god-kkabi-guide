/**
 * lib/coupon/auto-validate.ts — decideCouponValidation + bulkDecideValidation 단위 테스트.
 * Sprint 19 F19-H (마스터 V2 F3.4 1차).
 */
import { describe, it, expect } from 'vitest';
import {
  decideCouponValidation,
  bulkDecideValidation,
  decisionToCouponUpdate,
  COUPON_AUTO_VALIDATE_THRESHOLDS,
} from './auto-validate';
import type { CouponValidationInput } from './auto-validate';

const NOW = 1_700_000_000_000;
const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

function base(over: Partial<CouponValidationInput> = {}): CouponValidationInput {
  return {
    votesUp: 0,
    votesDown: 0,
    status: 'pending',
    createdAtMs: NOW - HOUR * 2, // 2시간 전
    nowMs: NOW,
    ...over,
  };
}

describe('decideCouponValidation — 우선순위 분기', () => {
  describe('1. expired (가장 우선)', () => {
    it('expiresAtMs < nowMs → auto_disable expired', () => {
      const r = decideCouponValidation(base({ expiresAtMs: NOW - 1 }));
      expect(r).toEqual({ type: 'auto_disable', reason: 'expired' });
    });

    it('expired 는 다른 조건 무시 (verified 도 만료)', () => {
      const r = decideCouponValidation(
        base({ status: 'verified', expiresAtMs: NOW - 1 }),
      );
      expect(r).toEqual({ type: 'auto_disable', reason: 'expired' });
    });

    it('expiresAtMs === nowMs 는 만료 X (strict less than)', () => {
      const r = decideCouponValidation(base({ expiresAtMs: NOW }));
      expect(r.type).not.toBe('auto_disable');
    });

    it('expiresAtMs undefined → no expiry', () => {
      const r = decideCouponValidation(base({}));
      expect(r.type).toBe('noop');
    });
  });

  describe('2. already_terminal', () => {
    it('verified 상태 → noop already_terminal', () => {
      const r = decideCouponValidation(base({ status: 'verified' }));
      expect(r).toEqual({ type: 'noop', reason: 'already_terminal' });
    });

    it('rejected 상태 → noop already_terminal', () => {
      const r = decideCouponValidation(base({ status: 'rejected' }));
      expect(r).toEqual({ type: 'noop', reason: 'already_terminal' });
    });

    it('expired 상태 → noop already_terminal', () => {
      const r = decideCouponValidation(base({ status: 'expired' }));
      expect(r).toEqual({ type: 'noop', reason: 'already_terminal' });
    });
  });

  describe('3. within_grace_period (1시간)', () => {
    it('30분 경과 → noop within_grace_period', () => {
      const r = decideCouponValidation(
        base({ createdAtMs: NOW - 1000 * 60 * 30, votesUp: 10, votesDown: 0 }),
      );
      expect(r).toEqual({ type: 'noop', reason: 'within_grace_period' });
    });

    it('정확히 1시간 경과는 grace period 통과 (boundary)', () => {
      const r = decideCouponValidation(
        base({ createdAtMs: NOW - HOUR, votesUp: 0, votesDown: 0 }),
      );
      // grace period 통과했지만 vote 부족 + 24h 미만 → insufficient_votes
      expect(r).toEqual({ type: 'noop', reason: 'insufficient_votes' });
    });

    it('grace period 내라면 majority_downvote 도 무시', () => {
      const r = decideCouponValidation(
        base({
          createdAtMs: NOW - 1000 * 60 * 30,
          votesUp: 0,
          votesDown: 20,
        }),
      );
      expect(r.type).toBe('noop');
      expect(r).toMatchObject({ reason: 'within_grace_period' });
    });
  });

  describe('4. majority_downvote (votesDown >= 5 AND > upvotes*2)', () => {
    it('downvotes 5 + upvotes 0 → auto_disable', () => {
      const r = decideCouponValidation(base({ votesUp: 0, votesDown: 5 }));
      expect(r).toEqual({ type: 'auto_disable', reason: 'majority_downvote' });
    });

    it('downvotes 5 + upvotes 1 → auto_disable (5 > 1*2)', () => {
      const r = decideCouponValidation(base({ votesUp: 1, votesDown: 5 }));
      expect(r).toEqual({ type: 'auto_disable', reason: 'majority_downvote' });
    });

    it('downvotes 4 → noop (MIN 5 미만)', () => {
      const r = decideCouponValidation(base({ votesUp: 0, votesDown: 4 }));
      expect(r.type).toBe('noop');
    });

    it('downvotes 6 + upvotes 3 → noop (6 > 3*2 = 6 false)', () => {
      const r = decideCouponValidation(base({ votesUp: 3, votesDown: 6 }));
      expect(r.type).toBe('noop');
    });

    it('downvotes 7 + upvotes 3 → auto_disable (7 > 6)', () => {
      const r = decideCouponValidation(base({ votesUp: 3, votesDown: 7 }));
      expect(r).toEqual({ type: 'auto_disable', reason: 'majority_downvote' });
    });
  });

  describe('5. majority_upvote (votesUp >= 3 AND > downvotes*2)', () => {
    it('upvotes 3 + downvotes 0 → auto_enable', () => {
      const r = decideCouponValidation(base({ votesUp: 3, votesDown: 0 }));
      expect(r).toEqual({ type: 'auto_enable', reason: 'majority_upvote' });
    });

    it('upvotes 3 + downvotes 1 → auto_enable (3 > 1*2)', () => {
      const r = decideCouponValidation(base({ votesUp: 3, votesDown: 1 }));
      expect(r).toEqual({ type: 'auto_enable', reason: 'majority_upvote' });
    });

    it('upvotes 2 → noop (MIN 3 미만)', () => {
      const r = decideCouponValidation(base({ votesUp: 2, votesDown: 0 }));
      expect(r.type).toBe('noop');
    });

    it('upvotes 4 + downvotes 2 → noop (4 > 4 false)', () => {
      const r = decideCouponValidation(base({ votesUp: 4, votesDown: 2 }));
      expect(r.type).toBe('noop');
    });

    it('upvotes 5 + downvotes 2 → auto_enable (5 > 4)', () => {
      const r = decideCouponValidation(base({ votesUp: 5, votesDown: 2 }));
      expect(r).toEqual({ type: 'auto_enable', reason: 'majority_upvote' });
    });
  });

  describe('6. stale_pending (24h + votes 0)', () => {
    it('24시간 경과 + votes 0 → auto_disable stale_pending', () => {
      const r = decideCouponValidation(
        base({ createdAtMs: NOW - DAY - 1, votesUp: 0, votesDown: 0 }),
      );
      expect(r).toEqual({ type: 'auto_disable', reason: 'stale_pending' });
    });

    it('정확히 24시간은 stale X (strict greater than)', () => {
      const r = decideCouponValidation(
        base({ createdAtMs: NOW - DAY, votesUp: 0, votesDown: 0 }),
      );
      // stale 아님 → insufficient_votes
      expect(r).toEqual({ type: 'noop', reason: 'insufficient_votes' });
    });

    it('24시간 경과 + 1 vote 라도 → stale 아님', () => {
      const r = decideCouponValidation(
        base({ createdAtMs: NOW - DAY - 1, votesUp: 1, votesDown: 0 }),
      );
      expect(r).toEqual({ type: 'noop', reason: 'insufficient_votes' });
    });
  });

  describe('7. fall-through: insufficient_votes', () => {
    it('grace 통과 + vote 1개 → insufficient', () => {
      const r = decideCouponValidation(base({ votesUp: 1, votesDown: 0 }));
      expect(r).toEqual({ type: 'noop', reason: 'insufficient_votes' });
    });

    it('grace 통과 + 비등 votes → insufficient', () => {
      const r = decideCouponValidation(base({ votesUp: 2, votesDown: 2 }));
      expect(r).toEqual({ type: 'noop', reason: 'insufficient_votes' });
    });
  });
});

describe('bulkDecideValidation', () => {
  it('빈 배열 → 빈 배열', () => {
    expect(bulkDecideValidation([])).toEqual([]);
  });

  it('다수 쿠폰 일괄 결정', () => {
    const inputs = [
      { couponId: 'c1', ...base({ votesUp: 5, votesDown: 0 }) },
      { couponId: 'c2', ...base({ votesUp: 0, votesDown: 8 }) },
      { couponId: 'c3', ...base({ status: 'verified' as const }) },
    ];
    const result = bulkDecideValidation(inputs);
    expect(result.length).toBe(3);
    expect(result[0]).toEqual({
      couponId: 'c1',
      decision: { type: 'auto_enable', reason: 'majority_upvote' },
    });
    expect(result[1]?.decision.type).toBe('auto_disable');
    expect(result[2]?.decision).toEqual({
      type: 'noop',
      reason: 'already_terminal',
    });
  });
});

describe('decisionToCouponUpdate', () => {
  it('noop → null', () => {
    expect(
      decisionToCouponUpdate({ type: 'noop', reason: 'insufficient_votes' }),
    ).toBeNull();
  });

  it('auto_enable → status verified', () => {
    expect(
      decisionToCouponUpdate({ type: 'auto_enable', reason: 'majority_upvote' }),
    ).toEqual({ status: 'verified', autoValidationReason: 'majority_upvote' });
  });

  it('auto_disable expired → status rejected', () => {
    expect(
      decisionToCouponUpdate({ type: 'auto_disable', reason: 'expired' }),
    ).toEqual({ status: 'rejected', autoValidationReason: 'expired' });
  });

  it('auto_disable majority_downvote → status rejected', () => {
    expect(
      decisionToCouponUpdate({
        type: 'auto_disable',
        reason: 'majority_downvote',
      }),
    ).toEqual({
      status: 'rejected',
      autoValidationReason: 'majority_downvote',
    });
  });
});

describe('COUPON_AUTO_VALIDATE_THRESHOLDS', () => {
  it('design.md §6.2 임계값과 일치', () => {
    expect(COUPON_AUTO_VALIDATE_THRESHOLDS.DOWNVOTE_FACTOR).toBe(2);
    expect(COUPON_AUTO_VALIDATE_THRESHOLDS.MIN_DOWNVOTES).toBe(5);
    expect(COUPON_AUTO_VALIDATE_THRESHOLDS.MIN_UPVOTES).toBe(3);
    expect(COUPON_AUTO_VALIDATE_THRESHOLDS.UPVOTE_FACTOR).toBe(2);
    expect(COUPON_AUTO_VALIDATE_THRESHOLDS.GRACE_PERIOD_MS).toBe(60 * 60 * 1000);
    expect(COUPON_AUTO_VALIDATE_THRESHOLDS.STALE_AFTER_MS).toBe(24 * 60 * 60 * 1000);
  });
});
