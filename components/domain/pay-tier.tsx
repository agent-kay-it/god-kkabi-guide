/**
 * <PayTier> — 과금 티어 카드 (무/소/중과금 3 variant).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0 — v2: free=jade / light=bronze / medium=bronze glow
 */
import { Check } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tierVariants = cva(
  'glass flex h-full flex-col gap-3 rounded-[var(--radius-card)] border p-5 transition-card hover:bg-ink-card-strong',
  {
    variants: {
      tier: {
        free: 'border-jade/30',
        light: 'border-bronze/40',
        medium: 'border-bronze shadow-glow-bronze',
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
        <h3 className="text-lg font-bold text-bronze-soft">{label}</h3>
        <p className="mt-1 text-xs text-text-mute">{recommendedFor}</p>
      </header>

      <ul className="flex-1 space-y-2">
        {strategy.map((s) => (
          <li key={s} className="flex items-start gap-2 text-sm text-text">
            <Check
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-bronze"
            />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
