/**
 * <CommentItem> — 댓글 1건 표시 + 액션 (답글/좋아요/신고/삭제).
 * 출처: docs/sprint/04-sprint-v1/design.md §3.2
 *
 * Clean Architecture:
 *  - 본 컴포넌트는 feature 레이어 — useState/useTransition 사용
 *  - domain CommentThread가 renderItem 슬롯으로 본 컴포넌트 주입
 */
'use client';

import { useState, useTransition } from 'react';
import { Flag, MessageSquareReply, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { deleteComment } from '@/lib/comment/actions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CLASS_ACCENT } from '@/types/wiki';
import type { CommentDoc } from '@/types/comment';
import { CommentForm } from './comment-form';
import { LikeButton } from './like-button';
import { PostReportDialog } from './post-report-dialog';
import { cn } from '@/lib/utils';

export interface CommentItemProps {
  readonly comment: CommentDoc;
  readonly viewerUid: string | null;
  readonly viewerIsAdmin: boolean;
  readonly canInteract: boolean;
  readonly isReply: boolean;
  /** 본인이 좋아요 누른 상태 (Server에서 결정) */
  readonly liked: boolean;
}

export function CommentItem({
  comment,
  viewerUid,
  viewerIsAdmin,
  canInteract,
  isReply,
  liked,
}: CommentItemProps): React.JSX.Element {
  const [showReply, setShowReply] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isMine = viewerUid !== null && comment.authorUid === viewerUid;
  const canDelete = isMine || viewerIsAdmin;

  function handleDelete() {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return;
    startTransition(async () => {
      const result = await deleteComment(comment.postId, comment.id);
      if (result.ok) {
        toast.success('댓글이 삭제되었습니다');
      } else {
        toast.error('삭제에 실패했습니다');
      }
    });
  }

  const displayBody = comment.deletedByOperator
    ? '[운영자에 의해 삭제된 댓글]'
    : comment.hidden && !comment.keptByOperator && !viewerIsAdmin
      ? '[신고 누적으로 자동 숨김된 댓글]'
      : comment.body;

  const initial = comment.authorNickname.slice(0, 1).toUpperCase();
  const authorVariant = comment.authorClassId ? CLASS_ACCENT[comment.authorClassId] : undefined;

  return (
    <article
      role="article"
      aria-label={`${comment.authorNickname}님의 댓글`}
      className={cn(
        'group flex gap-3 rounded-md border border-ink-line bg-ink-elev/40 p-3',
        isReply && 'bg-ink-elev/20',
      )}
    >
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className="bg-ink-card-strong text-xs">{initial}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline gap-2">
          {comment.authorClassId ? (
            <Badge variant={authorVariant} className="text-[0.65rem]">
              {comment.authorNickname}
            </Badge>
          ) : (
            <span className="text-sm font-medium text-text">{comment.authorNickname}</span>
          )}
          <time
            dateTime={new Date(comment.createdAtMs).toISOString()}
            className="font-mono text-[0.65rem] text-text-mute"
          >
            {new Date(comment.createdAtMs).toLocaleString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </header>

        <p
          className={cn(
            'mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed',
            comment.deletedByOperator || comment.hidden
              ? 'text-text-mute italic'
              : 'text-text-soft',
          )}
        >
          {displayBody}
        </p>

        <footer className="mt-2 flex flex-wrap items-center gap-1">
          {!comment.deletedByOperator && !comment.hidden ? (
            <LikeButton
              targetType="comment"
              targetId={comment.id}
              postId={comment.postId}
              initialLiked={liked}
              initialCount={comment.likeCount}
              canLike={canInteract && !isMine}
            />
          ) : null}
          {!isReply && canInteract && !comment.deletedByOperator ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowReply((v) => !v)}
              aria-pressed={showReply}
              className="gap-1 text-xs"
            >
              <MessageSquareReply aria-hidden className="h-3 w-3" />
              {showReply ? '답글 취소' : '답글'}
            </Button>
          ) : null}
          {!isMine && canInteract && !comment.deletedByOperator ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReportOpen(true)}
              aria-label="이 댓글 신고"
              className="gap-1 text-xs text-text-mute hover:text-vermilion"
            >
              <Flag aria-hidden className="h-3 w-3" />
            </Button>
          ) : null}
          {canDelete && !comment.deletedByOperator ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              aria-label="댓글 삭제"
              className="gap-1 text-xs text-text-mute hover:text-vermilion"
            >
              <Trash2 aria-hidden className="h-3 w-3" />
            </Button>
          ) : null}
        </footer>

        {showReply ? (
          <div className="mt-3">
            <CommentForm
              postId={comment.postId}
              canComment={canInteract}
              parentCommentId={comment.id}
              onClose={() => setShowReply(false)}
            />
          </div>
        ) : null}

        <PostReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          targetType="comment"
          targetId={comment.id}
          postId={comment.postId}
          reportedUid={comment.authorUid}
          snapshot={comment.body.slice(0, 200)}
        />
      </div>
    </article>
  );
}
