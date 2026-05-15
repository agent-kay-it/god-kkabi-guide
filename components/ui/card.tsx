/**
 * shadcn/ui Card — new-york style.
 * 갓깨비 토큰 오버라이드: bg-card (#1c1235), border-soft.
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

/** 카드 루트 — bg-card + border-soft + radius-card */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

/** 카드 헤더 영역 */
export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
}

/** 카드 타이틀 */
export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-[var(--color-accent-gold)]',
        className,
      )}
      {...props}
    />
  );
}

/** 카드 설명 */
export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return (
    <p
      className={cn('text-sm text-[var(--color-text-secondary)]', className)}
      {...props}
    />
  );
}

/** 카드 본문 */
export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

/** 카드 푸터 */
export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
  );
}
