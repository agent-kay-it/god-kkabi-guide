/**
 * shadcn/ui Separator — new-york style.
 * 갓깨비 토큰: border-soft (rgba(255,255,255,0.08)).
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  /** 방향 — 기본 horizontal */
  orientation?: 'horizontal' | 'vertical';
  /** 장식용 구분선 여부 (aria-hidden) */
  decorative?: boolean;
}

/** 섹션 구분선 — 디자인 토큰 border-soft 적용 */
export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps): React.JSX.Element {
  return (
    <hr
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'shrink-0 border-none bg-ink-line',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}
