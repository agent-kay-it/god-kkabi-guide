/**
 * F3.5 Pain Point NLP — 정규식 + 빈도 기반 (LLM 미사용).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §5
 */

export type PainCategory = 'bug' | 'balance' | 'monetization' | 'qol' | 'event' | 'class';
export type PainSeverity = 'minor' | 'major';

export interface PainKeyword {
  readonly id: string;
  readonly term: string;
  readonly aliases: readonly string[];
  readonly category: PainCategory;
  readonly severity: PainSeverity;
}

export interface PainMentionDoc {
  readonly id: string;
  readonly sourceType: 'post' | 'comment';
  readonly sourceId: string;
  readonly postId?: string; // comment의 경우 부모 postId
  readonly keywordId: string;
  readonly excerpt: string; // 매칭 컨텍스트 ~100자
  readonly timestampMs: number;
}

export interface PainTopicDoc {
  readonly id: string;
  readonly weekISO: string;
  readonly keywordId: string;
  readonly term: string;
  readonly category: PainCategory;
  readonly severity: PainSeverity;
  readonly count: number;
  readonly rank: number;
  readonly prevRank?: number;
  readonly delta?: number;
  readonly mentionIds: readonly string[];
  readonly aggregatedAtMs: number;
}

export const PAIN_CATEGORY_LABEL: Record<PainCategory, string> = {
  bug: '버그/오류',
  balance: '밸런스',
  monetization: '과금',
  qol: 'QoL/편의',
  event: '이벤트',
  class: '직업',
};

export const PAIN_CATEGORY_COLOR: Record<PainCategory, 'vermilion' | 'bronze' | 'jade' | 'muted' | 'indigo'> = {
  bug: 'vermilion',
  balance: 'bronze',
  monetization: 'vermilion',
  qol: 'jade',
  event: 'indigo',
  class: 'muted',
};
