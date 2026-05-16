/**
 * ShimmerButton — Magic UI 모션 컴포넌트 (CSS animation + framer-motion 기반).
 * 출처: https://magicui.design/docs/components/shimmer-button
 *
 * v2: bronze rgba shimmer + ink-card background.
 * 버튼 위를 흐르는 shimmer 광택 효과.
 * prefers-reduced-motion: shimmer 비활성화.
 */
'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** shimmer 색상 (기본 bronze rgba) */
  shimmerColor?: string;
  /** shimmer 크기 */
  shimmerSize?: string;
  /** shimmer 속도 (초) */
  shimmerDuration?: string;
  /** 배경 반경 */
  borderRadius?: string;
  /** 배경 색상 */
  background?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * ShimmerButton — 광택이 흐르는 버튼. v2 bronze 토큰 매핑.
 *
 * @example
 * <ShimmerButton onClick={handleCopy}>
 *   <Copy className="h-4 w-4" />
 *   복사
 * </ShimmerButton>
 */
export function ShimmerButton({
  shimmerColor = 'rgba(232, 199, 154, 0.5)',
  shimmerSize = '0.1em',
  shimmerDuration = '2s',
  borderRadius = '14px',
  background = 'var(--color-ink-card-strong)',
  className,
  children,
  ...props
}: ShimmerButtonProps): React.JSX.Element {
  return (
    <button
      className={cn(
        'group relative cursor-pointer overflow-hidden px-6 py-3',
        'text-sm font-semibold text-text',
        'border border-bronze/30',
        'transition-all duration-300 hover:border-bronze',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={{ borderRadius, background }}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <span
          className="shimmer-element absolute inset-0 -translate-x-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
            width: shimmerSize === '0.1em' ? '100%' : shimmerSize,
            animation: `shimmer ${shimmerDuration} ease-in-out infinite`,
          }}
        />
      </span>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer-element { animation: none !important; }
        }
      `}</style>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
