/**
 * Sprint 18 / F18-A — types/insights.ts unit test.
 *
 * toWeekISO() ISO-8601 주 번호 변환 검증.
 */
import { describe, it, expect } from 'vitest';
import { toWeekISO } from './insights';

describe('toWeekISO()', () => {
  it('2026-01-05 (월요일) → 2026-W02 (W02 시작일)', () => {
    const result = toWeekISO(new Date('2026-01-05T00:00:00Z'));
    expect(result.value).toBe('2026-W02');
    expect(result.year).toBe(2026);
    expect(result.week).toBe(2);
  });

  it('2026-01-01 (목요일) → 2026-W01 (W01)', () => {
    const result = toWeekISO(new Date('2026-01-01T00:00:00Z'));
    expect(result.value).toBe('2026-W01');
    expect(result.year).toBe(2026);
    expect(result.week).toBe(1);
  });

  it('value 형식 = YYYY-Www', () => {
    const result = toWeekISO(new Date('2026-05-19'));
    expect(result.value).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('week 가 한 자리 → 0 padding', () => {
    const result = toWeekISO(new Date('2026-01-05T00:00:00Z'));
    // value 는 항상 2자리 padding
    const weekPart = result.value.split('W')[1];
    expect(weekPart?.length).toBe(2);
  });

  it('startMs < endMs', () => {
    const result = toWeekISO(new Date('2026-05-19T00:00:00Z'));
    expect(result.startMs).toBeLessThan(result.endMs);
  });

  it('endMs - startMs ≈ 7일', () => {
    const result = toWeekISO(new Date('2026-05-19T00:00:00Z'));
    const diff = result.endMs - result.startMs;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    // 1ms tolerance (endMs 가 7일 - 1ms)
    expect(diff).toBeGreaterThanOrEqual(sevenDaysMs - 1000);
    expect(diff).toBeLessThanOrEqual(sevenDaysMs);
  });

  it('동일 주의 다른 날 → 동일 weekISO', () => {
    const mon = toWeekISO(new Date('2026-05-18T00:00:00Z')); // 월요일
    const wed = toWeekISO(new Date('2026-05-20T00:00:00Z')); // 수요일
    const sun = toWeekISO(new Date('2026-05-24T00:00:00Z')); // 일요일
    expect(mon.value).toBe(wed.value);
    expect(wed.value).toBe(sun.value);
  });

  it('연도 경계 — 2025-12-29 (월) → 2026-W01', () => {
    // ISO-8601: 첫 목요일이 포함된 주 = W01
    const result = toWeekISO(new Date('2025-12-29T00:00:00Z'));
    expect(result.value).toBe('2026-W01');
  });
});
