/**
 * <ChannelSidebar> — 3 채널 nav (전체 / 서버 / 문파).
 * 출처: docs/sprint/10-sprint-launch/design.md §7.1
 *
 * Client Component:
 *  - usePathname()으로 active channel hightlight
 *  - resolveUserChannels()의 available=false 항목은 비활성 (disabled cursor + tooltip)
 *  - 디자인 토큰: text-text-soft / text-bronze (active) / hover:bg-ink-elev
 *  - 데스크톱 (md+): 좌측 inline sidebar (240px)
 *  - 모바일 (<md): MobileChannelDrawer가 본 컴포넌트를 Sheet 내부에 mount
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe2, Hash, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ChannelNavEntry } from '@/lib/chat/types';

const KIND_ICON: Record<ChannelNavEntry['kind'], LucideIcon> = {
  global: Globe2,
  server: Hash,
  munpa: Users,
};

const DISABLED_REASON_TEXT: Record<
  NonNullable<ChannelNavEntry['disabledReason']>,
  string
> = {
  NOT_REGISTERED: '등록 필요',
  NO_SERVER: '서버 미설정',
  NO_MUNPA: '문파 미설정',
  BANNED: '정지 상태',
};

export interface ChannelSidebarProps {
  readonly channels: readonly ChannelNavEntry[];
  readonly onChannelClick?: () => void;
  readonly className?: string;
}

export function ChannelSidebar({
  channels,
  onChannelClick,
  className,
}: ChannelSidebarProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex flex-col gap-1 border-r border-ink-line bg-ink-card-strong/30 p-3 md:w-60 md:shrink-0',
        className,
      )}
      aria-label="채팅 채널 목록"
    >
      <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-text-mute">
        채널
      </h2>
      <ul className="flex flex-col gap-0.5">
        {channels.map((entry) => {
          const Icon = KIND_ICON[entry.kind];
          const isActive = pathname === `/chat/${entry.id}`;

          if (!entry.available) {
            const reason = entry.disabledReason
              ? DISABLED_REASON_TEXT[entry.disabledReason]
              : '비활성';
            return (
              <li key={entry.kind + entry.id}>
                <span
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-mute',
                    'cursor-not-allowed opacity-60',
                  )}
                  aria-disabled="true"
                  title={`${entry.label} — ${reason}`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{entry.label}</span>
                  <span className="shrink-0 text-[0.65rem]">{reason}</span>
                </span>
              </li>
            );
          }

          return (
            <li key={entry.id}>
              <Link
                href={`/chat/${entry.id}`}
                {...(onChannelClick ? { onClick: onChannelClick } : {})}
                {...(isActive ? { 'aria-current': 'page' as const } : {})}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2',
                  isActive
                    ? 'bg-bronze/15 font-semibold text-bronze'
                    : 'text-text-soft hover:bg-ink-elev hover:text-text',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{entry.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
