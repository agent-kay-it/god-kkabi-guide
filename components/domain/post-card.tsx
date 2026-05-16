/**
 * <PostCard> — 게시물 1건 리스트 카드.
 * 출처: docs/sprint/04-sprint-v1/design.md §1
 *
 * Clean Architecture 일방향 준수:
 *  - feature 컴포넌트(BookmarkButton / LikeButton 등)는 부모에서 슬롯으로 주입
 *  - 본 컴포넌트는 ui + domain만 의존
 */
import Link from 'next/link';

import { GlassCard } from '@/components/ui/glass-card';
import { PostMeta } from './post-meta';
import type { PostListItem } from '@/types/post';
import { cn } from '@/lib/utils';

export interface PostCardProps {
  readonly data: PostListItem;
  /** feature 슬롯 — 좋아요/북마크 버튼 부모 주입 */
  readonly actionsSlot?: React.ReactNode;
  readonly className?: string;
}

export function PostCard({
  data,
  actionsSlot,
  className,
}: PostCardProps): React.JSX.Element {
  const isHidden = data.status === 'hidden_auto';
  return (
    <GlassCard
      accent={accentForCategory(data.category)}
      className={cn(
        'flex flex-col gap-3 p-5',
        isHidden && 'opacity-60',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <PostMeta
          category={data.category}
          authorNickname={data.authorNickname}
          {...(data.authorClassId ? { authorClassId: data.authorClassId } : {})}
          createdAtMs={data.createdAtMs}
          viewCount={data.viewCount}
          likeCount={data.likeCount}
          commentCount={data.commentCount}
        />
        {actionsSlot ? <div className="shrink-0">{actionsSlot}</div> : null}
      </header>

      <Link href={`/post/${data.id}`} className="block">
        <h3 className="text-lg font-bold leading-tight tracking-tight text-text hover:text-bronze-soft sm:text-xl">
          {data.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-soft">
          {isHidden ? '신고 누적으로 자동 숨김된 게시물입니다.' : data.bodyExcerpt}
        </p>
      </Link>

      {data.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {data.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-ink-elev px-2 py-0.5 font-mono text-[0.65rem] text-text-mute"
            >
              #{tag.replace(/^[a-z]+:/, '')}
            </span>
          ))}
        </div>
      ) : null}
    </GlassCard>
  );
}

function accentForCategory(
  c: 'build' | 'guide' | 'review',
): 'swordsman' | 'pve' | 'mage' {
  if (c === 'build') return 'swordsman';
  if (c === 'guide') return 'pve';
  return 'mage';
}
