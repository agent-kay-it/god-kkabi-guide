/**
 * <MessageItem> — 단일 채팅 메시지 render (3 variants: text / link / deleted).
 * 출처: docs/sprint/10-sprint-launch/design.md §7.1 + §7.2
 *
 * Sprint 10 Phase E 신규:
 *  - 기존 components/feature/chat-message.tsx 와 분리 — 기존 ChatWidget(콜론 prefix
 *    `server:` / `munpa:`)는 유지하고, Phase E (하이픈 prefix 라우팅 + 3-tier 페이지)는
 *    독립적으로 진화.
 *  - variant resolver를 lib/chat/message-variant.ts에 분리 (Pure 도메인 + vitest)
 *  - image variant 미포함 — Sprint 11
 *  - admin 모더레이션 액션은 Task #27의 ChatReportDialog/moderation-actions와 통합
 */
'use client';

import { useState } from 'react';
import { Flag, ShieldAlert, Trash2 } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageContextMenu } from './message-context-menu';
import { LinkPreviewInMessage } from './link-preview-in-message';
import { ChatReportDialog } from '@/components/feature/chat-report-dialog';
import { resolveMessageVariant } from '@/lib/chat/message-variant';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

const CLASS_LABEL: Record<'warrior' | 'swordsman' | 'medium', string> = {
  warrior: '전사',
  swordsman: '검객',
  medium: '영매',
};

const CLASS_VARIANT: Record<'warrior' | 'swordsman' | 'medium', 'vermilion' | 'bronze' | 'indigo'> = {
  warrior: 'vermilion',
  swordsman: 'bronze',
  medium: 'indigo',
};

const DELETED_REASON_TEXT: Record<'self' | 'operator' | 'hidden', string> = {
  self: '본인이 삭제한 메시지입니다.',
  operator: '운영자에 의해 삭제된 메시지입니다.',
  hidden: '신고가 누적되어 자동 숨김된 메시지입니다.',
};

export interface MessageItemProps {
  readonly message: ChatMessage;
  readonly currentUid: string | null;
  readonly canReport: boolean;
  readonly isAdmin: boolean;
  /** admin 모더레이션 액션 — Task #27에서 주입. */
  readonly onAdminHide?: (messageId: string, channelId: string) => void;
  readonly onAdminKeep?: (messageId: string, channelId: string) => void;
  readonly onAdminDelete?: (messageId: string, channelId: string) => void;
}

export function MessageItem({
  message,
  currentUid,
  canReport,
  isAdmin,
  onAdminHide,
  onAdminKeep,
  onAdminDelete,
}: MessageItemProps): React.JSX.Element {
  const variant = resolveMessageVariant(message);
  const isOwn = currentUid === message.authorUid;
  const isAuthorAdmin = message.authorRole === 'admin';
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div
      className={cn(
        'group flex gap-2 px-3 py-1.5',
        isOwn ? 'flex-row-reverse' : 'flex-row',
      )}
      role="article"
      aria-label={`${message.authorNickname}님의 메시지`}
    >
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback
          className={cn(
            'text-[0.7rem]',
            isAuthorAdmin
              ? 'bg-vermilion/20 text-vermilion'
              : 'bg-bronze/15 text-bronze-soft',
          )}
        >
          {message.authorNickname.slice(0, 1)}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex max-w-[75%] min-w-0 flex-col gap-1', isOwn && 'items-end')}>
        <header
          className={cn(
            'flex items-center gap-1.5',
            isOwn && 'flex-row-reverse',
          )}
        >
          <span className="text-xs font-semibold text-text">{message.authorNickname}</span>
          {message.authorClassId ? (
            <Badge variant={CLASS_VARIANT[message.authorClassId]} className="text-[0.6rem]">
              {CLASS_LABEL[message.authorClassId]}
            </Badge>
          ) : null}
          {isAuthorAdmin ? (
            <Badge variant="vermilion" className="gap-1 text-[0.6rem]">
              <ShieldAlert className="h-2.5 w-2.5" />
              운영자
            </Badge>
          ) : null}
          <time className="font-mono text-[0.65rem] text-text-mute">
            {formatTime(message.createdAt)}
          </time>
          <MessageContextMenu
            isOwn={isOwn}
            isAdmin={isAdmin}
            canReport={canReport && !isOwn}
            currentlyHidden={Boolean(message.hidden)}
            currentlyKept={Boolean(message.keptByOperator)}
            onReport={() => setReportOpen(true)}
            {...(isAdmin && onAdminHide
              ? { onAdminHide: () => onAdminHide(message.id, message.channelId) }
              : {})}
            {...(isAdmin && onAdminKeep
              ? { onAdminKeep: () => onAdminKeep(message.id, message.channelId) }
              : {})}
            {...(isAdmin && onAdminDelete
              ? { onAdminDelete: () => onAdminDelete(message.id, message.channelId) }
              : {})}
          />
        </header>

        {variant.type === 'deleted' ? (
          <div
            className={cn(
              'rounded-2xl border border-dashed border-ink-line bg-ink-elev/40 px-3 py-2 text-xs italic text-text-mute',
              isOwn && 'self-end',
            )}
          >
            {DELETED_REASON_TEXT[variant.reason]}
          </div>
        ) : (
          <div
            className={cn(
              'rounded-2xl px-3 py-2 text-sm',
              isOwn ? 'bg-bronze/15 text-text' : 'bg-ink-elev text-text',
            )}
          >
            <p className="whitespace-pre-wrap break-words">{variant.content}</p>
            {variant.type === 'link' ? (
              <LinkPreviewInMessage meta={variant.linkPreview} />
            ) : null}
          </div>
        )}

        {/* 모바일/터치 디바이스 fallback — context menu 외 별도 단축 신고 버튼 */}
        {!isOwn && canReport && variant.type !== 'deleted' ? (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            aria-label="이 메시지 신고하기"
            className={cn(
              'inline-flex items-center gap-1 self-start text-[0.65rem] text-text-mute transition-opacity',
              'opacity-0 hover:text-vermilion group-hover:opacity-100',
              'md:hidden md:opacity-100',
            )}
          >
            <Flag className="h-2.5 w-2.5" aria-hidden="true" />
            신고
          </button>
        ) : null}

        {/* admin 단축 — 모바일에서 context menu 대체 */}
        {isAdmin && onAdminDelete && variant.type !== 'deleted' ? (
          <button
            type="button"
            onClick={() => onAdminDelete(message.id, message.channelId)}
            aria-label="운영자: 메시지 삭제"
            className={cn(
              'inline-flex items-center gap-1 self-start text-[0.65rem] text-vermilion-soft transition-opacity hover:text-vermilion',
              'opacity-0 group-hover:opacity-100',
              'md:hidden md:opacity-100',
            )}
          >
            <Trash2 className="h-2.5 w-2.5" aria-hidden="true" />
            삭제
          </button>
        ) : null}

        <ChatReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          messageId={message.id}
          channelId={message.channelId}
          reportedUid={message.authorUid}
          messageSnapshot={message.content}
          {...(message.imageUrl ? { imageUrl: message.imageUrl } : {})}
        />
      </div>
    </div>
  );
}

function formatTime(ms: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
