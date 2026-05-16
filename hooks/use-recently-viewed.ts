/**
 * useRecentlyViewed — Sprint V7 P3.A + P4 (useSyncExternalStore).
 *
 * localStorage 외부 상태를 React에 동기화. SSR-safe (server snapshot = empty).
 * 같은 탭의 다른 컴포넌트에서 addRecentlyViewed 호출 시 즉시 반영.
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §2
 */
'use client';

import { useSyncExternalStore } from 'react';

import {
  recentlyViewedStore,
  type RecentlyViewedEntry,
} from '@/lib/personalization/recently-viewed';

export function useRecentlyViewed(): readonly RecentlyViewedEntry[] {
  return useSyncExternalStore(
    recentlyViewedStore.subscribe,
    recentlyViewedStore.getSnapshot,
    recentlyViewedStore.getServerSnapshot,
  );
}
