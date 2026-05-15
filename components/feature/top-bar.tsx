/**
 * TopBar — scroll-aware glassmorphism navigation.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.1
 *
 * 책임:
 *  - 로고 + 메뉴 (위키 / 직업 / 진령 / 채팅 — P3.B/C 단계 추가)
 *  - 사용자 dropdown (UserMenu)
 *  - scroll > 10px 시 backdrop-blur + border 표시
 *
 * Client Component — scroll listener 필요.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { UserMenu, type UserMenuSession } from './user-menu';

interface TopBarProps {
  readonly session: UserMenuSession | null;
  readonly signOutAction: () => Promise<void>;
}

const NAV_ITEMS: ReadonlyArray<{ href: string; label: string; highlight?: boolean }> = [
  // Sprint V1: 커뮤니티 신규 + 위키 6 + 팁 = 8 메뉴
  { href: '/post', label: '커뮤니티', highlight: true },
  { href: '/class', label: '직업' },
  { href: '/jinryeong', label: '진령' },
  { href: '/skill', label: '스킬' },
  { href: '/equipment', label: '장비' },
  { href: '/content', label: '콘텐츠' },
  { href: '/munpa', label: '문파' },
  { href: '/tips', label: '팁' },
];

export function TopBar({ session, signOutAction }: TopBarProps): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      aria-label="주요 메뉴"
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-300',
        scrolled &&
          'border-ink-line bg-[rgba(7,7,11,0.72)] backdrop-blur-[20px] backdrop-saturate-[180%]',
      )}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-5 py-3.5 sm:px-[5vw]">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[0.95rem] font-semibold tracking-tight text-text"
        >
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-bronze/15 text-bronze-soft"
          >
            ◑
          </span>
          <span>깨비지기</span>
        </Link>

        <div className="hidden items-center gap-1 overflow-x-auto sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-ink-elev hover:text-text',
                item.highlight
                  ? 'font-medium text-bronze-soft hover:text-bronze'
                  : 'text-text-soft',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <UserMenu session={session} signOutAction={signOutAction} />
      </div>
    </nav>
  );
}
