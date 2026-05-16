/**
 * <AdSlotSticky> — 하단 고정 AdSense 슬롯.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/adsense-strategy.md §5.2
 *
 * 사이즈:
 *  - mobile: 320x50
 *  - desktop: 728x90
 *
 * 정책: dev 환경 / admin role / 미동의 시 미렌더 (layout.tsx 가드)
 */
'use client';

import { useEffect, useRef } from 'react';

export interface AdSlotStickyProps {
  readonly publisher: string;
  readonly slot: string;
}

export function AdSlotSticky({
  publisher,
  slot,
}: AdSlotStickyProps): React.JSX.Element | null {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    try {
      // adsbygoogle 큐에 push (script load 이후 광고 fill)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ads = (window as any).adsbygoogle;
      if (Array.isArray(ads)) ads.push({});
    } catch {
      // silent — 광고 fill 실패는 무시
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') return null;
  if (!publisher || !slot) return null;

  return (
    <div
      role="complementary"
      aria-label="광고"
      className="fixed inset-x-0 bottom-0 z-40 flex h-[60px] justify-center border-t border-ink-line bg-[rgba(7,7,11,0.92)] backdrop-blur-md sm:h-[100px]"
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '320px', height: '50px' }}
        data-ad-client={publisher}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
