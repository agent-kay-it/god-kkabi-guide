/**
 * ShimmerButton — Magic UI 모션 컴포넌트 (CSS animation + framer-motion 기반).
 * 출처: https://magicui.design/docs/components/shimmer-button
 *
 * 버튼 위를 흐르는 shimmer 광택 효과.
 * MVP에서는 CouponCode 복사 버튼 V1+ 교체용으로 준비.
 * prefers-reduced-motion: shimmer 비활성화.
 */
'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** shimmer 색상 (기본 골드 rgba) */
  shimmerColor?: string;
  /** shimmer 크기 (기본 100%) */
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
 * ShimmerButton — 광택이 흐르는 버튼.
 *
 * @example
 * <ShimmerButton onClick={handleCopy}>
 *   <Copy className="h-4 w-4" />
 *   복사
 * </ShimmerButton>
 */
export function ShimmerButton({
  shimmerColor = 'rgba(232, 184, 96, 0.5)',
  shimmerSize = '0.1em',
  shimmerDuration = '2s',
  borderRadius = '14px',
  background = 'var(--color-bg-card)',
  className,
  children,
  ...props
}: ShimmerButtonProps): React.JSX.Element {
  return (
    <button
      className={cn(
        'group relative cursor-pointer overflow-hidden px-6 py-3',
        'text-sm font-semibold text-[var(--color-text-primary)]',
        'border border-[var(--color-border-gold)]',
        'transition-all duration-300 hover:border-[var(--color-accent-gold)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={{ borderRadius, background }}
      {...props}
    >
      {/* shimmer overlay */}
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
      {/* content */}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
