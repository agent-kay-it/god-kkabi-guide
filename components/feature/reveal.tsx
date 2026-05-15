/**
 * <Reveal> — Sprint V4 P3.B.
 * useRevealOnScroll로 자식을 페이드인+위로 transit.
 * stagger delay 1..5 (80ms 단위 — source default).
 *
 * 사용법:
 *   <Reveal as="section" delay={1}>...</Reveal>
 *   <Reveal>...</Reveal> (default delay 0)
 *
 * SSR safe: 초기 server render = opacity 0 (CSS 기본). client mount 후 observer 부착.
 */
'use client';

import type { ElementType, HTMLAttributes } from 'react';

import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { cn } from '@/lib/utils';

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Wrapper tag. 기본 div. */
  readonly as?: ElementType;
  /** Stagger delay 1..5 (source 매핑) */
  readonly delay?: 1 | 2 | 3 | 4 | 5;
  /** IntersectionObserver threshold (기본 0.12) */
  readonly threshold?: number;
}

export function Reveal({
  as,
  delay,
  threshold,
  className,
  children,
  ...rest
}: RevealProps): React.JSX.Element {
  const ref = useRevealOnScroll<HTMLElement>(
    threshold !== undefined ? { threshold } : {},
  );
  const Tag = (as ?? 'div') as ElementType;

  return (
    <Tag
      ref={ref as never}
      className={cn('reveal', className)}
      {...(delay ? { 'data-delay': String(delay) } : {})}
      {...rest}
    >
      {children}
    </Tag>
  );
}
