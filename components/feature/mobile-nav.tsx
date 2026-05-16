/**
 * <MobileNav> — Sprint V7 P3.E.
 *
 * 모바일 (< sm) 햄버거 메뉴 + 좌→우 슬라이드 drawer.
 * Radix Dialog primitives 사용 (focus trap, ESC, scroll lock 자동).
 *
 * - 햄버거 버튼: sm:hidden로 모바일만 노출
 * - drawer 내부에 8 NAV_ITEMS 세로 리스트 + 검색 단축 + 사용자 메뉴 안내
 * - 메뉴 항목 클릭 시 자동 닫힘 (Link click → router navigation → Dialog close)
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §6
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Menu, Search as SearchIcon, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly highlight?: boolean;
}

export interface MobileNavProps {
  readonly items: readonly NavItem[];
}

export function MobileNav({ items }: MobileNavProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="메뉴 열기"
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-md text-text-soft sm:hidden',
            'transition-colors hover:bg-ink-elev hover:text-text',
            'focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2',
          )}
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-[60] bg-ink-base/70 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=open]:fade-in',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out',
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed left-0 top-0 z-[61] flex h-full w-[82vw] max-w-[340px] flex-col gap-1 border-r border-ink-line-strong bg-ink-base p-5 shadow-2xl outline-none',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-left',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left',
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <DialogPrimitive.Title className="text-base font-semibold tracking-tight text-text">
              메뉴
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="메뉴 닫기"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-mute transition-colors hover:bg-ink-elev hover:text-text"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Close asChild>
            <Link
              href="/search"
              className={cn(
                'mb-3 flex items-center gap-2 rounded-md border border-ink-line-strong bg-ink-elev px-3 py-2.5 text-sm text-text-soft',
                'transition-colors hover:border-bronze/40 hover:text-bronze-soft',
              )}
            >
              <SearchIcon aria-hidden className="h-4 w-4 text-text-mute" />
              <span>사이트 검색</span>
            </Link>
          </DialogPrimitive.Close>

          <nav aria-label="모바일 주요 메뉴" className="flex flex-col gap-0.5">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <DialogPrimitive.Close key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'rounded-md px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-bronze/15 text-bronze-soft'
                        : item.highlight
                          ? 'font-medium text-bronze-soft hover:bg-ink-elev hover:text-bronze'
                          : 'text-text-soft hover:bg-ink-elev hover:text-text',
                    )}
                  >
                    {item.label}
                  </Link>
                </DialogPrimitive.Close>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-ink-line pt-4 text-[0.72rem] text-text-mute">
            우측 사용자 아이콘에서 로그인 / 내 정보 진입
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
