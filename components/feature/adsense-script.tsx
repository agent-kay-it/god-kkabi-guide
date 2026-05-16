/**
 * <AdSenseScript> — Google AdSense 스크립트 lazy load.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/adsense-strategy.md §3.1
 *
 * 정책 가드 (4 조건 AND):
 *  1. production 환경만
 *  2. NEXT_PUBLIC_ADSENSE_PUBLISHER env 설정
 *  3. admin role 미노출 (본인 클릭 차단)
 *  4. 사용자 advertising 동의
 */
'use client';

import Script from 'next/script';

export interface AdSenseScriptProps {
  readonly publisher: string;
}

export function AdSenseScript({ publisher }: AdSenseScriptProps): React.JSX.Element | null {
  if (process.env.NODE_ENV !== 'production') return null;
  if (!publisher) return null;
  return (
    <Script
      id="adsense-init"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
