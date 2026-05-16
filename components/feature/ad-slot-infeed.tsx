/**
 * <AdSlotInfeed> — 게시물 리스트 인피드 AdSense 슬롯.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/adsense-strategy.md §5.3
 *
 * 위치: /post 리스트 5번째 슬롯 위치 (PostCard 사이 삽입)
 */
'use client';

import { useEffect } from 'react';

export interface AdSlotInfeedProps {
  readonly publisher: string;
  readonly slot: string;
}

export function AdSlotInfeed({
  publisher,
  slot,
}: AdSlotInfeedProps): React.JSX.Element | null {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ads = (window as any).adsbygoogle;
      if (Array.isArray(ads)) ads.push({});
    } catch {
      // silent
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') return null;
  if (!publisher || !slot) return null;

  return (
    <div
      role="complementary"
      aria-label="광고"
      className="overflow-hidden rounded-lg border border-ink-line bg-ink-card-strong p-2"
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisher}
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
      />
    </div>
  );
}
