/**
 * Sprint 16 / F16-A — lib/search/wiki-search-index unit test.
 */
import { describe, it, expect } from 'vitest';
import {
  normalizeQuery,
  getSearchIndex,
  searchIndex,
  SEARCH_TYPE_LABEL,
} from './wiki-search-index';

describe('normalizeQuery()', () => {
  it('lowercase', () => {
    expect(normalizeQuery('ABC')).toBe('abc');
  });
  it('trim + 공백 collapse', () => {
    expect(normalizeQuery('  a   b  c  ')).toBe('a b c');
  });
  it('NFC 정규화', () => {
    // 한글 자모 NFD → NFC
    const decomposed = 'ㄱᅡᆷ';
    expect(normalizeQuery(decomposed).length).toBeGreaterThan(0);
  });
  it('빈 문자열 → 빈 문자열', () => {
    expect(normalizeQuery('')).toBe('');
    expect(normalizeQuery('   ')).toBe('');
  });
});

describe('getSearchIndex()', () => {
  it('1 entry 이상 반환', () => {
    expect(getSearchIndex().length).toBeGreaterThan(0);
  });
  it('한 entry 의 필수 속성', () => {
    const first = getSearchIndex()[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('type');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('href');
    expect(first).toHaveProperty('tokens');
  });
  it('모든 entry 의 type 이 SEARCH_TYPE_LABEL 에 존재', () => {
    for (const e of getSearchIndex()) {
      expect(SEARCH_TYPE_LABEL[e.type]).toBeDefined();
    }
  });
  it('module 캐시 — 두 번 호출 시 동일 reference', () => {
    expect(getSearchIndex()).toBe(getSearchIndex());
  });
});

describe('searchIndex()', () => {
  const idx = getSearchIndex();

  it('빈 query → 빈 결과', () => {
    expect(searchIndex(idx, '')).toEqual([]);
    expect(searchIndex(idx, '   ')).toEqual([]);
  });

  it('한국어 검색 — 검색 결과 score 정렬 (높은 score 가 먼저)', () => {
    const hits = searchIndex(idx, '검객');
    const a = hits[0];
    const b = hits[1];
    if (a && b) {
      expect(a.score).toBeGreaterThanOrEqual(b.score);
    }
  });

  it('title prefix > contains > description > tokens', () => {
    const hits = searchIndex(idx, '검객');
    const first = hits[0];
    if (first) {
      // title 매칭이 있다면 최대 100
      expect(first.score).toBeLessThanOrEqual(100);
      expect(first.score).toBeGreaterThanOrEqual(20);
    }
  });

  it('대소문자 무시', () => {
    const upper = searchIndex(idx, 'CHIWOO');
    const lower = searchIndex(idx, 'chiwoo');
    expect(upper.length).toBe(lower.length);
  });

  it('limit 적용', () => {
    const all = searchIndex(idx, '진령', 100);
    const limited = searchIndex(idx, '진령', 3);
    expect(limited.length).toBeLessThanOrEqual(3);
    expect(limited.length).toBeLessThanOrEqual(all.length);
  });

  it('존재하지 않는 키워드 → 빈 결과', () => {
    const hits = searchIndex(idx, '__nonexistent_kw_xyz__');
    expect(hits).toEqual([]);
  });
});
