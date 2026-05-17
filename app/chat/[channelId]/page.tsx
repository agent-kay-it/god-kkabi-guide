/**
 * /chat/[channelId] — 단일 채널 view (Server Component).
 * 출처: docs/sprint/10-sprint-launch/design.md §4.3 + §7.4
 *
 * 3중 방어 첫 번째 게이트 (Server SSR):
 *  1. channelId 정규식 검증 (validateChannelId)
 *  2. canAccessChannel(channelId, user) — 권한 검증
 *  3. 실패 시 next/notFound 또는 default 채널로 redirect
 *
 * 본 페이지는 ChannelHeader + (MessageList + MessageComposer)를 mount한다.
 * Message 컴포넌트들은 Task #25 / #26에서 추가되며 본 commit은 placeholder를 둔다.
 */
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import {
  channelLabel,
  defaultChannelFor,
  parseChannelId,
  resolveUserChannels,
} from '@/lib/chat/channel-resolver';
import { canAccessChannel, accessDenyMessage } from '@/lib/chat/channel-permission';
import { chatUserFromSession } from '@/lib/chat/session-context';
import { ChannelHeader } from '@/components/feature/chat/channel-header';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: Promise<{ readonly channelId: string }>;
}

export default async function ChannelPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { channelId } = await params;

  const parsed = parseChannelId(channelId);
  if (!parsed) {
    notFound();
  }

  const session = await auth();
  const user = chatUserFromSession(session);
  if (!user) {
    redirect('/login?callbackUrl=/chat');
  }

  const access = canAccessChannel(channelId, user);
  if (!access.ok) {
    // INVALID_CHANNEL은 위에서 처리됨. 나머지는 default 채널로 redirect.
    // BANNED는 global만 허용 — defaultChannelFor가 global 반환.
    const fallback = defaultChannelFor(user);
    if (fallback !== channelId) {
      redirect(`/chat/${fallback}?denied=${access.reason}`);
    }
    // fallback도 같으면 막힌 상태 — error UI 표시
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-text-mute">{accessDenyMessage(access.reason)}</p>
      </div>
    );
  }

  const channels = resolveUserChannels(user);
  const label = channelLabel(parsed);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChannelHeader kind={parsed.kind} label={label} channels={channels} />
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-sm text-text-mute">
        <p>채팅 UI는 Task #25 / #26에서 추가됩니다.</p>
        <p className="mt-2 font-mono text-xs">channel: {channelId}</p>
      </div>
    </div>
  );
}
