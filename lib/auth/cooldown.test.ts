/**
 * lib/auth/cooldown.ts — Sprint 23 F23-A 단위 테스트.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calcNicknameCooldownRemainingMs,
  NICKNAME_COOLDOWN_MS,
} from './cooldown';

const FIXED_NOW = 1_700_000_000_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(FIXED_NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('calcNicknameCooldownRemainingMs', () => {
  it('undefined → 0', () => {
    expect(calcNicknameCooldownRemainingMs(undefined)).toBe(0);
  });

  it('null → 0', () => {
    expect(calcNicknameCooldownRemainingMs(null)).toBe(0);
  });

  it('0 → 0 (변경 이력 없음)', () => {
    expect(calcNicknameCooldownRemainingMs(0)).toBe(0);
  });

  it('현재 시각에 막 변경 → 30일 남음', () => {
    expect(calcNicknameCooldownRemainingMs(FIXED_NOW)).toBe(NICKNAME_COOLDOWN_MS);
  });

  it('1일 전 변경 → 29일 남음', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const r = calcNicknameCooldownRemainingMs(FIXED_NOW - dayMs);
    expect(r).toBe(NICKNAME_COOLDOWN_MS - dayMs);
  });

  it('30일 정확히 경과 → 0', () => {
    const r = calcNicknameCooldownRemainingMs(FIXED_NOW - NICKNAME_COOLDOWN_MS);
    expect(r).toBe(0);
  });

  it('30일 + 1ms 경과 → 0 (음수 방지)', () => {
    const r = calcNicknameCooldownRemainingMs(
      FIXED_NOW - NICKNAME_COOLDOWN_MS - 1,
    );
    expect(r).toBe(0);
  });

  it('1년 전 변경 → 0', () => {
    const yearMs = 365 * 24 * 60 * 60 * 1000;
    expect(calcNicknameCooldownRemainingMs(FIXED_NOW - yearMs)).toBe(0);
  });
});
