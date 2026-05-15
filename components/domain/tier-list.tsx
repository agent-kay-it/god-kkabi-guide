/**
 * <TierList> — 0/1/2 티어 행 분리 + 진령 11종 매핑.
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.5
 */
import { cn } from '@/lib/utils';
import { JinryeongCard, type JinryeongCardProps } from './jinryeong-card';
import type { JinryeongTier } from '@/types';

export interface TierRow {
  tier: JinryeongTier;
  label: string;
  cards: readonly JinryeongCardProps[];
}

export interface TierListProps {
  tiers: readonly TierRow[];
  className?: string;
}

const TIER_ACCENT: Record<JinryeongTier, string> = {
  0: 'text-accent-gold',
  1: 'text-accent-cyan',
  2: 'text-accent-green',
};

export function TierList({ tiers, className }: TierListProps): React.JSX.Element {
  return (
    <section
      className={cn('space-y-8', className)}
      aria-label="진령 티어 리스트"
    >
      {tiers.map((row) => (
        <div
          key={row.tier}
          className="space-y-3 border-b border-border-soft pb-6 last:border-b-0 last:pb-0"
        >
          <h3
            className={cn(
              'text-lg font-bold sm:text-xl',
              TIER_ACCENT[row.tier],
            )}
          >
            {row.label}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {row.cards.map((card) => (
              <JinryeongCard key={card.id} {...card} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
