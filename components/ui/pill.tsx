/**
 * Pill — rounded-full 칩 컴포넌트. HeroMeta / 채널 라벨 / 빌드 태그 공용.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.2 (HeroMeta 패턴 확장)
 *
 * Badge와 차별점:
 *  - Badge = 상태/등급 표시 (작은 라벨)
 *  - Pill  = 메타데이터 칩 (Hero 상단의 build/version/date 묶음, 내부에 아이콘 + chip)
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const pillVariants = cva(
  'inline-flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3.5 text-[0.78rem] tracking-wide backdrop-blur-[10px]',
  {
    variants: {
      variant: {
        default: 'border-ink-line-strong bg-[rgba(14,14,21,0.6)] text-text-soft',
        bronze: 'border-bronze/30 bg-bronze/10 text-bronze-soft',
        jade: 'border-jade/30 bg-jade/10 text-jade-soft',
        vermilion: 'border-vermilion/30 bg-vermilion/10 text-vermilion-soft',
        indigo: 'border-indigo/30 bg-indigo/10 text-indigo',
      },
      size: {
        sm: 'py-1 pl-1.5 pr-3 text-[0.72rem]',
        default: 'py-1.5 pl-2 pr-3.5 text-[0.78rem]',
        lg: 'py-2 pl-2.5 pr-4 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface PillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillVariants> {}

export function Pill({
  className,
  variant,
  size,
  ...props
}: PillProps): React.JSX.Element {
  return (
    <div className={cn(pillVariants({ variant, size }), className)} {...props} />
  );
}
