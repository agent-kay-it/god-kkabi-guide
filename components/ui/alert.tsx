/**
 * shadcn/ui Alert primitive — new-york style + v2 4-색 액센트.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.5 + component-inventory-v2.md §1.1
 *
 * v2 variants: tip(indigo) / warn(vermilion) / success(jade) / info(indigo) / destructive(vermilion).
 * 좌측 4px stripe는 cva로 적용.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full overflow-hidden rounded-[var(--radius-card)] border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
  {
    variants: {
      variant: {
        default: 'border-ink-line bg-ink-card text-text [&>svg]:text-text',
        tip: 'border-indigo/30 bg-indigo/10 text-text [&>svg]:text-indigo before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-indigo before:content-[""]',
        warn: 'border-vermilion/30 bg-vermilion/10 text-text [&>svg]:text-vermilion before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-vermilion before:content-[""]',
        success: 'border-jade/30 bg-jade/10 text-text [&>svg]:text-jade before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-jade before:content-[""]',
        info: 'border-indigo/30 bg-indigo/10 text-text [&>svg]:text-indigo before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-indigo before:content-[""]',
        bronze: 'border-bronze/30 bg-bronze/10 text-text [&>svg]:text-bronze before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-bronze before:content-[""]',
        destructive: 'border-vermilion/50 bg-vermilion/10 text-vermilion-soft [&>svg]:text-vermilion',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface AlertRootProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

/** shadcn Alert 루트 — role=alert, aria-live=polite (status) */
export function AlertRoot({ className, variant, ...props }: AlertRootProps): React.JSX.Element {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

/** shadcn AlertTitle */
export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return (
    <h5
      className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

/** shadcn AlertDescription */
export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return (
    <div className={cn('text-sm text-text-soft [&_p]:leading-relaxed', className)} {...props} />
  );
}

export { alertVariants };
