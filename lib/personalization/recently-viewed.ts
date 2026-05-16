/**
 * Recently Viewed — Sprint V7 P3.A + P4 (storage-store 리팩토링).
 *
 * 정책:
 *  - 최대 5개 보관 (FIFO)
 *  - 동일 id 재방문 시 기존 항목을 맨 앞으로 이동 (timestamp 갱신)
 *  - localStorage 미지원 환경 (SSR / private mode) → no-op + 빈 배열 반환
 *  - schema migration: key에 `:v1` 접미 — 향후 변경 시 키 업그레이드
 *
 * P4 변경:
 *  - createStorageStore 사용 → useSyncExternalStore와 호환
 *  - 동일 탭 broadcast로 같은 페이지 내 다른 컴포넌트도 즉시 반영
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §2
 */
import type { SearchEntryType } from '@/lib/search/wiki-search-index';
import { createStorageStore } from './storage-store';

export interface RecentlyViewedEntry {
  readonly id: string;
  readonly type: SearchEntryType;
  readonly title: string;
  readonly href: string;
  readonly emoji?: string;
  readonly viewedAtMs: number;
}

const STORAGE_KEY = 'god-kkabi:recently-viewed:v1';
const MAX_ENTRIES = 5;
const EMPTY: readonly RecentlyViewedEntry[] = Object.freeze([]);

function isValidEntry(x: unknown): x is RecentlyViewedEntry {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.type === 'string' &&
    typeof o.title === 'string' &&
    typeof o.href === 'string' &&
    typeof o.viewedAtMs === 'number'
  );
}

function parse(raw: string | null): readonly RecentlyViewedEntry[] {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    return data.filter(isValidEntry);
  } catch {
    return EMPTY;
  }
}

export const recentlyViewedStore = createStorageStore<readonly RecentlyViewedEntry[]>({
  key: STORAGE_KEY,
  parse,
  fallback: EMPTY,
});

/**
 * 새 항목 추가. 기존 동일 id 제거 후 맨 앞에 push.
 * SSR 환경에서는 no-op.
 */
export function addRecentlyViewed(
  entry: Omit<RecentlyViewedEntry, 'viewedAtMs'>,
): void {
  if (typeof window === 'undefined') return;
  const current = recentlyViewedStore.getSnapshot();
  const filtered = current.filter((e) => e.id !== entry.id);
  const next: readonly RecentlyViewedEntry[] = [
    { ...entry, viewedAtMs: Date.now() },
    ...filtered,
  ].slice(0, MAX_ENTRIES);
  recentlyViewedStore.set(next);
}

export function clearRecentlyViewed(): void {
  recentlyViewedStore.set(EMPTY);
}
