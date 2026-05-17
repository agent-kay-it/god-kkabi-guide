/**
 * <MessageList> — RTDB 채널 구독 + 메시지 list rendering.
 * 출처: docs/sprint/10-sprint-launch/design.md §7.1 + lib/chat/use-channel
 *
 * 동작:
 *  - useChannel(channelId, { isAdmin }) — 50개 limit + load older
 *  - 새 메시지 자동 스크롤 (사용자가 위로 스크롤 중이면 미적용 — 단순 buffer)
 *  - error / loading / empty state 별도 UI
 *  - admin 액션은 Task #27의 moderation-actions와 통합 (callback props)
 *
 * 가상화: 50개 limit이므로 별도 virtualization 라이브러리 불필요 — DOM 직접 render.
 * 추후 1000+ 메시지가 보편화되면 react-virtuoso 등 검토.
 */
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { useChannel } from '@/lib/chat/use-channel';
import { MessageItem } from './message-item';
import { LoadOlderButton } from './load-older-button';
import { cn } from '@/lib/utils';

export interface MessageListProps {
  readonly channelId: string;
  readonly currentUid: string | null;
  readonly canReport: boolean;
  readonly isAdmin: boolean;
  readonly onAdminHide?: (messageId: string, channelId: string) => Promise<{ ok: boolean; message?: string }>;
  readonly onAdminKeep?: (messageId: string, channelId: string) => Promise<{ ok: boolean; message?: string }>;
  readonly onAdminDelete?: (messageId: string, channelId: string) => Promise<{ ok: boolean; message?: string }>;
  readonly className?: string;
}

/** 자동 스크롤 임계값 — 사용자가 하단에서 N px 안에 있으면 자동 스크롤. */
const AUTO_SCROLL_THRESHOLD_PX = 80;

export function MessageList({
  channelId,
  currentUid,
  canReport,
  isAdmin,
  onAdminHide,
  onAdminKeep,
  onAdminDelete,
  className,
}: MessageListProps): React.JSX.Element {
  const { messages, isLoading, error, loadOlder, hasMore } = useChannel(channelId, {
    isAdmin,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [, startAdminTransition] = useTransition();

  // 새 메시지 도착 시 자동 스크롤 (단, 사용자가 위로 스크롤 중이면 skip)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      prevCountRef.current = messages.length;
      return;
    }
    const isNew = messages.length > prevCountRef.current;
    prevCountRef.current = messages.length;
    if (!isNew) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom <= AUTO_SCROLL_THRESHOLD_PX) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  function handleLoadOlder() {
    if (isLoadingOlder) return;
    setIsLoadingOlder(true);
    void loadOlder().finally(() => setIsLoadingOlder(false));
  }

  function bindAdminAction(
    fn: ((messageId: string, channelId: string) => Promise<{ ok: boolean; message?: string }>) | undefined,
    successMsg: string,
  ): ((messageId: string, channelId: string) => void) | undefined {
    if (!fn) return undefined;
    return (messageId, ch) => {
      startAdminTransition(async () => {
        const result = await fn(messageId, ch);
        if (result.ok) {
          toast.success(successMsg);
        } else {
          toast.error(result.message ?? '처리에 실패했습니다');
        }
      });
    };
  }

  const adminHide = bindAdminAction(onAdminHide, '메시지를 숨겼습니다');
  const adminKeep = bindAdminAction(onAdminKeep, '메시지를 유지 처리했습니다');
  const adminDelete = bindAdminAction(onAdminDelete, '메시지를 삭제했습니다');

  return (
    <div className={cn('flex flex-1 flex-col overflow-hidden', className)}>
      {error ? (
        <div className="border-b border-ink-line bg-vermilion/10 px-4 py-2 text-xs text-vermilion-soft">
          채팅 연결 실패: {error}
        </div>
      ) : null}

      <LoadOlderButton
        hasMore={hasMore}
        isLoading={isLoadingOlder}
        onClick={handleLoadOlder}
      />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-2"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={isLoading}
      >
        {isLoading && messages.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-text-mute">불러오는 중…</p>
        ) : messages.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-text-mute">
            아직 메시지가 없습니다. 첫 메시지를 남겨보세요!
          </p>
        ) : (
          messages.map((m) => (
            <MessageItem
              key={m.id}
              message={m}
              currentUid={currentUid}
              canReport={canReport}
              isAdmin={isAdmin}
              {...(adminHide ? { onAdminHide: adminHide } : {})}
              {...(adminKeep ? { onAdminKeep: adminKeep } : {})}
              {...(adminDelete ? { onAdminDelete: adminDelete } : {})}
            />
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
