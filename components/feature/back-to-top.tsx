/**
 * <BackToTop> — Sprint V4 P3.B.
 * 24px bottom-right FAB. scroll.y > 600px 일 때 페이드인.
 *
 * 출처: source/godkkabi-guide/index.html `.totop` + `#totop` 로직.
 */
'use client';

import { ArrowUp } from 'lucide-react';

import { useBackToTop } from '@/hooks/use-back-to-top';
import { cn } from '@/lib/utils';

export function BackToTop(): React.JSX.Element {
  const visible = useBackToTop(600);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <a
      href="#top"
      onClick={onClick}
      aria-label="맨 위로"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        'fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full border border-ink-line-strong bg-ink-card-strong backdrop-blur-md',
        'text-bronze-soft transition-all duration-base ease-out-soft',
        'hover:-translate-y-0.5 hover:border-bronze hover:text-bronze',
        visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <ArrowUp aria-hidden className="h-5 w-5" />
    </a>
  );
}
