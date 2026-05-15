/**
 * <JinryeongCard> — 진령 카드 (11종, 0/1/2 티어별 보더 색상).
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.4
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ClassId, JinryeongTier } from '@/types';

const jinryeongVariants = cva(
  'group relative flex h-full flex-col gap-2 rounded-card border bg-bg-card p-4 transition-card hover:bg-bg-card-hover',
  {
    variants: {
      tier: {
        0: 'border-accent-gold shadow-glow',
        1: 'border-accent-cyan',
        2: 'border-accent-green',
      },
    },
    defaultVariants: { tier: 1 },
  },
);

const rarityBadgeVariants = cva(
  'absolute right-3 top-3 rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
  {
    variants: {
      rarity: {
        SSR: 'bg-accent-gold text-bg-primary',
        SR: 'bg-text-muted text-bg-primary',
      },
    },
    defaultVariants: { rarity: 'SR' },
  },
);

export type JinryeongRarity = 'SSR' | 'SR';

export interface JinryeongCardProps extends VariantProps<typeof jinryeongVariants> {
  id: string;
  nameKo: string;
  rarity: JinryeongRarity;
  tier: JinryeongTier;
  recommendedClass: readonly ClassId[];
  coreSkill: string;
  lastUpdated: string;
  className?: string;
}

const CLASS_LABEL: Record<ClassId, string> = {
  warrior: '전사',
  swordsman: '검객',
  medium: '영매',
};

export function JinryeongCard({
  nameKo,
  rarity,
  tier,
  recommendedClass,
  coreSkill,
  lastUpdated,
  className,
}: JinryeongCardProps): React.JSX.Element {
  return (
    <article
      className={cn(jinryeongVariants({ tier }), className)}
      aria-label={`${nameKo} 진령 (${rarity} ${tier}티어)`}
    >
      <span className={rarityBadgeVariants({ rarity })}>{rarity}</span>

      <header>
        <h3 className="text-base font-bold text-text-primary">{nameKo}</h3>
        <p className="mt-0.5 text-xs text-text-muted">{tier}티어</p>
      </header>

      <p className="flex-1 text-xs leading-relaxed text-text-secondary">{coreSkill}</p>

      <footer className="mt-2 flex items-center justify-between gap-2 text-[11px]">
        <ul className="flex flex-wrap gap-1">
          {recommendedClass.map((c) => (
            <li
              key={c}
              className="rounded-pill bg-bg-secondary px-1.5 py-0.5 text-text-secondary"
            >
              {CLASS_LABEL[c]}
            </li>
          ))}
        </ul>
        <time dateTime={lastUpdated} className="text-text-muted">
          {lastUpdated}
        </time>
      </footer>
    </article>
  );
}
