/**
 * Sprint 18 / F18-A — types/penalty.ts unit test.
 *
 * determinePenaltyLevel + PENALTY_THRESHOLDS 검증.
 */
import { describe, it, expect } from 'vitest';
import {
  determinePenaltyLevel,
  PENALTY_THRESHOLDS,
  PENALTY_LEVEL_LABEL,
  PENALTY_REASON_LABEL,
  BAN_7D_DURATION_MS,
} from './penalty';

describe('PENALTY_THRESHOLDS', () => {
  it('warning < ban_7d < ban_permanent', () => {
    expect(PENALTY_THRESHOLDS.warning).toBeLessThan(PENALTY_THRESHOLDS.ban_7d);
    expect(PENALTY_THRESHOLDS.ban_7d).toBeLessThan(PENALTY_THRESHOLDS.ban_permanent);
  });

  it('warning = 5', () => {
    expect(PENALTY_THRESHOLDS.warning).toBe(5);
  });

  it('ban_7d = 10', () => {
    expect(PENALTY_THRESHOLDS.ban_7d).toBe(10);
  });

  it('ban_permanent = 20', () => {
    expect(PENALTY_THRESHOLDS.ban_permanent).toBe(20);
  });
});

describe('determinePenaltyLevel()', () => {
  it('0건 — null', () => {
    expect(determinePenaltyLevel(0)).toBeNull();
  });

  it('4건 — null (warning 미달)', () => {
    expect(determinePenaltyLevel(4)).toBeNull();
  });

  it('5건 — warning (warning 임계값)', () => {
    expect(determinePenaltyLevel(5)).toBe('warning');
  });

  it('9건 — warning (ban_7d 미달)', () => {
    expect(determinePenaltyLevel(9)).toBe('warning');
  });

  it('10건 — ban_7d (ban_7d 임계값)', () => {
    expect(determinePenaltyLevel(10)).toBe('ban_7d');
  });

  it('19건 — ban_7d (ban_permanent 미달)', () => {
    expect(determinePenaltyLevel(19)).toBe('ban_7d');
  });

  it('20건 — ban_permanent (ban_permanent 임계값)', () => {
    expect(determinePenaltyLevel(20)).toBe('ban_permanent');
  });

  it('100건 — ban_permanent (최상위 유지)', () => {
    expect(determinePenaltyLevel(100)).toBe('ban_permanent');
  });

  it('음수 — null (정상 시나리오 아님)', () => {
    expect(determinePenaltyLevel(-1)).toBeNull();
  });
});

describe('BAN_7D_DURATION_MS', () => {
  it('7일 = 604_800_000 ms', () => {
    expect(BAN_7D_DURATION_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe('PENALTY_LEVEL_LABEL / PENALTY_REASON_LABEL', () => {
  it('모든 PenaltyLevel 의 라벨 존재', () => {
    expect(PENALTY_LEVEL_LABEL.warning).toBeTruthy();
    expect(PENALTY_LEVEL_LABEL.ban_7d).toBeTruthy();
    expect(PENALTY_LEVEL_LABEL.ban_permanent).toBeTruthy();
  });

  it('모든 PenaltyReason 의 라벨 존재', () => {
    expect(PENALTY_REASON_LABEL.auto_threshold).toBeTruthy();
    expect(PENALTY_REASON_LABEL.manual_admin).toBeTruthy();
  });
});
