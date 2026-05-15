/**
 * <Hero> — 페이지 상단 앱 아이콘 + 타이틀 + 메타 정보.
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.1
 * 원본 HTML: source/original-guide.html `<header class="hero">`
 *
 * Server Component (인터랙티브 없음).
 * 타이틀은 AnimatedGradientText로 골드 그라데이션 적용.
 */
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AnimatedGradientText } from '@/components/motion/animated-gradient-text';
import { BlurFade } from '@/components/motion/blur-fade';

export interface HeroProps {
  iconUrl: string;
  iconAlt?: string;
  title: string;
  subtitle: string;
  metaInfo: string;
  className?: string;
}

export function Hero({
  iconUrl,
  iconAlt = '갓깨비 키우기 앱 아이콘',
  title,
  subtitle,
  metaInfo,
  className,
}: HeroProps): React.JSX.Element {
  return (
    <header
      className={cn(
        'relative isolate overflow-hidden rounded-card-large px-6 py-12 text-center sm:py-16',
        className,
      )}
      aria-label="갓깨비 키우기 가이드 메인 헤더"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(232, 184, 96, 0.18) 0%, transparent 60%)',
        }}
      />

      <BlurFade delay={0.05} yOffset={12}>
        <div className="mx-auto h-[120px] w-[120px] overflow-hidden rounded-app-icon shadow-glow ring-1 ring-border-gold">
          <Image
            src={iconUrl}
            alt={iconAlt}
            width={120}
            height={120}
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </BlurFade>

      <BlurFade delay={0.15} yOffset={16}>
        <h1
          className="mt-6 text-[clamp(1.8rem,5vw,2.6rem)] font-black leading-tight tracking-tight"
        >
          <AnimatedGradientText>{title}</AnimatedGradientText>
        </h1>
      </BlurFade>

      <BlurFade delay={0.25} yOffset={12}>
        <p className="mt-3 text-base text-text-secondary sm:text-lg">{subtitle}</p>
      </BlurFade>

      <BlurFade delay={0.35} yOffset={8}>
        <span
          className="mt-5 inline-flex items-center gap-2 rounded-pill border border-border-gold px-4 py-1.5 text-xs font-medium text-accent-gold sm:text-sm"
          style={{ background: 'rgba(232, 184, 96, 0.08)' }}
        >
          {metaInfo}
        </span>
      </BlurFade>
    </header>
  );
}
