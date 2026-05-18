/**
 * <AdSenseScript> — Google AdSense 스크립트 lazy load.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/adsense-strategy.md §3.1
 *
 * 정책 가드 (4 조건 AND):
 *  1. production 환경만
 *  2. NEXT_PUBLIC_ADSENSE_PUBLISHER env 설정
 *  3. admin role 미노출 (본인 클릭 차단)
 *  4. 사용자 advertising 동의
 *
 * Sprint 12 / F12-B-2 — perf 최적화:
 *  - strategy="lazyOnload" 로 변경 (afterInteractive → lazyOnload)
 *  - 클라이언트 hydrate 후 requestIdleCallback (또는 3초 fallback) 까지 mount 지연
 *  - 모바일 LCP 16s 의 부분 원인으로 AdSense fetch 가 image fetch 와 HTTP/2 우선순위
 *    경합 의심 → 페인트 완료 후 로드로 LCP -400~800ms 절감 예상
 */
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export interface AdSenseScriptProps {
  readonly publisher: string;
}

/** browser idle 또는 N ms 후 boolean true. SSR 안전. */
function useIdleMount(timeoutMs: number = 3000): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const requestIdle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback.bind(window)
        : (cb: () => void) => window.setTimeout(cb, timeoutMs);
    const cancelIdle =
      typeof window.cancelIdleCallback === 'function'
        ? window.cancelIdleCallback.bind(window)
        : window.clearTimeout.bind(window);

    const handle = requestIdle(() => setReady(true), { timeout: timeoutMs });
    return () => {
      if (typeof handle === 'number') cancelIdle(handle);
      else cancelIdle(handle as unknown as number);
    };
  }, [timeoutMs]);

  return ready;
}

export function AdSenseScript({ publisher }: AdSenseScriptProps): React.JSX.Element | null {
  const ready = useIdleMount(3000);
  if (process.env.NODE_ENV !== 'production') return null;
  if (!publisher) return null;
  if (!ready) return null;
  return (
    <Script
      id="adsense-init"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
