/**
 * vitest — decideRateLimit pure policy tests.
 */
import { describe, it, expect } from 'vitest';

import {
  decideRateLimit,
  RATE_LIMIT_PER_MINUTE_DEFAULT,
  RATE_LIMIT_PER_HOUR_DEFAULT,
} from './rate-limit-policy';

const NOW = 1_700_000_000_000;

describe('decideRateLimit — fresh user (no prior history)', () => {
  it('allows first message (resets both windows)', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: 0,
      minuteCount: 0,
      hourWindowStartMs: 0,
      hourCount: 0,
    });
    expect(d).toEqual({
      ok: true,
      nextMinuteCount: 1,
      nextHourCount: 1,
      resetMinuteWindow: true,
      resetHourWindow: true,
    });
  });
});

describe('decideRateLimit — within active windows', () => {
  it('allows increment when below both limits', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: NOW - 30_000,
      minuteCount: 5,
      hourWindowStartMs: NOW - 1_000_000,
      hourCount: 20,
    });
    if (d.ok) {
      expect(d.nextMinuteCount).toBe(6);
      expect(d.nextHourCount).toBe(21);
      expect(d.resetMinuteWindow).toBe(false);
      expect(d.resetHourWindow).toBe(false);
    } else {
      throw new Error('expected ok');
    }
  });

  it('denies on minute limit', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: NOW - 30_000,
      minuteCount: RATE_LIMIT_PER_MINUTE_DEFAULT,
      hourWindowStartMs: NOW - 1_000_000,
      hourCount: 20,
    });
    expect(d).toMatchObject({ ok: false, scope: 'minute' });
    if (!d.ok) {
      expect(d.retryAfterMs).toBeGreaterThan(0);
      expect(d.retryAfterMs).toBeLessThanOrEqual(60_000);
    }
  });

  it('denies on hour limit', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: NOW - 30_000,
      minuteCount: 1,
      hourWindowStartMs: NOW - 1_000_000,
      hourCount: RATE_LIMIT_PER_HOUR_DEFAULT,
    });
    expect(d).toMatchObject({ ok: false, scope: 'hour' });
    if (!d.ok) {
      expect(d.retryAfterMs).toBeGreaterThan(0);
      expect(d.retryAfterMs).toBeLessThanOrEqual(60 * 60_000);
    }
  });

  it('prefers minute scope when both limits triggered', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: NOW - 30_000,
      minuteCount: RATE_LIMIT_PER_MINUTE_DEFAULT,
      hourWindowStartMs: NOW - 1_000_000,
      hourCount: RATE_LIMIT_PER_HOUR_DEFAULT,
    });
    if (!d.ok) expect(d.scope).toBe('minute');
  });
});

describe('decideRateLimit — window expiry resets counter', () => {
  it('resets minute window after 60s elapsed', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: NOW - 65_000,
      minuteCount: RATE_LIMIT_PER_MINUTE_DEFAULT,
      hourWindowStartMs: NOW - 1_000_000,
      hourCount: 20,
    });
    if (d.ok) {
      expect(d.nextMinuteCount).toBe(1);
      expect(d.resetMinuteWindow).toBe(true);
    } else {
      throw new Error('expected ok after minute reset');
    }
  });

  it('resets hour window after 60min elapsed', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: NOW - 30_000,
      minuteCount: 1,
      hourWindowStartMs: NOW - 60 * 60_000 - 1000,
      hourCount: RATE_LIMIT_PER_HOUR_DEFAULT,
    });
    if (d.ok) {
      expect(d.nextHourCount).toBe(1);
      expect(d.resetHourWindow).toBe(true);
    } else {
      throw new Error('expected ok after hour reset');
    }
  });
});

describe('decideRateLimit — custom limits', () => {
  it('respects perMinute override', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: NOW - 10_000,
      minuteCount: 2,
      hourWindowStartMs: NOW - 1000,
      hourCount: 2,
      perMinute: 2,
    });
    expect(d).toMatchObject({ ok: false, scope: 'minute' });
  });

  it('respects perHour override', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: NOW - 10_000,
      minuteCount: 1,
      hourWindowStartMs: NOW - 1000,
      hourCount: 3,
      perHour: 3,
    });
    expect(d).toMatchObject({ ok: false, scope: 'hour' });
  });
});

describe('decideRateLimit — boundary conditions', () => {
  it('treats window start = 0 (no prior history) as expired', () => {
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: 0,
      minuteCount: 999,
      hourWindowStartMs: 0,
      hourCount: 999,
    });
    if (d.ok) {
      expect(d.nextMinuteCount).toBe(1);
      expect(d.nextHourCount).toBe(1);
    } else {
      throw new Error('expected ok for expired windows');
    }
  });

  it('retryAfter clamped to 0 minimum', () => {
    // Edge case: clock skew — minuteWindowStart in future
    const d = decideRateLimit({
      nowMs: NOW,
      minuteWindowStartMs: NOW + 10_000,
      minuteCount: RATE_LIMIT_PER_MINUTE_DEFAULT,
      hourWindowStartMs: NOW,
      hourCount: 1,
    });
    if (!d.ok) {
      expect(d.retryAfterMs).toBeGreaterThanOrEqual(0);
    }
  });
});
