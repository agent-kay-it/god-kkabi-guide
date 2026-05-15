/**
 * <LocaleSwitcher> — F3.7 언어 선택 드롭다운.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §7.3
 *
 * 사용 위치: TopBar 우상단 (마이그레이션 완료 후 활성화).
 * 동작:
 *  - 현재 locale 표시 (KO/JA/EN)
 *  - 선택 시 cookie 'NEXT_LOCALE' 갱신 + router.refresh
 *  - GA4 locale_switch 발화
 *
 * Note: app/* → app/[locale]/* 마이그레이션 전까지는 cookie 갱신만 됨.
 *       마이그레이션 후 next-intl middleware가 자동 redirect 처리.
 */
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

import { logEvent } from '@/lib/firebase/analytics';
import { locales, LOCALE_LABEL, LOCALE_FLAG, type Locale } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LocaleSwitcherProps {
  readonly current: Locale;
}

export function LocaleSwitcher({ current }: LocaleSwitcherProps): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Outside click → close
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function changeLocale(next: Locale) {
    setOpen(false);
    if (next === current) return;
    startTransition(() => {
      void logEvent('locale_switch', { from: current, to: next });
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
      router.refresh();
    });
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((p) => !p)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`현재 언어: ${LOCALE_LABEL[current]}`}
        className="gap-1.5"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden />
        <span aria-hidden>{LOCALE_FLAG[current]}</span>
        <span className="hidden sm:inline">{LOCALE_LABEL[current]}</span>
      </Button>
      {open ? (
        <ul
          role="listbox"
          aria-label="언어 선택"
          className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-md border border-ink-line bg-ink-elev p-1 shadow-lg"
        >
          {locales.map((loc) => (
            <li key={loc}>
              <button
                type="button"
                role="option"
                aria-selected={loc === current}
                onClick={() => changeLocale(loc)}
                className={cn(
                  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-ink-card-strong',
                  loc === current && 'font-bold text-bronze',
                )}
              >
                <span aria-hidden>{LOCALE_FLAG[loc]}</span>
                {LOCALE_LABEL[loc]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
