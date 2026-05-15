/**
 * <HeroMeta> — Hero 상단의 pill + 내부 chip 메타데이터.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.2
 *
 * 사용 예:
 *   <HeroMeta>
 *     <HeroMetaBadge>Sprint MVP v2</HeroMetaBadge>
 *     <span className="font-mono">v2.0.0 · 2026.05.15</span>
 *   </HeroMeta>
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

export function HeroMeta({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border border-ink-line-strong bg-[rgba(14,14,21,0.6)] py-1.5 pl-2 pr-3.5 text-[0.78rem] tracking-wide text-text-soft backdrop-blur-[10px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Inner chip — Hero 메타 내부 강조 라벨 */
export function HeroMetaBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'rounded-full bg-bronze/15 px-2 py-0.5 text-[0.72rem] font-semibold text-bronze-soft',
        className,
      )}
    >
      {children}
    </span>
  );
}
