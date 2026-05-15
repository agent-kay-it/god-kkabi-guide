/**
 * shadcn/ui Button — new-york style.
 * 갓깨비 토큰 오버라이드: --primary = accent-gold, --radius = 0.75rem.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-accent-gold)] text-[var(--color-bg-primary)] hover:bg-[var(--color-accent-gold-light)]',
        destructive:
          'bg-[var(--color-accent-red)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-red)]/90',
        outline:
          'border border-[var(--color-border-gold)] bg-transparent text-[var(--color-accent-gold)] hover:bg-[var(--color-bg-card-hover)]',
        secondary:
          'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)]',
        ghost:
          'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]',
        link: 'text-[var(--color-accent-gold)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * 범용 버튼 컴포넌트.
 * asChild=true 시 첫 번째 자식 요소를 버튼으로 렌더링 (Slot 패턴 미사용 — MVP 단순화).
 */
export function Button({ className, variant, size, ...props }: ButtonProps): React.JSX.Element {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { buttonVariants };
