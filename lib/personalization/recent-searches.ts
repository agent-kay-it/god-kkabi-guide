/**
 * Recent Searches — Sprint V7 P3.C + P4 (storage-store 리팩토링).
 *
 * - dedup (정규화 후), max 8, FIFO
 * - 1자 이하 쿼리는 저장 안 함
 * - useSyncExternalStore와 호환되는 store API
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §4
 */
import { normalizeQuery } from '@/lib/search/wiki-search-index';
import { createStorageStore } from './storage-store';

const STORAGE_KEY = 'god-kkabi:recent-searches:v1';
const MAX_ENTRIES = 8;
const EMPTY: readonly string[] = Object.freeze([]);

function parse(raw: string | null): readonly string[] {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    return data.filter((x): x is string => typeof x === 'string');
  } catch {
    return EMPTY;
  }
}

export const recentSearchesStore = createStorageStore<readonly string[]>({
  key: STORAGE_KEY,
  parse,
  fallback: EMPTY,
});

/**
 * 최근 검색어 추가. dedup, max 8, FIFO.
 * 빈 / 1자 이하 쿼리는 무시.
 */
export function addRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = query.trim();
  if (trimmed.length < 2) return;
  const norm = normalizeQuery(trimmed);
  const current = recentSearchesStore.getSnapshot();
  const filtered = current.filter((q) => normalizeQuery(q) !== norm);
  const next = [trimmed, ...filtered].slice(0, MAX_ENTRIES);
  recentSearchesStore.set(next);
}

export function clearRecentSearches(): void {
  recentSearchesStore.set(EMPTY);
}

/**
 * 0건 결과 시 사용자에게 보여줄 정적 추천 검색어.
 * 운영자 큐레이션 — 인기 키워드 / 핵심 메타.
 */
export const SUGGESTED_QUERIES: readonly string[] = [
  '검객',
  '서해용왕',
  '999뽑기',
  '홍길동',
  '진령',
  '제련',
  '결투장',
];
