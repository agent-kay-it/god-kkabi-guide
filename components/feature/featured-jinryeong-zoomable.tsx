/**
 * <FeaturedJinryeongZoomable> — Sprint V5 P3.B.
 * Lightbox 연동 wrapper for FeaturedJinryeong (server-rendered).
 *
 * Clean Architecture 경로:
 *  - domain/featured-jinryeong.tsx (server) → 시각적 표현만
 *  - feature/featured-jinryeong-zoomable.tsx (client) → 인터랙션 (lightbox)
 *
 * 동작:
 *  - 이미지 영역 위에 absolute invisible button 오버레이
 *  - 클릭 시 useLightbox().open(src, alt)
 *  - 키보드: Enter/Space로 활성화 (button native)
 *  - 280px md+ left column에 맞춰 절대 위치
 *
 * 출처: docs/sprint/07-sprint-v5/MASTER-PLAN.md §3
 */
'use client';

import {
  FeaturedJinryeong,
  type FeaturedJinryeongProps,
} from '@/components/domain';
import { useLightbox } from './lightbox-provider';

export interface FeaturedJinryeongZoomableProps extends FeaturedJinryeongProps {
  /** 이미지가 있을 때만 zoom 활성. 없으면 plain FeaturedJinryeong 렌더. */
}

export function FeaturedJinryeongZoomable(
  props: FeaturedJinryeongZoomableProps,
): React.JSX.Element {
  const { open } = useLightbox();
  const { data } = props;

  if (!data.imageUrl) {
    return <FeaturedJinryeong {...props} />;
  }

  const imageUrl = data.imageUrl;
  const altText = `${data.name} 상세 — ${data.effectShort}`;

  return (
    <div className="relative">
      <FeaturedJinryeong {...props} />
      <button
        type="button"
        aria-label={`${data.name} 이미지 확대`}
        onClick={() => open(imageUrl, altText)}
        className={[
          'absolute left-0 top-0 z-10 cursor-zoom-in',
          // 모바일: 이미지 영역 전체 (aspect-[16/9] 상단)
          'h-[56.25vw] max-h-[280px] w-full',
          // md+: 280px 좌측 컬럼만 (전체 높이)
          'md:h-full md:w-[280px] md:max-h-none',
          'focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-[-2px]',
        ].join(' ')}
      />
    </div>
  );
}
