/**
 * @vitest-environment jsdom
 *
 * Sprint 16 / F16-B — lib/personalization/recent-searches unit test.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  addRecentSearch,
  clearRecentSearches,
  recentSearchesStore,
  SUGGESTED_QUERIES,
} from './recent-searches';

beforeEach(() => {
  window.localStorage.clear();
  clearRecentSearches();
});

describe('addRecentSearch()', () => {
  it('정상 query 저장', () => {
    addRecentSearch('검객');
    expect(recentSearchesStore.getSnapshot()).toEqual(['검객']);
  });

  it('1자 이하 query 는 무시', () => {
    addRecentSearch('a');
    addRecentSearch('');
    addRecentSearch(' ');
    expect(recentSearchesStore.getSnapshot().length).toBe(0);
  });

  it('trim 적용', () => {
    addRecentSearch('  검객  ');
    expect(recentSearchesStore.getSnapshot()).toEqual(['검객']);
  });

  it('중복 dedup (정규화 후)', () => {
    addRecentSearch('검객');
    addRecentSearch('서해용왕');
    addRecentSearch('검객'); // dedup
    const list = recentSearchesStore.getSnapshot();
    expect(list.length).toBe(2);
    expect(list[0]).toBe('검객'); // 최신 호출이 앞으로
  });

  it('대소문자 dedup (normalize)', () => {
    addRecentSearch('Hello');
    addRecentSearch('HELLO');
    expect(recentSearchesStore.getSnapshot().length).toBe(1);
  });

  it('MAX_ENTRIES (8) 초과 시 가장 오래된 항목 제거', () => {
    for (let i = 0; i < 10; i++) {
      addRecentSearch(`query-${i}`);
    }
    const list = recentSearchesStore.getSnapshot();
    expect(list.length).toBe(8);
    expect(list[0]).toBe('query-9'); // 최신
  });
});

describe('clearRecentSearches()', () => {
  it('clear → 빈 배열', () => {
    addRecentSearch('test');
    clearRecentSearches();
    expect(recentSearchesStore.getSnapshot().length).toBe(0);
  });
});

describe('SUGGESTED_QUERIES', () => {
  it('비어있지 않음', () => {
    expect(SUGGESTED_QUERIES.length).toBeGreaterThan(0);
  });

  it('모든 항목이 string', () => {
    for (const q of SUGGESTED_QUERIES) {
      expect(typeof q).toBe('string');
      expect(q.length).toBeGreaterThan(0);
    }
  });
});
