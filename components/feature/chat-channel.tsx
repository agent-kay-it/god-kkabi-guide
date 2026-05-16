/**
 * ChatChannel — 단일 채널 메시지 list + 무한 스크롤.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §6 + lib/chat/use-channel
 */
'use client';

import { useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';

import { useChannel } from '@/lib/chat/use-channel';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './chat-message';
import { cn } from '@/lib/utils';

export interface ChatChannelProps {
  readonly channelId: string;
  readonly currentUid: string | null;
  readonly canReport: boolean;
  readonly isAdmin: boolean;
  readonly className?: string;
}

export function ChatChannel({
  channelId,
  currentUid,
  canReport,
  isAdmin,
  className,
}: ChatChannelProps): React.JSX.Element {
  const { messages, isLoading, error, loadOlder, hasMore } = useChannel(channelId, {
    isAdmin,
  });
  const endRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  // 새 메시지 도착 시 자동 스크롤 (사용자가 위로 스크롤 중이면 미적용 — 단순 구현)
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  return (
    <div className={cn('flex flex-1 flex-col overflow-hidden', className)}>
      {error ? (
        <div className="px-4 py-3 text-sm text-vermilion-soft">
          채팅 연결 실패: {error}
        </div>
      ) : null}

      {hasMore ? (
        <div className="border-b border-ink-line p-2 text-center">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => void loadOlder()}
            className="gap-1 text-text-mute"
          >
            <ChevronUp className="h-3 w-3" />
            이전 메시지 보기
          </Button>
        </div>
      ) : null}

      <div
        className="flex-1 overflow-y-auto py-2"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {isLoading && messages.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-text-mute">불러오는 중…</p>
        ) : messages.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-text-mute">
            아직 메시지가 없습니다. 첫 메시지를 남겨보세요!
          </p>
        ) : (
          messages.map((m) => (
            <ChatMessage
              key={m.id}
              data={m}
              currentUid={currentUid}
              canReport={canReport}
            />
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
