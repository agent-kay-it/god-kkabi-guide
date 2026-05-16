/**
 * <RecentlyViewedList> — Sprint V7 P3.A.
 *
 * useRecentlyViewed로 localStorage hydrate 후 horizontal scroll list 렌더.
 * 빈 list (서버 렌더 시점 + 데이터 없음) → null 반환 → 자리 차지하지 않음.
 *
 * Props:
 *   - title: 섹션 제목 (기본 "최근 본 항목")
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §2
 */
'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';

import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import {
  SEARCH_TYPE_LABEL,
  SEARCH_TYPE_VARIANT,
} from '@/lib/search/wiki-search-index';
import { cn } from '@/lib/utils';

export interface RecentlyViewedListProps {
  readonly title?: string;
  readonly className?: string;
}

export function RecentlyViewedList({
  title = '최근 본 항목',
  className,
}: RecentlyViewedListProps): React.JSX.Element | null {
  const list = useRecentlyViewed();

  if (list.length === 0) return null;

  return (
    <section
      aria-labelledby="recently-viewed"
      className={cn('space-y-3', className)}
    >
      <div className="flex items-center gap-2">
        <Clock aria-hidden className="h-3.5 w-3.5 text-text-mute" />
        <h2
          id="recently-viewed"
          className="text-[0.72rem] uppercase tracking-[0.2em] text-text-mute"
        >
          {title}
        </h2>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {list.map((entry) => (
          <li key={entry.id}>
            <Link
              href={entry.href}
              className="group block focus-visible:outline-none"
            >
              <GlassCard
                interactive
                className="flex items-center gap-3 p-3 transition-card hover:border-bronze/40"
              >
                {entry.emoji ? (
                  <span aria-hidden className="text-xl">
                    {entry.emoji}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text group-hover:text-bronze-soft">
                    {entry.title}
                  </span>
                </span>
                <Badge
                  variant={SEARCH_TYPE_VARIANT[entry.type]}
                  className="shrink-0 text-[0.65rem]"
                >
                  {SEARCH_TYPE_LABEL[entry.type]}
                </Badge>
              </GlassCard>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
