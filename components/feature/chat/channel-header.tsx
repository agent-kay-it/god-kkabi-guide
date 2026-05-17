/**
 * <ChannelHeader> — 현재 채널 헤더 (label + 참여자 수 + 모바일 drawer trigger).
 * 출처: docs/sprint/10-sprint-launch/design.md §7.1
 *
 * Server Component (사전 fetched memberCount 표시 — 실시간 X).
 */
import { Hash, Globe2, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { MobileChannelDrawer } from './mobile-channel-drawer';
import type { ChannelKind, ChannelNavEntry } from '@/lib/chat/types';

const KIND_ICON: Record<ChannelKind, LucideIcon> = {
  global: Globe2,
  server: Hash,
  munpa: Users,
};

export interface ChannelHeaderProps {
  readonly kind: ChannelKind;
  readonly label: string;
  readonly memberCount?: number;
  readonly channels: readonly ChannelNavEntry[];
}

export function ChannelHeader({
  kind,
  label,
  memberCount,
  channels,
}: ChannelHeaderProps): React.JSX.Element {
  const Icon = KIND_ICON[kind];
  return (
    <header className="flex items-center gap-3 border-b border-ink-line bg-ink-card-strong/40 px-4 py-3">
      <MobileChannelDrawer channels={channels} currentLabel={label} />
      <Icon className="hidden h-5 w-5 text-bronze md:inline-block" aria-hidden="true" />
      <h1 className="flex-1 truncate text-base font-bold text-text md:text-lg">{label}</h1>
      {typeof memberCount === 'number' && memberCount > 0 ? (
        <span className="hidden items-center gap-1 text-xs text-text-mute md:inline-flex">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {memberCount.toLocaleString('ko-KR')}명
        </span>
      ) : null}
    </header>
  );
}
