/**
 * GlassCard — Editorial × Glassmorphism 카드 표면.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.3
 *
 * 책임:
 *  - rgba(22, 22, 32, 0.55) + backdrop-filter blur(12px) saturate(160%)
 *  - 선택적 좌측 3px stripe (accent prop, 5 종)
 *  - hover 시 ink-card-strong + bronze stripe 강화
 *  - shadcn Card와 분리하여 도메인 카드 (직업/진령/장비 등)에 사용
 *
 * 사용 예:
 *   <GlassCard accent="warrior">전사 카드 본문</GlassCard>
 *   <GlassCard className="p-6">기본 glass</GlassCard>
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const glassCardVariants = cva(
  'glass transition-card relative overflow-hidden rounded-[var(--radius-card)]',
  {
    variants: {
      accent: {
        warrior: 'before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-vermilion before:content-[""]',
        swordsman: 'before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-bronze before:content-[""]',
        mage: 'before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-indigo before:content-[""]',
        pve: 'before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-jade before:content-[""]',
        pvp: 'before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-vermilion before:content-[""]',
        none: '',
      },
      interactive: {
        true: 'hover:bg-ink-card-strong hover:border-ink-line-strong cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      accent: 'none',
      interactive: false,
    },
  },
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

export function GlassCard({
  className,
  accent,
  interactive,
  ...props
}: GlassCardProps): React.JSX.Element {
  return (
    <div
      className={cn(glassCardVariants({ accent, interactive }), className)}
      {...props}
    />
  );
}
