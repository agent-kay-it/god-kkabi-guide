/**
 * shadcn/ui Card — new-york style + v2 토큰 (glassmorphism 적용 가능).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.3
 *
 * 본 Card는 솔리드 표면이고, glassmorphism 효과는 GlassCard (별도 컴포넌트)에서 제공.
 * shadcn 컴포넌트 (Dialog/Popover 등) 내부에서 사용되는 표준 Card도 본 컴포넌트.
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

/** 카드 루트 — ink-elev 표면 + ink-line 보더 */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-ink-line bg-ink-elev text-text shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-text',
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return <p className={cn('text-sm text-text-soft', className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}
