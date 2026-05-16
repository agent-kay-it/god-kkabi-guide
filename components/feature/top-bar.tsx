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
import { useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { UserMenu, type UserMenuSession } from './user-menu';
import { MobileNav } from './mobile-nav';

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
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Sprint V6 P3.B: '/' 단축키로 검색 페이지 진입.
  // input/textarea/contentEditable focus 시에는 무시 (텍스트 입력과 충돌 방지).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t instanceof HTMLElement) {
        const tag = t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (t.isContentEditable) return;
      }
      e.preventDefault();
      router.push('/search');
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <nav
      aria-label="주요 메뉴"
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-300',
        scrolled &&
          'border-ink-line bg-[rgba(7,7,11,0.72)] backdrop-blur-[20px] backdrop-saturate-[180%]',
      )}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3 px-5 py-3.5 sm:px-[5vw]">
        <div className="flex items-center gap-2">
          <MobileNav items={NAV_ITEMS} />
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
        </div>

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

        <div className="flex items-center gap-1.5">
          <Link
            href="/search"
            aria-label="사이트 검색 (단축키 /)"
            title="검색 — / 키"
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-text-soft',
              'transition-colors duration-200 hover:border-ink-line-strong hover:bg-ink-elev hover:text-bronze-soft',
              'focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2',
            )}
          >
            <SearchIcon aria-hidden className="h-4 w-4" />
          </Link>
          <UserMenu session={session} signOutAction={signOutAction} />
        </div>
      </div>
    </nav>
  );
}
