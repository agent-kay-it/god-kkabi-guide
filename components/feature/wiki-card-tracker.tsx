/**
 * WikiCardTracker — 위키 카드 클릭 시 GA4 `wiki_card_click` 발화.
 * 출처: docs/sprint/04-sprint-v1/design.md §7 + plan.md §P3.A.2
 *
 * 패턴:
 *  - 'use client' wrapper로 도메인 카드를 감싼다.
 *  - 도메인 카드(ClassCard/JinryeongCard/...)는 feature 의존 금지 (Clean Arch 일방향).
 *  - 카드 자체에 onClick prop을 추가하지 않고 wrapper 분리로 책임 격리.
 *
 * 사용 예 (app/class/page.tsx):
 *   <WikiCardTracker category="class" targetId={c.id}>
 *     <ClassCard data={c} ... />
 *   </WikiCardTracker>
 */
'use client';

import { useCallback } from 'react';

import { logEvent } from '@/lib/firebase/analytics';
import { addRecentlyViewed } from '@/lib/personalization/recently-viewed';
import type { SearchEntryType } from '@/lib/search/wiki-search-index';

export interface WikiCardTrackerProps {
  readonly category: 'class' | 'jinryeong' | 'skill' | 'equipment' | 'content' | 'munpa';
  readonly targetId: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  /** Sprint V7 P3.A: Recently Viewed에 push할 메타데이터. 미제공 시 GA만 발화. */
  readonly recentlyViewed?: {
    readonly title: string;
    readonly href: string;
    /** V7 P5: 우선순위 — iconUrl이 있으면 webp Image로 렌더, 없으면 emoji 폴백 */
    readonly iconUrl?: string;
    readonly emoji?: string;
  };
}

const CATEGORY_TO_SEARCH_TYPE: Record<
  WikiCardTrackerProps['category'],
  SearchEntryType
> = {
  class: 'class',
  jinryeong: 'jinryeong',
  skill: 'skill',
  equipment: 'equipment',
  content: 'content',
  munpa: 'munpa',
};

export function WikiCardTracker({
  category,
  targetId,
  children,
  className,
  recentlyViewed,
}: WikiCardTrackerProps): React.JSX.Element {
  const handleClick = useCallback(() => {
    void logEvent('wiki_card_click', { category, target_id: targetId });
    if (recentlyViewed) {
      addRecentlyViewed({
        id: `${category}-${targetId}`,
        type: CATEGORY_TO_SEARCH_TYPE[category],
        title: recentlyViewed.title,
        href: recentlyViewed.href,
        ...(recentlyViewed.iconUrl !== undefined ? { iconUrl: recentlyViewed.iconUrl } : {}),
        ...(recentlyViewed.emoji !== undefined ? { emoji: recentlyViewed.emoji } : {}),
      });
    }
  }, [category, targetId, recentlyViewed]);

  // a11y: 카드 내부에 이미 button/link가 있으므로 wrapper는 div + onClickCapture로 버블링 캡처.
  // tabindex/role은 자식 컴포넌트가 담당 (a/button).
  return (
    <div
      onClickCapture={handleClick}
      className={className}
      data-wiki-category={category}
      data-wiki-target-id={targetId}
    >
      {children}
    </div>
  );
}
