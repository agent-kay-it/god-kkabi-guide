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

export interface WikiCardTrackerProps {
  readonly category: 'class' | 'jinryeong' | 'skill' | 'equipment' | 'content' | 'munpa';
  readonly targetId: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function WikiCardTracker({
  category,
  targetId,
  children,
  className,
}: WikiCardTrackerProps): React.JSX.Element {
  const handleClick = useCallback(() => {
    void logEvent('wiki_card_click', { category, target_id: targetId });
  }, [category, targetId]);

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
