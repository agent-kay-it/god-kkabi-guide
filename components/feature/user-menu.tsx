/**
 * UserMenu — Avatar dropdown (Server-Side rendering 가능, 본 컴포넌트는 Client).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.1 + auth-flow.md §7
 *
 * 책임:
 *  - 비로그인: "로그인" 버튼
 *  - 로그인 + 미등록: "등록 완료하기" 버튼
 *  - 로그인 + 등록 완료: Avatar dropdown (북마크 / 운영자 / 로그아웃)
 *
 * Server Action으로 로그아웃 처리 (NextAuth signOut).
 */
'use client';

import Link from 'next/link';
import { LogOut, User, Bookmark, Shield } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface UserMenuSession {
  readonly user: {
    readonly id: string;
    readonly name?: string | null;
    readonly email?: string | null;
    readonly image?: string | null;
    readonly role?: 'admin' | 'user' | 'banned';
    readonly registered?: boolean;
    readonly nickname?: string;
    readonly serverId?: string;
  };
}

interface UserMenuProps {
  readonly session: UserMenuSession | null;
  readonly signOutAction: () => Promise<void>;
}

export function UserMenu({ session, signOutAction }: UserMenuProps): React.JSX.Element {
  if (!session) {
    return (
      <Button asChild size="sm" variant="bronze">
        <Link href="/login">로그인</Link>
      </Button>
    );
  }

  const isRegistered = Boolean(session.user.registered);
  const isAdmin = session.user.role === 'admin';

  if (!isRegistered) {
    return (
      <Button asChild size="sm" variant="bronze">
        <Link href="/register">등록 완료하기</Link>
      </Button>
    );
  }

  const displayName = session.user.nickname ?? session.user.name ?? '사용자';
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`${displayName} 메뉴 열기`}
          className="flex items-center gap-2 rounded-full border border-ink-line bg-ink-elev px-2 py-1 text-sm text-text transition-colors hover:bg-ink-card-strong"
        >
          <Avatar className="h-7 w-7">
            {session.user.image ? (
              <AvatarImage src={session.user.image} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-bronze/15 text-xs text-bronze-soft">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[8rem] truncate sm:inline">{displayName}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text">{displayName}</p>
          {session.user.serverId ? (
            <p className="font-mono text-xs text-text-soft">{session.user.serverId}</p>
          ) : null}
        </div>

        <div className="mt-4 space-y-1">
          <Link
            href="/me/bookmarks"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text hover:bg-ink-elev"
          >
            <Bookmark className="h-4 w-4 text-bronze" />
            북마크
          </Link>
          <Link
            href="/me"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text hover:bg-ink-elev"
          >
            <User className="h-4 w-4 text-bronze" />
            내 정보
          </Link>
          {isAdmin ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-vermilion-soft hover:bg-vermilion/10"
            >
              <Shield className="h-4 w-4" />
              운영자 콘솔
            </Link>
          ) : null}
        </div>

        <form action={signOutAction} className="mt-3 border-t border-ink-line pt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-soft hover:bg-ink-elev hover:text-text"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
