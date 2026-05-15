/**
 * <HeroBackdrop> — Sprint V4 P3.C.
 * source/godkkabi-guide/index.html `.hero-backdrop` 이식.
 *
 * 6장 배너 듀얼 row 마퀴:
 *   r1: top 36%, 70s normal,  banners[0..2]
 *   r2: top 76%, 90s reverse, banners[3..5]
 *
 * 디자인:
 *  - absolute inset-0 + z-0 + pointer-events-none (배경 전용)
 *  - ::after 오버레이 — radial vignette + linear fade (텍스트 가독성)
 *  - ::before — edge vignette
 *  - .hero-marquee-row className으로 globals.css 애니메이션 연동
 *  - prefers-reduced-motion → 애니메이션 정지 (globals.css)
 *  - 모바일: row height 240→190px, opacity 0.6→0.55 (globals.css 미디어쿼리 위임 가능. 현재는 inline sizes)
 *
 * 자식 이미지 6장은 props로 받지 않고 상수로 묶음 — Hero 단일 사용 컴포넌트.
 * 향후 다른 페이지에서 재사용 시 props로 확장.
 *
 * 출처: docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.3 + source CSS 188-262
 */
import Image from 'next/image';

import { cn } from '@/lib/utils';

interface BannerImage {
  readonly src: string;
  readonly alt: string;
}

const ROW_1: readonly BannerImage[] = [
  { src: '/images/wiki/banner-fantasy-explore.webp', alt: '' },
  { src: '/images/wiki/banner-demon-king.webp', alt: '' },
  { src: '/images/wiki/banner-coop-battle.webp', alt: '' },
];

const ROW_2: readonly BannerImage[] = [
  { src: '/images/wiki/banner-korean-carry.webp', alt: '' },
  { src: '/images/wiki/banner-infinite-gear.webp', alt: '' },
  { src: '/images/wiki/banner-baekgwi.webp', alt: '' },
];

export interface HeroBackdropProps {
  readonly className?: string;
}

export function HeroBackdrop({ className }: HeroBackdropProps): React.JSX.Element {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-0 overflow-hidden',
        // ::after — radial + linear 오버레이 (텍스트 가독성)
        'after:absolute after:inset-0 after:z-[2] after:pointer-events-none after:content-[""]',
        'after:[background:radial-gradient(ellipse_75%_55%_at_50%_45%,rgba(7,7,11,0.30)_0%,rgba(7,7,11,0.70)_55%,rgba(7,7,11,0.93)_100%),linear-gradient(180deg,rgba(7,7,11,0.30)_0%,rgba(7,7,11,0.35)_50%,var(--color-ink-base)_100%)]',
        // ::before — edge vignette
        'before:absolute before:inset-0 before:z-[2] before:pointer-events-none before:content-[""]',
        'before:[background:radial-gradient(ellipse_100%_80%_at_50%_50%,transparent_45%,rgba(7,7,11,0.5)_100%)]',
        className,
      )}
    >
      {/* Row 1 — 70s normal, top 36% */}
      <div
        className="hero-marquee-row top-[36%]"
        style={
          {
            '--marquee-duration': 'var(--duration-marquee-r1)',
          } as React.CSSProperties
        }
      >
        {[...ROW_1, ...ROW_1].map((img, i) => (
          <BannerImg key={`r1-${i}`} src={img.src} alt={img.alt} />
        ))}
      </div>

      {/* Row 2 — 90s reverse, top 76% */}
      <div
        className="hero-marquee-row top-[76%]"
        style={
          {
            '--marquee-duration': 'var(--duration-marquee-r2)',
            '--marquee-direction': 'reverse',
          } as React.CSSProperties
        }
      >
        {[...ROW_2, ...ROW_2].map((img, i) => (
          <BannerImg key={`r2-${i}`} src={img.src} alt={img.alt} />
        ))}
      </div>
    </div>
  );
}

/**
 * Hero backdrop 전용 이미지 — height 240px / 모바일 190px,
 * opacity/필터는 source 값 그대로 적용. Next/Image 사용 (LCP 최적화).
 */
function BannerImg({ src, alt }: BannerImage): React.JSX.Element {
  return (
    <div className="relative h-[190px] w-auto shrink-0 sm:h-[240px]">
      <Image
        src={src}
        alt={alt}
        width={420}
        height={240}
        sizes="420px"
        priority={false}
        loading="lazy"
        className="h-full w-auto rounded-[14px] object-cover opacity-[0.55] [filter:saturate(1)_brightness(0.8)_contrast(1.02)] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.65)] sm:opacity-60"
      />
    </div>
  );
}
