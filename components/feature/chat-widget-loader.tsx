/**
 * ChatWidget Lazy Loader — 'use client' wrapper.
 *
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-5-act/REPORT.md M9 (Performance 75 → 85+)
 *
 * 목적:
 *  - ChatWidget이 의존하는 Firebase RTDB SDK + browser-image-compression 등
 *    클라이언트 번들을 initial load에서 제외 (LCP 14.3s → 개선)
 *  - 채팅 위젯은 사용자 상호작용 (등록/로그인) 후에만 렌더링되므로 ssr: false 안전
 *
 * 패턴 근거:
 *  - Server Component (layout.tsx) 에서는 `dynamic(..., { ssr: false })` 사용 불가
 *  - 'use client' wrapper로 한 단계 위임 후, 그 안에서 dynamic import
 */
'use client';

import dynamic from 'next/dynamic';

import type { ChatWidgetSession } from './chat-widget';

const ChatWidget = dynamic(
  () => import('./chat-widget').then((mod) => ({ default: mod.ChatWidget })),
  { ssr: false },
);

export function ChatWidgetLoader({
  session,
}: {
  readonly session: ChatWidgetSession;
}): React.JSX.Element {
  return <ChatWidget session={session} />;
}
