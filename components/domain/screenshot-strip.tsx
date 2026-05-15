/**
 * <ScreenshotStrip> — Google Play 스크린샷 가로 스크롤.
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.13
 *
 * 디자인: 가로 overflow-x scroll + scroll-snap-x mandatory.
 * 모바일에서 한 번에 1.2장 보이도록 width 조정.
 * 이미지: next/image + play-lh.googleusercontent.com 핫링크.
 */
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ScreenshotItem {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ScreenshotStripProps {
  images: readonly ScreenshotItem[];
  sourceLabel?: string;
  className?: string;
}

export function ScreenshotStrip({
  images,
  sourceLabel = 'Google Play 공식 스크린샷',
  className,
}: ScreenshotStripProps): React.JSX.Element {
  return (
    <section
      className={cn('space-y-2', className)}
      aria-label="갓깨비 키우기 게임 스크린샷"
    >
      {sourceLabel ? (
        <p className="text-xs text-text-muted">
          <span className="rounded-pill bg-bg-secondary px-2 py-0.5">{sourceLabel}</span>
        </p>
      ) : null}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'thin' }}
      >
        {images.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="relative shrink-0 overflow-hidden rounded-card border border-border-soft"
            style={{
              width: 'min(80vw, 280px)',
              aspectRatio: '9 / 16',
              scrollSnapAlign: 'start',
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 80vw, 280px"
              className="object-cover"
              loading={i < 2 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
