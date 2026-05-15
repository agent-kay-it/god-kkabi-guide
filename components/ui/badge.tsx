/**
 * shadcn/ui Badge — new-york style.
 * 갓깨비 토큰 오버라이드: 골드 primary, radius-pill.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--color-accent-gold)] text-[var(--color-bg-primary)]',
        secondary:
          'border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]',
        destructive:
          'border-transparent bg-[var(--color-accent-red)] text-[var(--color-text-primary)]',
        outline:
          'border-[var(--color-border-gold)] text-[var(--color-accent-gold)] bg-transparent',
        muted:
          'border-[var(--color-border-soft)] text-[var(--color-text-muted)] bg-transparent',
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

/** Badge 컴포넌트 — pill 형태 레이블 표시 */
export function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
