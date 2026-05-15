/**
 * AnalyticsBootstrap — Client Component (side-effect only).
 * 출처: docs/sprint/02-sprint-mvp/design.md §10.2.4
 *
 * Phase 5 iterate (Performance 68 → ≥90):
 *  - requestIdleCallback으로 Analytics 초기화 지연 (LCP/FID 영향 0)
 *  - fallback: setTimeout 2초 (브라우저 idle 미지원 시)
 *  - 초기 렌더 critical path에서 Firebase SDK 완전 분리
 */
'use client';

import { useEffect } from 'react';
import { getAnalyticsClient } from '@/lib/firebase/analytics';

export function AnalyticsBootstrap(): null {
  useEffect(() => {
    const init = (): void => {
      void getAnalyticsClient();
    };

    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    if (typeof ric === 'function') {
      ric(init, { timeout: 4000 });
      return;
    }
    const tid = window.setTimeout(init, 2000);
    return () => window.clearTimeout(tid);
  }, []);
  return null;
}
