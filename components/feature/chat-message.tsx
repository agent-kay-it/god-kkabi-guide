/**
 * ChatMessage — 단일 채팅 메시지 표시 (텍스트 + 이미지 + 신고 버튼).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §6 + components/feature/chat-widget 통합
 *
 * 본인 메시지는 우측 정렬, 타인 메시지는 좌측. 운영자 보기는 hidden 메시지도 표시.
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Flag, ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChatReportDialog } from './chat-report-dialog';
import type { ChatMessage as ChatMessageData } from '@/types/chat';
import { cn } from '@/lib/utils';

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

export interface ChatMessageProps {
  readonly data: ChatMessageData;
  readonly currentUid: string | null;
  readonly canReport: boolean;
}

export function ChatMessage({
  data,
  currentUid,
  canReport,
}: ChatMessageProps): React.JSX.Element {
  const isMine = currentUid === data.authorUid;
  const isAdmin = data.authorRole === 'admin';
  const [reportOpen, setReportOpen] = useState(false);

  const isHidden = Boolean(data.hidden && !data.keptByOperator);
  const isDeleted = Boolean(data.deletedByOperator);

  return (
    <div
      className={cn(
        'group flex gap-2 px-3 py-1.5',
        isMine ? 'flex-row-reverse' : 'flex-row',
      )}
      role="article"
      aria-label={`${data.authorNickname}님의 메시지`}
    >
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback
          className={cn(
            'text-[0.7rem]',
            isAdmin
              ? 'bg-vermilion/20 text-vermilion'
              : 'bg-bronze/15 text-bronze-soft',
          )}
        >
          {data.authorNickname.slice(0, 1)}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex max-w-[75%] flex-col gap-1', isMine && 'items-end')}>
        <header className={cn('flex items-center gap-1.5', isMine && 'flex-row-reverse')}>
          <span className="text-xs font-semibold text-text">
            {data.authorNickname}
          </span>
          {data.authorClassId ? (
            <Badge variant={CLASS_VARIANT[data.authorClassId]} className="text-[0.6rem]">
              {CLASS_LABEL[data.authorClassId]}
            </Badge>
          ) : null}
          {isAdmin ? (
            <Badge variant="vermilion" className="gap-1 text-[0.6rem]">
              <ShieldAlert className="h-2.5 w-2.5" />
              운영자
            </Badge>
          ) : null}
          <time className="font-mono text-[0.65rem] text-text-mute">
            {formatTime(data.createdAt)}
          </time>
        </header>

        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-sm',
            isMine ? 'bg-bronze/15 text-text' : 'bg-ink-elev text-text',
            (isHidden || isDeleted) && 'opacity-50 italic',
          )}
        >
          {isDeleted ? (
            <span className="text-text-mute">운영자에 의해 삭제된 메시지입니다.</span>
          ) : isHidden ? (
            <span className="text-text-mute">신고가 누적되어 자동 숨김된 메시지입니다.</span>
          ) : (
            <p className="whitespace-pre-wrap break-words">{data.content}</p>
          )}

          {data.imageUrl && !isHidden && !isDeleted ? (
            <div className="relative mt-2 inline-block max-h-48 overflow-hidden rounded-lg border border-ink-line">
              <Image
                src={data.imageUrl}
                alt="첨부 이미지"
                width={320}
                height={192}
                sizes="(max-width: 640px) 70vw, 320px"
                className="h-auto max-h-48 w-auto object-contain"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>

        {!isMine && canReport && !isHidden && !isDeleted ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setReportOpen(true)}
            className="gap-1 text-text-mute opacity-0 transition-opacity hover:text-vermilion group-hover:opacity-100"
            aria-label="이 메시지 신고하기"
          >
            <Flag className="h-3 w-3" />
            신고
          </Button>
        ) : null}

        <ChatReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          messageId={data.id}
          channelId={data.channelId}
          reportedUid={data.authorUid}
          messageSnapshot={data.content}
          {...(data.imageUrl ? { imageUrl: data.imageUrl } : {})}
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
