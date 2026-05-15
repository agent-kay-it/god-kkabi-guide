/**
 * AnimatedGradientText — Magic UI 모션 컴포넌트 (CSS animation 기반 수동 구현).
 * 출처: https://magicui.design/docs/components/animated-gradient-text
 *
 * 텍스트에 흐르는 골드 그라데이션 애니메이션 적용.
 * Hero h1.title에 사용 — 원본 HTML gradient 정밀 재현.
 * prefers-reduced-motion: 정적 골드 텍스트로 폴백.
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  /** 애니메이션 속도 (초). 기본 4s */
  speed?: number;
}

/**
 * AnimatedGradientText — 흐르는 골드 그라데이션 텍스트.
 * Server Component (CSS animation만 사용, JS 불필요).
 *
 * @example
 * <AnimatedGradientText className="text-4xl font-black">
 *   갓깨비 키우기 완전 공략
 * </AnimatedGradientText>
 */
export function AnimatedGradientText({
  children,
  className,
  speed = 4,
}: AnimatedGradientTextProps): React.JSX.Element {
  return (
    <span
      className={cn('inline-block bg-clip-text text-transparent', className)}
      style={{
        backgroundImage:
          'linear-gradient(135deg, var(--color-accent-gold-light), var(--color-accent-gold), #c79a3f, var(--color-accent-gold), var(--color-accent-gold-light))',
        backgroundSize: '200% auto',
        animation: `gradient-flow ${speed}s linear infinite`,
      }}
    >
      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-animated-gradient] {
            animation: none !important;
            background-position: 0% center;
          }
        }
      `}</style>
      <span data-animated-gradient>{children}</span>
    </span>
  );
}
