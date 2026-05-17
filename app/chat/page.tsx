/**
 * /chat — 기본 채널로 redirect.
 * 출처: docs/sprint/10-sprint-launch/design.md §4.3
 *
 * 사용자 우선순위: munpa > server > global. layout에서 이미 auth/registered 검증됨.
 */
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { defaultChannelFor } from '@/lib/chat/channel-resolver';
import { chatUserFromSession } from '@/lib/chat/session-context';

export default async function ChatIndexPage(): Promise<never> {
  const session = await auth();
  const user = chatUserFromSession(session);
  // layout에서 보장하지만 narrowing 위해 한 번 더 검증.
  const fallback = user ? defaultChannelFor(user) : 'global';
  redirect(`/chat/${fallback}`);
}
