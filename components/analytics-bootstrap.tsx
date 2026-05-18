/**
 * AnalyticsBootstrap — Client Component (side-effect only).
 * 출처: docs/sprint/02-sprint-mvp/design.md §10.2.4
 *
 * Phase 5 iterate (Performance 68 → ≥90):
 *  - requestIdleCallback으로 Analytics 초기화 지연 (LCP/FID 영향 0)
 *  - fallback: setTimeout 2초 (브라우저 idle 미지원 시)
 *  - 초기 렌더 critical path에서 Firebase SDK 완전 분리
 *
 * Sprint 12 / F12-B-5:
 *  - production 환경에서만 init (dev/staging 에서 GA hit 발생 차단)
 *  - 시작 시점에 production 가드를 두어 idle 콜백 자체도 등록 안 함
 */
'use client';

import { useEffect } from 'react';
import { getAnalyticsClient } from '@/lib/firebase/analytics';

export function AnalyticsBootstrap(): null {
  useEffect(() => {
    // Sprint 12 / F12-B-5 — dev/staging 에서 GA 발화 차단.
    // Firebase Analytics SDK 자체 dynamic chunk 는 그대로 (lazy init 시점에 fetch).
    if (process.env.NODE_ENV !== 'production') return;

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
