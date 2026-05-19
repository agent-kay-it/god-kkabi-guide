/**
 * lib/simulator/prefill-url.ts — Sprint 19 F19-G 단위 테스트.
 */
import { describe, it, expect } from 'vitest';
import {
  buildPrefillUrl,
  parsePrefillUrl,
  isValidComboId,
  buildPrefillUrlFromSynergy,
} from './prefill-url';

describe('buildPrefillUrl', () => {
  it('combo 만 — prefill=simulator + combo 포함', () => {
    const url = buildPrefillUrl({ combo: 'chiwoo_hangah_hong_gildong' });
    expect(url).toContain('/post/new?');
    expect(url).toContain('prefill=simulator');
    expect(url).toContain('combo=chiwoo_hangah_hong_gildong');
  });

  it('class 추가', () => {
    const url = buildPrefillUrl({
      combo: 'a_b_c',
      classId: 'warrior',
    });
    expect(url).toContain('class=warrior');
  });

  it('score 추가 (Math.round)', () => {
    const url = buildPrefillUrl({
      combo: 'a_b_c',
      score: 87.6,
    });
    expect(url).toContain('score=88');
  });

  it('tier 추가', () => {
    const url = buildPrefillUrl({
      combo: 'a_b_c',
      tier: 'S',
    });
    expect(url).toContain('tier=S');
  });

  it('전체 필드 합성', () => {
    const url = buildPrefillUrl({
      combo: 'a_b_c',
      classId: 'medium',
      score: 95,
      tier: 'S',
    });
    expect(url).toContain('combo=a_b_c');
    expect(url).toContain('class=medium');
    expect(url).toContain('score=95');
    expect(url).toContain('tier=S');
  });

  it('NaN score 는 strip', () => {
    const url = buildPrefillUrl({
      combo: 'a_b_c',
      score: NaN,
    });
    expect(url).not.toContain('score=');
  });

  it('Infinity score 는 strip', () => {
    const url = buildPrefillUrl({
      combo: 'a_b_c',
      score: Infinity,
    });
    expect(url).not.toContain('score=');
  });
});

describe('parsePrefillUrl', () => {
  it('prefill !== simulator → null', () => {
    const s = new URLSearchParams({ prefill: 'other', combo: 'a_b_c' });
    expect(parsePrefillUrl(s)).toBeNull();
  });

  it('combo 없음 → null', () => {
    const s = new URLSearchParams({ prefill: 'simulator' });
    expect(parsePrefillUrl(s)).toBeNull();
  });

  it('combo 빈 문자열 → null', () => {
    const s = new URLSearchParams({ prefill: 'simulator', combo: '' });
    expect(parsePrefillUrl(s)).toBeNull();
  });

  it('combo 형식 위반 → null', () => {
    const s = new URLSearchParams({
      prefill: 'simulator',
      combo: 'invalid combo with space',
    });
    expect(parsePrefillUrl(s)).toBeNull();
  });

  it('valid combo 만 → combo 만 반환', () => {
    const s = new URLSearchParams({
      prefill: 'simulator',
      combo: 'a_b_c',
    });
    const r = parsePrefillUrl(s);
    expect(r).toEqual({ combo: 'a_b_c' });
  });

  it('valid 전체 필드 파싱', () => {
    const s = new URLSearchParams({
      prefill: 'simulator',
      combo: 'a_b_c',
      class: 'warrior',
      score: '95',
      tier: 'S',
    });
    expect(parsePrefillUrl(s)).toEqual({
      combo: 'a_b_c',
      classId: 'warrior',
      score: 95,
      tier: 'S',
    });
  });

  it('invalid class 는 strip (combo 만 유효)', () => {
    const s = new URLSearchParams({
      prefill: 'simulator',
      combo: 'a_b_c',
      class: 'rogue',
    });
    expect(parsePrefillUrl(s)).toEqual({ combo: 'a_b_c' });
  });

  it('invalid tier 는 strip', () => {
    const s = new URLSearchParams({
      prefill: 'simulator',
      combo: 'a_b_c',
      tier: 'Z',
    });
    expect(parsePrefillUrl(s)).toEqual({ combo: 'a_b_c' });
  });

  it('score 범위 초과 (-1, 101) 는 strip', () => {
    const s1 = new URLSearchParams({ prefill: 'simulator', combo: 'a_b_c', score: '-1' });
    const s2 = new URLSearchParams({ prefill: 'simulator', combo: 'a_b_c', score: '101' });
    expect(parsePrefillUrl(s1)).toEqual({ combo: 'a_b_c' });
    expect(parsePrefillUrl(s2)).toEqual({ combo: 'a_b_c' });
  });

  it('score 비정상 (foo) 는 strip', () => {
    const s = new URLSearchParams({ prefill: 'simulator', combo: 'a_b_c', score: 'foo' });
    expect(parsePrefillUrl(s)).toEqual({ combo: 'a_b_c' });
  });

  it('round-trip: build → parse 일치', () => {
    const params = {
      combo: 'chiwoo_hangah_hong_gildong',
      classId: 'warrior' as const,
      score: 95,
      tier: 'S' as const,
    };
    const url = buildPrefillUrl(params);
    const search = new URL(url, 'http://x').searchParams;
    const parsed = parsePrefillUrl(search);
    expect(parsed).toEqual(params);
  });
});

describe('isValidComboId', () => {
  it('빈 문자열 → false', () => {
    expect(isValidComboId('')).toBe(false);
  });

  it('단일 토큰 → false', () => {
    expect(isValidComboId('chiwoo')).toBe(false);
  });

  it('2 토큰 → false', () => {
    expect(isValidComboId('chiwoo_hangah')).toBe(false);
  });

  it('3 토큰 alpha-sorted → true', () => {
    expect(isValidComboId('chiwoo_hangah_sansin')).toBe(true);
  });

  it('빈 토큰 포함 → false', () => {
    expect(isValidComboId('chiwoo__sansin')).toBe(false);
  });

  it('대문자 포함 → false', () => {
    expect(isValidComboId('Chiwoo_hangah_sansin')).toBe(false);
  });

  it('특수문자 포함 → false', () => {
    expect(isValidComboId('chiwoo-hangah-sansin')).toBe(false);
  });

  it('숫자 허용 (예: 진령 ID 가 숫자 포함)', () => {
    expect(isValidComboId('jinryeong1_jinryeong2_jinryeong3')).toBe(true);
  });
});

describe('buildPrefillUrlFromSynergy', () => {
  it('synergy 객체 전체 필드 → URL 생성', () => {
    const url = buildPrefillUrlFromSynergy({
      comboId: 'chiwoo_hangah_hong_gildong',
      jinryeongIds: ['chiwoo', 'hangah', 'hong_gildong'] as never,
      synergyScore: 95,
      tier: 'S',
      recommendedClass: 'warrior',
    });
    expect(url).toContain('combo=chiwoo_hangah_hong_gildong');
    expect(url).toContain('score=95');
    expect(url).toContain('tier=S');
    expect(url).toContain('class=warrior');
  });

  it('recommendedClass 없을 때 class 파라미터 누락', () => {
    const url = buildPrefillUrlFromSynergy({
      comboId: 'a_b_c',
      jinryeongIds: ['a', 'b', 'c'] as never,
      synergyScore: 60,
      tier: 'B',
    });
    expect(url).not.toContain('class=');
    expect(url).toContain('combo=a_b_c');
    expect(url).toContain('tier=B');
  });
});
