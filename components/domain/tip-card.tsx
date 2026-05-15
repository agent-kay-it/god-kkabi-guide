/**
 * <TipCard> — 실전 팁 박스.
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.12
 */
import { Lightbulb } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tipVariants = cva(
  'flex gap-3 rounded-card border-l-4 bg-bg-card p-4 transition-card hover:bg-bg-card-hover',
  {
    variants: {
      category: {
        general: 'border-accent-gold',
        beginner: 'border-accent-cyan',
        advanced: 'border-accent-purple',
        pvp: 'border-accent-red',
      },
    },
    defaultVariants: { category: 'general' },
  },
);

const CATEGORY_LABEL = {
  general: '일반 팁',
  beginner: '초보 팁',
  advanced: '고급 팁',
  pvp: 'PvP 팁',
} as const;

export type TipCategory = keyof typeof CATEGORY_LABEL;

export interface TipCardProps extends VariantProps<typeof tipVariants> {
  category: TipCategory;
  title: string;
  content: string;
  className?: string;
}

export function TipCard({
  category,
  title,
  content,
  className,
}: TipCardProps): React.JSX.Element {
  return (
    <article
      className={cn(tipVariants({ category }), className)}
      aria-label={`${title} 팁`}
    >
      <Lightbulb
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 shrink-0 text-accent-gold"
      />
      <div className="flex-1">
        <header className="mb-1 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-text-primary">{title}</h3>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            {CATEGORY_LABEL[category]}
          </span>
        </header>
        <p className="text-sm leading-relaxed text-text-secondary">{content}</p>
      </div>
    </article>
  );
}
