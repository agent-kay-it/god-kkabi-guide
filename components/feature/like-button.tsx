/**
 * LikeButton — 좋아요 토글 (post / comment 공용).
 * 출처: docs/sprint/04-sprint-v1/design.md §3.3 + Sprint v2 BookmarkButton 패턴 재사용
 *
 * 책임:
 *  - useOptimistic으로 낙관적 업데이트 + 실패 시 롤백
 *  - 비로그인/미등록 시 /login 안내 토스트
 *  - aria-pressed로 상태 노출
 *  - 본인 콘텐츠 좋아요 차단 (Server Action에서 SELF_REACTION 반환 → 토스트)
 */
'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

import { toggleReaction } from '@/lib/reaction/actions';
import { logEvent } from '@/lib/firebase/analytics';
import { Button } from '@/components/ui/button';
import type { ReactionTargetType } from '@/types/reaction';
import { cn } from '@/lib/utils';

export interface LikeButtonProps {
  readonly targetType: ReactionTargetType;
  readonly targetId: string;
  /** comment의 경우 부모 postId 필수 */
  readonly postId?: string;
  /** 게시물 카테고리 (GA4 파라미터용) */
  readonly postCategory?: 'build' | 'guide' | 'review';
  readonly initialLiked: boolean;
  readonly initialCount: number;
  readonly canLike: boolean;
  readonly className?: string;
}

interface OptimisticState {
  readonly liked: boolean;
  readonly count: number;
}

export function LikeButton({
  targetType,
  targetId,
  postId,
  postCategory,
  initialLiked,
  initialCount,
  canLike,
  className,
}: LikeButtonProps): React.JSX.Element {
  const router = useRouter();
  const [base, setBase] = useState<OptimisticState>({
    liked: initialLiked,
    count: initialCount,
  });
  const [optimistic, applyOptimistic] = useOptimistic<OptimisticState, OptimisticState>(
    base,
    (_, next) => next,
  );
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!canLike) {
      toast.message('로그인 후 등록을 완료하면 좋아요를 누를 수 있어요.', {
        action: { label: '로그인', onClick: () => router.push('/login') },
      });
      return;
    }
    const next: OptimisticState = {
      liked: !optimistic.liked,
      count: Math.max(0, optimistic.count + (optimistic.liked ? -1 : 1)),
    };
    startTransition(async () => {
      applyOptimistic(next);
      const result = await toggleReaction({
        targetType,
        targetId,
        ...(postId ? { postId } : {}),
      });
      if (result.ok) {
        const confirmed: OptimisticState = {
          liked: Boolean(result.isLiked),
          count: result.likeCount ?? next.count,
        };
        setBase(confirmed);
        applyOptimistic(confirmed);
        if (result.isLiked) {
          if (targetType === 'post') {
            void logEvent('post_like', {
              post_id: targetId,
              category: postCategory ?? 'build',
            });
          } else {
            void logEvent('comment_like', {
              comment_id: targetId,
              post_id: postId ?? '',
            });
          }
        }
      } else {
        applyOptimistic(base);
        const msg =
          result.error === 'SELF_REACTION'
            ? '본인 콘텐츠에는 좋아요를 누를 수 없습니다'
            : result.error === 'NOT_REGISTERED'
              ? '등록 완료 후 이용 가능합니다'
              : result.error === 'UNAUTHENTICATED'
                ? '로그인이 필요합니다'
                : '좋아요 처리에 실패했습니다';
        toast.error(msg);
      }
    });
  }

  const label = optimistic.liked
    ? `좋아요 취소 (${optimistic.count})`
    : `좋아요 (${optimistic.count})`;

  return (
    <Button
      type="button"
      variant={optimistic.liked ? 'bronze' : 'ghost'}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={optimistic.liked}
      aria-label={label}
      className={cn('gap-1.5', className)}
    >
      <Heart
        aria-hidden
        className={cn(
          'h-3.5 w-3.5 transition-transform',
          optimistic.liked ? 'fill-current scale-110' : '',
        )}
      />
      <span className="font-mono text-xs">{optimistic.count}</span>
    </Button>
  );
}
