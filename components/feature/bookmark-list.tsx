/**
 * BookmarkList — /me/bookmarks 페이지 본문 (필터 + 그룹화 + 삭제).
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.6
 *
 * Client Component — 필터 상태 보유, 삭제 시 낙관적 업데이트.
 */
'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { removeBookmark } from '@/lib/bookmark/actions';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BOOKMARK_TYPE_LABEL, type BookmarkSummary, type BookmarkTargetType } from '@/types/bookmark';
import { cn } from '@/lib/utils';

const FILTER_VARIANTS: ReadonlyArray<{
  id: BookmarkTargetType | 'all';
  label: string;
}> = [
  { id: 'all', label: '전체' },
  { id: 'class', label: '직업' },
  { id: 'jinryeong', label: '진령' },
  { id: 'tip', label: '팁' },
  { id: 'equipment', label: '장비' },
  { id: 'skill', label: '스킬' },
  { id: 'content', label: '콘텐츠' },
];

const TYPE_ACCENT: Record<BookmarkTargetType, 'bronze' | 'jade' | 'vermilion' | 'indigo'> = {
  class: 'bronze',
  jinryeong: 'indigo',
  tip: 'jade',
  equipment: 'jade',
  skill: 'bronze',
  content: 'vermilion',
  post: 'indigo',
};

export interface BookmarkListProps {
  readonly initialBookmarks: readonly BookmarkSummary[];
}

type SortMode = 'latest' | 'alpha';

export function BookmarkList({ initialBookmarks }: BookmarkListProps): React.JSX.Element {
  const [bookmarks, setBookmarks] =
    useState<readonly BookmarkSummary[]>(initialBookmarks);
  const [filter, setFilter] = useState<BookmarkTargetType | 'all'>('all');
  const [sort, setSort] = useState<SortMode>('latest');
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const base = filter === 'all' ? bookmarks : bookmarks.filter((b) => b.targetType === filter);
    if (sort === 'alpha') {
      // 가나다순 — 한국어 locale 정렬
      return [...base].sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    }
    // 최신순 — createdAtMs desc
    return [...base].sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [bookmarks, filter, sort]);

  function handleRemove(b: BookmarkSummary) {
    startTransition(async () => {
      // 낙관적 제거
      setBookmarks((prev) => prev.filter((x) => x.id !== b.id));
      const result = await removeBookmark(b.targetType, b.targetId);
      if (!result.ok) {
        // 롤백
        setBookmarks((prev) => [...prev, b]);
        toast.error('북마크 제거에 실패했습니다');
        return;
      }
      toast.success('북마크에서 제거했습니다');
    });
  }

  if (bookmarks.length === 0) {
    return (
      <GlassCard className="p-10 text-center" accent="swordsman">
        <p className="text-base font-semibold text-text">아직 북마크가 없어요</p>
        <p className="mt-2 text-sm text-text-soft">
          위키 카드 우측 상단의 북마크 아이콘으로 추가할 수 있습니다.
        </p>
        <div className="mt-6 inline-flex flex-wrap gap-2">
          <Button asChild variant="bronze">
            <Link href="/class" className="gap-2">
              직업 가이드 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/jinryeong">진령 가이드 →</Link>
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="flex flex-wrap gap-2" aria-label="북마크 필터">
          {FILTER_VARIANTS.map((f) => {
          const count =
            f.id === 'all'
              ? bookmarks.length
              : bookmarks.filter((b) => b.targetType === f.id).length;
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setFilter(f.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                isActive
                  ? 'border-bronze bg-bronze/15 text-bronze-soft'
                  : 'border-ink-line bg-ink-elev text-text-soft hover:border-bronze/40 hover:text-text',
              )}
            >
              {f.label}
              <span className="font-mono text-[0.7rem] text-text-mute">{count}</span>
            </button>
          );
        })}
        </div>

        {/* Sprint V6 P3.C: 정렬 옵션 */}
        <div className="flex items-center gap-1 text-xs text-text-mute" role="group" aria-label="북마크 정렬">
          <span>정렬</span>
          {(
            [
              { id: 'latest' as const, label: '최신순' },
              { id: 'alpha' as const, label: '가나다순' },
            ]
          ).map((opt) => {
            const isActive = sort === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSort(opt.id)}
                className={cn(
                  'rounded-md px-2 py-1 transition-colors',
                  isActive
                    ? 'bg-ink-card-strong text-text'
                    : 'text-text-mute hover:text-text-soft',
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((b) => (
          <GlassCard
            key={b.id}
            className="flex items-center gap-3 p-3"
            interactive
          >
            <Badge variant={TYPE_ACCENT[b.targetType]} className="shrink-0 text-[0.7rem]">
              {BOOKMARK_TYPE_LABEL[b.targetType]}
            </Badge>
            <Link
              href={b.href}
              className="flex-1 truncate text-sm font-medium text-text hover:text-bronze"
            >
              {b.emoji ? <span aria-hidden className="mr-1.5">{b.emoji}</span> : null}
              {b.title}
            </Link>
            <button
              type="button"
              onClick={() => handleRemove(b)}
              disabled={isPending}
              aria-label={`${b.title} 북마크 제거`}
              className="rounded-md p-1.5 text-text-mute transition-colors hover:bg-vermilion/10 hover:text-vermilion"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </GlassCard>
        ))}

        {filtered.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-ink-line bg-ink-elev p-6 text-center text-sm text-text-mute">
            해당 카테고리에는 북마크가 없습니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}
