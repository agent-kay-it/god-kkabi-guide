/**
 * LoginSuccessTracker — GA4 `login` 이벤트 1회 발화.
 * 출처: docs/sprint/04-sprint-v1/design.md §7 + plan.md §P3.A.2
 *      + docs/sprint/10-sprint-launch/prd.md §2.F1.1 (Sprint 10에서 Kakao 제거)
 *
 * 동작:
 *  - useSearchParams로 `?login=success&method=google` 감지
 *  - 발화 후 history.replaceState로 search param 정리 (재발화 방지)
 *  - 페이지 전환 시점에 mount되므로 1회만 동작
 *
 * 호출 위치: app/layout.tsx body 안 (모든 페이지 mount)
 */
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { logEvent } from '@/lib/firebase/analytics';

const VALID_METHODS = new Set(['google']);

export function LoginSuccessTracker(): null {
  const searchParams = useSearchParams();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (searchParams?.get('login') !== 'success') return;
    const rawMethod = searchParams.get('method');
    if (!rawMethod || !VALID_METHODS.has(rawMethod)) return;
    firedRef.current = true;

    void logEvent('login', { method: rawMethod as 'google' });

    // URL 정리 — 재발화 방지 + 공유 URL 위생
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('login');
      url.searchParams.delete('method');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  return null;
}
