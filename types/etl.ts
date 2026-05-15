/**
 * External signal ETL types — Sprint V3 P3.D (F4.1).
 * 출처: docs/sprint/05-sprint-v3/design.md §8
 *
 * external_signals 컬렉션 — 외부 데이터 (사람인/잡코리아/Google News/LinkedIn/Sensor Tower)
 * 통합 저장소. Cloud Functions 또는 Vercel cron이 일일/주간/분기 수집.
 */

export type ExternalSignalSource =
  | 'linkedin'
  | 'saramin'
  | 'jobkorea'
  | 'sensor_tower'
  | 'google_news';

export type ExternalSignalType =
  | 'job_posting'
  | 'industry_revenue'
  | 'news_article'
  | 'role_change'
  | 'patent_filing';

export interface ExternalSignalDoc {
  readonly id: string;
  readonly source: ExternalSignalSource;
  readonly signalType: ExternalSignalType;
  /** 원본 payload (JSON serializable). source별 schema 다름. */
  readonly payload: Record<string, unknown>;
  readonly fetchedAtMs: number;
  /** 'YYYY-Wnn' (주별) | 'YYYY-Qn' (분기별) */
  readonly period?: string;
  readonly keywords?: readonly string[];
  /** 0.0~1.0 — 수동 검증 시 1.0 */
  readonly confidence?: number;
  readonly manuallyVerified?: boolean;
  readonly language?: 'ko' | 'en' | 'zh';
}

/** 새 시그널 upsert 입력 — Firestore doc id는 자동 생성 또는 명시 */
export interface UpsertSignalInput {
  /** 명시 시 fixed doc id (재실행 시 deduplication) */
  readonly id?: string;
  readonly source: ExternalSignalSource;
  readonly signalType: ExternalSignalType;
  readonly payload: Record<string, unknown>;
  readonly period?: string;
  readonly keywords?: readonly string[];
  readonly confidence?: number;
  readonly manuallyVerified?: boolean;
  readonly language?: 'ko' | 'en' | 'zh';
}
