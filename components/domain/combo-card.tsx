/**
 * <ComboCard> — 3종 추천 조합 (시너지 카드).
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.6
 */
import { ArrowRight } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ClassId } from '@/types';

const comboVariants = cva(
  'flex flex-col gap-3 rounded-card border bg-bg-card p-5 transition-card hover:bg-bg-card-hover',
  {
    variants: {
      type: {
        meta: 'border-accent-gold shadow-glow',
        damage: 'border-accent-red',
        stability: 'border-accent-cyan',
      },
    },
    defaultVariants: { type: 'meta' },
  },
);

export type ComboType = 'meta' | 'damage' | 'stability';

export interface ComboCardProps extends VariantProps<typeof comboVariants> {
  title: string;
  jinryeong3: readonly [string, string, string];
  description: string;
  recommendedFor: readonly ClassId[];
  type: ComboType;
  className?: string;
}

const CLASS_EMOJI: Record<ClassId, string> = {
  warrior: '⚔️',
  swordsman: '🗡️',
  medium: '🔮',
};

const TYPE_LABEL: Record<ComboType, string> = {
  meta: '메타 정석',
  damage: '폭딜 특화',
  stability: '안정 운영',
};

export function ComboCard({
  title,
  jinryeong3,
  description,
  recommendedFor,
  type,
  className,
}: ComboCardProps): React.JSX.Element {
  return (
    <article
      className={cn(comboVariants({ type }), className)}
      aria-label={`${title} 조합`}
    >
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        <span className="rounded-pill bg-bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {TYPE_LABEL[type]}
        </span>
      </header>

      <div className="flex items-center justify-center gap-1.5 rounded-lg bg-bg-secondary px-3 py-3">
        {jinryeong3.map((name, i) => (
          <span key={`${name}-${i}`} className="flex items-center gap-1.5 text-sm">
            <span className="rounded-pill bg-bg-card px-2.5 py-1 font-medium text-text-primary">
              {name}
            </span>
            {i < jinryeong3.length - 1 ? (
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-accent-gold" />
            ) : null}
          </span>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>

      <footer className="flex items-center gap-2 text-xs text-text-muted">
        <span className="font-semibold">추천 직업</span>
        <ul className="flex gap-1.5">
          {recommendedFor.map((c) => (
            <li key={c} className="text-sm" aria-label={c}>
              {CLASS_EMOJI[c]}
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
