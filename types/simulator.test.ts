/**
 * Sprint 18 / F18-A — types/simulator.ts unit test.
 *
 * buildComboId + SYNERGY_TIER_LABEL + SYNERGY_TIER_COLOR 검증.
 */
import { describe, it, expect } from 'vitest';
import { buildComboId, SYNERGY_TIER_LABEL, SYNERGY_TIER_COLOR } from './simulator';
import type { WikiJinryeongId } from './wiki';

describe('buildComboId()', () => {
  it('3 id 를 alpha-sort 후 _ 로 join', () => {
    const ids: WikiJinryeongId[] = ['chiwoo', 'hangah', 'hong_gildong'];
    expect(buildComboId(ids)).toBe('chiwoo_hangah_hong_gildong');
  });

  it('순서 무관 — 동일 결과', () => {
    const a = buildComboId(['chiwoo', 'hangah', 'hong_gildong']);
    const b = buildComboId(['hong_gildong', 'chiwoo', 'hangah']);
    const c = buildComboId(['hangah', 'hong_gildong', 'chiwoo']);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('빈 배열 → 빈 문자열', () => {
    expect(buildComboId([])).toBe('');
  });

  it('단일 id', () => {
    expect(buildComboId(['chiwoo'])).toBe('chiwoo');
  });

  it('2 id alpha-sort', () => {
    expect(buildComboId(['hangah', 'chiwoo'])).toBe('chiwoo_hangah');
  });

  it('alpha 정렬 — 한글 ID 도 sort', () => {
    const ids: WikiJinryeongId[] = ['gunggwi', 'eumyeonggwi', 'myeongwang'];
    // alpha sort: e < g < m
    expect(buildComboId(ids)).toBe('eumyeonggwi_gunggwi_myeongwang');
  });

  it('동일 id 중복 (정상 시나리오 아님 — 단순 sort 결과 검증)', () => {
    expect(buildComboId(['chiwoo', 'chiwoo'])).toBe('chiwoo_chiwoo');
  });
});

describe('SYNERGY_TIER_LABEL', () => {
  it('S A B C 모든 tier 라벨 존재', () => {
    expect(SYNERGY_TIER_LABEL.S).toBeTruthy();
    expect(SYNERGY_TIER_LABEL.A).toBeTruthy();
    expect(SYNERGY_TIER_LABEL.B).toBeTruthy();
    expect(SYNERGY_TIER_LABEL.C).toBeTruthy();
  });

  it('각 라벨은 string', () => {
    for (const tier of ['S', 'A', 'B', 'C'] as const) {
      expect(typeof SYNERGY_TIER_LABEL[tier]).toBe('string');
      expect(SYNERGY_TIER_LABEL[tier].length).toBeGreaterThan(0);
    }
  });
});

describe('SYNERGY_TIER_COLOR', () => {
  it('S A B C 모든 tier color 존재', () => {
    expect(SYNERGY_TIER_COLOR.S).toBeTruthy();
    expect(SYNERGY_TIER_COLOR.A).toBeTruthy();
    expect(SYNERGY_TIER_COLOR.B).toBeTruthy();
    expect(SYNERGY_TIER_COLOR.C).toBeTruthy();
  });

  it('color 는 v2 4-색 시스템 중 하나', () => {
    const valid = ['vermilion', 'bronze', 'jade', 'muted'];
    for (const tier of ['S', 'A', 'B', 'C'] as const) {
      expect(valid).toContain(SYNERGY_TIER_COLOR[tier]);
    }
  });
});
