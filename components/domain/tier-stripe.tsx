/**
 * <TierStripe> — 카드 좌측 3px stripe + 티어 숫자 라벨.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0.1 + component-inventory-v2.md §3.4
 *
 * 직업/진령 카드의 티어 라벨로 사용. accent 5종 지원.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const stripeVariants = cva(
  'flex h-full w-10 shrink-0 items-center justify-center font-mono text-2xl font-black',
  {
    variants: {
      tier: {
        '0': 'bg-vermilion/15 text-vermilion',
        '1': 'bg-bronze/15 text-bronze',
        '2': 'bg-indigo/15 text-indigo',
        '3': 'bg-ink-line text-text-mute',
      },
    },
    defaultVariants: { tier: '1' },
  },
);

export interface TierStripeProps {
  tier: 0 | 1 | 2 | 3;
  className?: string;
}

export function TierStripe({ tier, className }: TierStripeProps): React.JSX.Element {
  const tierKey = String(tier) as '0' | '1' | '2' | '3';
  return (
    <div
      className={cn(stripeVariants({ tier: tierKey }), className)}
      aria-label={`티어 ${tier}`}
    >
      {tier}
    </div>
  );
}

// VariantProps re-export for downstream type compose if needed
export type TierStripeVariantProps = VariantProps<typeof stripeVariants>;
