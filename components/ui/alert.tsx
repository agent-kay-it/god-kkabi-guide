/**
 * shadcn/ui Alert primitive — new-york style.
 * 갓깨비 domain Alert 컴포넌트의 base로 사용 (shadcn 표준 인터페이스 유지).
 * 참고: components/domain/alert.tsx 가 이 primitive를 확장함.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[var(--color-text-primary)]',
  {
    variants: {
      variant: {
        default: 'border-[var(--color-border-soft)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]',
        destructive:
          'border-[var(--color-accent-red)]/50 bg-[var(--color-accent-red)]/10 text-[var(--color-accent-red)] [&>svg]:text-[var(--color-accent-red)]',
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

/** shadcn Alert 루트 */
export function AlertRoot({ className, variant, ...props }: AlertRootProps): React.JSX.Element {
  return (
    <div
      role="alert"
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
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
}
