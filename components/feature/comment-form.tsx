/**
 * <CommentForm> — 댓글/답글 입력 폼.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.2
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { createComment } from '@/lib/comment/actions';
import { logEvent } from '@/lib/firebase/analytics';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { COMMENT_LIMITS } from '@/types/comment';
import { cn } from '@/lib/utils';

export interface CommentFormProps {
  readonly postId: string;
  readonly canComment: boolean;
  /** null = top-level / non-null = depth 2 답글 */
  readonly parentCommentId?: string | null;
  /** 답글 폼 닫기 콜백 */
  readonly onClose?: () => void;
  readonly className?: string;
}

export function CommentForm({
  postId,
  canComment,
  parentCommentId = null,
  onClose,
  className,
}: CommentFormProps): React.JSX.Element {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();

  if (!canComment) {
    return (
      <div className={cn('rounded-md border border-ink-line bg-ink-elev/50 p-4 text-sm text-text-mute', className)}>
        등록 완료 후 댓글을 작성할 수 있습니다.{' '}
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="text-bronze-soft underline underline-offset-2"
        >
          로그인하기
        </button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (trimmed.length < COMMENT_LIMITS.body.min) return;
    if (trimmed.length > COMMENT_LIMITS.body.max) {
      toast.error(`${COMMENT_LIMITS.body.max}자 이내로 작성해주세요`);
      return;
    }
    startTransition(async () => {
      const result = await createComment(postId, { body: trimmed, parentCommentId });
      if (result.ok) {
        setBody('');
        toast.success(parentCommentId ? '답글이 등록되었습니다' : '댓글이 등록되었습니다');
        void logEvent('comment_create', {
          post_id: postId,
          has_parent: Boolean(parentCommentId),
          body_length: trimmed.length,
        });
        onClose?.();
        router.refresh();
      } else {
        const msg =
          result.error === 'DEPTH_EXCEEDED'
            ? '답글의 답글은 작성할 수 없습니다'
            : result.error === 'BANNED'
              ? '정지된 사용자는 작성할 수 없습니다'
              : (result.message ?? '댓글 등록에 실패했습니다');
        toast.error(msg);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-2', className)}>
      <label htmlFor={`comment-form-${parentCommentId ?? 'root'}`} className="sr-only">
        {parentCommentId ? '답글 입력' : '댓글 입력'}
      </label>
      <Textarea
        id={`comment-form-${parentCommentId ?? 'root'}`}
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={COMMENT_LIMITS.body.max}
        placeholder={parentCommentId ? '답글을 입력하세요 (1-500자)' : '댓글을 입력하세요 (1-500자)'}
        className="text-sm"
      />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.65rem] text-text-mute">
          {body.length} / {COMMENT_LIMITS.body.max}
        </span>
        <div className="flex gap-2">
          {onClose ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              취소
            </Button>
          ) : null}
          <Button
            type="submit"
            variant="bronze"
            size="sm"
            disabled={isPending || body.trim().length < COMMENT_LIMITS.body.min}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            {isPending ? '등록 중...' : '등록'}
          </Button>
        </div>
      </div>
    </form>
  );
}
