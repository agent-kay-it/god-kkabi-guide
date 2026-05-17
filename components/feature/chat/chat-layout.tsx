/**
 * <ChatLayout> — /chat/* 레이아웃 (Server Component).
 * 출처: docs/sprint/10-sprint-launch/design.md §7.1
 *
 * 책임:
 *  - 콘텐츠 폭 (max-w-screen-2xl) 표준화
 *  - 데스크톱: 좌측 ChannelSidebar (inline) + 우측 children
 *  - 모바일 (<md): children만 (sidebar는 ChannelHeader 내부 drawer로 노출)
 *  - 채팅 영역 최대 높이 — viewport - top-bar (mobile: 56px, desktop: 64px)
 */
import { ChannelSidebar } from './channel-sidebar';
import type { ChannelNavEntry } from '@/lib/chat/types';

export interface ChatLayoutProps {
  readonly channels: readonly ChannelNavEntry[];
  readonly children: React.ReactNode;
}

export function ChatLayout({ channels, children }: ChatLayoutProps): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-0 sm:px-[5vw]">
      <div className="flex h-[calc(100dvh-56px)] flex-col overflow-hidden border-x border-ink-line bg-ink-base/40 md:h-[calc(100dvh-64px)] md:flex-row md:rounded-[var(--radius-card-lg)] md:border md:border-ink-line">
        <aside className="hidden md:flex">
          <ChannelSidebar channels={channels} />
        </aside>
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</section>
      </div>
    </div>
  );
}
