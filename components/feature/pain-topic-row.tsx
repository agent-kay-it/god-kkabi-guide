/**
 * <PainTopicRow> — Admin Pain Topic 카드 (clickable).
 * Sprint V2 P5 (CA2-I4) — pain_topic_click GA4 발화.
 *
 * 클릭 시 동작:
 *  1. GA4 pain_topic_click 발화 (topic id + category + term + rank)
 *  2. window.location → /admin/insights/pain?category={category} (서버 필터 재실행)
 */
'use client';

import { useCallback } from 'react';

import { logEvent } from '@/lib/firebase/analytics';
import { PAIN_CATEGORY_LABEL, PAIN_CATEGORY_COLOR, type PainCategory } from '@/types/nlp';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';

export interface PainTopicRowProps {
  readonly id: string;
  readonly rank: number;
  readonly category: PainCategory;
  readonly term: string;
  readonly count: number;
  readonly weekISO: string;
  readonly delta?: number;
}

export function PainTopicRow(props: PainTopicRowProps): React.JSX.Element {
  const { id, rank, category, term, count, weekISO, delta } = props;

  const onClick = useCallback(() => {
    void logEvent('pain_topic_click', {
      topic_id: id,
      category,
      term,
      rank,
    });
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('category', category);
      window.location.assign(url.toString());
    }
  }, [id, category, term, rank]);

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  return (
    <GlassCard
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKey}
      aria-label={`${PAIN_CATEGORY_LABEL[category]} 카테고리 ${term} 상세 (언급 ${count}회)`}
      className="flex flex-wrap items-center justify-between gap-3 p-3 cursor-pointer hover:border-bronze/40 focus:outline-none focus:ring-2 focus:ring-bronze focus:ring-offset-2 focus:ring-offset-ink"
    >
      <div className="flex items-center gap-3">
        <Badge variant="bronze">#{rank}</Badge>
        <Badge variant={PAIN_CATEGORY_COLOR[category]}>{PAIN_CATEGORY_LABEL[category]}</Badge>
        <span className="font-medium text-text">{term}</span>
        <span className="text-xs text-text-mute">언급 {count}회</span>
        {delta !== undefined ? (
          <span
            className={`text-xs ${
              delta > 0 ? 'text-jade' : delta < 0 ? 'text-vermilion' : 'text-text-mute'
            }`}
          >
            {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${-delta}` : '—'}
          </span>
        ) : null}
      </div>
      <span className="font-mono text-xs text-text-mute">{weekISO}</span>
    </GlassCard>
  );
}
