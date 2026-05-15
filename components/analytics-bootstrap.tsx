/**
 * AnalyticsBootstrap — Client Component (side-effect only).
 * 출처: docs/sprint/02-sprint-mvp/design.md §10.2.4
 *
 * Root layout(Server Component)이 본 컴포넌트를 mount하면
 * useEffect에서 Firebase Analytics 클라이언트를 초기화한다.
 * getAnalyticsClient() 첫 호출 시점에 자동 page_view 이벤트가 발화된다.
 */
'use client';

import { useEffect } from 'react';
import { getAnalyticsClient } from '@/lib/firebase/analytics';

export function AnalyticsBootstrap(): null {
  useEffect(() => {
    void getAnalyticsClient();
  }, []);
  return null;
}
