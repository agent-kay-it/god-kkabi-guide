/**
 * V2 인사이트 (F3.2 진령 채용률 + F3.3 PvP 트렌드) 타입.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §2-§3
 */

import type { WikiJinryeongId } from '@/types/wiki';
import type { ClassId } from '@/types/simulator';

export interface WeekISO {
  /** ISO 8601 주 — `${year}-W${ww}` */
  readonly value: string;
  readonly year: number;
  readonly week: number;
  readonly startMs: number;
  readonly endMs: number;
}

export interface JinryeongRateRow {
  readonly weekISO: string;
  readonly jinryeongId: WikiJinryeongId;
  readonly className?: ClassId;
  readonly count: number;
  readonly rank: number;
  readonly prevRank?: number;
  readonly delta?: number;
  readonly source: 'posts' | 'simulator' | 'combined';
}

export interface PvpTrendRow {
  readonly weekISO: string;
  readonly comboId: string;
  readonly jinryeongIds: readonly WikiJinryeongId[];
  readonly className?: ClassId;
  readonly count: number;
  readonly rank: number;
  readonly winRate?: number;
}

export interface InsightsFilters {
  readonly className?: ClassId;
  readonly weeks?: number; // 최근 N주 (default 4)
}

/** Date → ISO Week */
export function toWeekISO(date: Date): WeekISO {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7; // Mon=0
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const dayDiff = (target.getTime() - firstThursday.getTime()) / 86400000;
  const week = 1 + Math.round((dayDiff - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  const year = target.getUTCFullYear();
  const value = `${year}-W${String(week).padStart(2, '0')}`;

  const startMs = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7)).getTime();
  const endMs = startMs + 7 * 86400000 - 1;
  return { value, year, week, startMs, endMs };
}
