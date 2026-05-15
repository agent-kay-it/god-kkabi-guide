/**
 * <PostMeta> — 게시물 메타 정보 (작성자/시간/뷰/좋아요/댓글).
 * 출처: docs/sprint/04-sprint-v1/design.md §1 (도메인 컴포넌트)
 *
 * 사용:
 *  - 리스트 카드 컴팩트 모드
 *  - 상세 페이지 헤더
 */
import { Eye, Heart, MessageSquare, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { CLASS_ACCENT } from '@/types/wiki';
import { POST_CATEGORY_LABEL, type PostCategory } from '@/types/post';
import { cn } from '@/lib/utils';

export interface PostMetaProps {
  readonly category: PostCategory;
  readonly authorNickname: string;
  readonly authorClassId?: 'warrior' | 'swordsman' | 'medium';
  readonly createdAtMs: number;
  readonly viewCount: number;
  readonly likeCount: number;
  readonly commentCount: number;
  readonly className?: string;
  readonly compact?: boolean;
}

export function PostMeta({
  category,
  authorNickname,
  authorClassId,
  createdAtMs,
  viewCount,
  likeCount,
  commentCount,
  className,
  compact = false,
}: PostMetaProps): React.JSX.Element {
  const relativeTime = formatRelative(createdAtMs);
  const authorVariant = authorClassId ? CLASS_ACCENT[authorClassId] : undefined;
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 text-xs text-text-mute',
        className,
      )}
    >
      <Badge variant={categoryVariant(category)} className="text-[0.65rem]">
        {POST_CATEGORY_LABEL[category]}
      </Badge>
      {authorClassId ? (
        <Badge variant={authorVariant} className="text-[0.65rem]">
          {authorNickname}
        </Badge>
      ) : (
        <span className="text-text-soft">{authorNickname}</span>
      )}
      <span className="flex items-center gap-1">
        <Clock aria-hidden className="h-3 w-3" />
        <time dateTime={new Date(createdAtMs).toISOString()}>{relativeTime}</time>
      </span>
      {!compact ? (
        <>
          <span aria-label={`조회 ${viewCount}`} className="flex items-center gap-1">
            <Eye aria-hidden className="h-3 w-3" />
            <span className="font-mono">{viewCount}</span>
          </span>
          <span aria-label={`좋아요 ${likeCount}`} className="flex items-center gap-1">
            <Heart aria-hidden className="h-3 w-3" />
            <span className="font-mono">{likeCount}</span>
          </span>
          <span aria-label={`댓글 ${commentCount}`} className="flex items-center gap-1">
            <MessageSquare aria-hidden className="h-3 w-3" />
            <span className="font-mono">{commentCount}</span>
          </span>
        </>
      ) : null}
    </div>
  );
}

function categoryVariant(category: PostCategory): 'bronze' | 'jade' | 'indigo' {
  if (category === 'build') return 'bronze';
  if (category === 'guide') return 'jade';
  return 'indigo';
}

function formatRelative(ms: number): string {
  if (!ms) return '방금';
  const diff = Date.now() - ms;
  if (diff < 60 * 1000) return '방금';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60_000))}시간 전`;
  if (diff < 7 * 24 * 60 * 60 * 1000)
    return `${Math.floor(diff / (24 * 60 * 60_000))}일 전`;
  return new Date(ms).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
