/**
 * <Marquee> — Sprint V4 P3.B.
 * CSS-only 무한 슬라이드 (좌/우). children을 2회 복제하여 seamless loop.
 *
 * 사용법:
 *   <Marquee duration="40s" direction="normal" pauseOnHover>
 *     <Item /> <Item /> ...
 *   </Marquee>
 *
 * 디자인:
 *  - 동일 children을 2회 렌더링 → 50% 이동 시점에 원위치 (seamless).
 *  - prefers-reduced-motion 시 정지 (globals.css에서 처리).
 */
'use client';

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface MarqueeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly children: ReactNode;
  /** 한 사이클 duration. 기본 '40s'. CSS time string. */
  readonly duration?: string;
  /** normal (왼쪽→) 또는 reverse (오른쪽→). 기본 'normal'. */
  readonly direction?: 'normal' | 'reverse';
  /** hover 시 일시정지. 기본 true. */
  readonly pauseOnHover?: boolean;
  /** 자식 간 gap (px). 기본 16. */
  readonly gap?: number;
}

export function Marquee({
  children,
  duration = '40s',
  direction = 'normal',
  pauseOnHover = true,
  gap = 16,
  className,
  ...rest
}: MarqueeProps): React.JSX.Element {
  const style: CSSProperties & Record<string, string> = {
    '--marquee-duration': duration,
    '--marquee-direction': direction,
  };

  return (
    <div
      className={cn('marquee-viewport', className)}
      {...(pauseOnHover ? { 'data-pause-on-hover': 'true' } : {})}
      {...rest}
    >
      <div className="marquee-track" style={style}>
        <div className="flex shrink-0" style={{ gap: `${gap}px` }}>
          {children}
        </div>
        <div className="flex shrink-0" style={{ gap: `${gap}px`, marginLeft: `${gap}px` }} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
