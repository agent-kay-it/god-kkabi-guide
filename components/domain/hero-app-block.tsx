/**
 * <HeroAppBlock> — Sprint V4 P3.C.
 * source/godkkabi-guide/index.html `.hero-app` 이식.
 *
 * 구성:
 *   [86×86 app-icon] [name + sub + rating]
 *
 * 디자인 토큰:
 *  - app-icon: 22px radius + bronze shadow + hover scale(1.06) rotate(-3deg)
 *  - rating: ★ 4.8 · 64K reviews · 500K+ 다운로드 (bronze-soft + JetBrains Mono dots)
 *
 * Play Store 외부 링크는 next/link 대신 <a target="_blank">로 처리 (rel="noopener noreferrer").
 *
 * 출처: docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.3 + source CSS 322-362
 */
import Image from 'next/image';

import { cn } from '@/lib/utils';

export interface HeroAppBlockProps {
  /** Play Store URL — 기본 갓깨비 공식 링크 */
  readonly href?: string;
  /** 앱 이름 */
  readonly name?: string;
  /** 부제 (개발사 · 장르) */
  readonly sub?: string;
  /** ★ 별점 */
  readonly rating?: string;
  /** 리뷰 수 */
  readonly reviewCount?: string;
  /** 다운로드 수 */
  readonly downloadCount?: string;
  readonly className?: string;
}

const DEFAULT_HREF =
  'https://play.google.com/store/apps/details?id=com.zzsjkr.google';

export function HeroAppBlock({
  href = DEFAULT_HREF,
  name = '갓깨비 키우기-999뽑기 증정',
  sub = 'Joy Nice Games · Role Playing',
  rating = '4.8',
  reviewCount = '64K reviews',
  downloadCount = '500K+ 다운로드',
  className,
}: HeroAppBlockProps): React.JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center gap-5 no-underline outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-ink-base',
        'rounded-2xl',
        className,
      )}
      aria-label={`${name} — Play Store에서 열기`}
    >
      {/* App icon — 70×70 모바일, 86×86 데스크톱 */}
      <div
        className={cn(
          'relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[18px] sm:h-[86px] sm:w-[86px] sm:rounded-[22px]',
          'shadow-[0_20px_50px_-15px_rgba(200,153,104,0.5),0_0_0_1px_rgba(255,255,255,0.1)]',
          'transition-transform duration-200 ease-out',
          'group-hover:scale-[1.06] group-hover:rotate-[-3deg]',
        )}
      >
        <Image
          src="/images/wiki/app-icon.webp"
          alt="갓깨비 키우기 앱 아이콘"
          width={172}
          height={172}
          sizes="(max-width: 640px) 70px, 86px"
          className="h-full w-full object-cover"
          priority
        />
        {/* shine overlay — group-hover opacity-100 */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background:
              'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Text block */}
      <div className="grid gap-0.5">
        <div className="text-[0.95rem] font-semibold text-text">{name}</div>
        <div className="text-[0.78rem] text-text-mute">{sub}</div>
        <div className="mt-1 inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.82rem] font-semibold text-bronze-soft">
          <span className="text-bronze" aria-hidden>
            ★
          </span>
          <span>{rating}</span>
          <span
            aria-hidden
            className="h-[3px] w-[3px] rounded-full bg-text-mute"
          />
          <span className="font-medium text-text-mute">{reviewCount}</span>
          <span
            aria-hidden
            className="h-[3px] w-[3px] rounded-full bg-text-mute"
          />
          <span className="font-medium text-text-mute">{downloadCount}</span>
        </div>
      </div>
    </a>
  );
}
