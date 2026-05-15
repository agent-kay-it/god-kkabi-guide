/**
 * <Alert> — info/warning/success/danger 4 variant.
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.8
 * 원본 HTML: `.alert.info` / `.warning` / `.success` / `.danger`
 *
 * shadcn primitive <Alert>와 별도로 갓깨비 톤에 맞게 자체 작성.
 */
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'flex gap-3 rounded-card border-l-4 bg-bg-card p-4 text-sm',
  {
    variants: {
      variant: {
        info: 'border-accent-cyan text-text-primary',
        warning: 'border-accent-gold text-text-primary',
        success: 'border-accent-green text-text-primary',
        danger: 'border-accent-red text-text-primary',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

const iconVariants = cva('mt-0.5 h-5 w-5 shrink-0', {
  variants: {
    variant: {
      info: 'text-accent-cyan',
      warning: 'text-accent-gold',
      success: 'text-accent-green',
      danger: 'text-accent-red',
    },
  },
  defaultVariants: { variant: 'info' },
});

export type AlertVariant = 'info' | 'warning' | 'success' | 'danger';

export interface AlertProps extends VariantProps<typeof alertVariants> {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const ICON_MAP: Record<AlertVariant, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  danger: AlertCircle,
};

export function Alert({
  variant,
  title,
  children,
  className,
}: AlertProps): React.JSX.Element {
  const Icon = ICON_MAP[variant];
  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert">
      <Icon aria-hidden="true" className={iconVariants({ variant })} />
      <div className="space-y-1">
        {title ? (
          <p className="font-semibold leading-tight text-text-primary">{title}</p>
        ) : null}
        <div className="text-text-secondary [&_a]:text-accent-gold [&_a]:underline-offset-4 [&_a]:hover:underline">
          {children}
        </div>
      </div>
    </div>
  );
}
