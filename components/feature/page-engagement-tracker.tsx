/**
 * <PageEngagementTracker> — scroll_depth_75 + dwell_60 이벤트 발화.
 * 출처: docs/sprint/02-sprint-mvp/design.md §10.2 GA4 이벤트 정의
 *
 * Client Component:
 *  - IntersectionObserver로 75% 스크롤 감지 (scroll_depth_75)
 *  - setTimeout 60초 타이머로 dwell 감지 (dwell_60)
 *  - 각 이벤트는 세션 내 1회만 발화 (중복 방지)
 *
 * 삽입 위치: app/layout.tsx (모든 페이지 공통 적용).
 * UI 없음 — null 반환.
 */
'use client';

import { useEffect, useRef } from 'react';
import { logEvent } from '@/lib/firebase/analytics';

interface PageEngagementTrackerProps {
  /** 페이지 식별자 — GA4 params.page에 포함 */
  pagePath?: string;
}

export function PageEngagementTracker({
  pagePath,
}: PageEngagementTrackerProps): null {
  const scrollFiredRef = useRef<boolean>(false);
  const dwellFiredRef = useRef<boolean>(false);

  // ── 75% 스크롤 감지 ──────────────────────────────────────────
  useEffect(() => {
    scrollFiredRef.current = false;

    // 페이지 하단 75% 지점에 sentinel 요소 배치
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText =
      'position:absolute;top:75%;left:0;width:1px;height:1px;pointer-events:none';
    document.body.style.position = 'relative';
    document.body.appendChild(sentinel);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !scrollFiredRef.current) {
          scrollFiredRef.current = true;
          void logEvent('scroll_depth_75', {
            page: pagePath ?? window.location.pathname,
            depth: 75,
          });
        }
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [pagePath]);

  // ── 60초 체류 감지 ───────────────────────────────────────────
  useEffect(() => {
    dwellFiredRef.current = false;

    const timerId = window.setTimeout(() => {
      if (!dwellFiredRef.current) {
        dwellFiredRef.current = true;
        void logEvent('dwell_60', {
          page: pagePath ?? window.location.pathname,
          seconds: 60,
        });
      }
    }, 60_000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [pagePath]);

  return null;
}
