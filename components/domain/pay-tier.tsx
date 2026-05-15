/**
 * <PayTier> — 과금 티어 카드 (무/소/중과금 3 variant).
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.10
 */
import { Check } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tierVariants = cva(
  'flex h-full flex-col gap-3 rounded-card border bg-bg-card p-5 transition-card hover:bg-bg-card-hover',
  {
    variants: {
      tier: {
        free: 'border-border-soft',
        light: 'border-accent-cyan',
        medium: 'border-accent-gold shadow-glow',
      },
    },
    defaultVariants: { tier: 'free' },
  },
);

export type PayTierLevel = 'free' | 'light' | 'medium';

export interface PayTierProps extends VariantProps<typeof tierVariants> {
  tier: PayTierLevel;
  label: string;
  strategy: readonly string[];
  recommendedFor: string;
  className?: string;
}

export function PayTier({
  tier,
  label,
  strategy,
  recommendedFor,
  className,
}: PayTierProps): React.JSX.Element {
  return (
    <article
      className={cn(tierVariants({ tier }), className)}
      aria-label={`${label} 과금 티어`}
    >
      <header>
        <h3 className="text-lg font-bold text-accent-gold">{label}</h3>
        <p className="mt-1 text-xs text-text-muted">{recommendedFor}</p>
      </header>

      <ul className="flex-1 space-y-2">
        {strategy.map((s) => (
          <li key={s} className="flex items-start gap-2 text-sm text-text-primary">
            <Check
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-accent-gold"
            />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
