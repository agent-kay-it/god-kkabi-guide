/**
 * useRecentSearches — Sprint V7 P4.
 *
 * localStorage 외부 상태를 React에 동기화. SSR-safe.
 * addRecentSearch 호출 시 동일 탭 내 다른 컴포넌트도 즉시 반영.
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §4
 */
'use client';

import { useSyncExternalStore } from 'react';

import { recentSearchesStore } from '@/lib/personalization/recent-searches';

export function useRecentSearches(): readonly string[] {
  return useSyncExternalStore(
    recentSearchesStore.subscribe,
    recentSearchesStore.getSnapshot,
    recentSearchesStore.getServerSnapshot,
  );
}
