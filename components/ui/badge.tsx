/**
 * shadcn/ui Badge — new-york style + v2 4-색 액센트 + tier 시스템.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0.1 + design-tokens-v2.json $semanticAccentMap
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-bronze focus:ring-offset-2',
  {
    variants: {
      variant: {
        // 기본
        default: 'border-transparent bg-bronze/15 text-bronze-soft',
        secondary: 'border-transparent bg-ink-elev text-text',
        destructive: 'border-transparent bg-vermilion text-ink-base',
        outline: 'border-bronze/30 bg-transparent text-bronze',
        muted: 'border-ink-line text-text-mute bg-transparent',

        // v2 4-색 액센트
        bronze: 'border-bronze/30 bg-bronze/15 text-bronze-soft',
        jade: 'border-jade/30 bg-jade/15 text-jade-soft',
        vermilion: 'border-vermilion/30 bg-vermilion/15 text-vermilion-soft',
        indigo: 'border-indigo/30 bg-indigo/15 text-indigo',

        // Tier 시스템 (0 = 최강, 3 = 약함)
        'tier-0': 'border-vermilion/30 bg-vermilion/15 text-vermilion-soft font-mono',
        'tier-1': 'border-bronze/30 bg-bronze/15 text-bronze-soft font-mono',
        'tier-2': 'border-indigo/30 bg-indigo/15 text-indigo font-mono',
        'tier-3': 'border-ink-line text-text-mute bg-transparent font-mono',

        // 직업 시스템 (warrior/swordsman/mage)
        warrior: 'border-vermilion/30 bg-vermilion/15 text-vermilion-soft',
        swordsman: 'border-bronze/30 bg-bronze/15 text-bronze-soft',
        mage: 'border-indigo/30 bg-indigo/15 text-indigo',

        // 채팅 채널 시스템
        'channel-all': 'border-bronze/30 bg-bronze/15 text-bronze-soft',
        'channel-server': 'border-jade/30 bg-jade/15 text-jade-soft',
        'channel-munpa': 'border-indigo/30 bg-indigo/15 text-indigo',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/** Badge — pill 형태 레이블. v2 4-색 + tier + 직업 + 채널 variants 지원. */
export function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
