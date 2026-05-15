/**
 * <BuildTagBadge> — 빌드 태그 (11종 enum 대응).
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.15
 *
 * 카테고리별 액센트 색상:
 *  - pvp/결투장 = red
 *  - pve/boss/무한던전/비경 = cyan
 *  - 초보/중수/고수 = gold
 *  - meta = gold glow
 *  - experimental = purple
 *
 * 클릭 가능 시 hover bg-card-hover.
 *
 * NOTE: 'use client' — V1+ 빌드 목록 필터 UI에서 onClick 핸들러 사용.
 * MVP는 정적 표시만 사용해도 클라이언트 바운더리는 필수 (조건부 onClick props).
 */
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BuildTag } from '@/types';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-xs font-semibold transition-badge',
  {
    variants: {
      category: {
        combat: 'border-accent-red bg-accent-red/10 text-accent-red',
        content: 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan',
        level: 'border-accent-gold bg-accent-gold/10 text-accent-gold',
        meta: 'border-accent-gold bg-accent-gold/15 text-accent-gold shadow-glow',
        experimental: 'border-accent-purple bg-accent-purple/10 text-accent-purple',
      },
      size: {
        sm: 'px-2 py-0 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
      },
      interactive: {
        true: 'cursor-pointer hover:bg-bg-card-hover',
        false: '',
      },
    },
    defaultVariants: { category: 'content', size: 'md', interactive: false },
  },
);

const TAG_CATEGORY: Record<BuildTag, NonNullable<VariantProps<typeof badgeVariants>['category']>> = {
  pve: 'content',
  pvp: 'combat',
  boss: 'content',
  결투장: 'combat',
  무한던전: 'content',
  비경: 'content',
  초보: 'level',
  중수: 'level',
  고수: 'level',
  meta: 'meta',
  experimental: 'experimental',
};

export interface BuildTagBadgeProps {
  tag: BuildTag;
  size?: 'sm' | 'md';
  onClick?: (tag: BuildTag) => void;
  className?: string;
}

export function BuildTagBadge({
  tag,
  size = 'md',
  onClick,
  className,
}: BuildTagBadgeProps): React.JSX.Element {
  const category = TAG_CATEGORY[tag];
  const interactive = Boolean(onClick);

  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onClick?.(tag)}
        className={cn(badgeVariants({ category, size, interactive: true }), className)}
        aria-label={`태그 ${tag} 필터`}
      >
        {tag}
      </button>
    );
  }

  return (
    <span
      className={cn(badgeVariants({ category, size }), className)}
      aria-label={`태그 ${tag}`}
    >
      {tag}
    </span>
  );
}
