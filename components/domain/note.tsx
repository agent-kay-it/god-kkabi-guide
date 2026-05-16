/**
 * <Note> — tip/warn/success/info variant + 아이콘 + 좌측 4px stripe.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.5
 *
 * shadcn ui/alert과 별도. Note는 본문 설명형 (긴 텍스트), Alert는 상태 알림형 (짧은 텍스트).
 */
import * as React from 'react';
import { Info, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const noteVariants = cva(
  'relative flex gap-3 rounded-[var(--radius-card)] border bg-ink-card p-4 backdrop-blur-md',
  {
    variants: {
      variant: {
        tip: 'border-indigo/30',
        warn: 'border-vermilion/30',
        success: 'border-jade/30',
        info: 'border-bronze/30',
      },
    },
    defaultVariants: { variant: 'tip' },
  },
);

const iconVariants = cva(
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
  {
    variants: {
      variant: {
        tip: 'bg-indigo/15 text-indigo',
        warn: 'bg-vermilion/15 text-vermilion',
        success: 'bg-jade/15 text-jade',
        info: 'bg-bronze/15 text-bronze',
      },
    },
    defaultVariants: { variant: 'tip' },
  },
);

const ICON_MAP = {
  tip: Lightbulb,
  warn: AlertTriangle,
  success: CheckCircle2,
  info: Info,
} as const;

const COLOR_MAP = {
  tip: 'text-indigo',
  warn: 'text-vermilion',
  success: 'text-jade',
  info: 'text-bronze-soft',
} as const;

export interface NoteProps extends VariantProps<typeof noteVariants> {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Note({
  variant = 'tip',
  title,
  children,
  className,
}: NoteProps): React.JSX.Element {
  const variantKey = (variant ?? 'tip') as keyof typeof ICON_MAP;
  const Icon = ICON_MAP[variantKey];
  return (
    <div className={cn(noteVariants({ variant }), className)} role="note">
      <div className={iconVariants({ variant })}>
        <Icon aria-hidden className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        {title ? (
          <p className={cn('text-sm font-semibold', COLOR_MAP[variantKey])}>{title}</p>
        ) : null}
        <div className="text-sm leading-relaxed text-text-soft">{children}</div>
      </div>
    </div>
  );
}
