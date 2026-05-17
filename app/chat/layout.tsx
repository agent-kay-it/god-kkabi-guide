/**
 * /chat layout — Server Component.
 * 출처: docs/sprint/10-sprint-launch/design.md §4.3 + §7.1
 *
 * 책임:
 *  - NextAuth session 확인 (proxy.ts가 미인증 시 차단하지만, types narrowing 위해 재확인)
 *  - chatUserFromSession → ChannelNavEntry[] 계산
 *  - ChatLayout (sidebar + content)에 children mount
 *
 * 미등록 사용자는 proxy.ts에서 /register로 redirect되므로 본 layout 진입 시점에
 * registered === true 보장. 다만 fallback으로 /register redirect 한 번 더 확인.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { resolveUserChannels } from '@/lib/chat/channel-resolver';
import { chatUserFromSession } from '@/lib/chat/session-context';
import { ChatLayout } from '@/components/feature/chat/chat-layout';

export const metadata: Metadata = {
  title: '실시간 채팅',
  description: '갓깨비 키우기 사용자 간 실시간 채팅 — 전체 / 서버 / 문파 3-tier 채널.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/chat' },
};

export default async function Layout({
  children,
}: {
  readonly children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const session = await auth();
  const user = chatUserFromSession(session);
  if (!user) {
    redirect('/login?callbackUrl=/chat');
  }
  if (!user.registered) {
    redirect('/register?callbackUrl=/chat');
  }

  const channels = resolveUserChannels(user);

  return <ChatLayout channels={channels}>{children}</ChatLayout>;
}
