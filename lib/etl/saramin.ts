/**
 * 사람인 Open API adapter — Sprint V3 P3.D (F4.1).
 * 출처: docs/sprint/05-sprint-v3/design.md §8.5
 *
 * API: https://oapi.saramin.co.kr/job-search?access_key=...&keywords=...&count=...
 * 무료 (rate-limited 1K req/day).
 *
 * API Key 미설정 시: { ok: false, skipped: true } 반환 → cron 정상 종료.
 */
import 'server-only';

import { upsertSignalsBatch } from './repo';
import type { UpsertSignalInput } from '@/types/etl';

const ENDPOINT = 'https://oapi.saramin.co.kr/job-search';
const DEFAULT_KEYWORDS = ['4399', '갓깨비', 'Joy Net Games', 'Juxin', '방치형 RPG'] as const;

interface SaraminJobItem {
  readonly id?: string | number;
  readonly title?: string | { name?: string };
  readonly company?: { detail?: { name?: string } };
  readonly position?: { industry?: { name?: string }; title?: string };
  readonly url?: string;
  readonly active?: number;
}

interface SaraminResponse {
  readonly jobs?: { job?: SaraminJobItem[] };
}

function getCurrentWeekISO(): string {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((diffDays + 1) / 7);
  return `${now.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export async function fetchSaraminJobPostings(opts: {
  readonly keywords?: readonly string[];
  readonly accessKey?: string;
  readonly count?: number;
} = {}): Promise<{ ok: boolean; skipped?: boolean; processed: number; errors: number }> {
  const accessKey = opts.accessKey ?? process.env.SARAMIN_API_KEY;
  if (!accessKey) {
    return { ok: false, skipped: true, processed: 0, errors: 0 };
  }
  const keywords = opts.keywords ?? DEFAULT_KEYWORDS;
  const count = Math.min(Math.max(1, opts.count ?? 50), 110);
  const period = getCurrentWeekISO();
  const inputs: UpsertSignalInput[] = [];

  for (const keyword of keywords) {
    const url = new URL(ENDPOINT);
    url.searchParams.set('access_key', accessKey);
    url.searchParams.set('keywords', keyword);
    url.searchParams.set('count', String(count));
    url.searchParams.set('loc_cd', '101000'); // 서울

    try {
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) {
        console.error('[etl/saramin] http error:', res.status, keyword);
        continue;
      }
      const json = (await res.json()) as SaraminResponse;
      const jobs = json.jobs?.job ?? [];
      for (const job of jobs) {
        const docId = `saramin_job_${job.id ?? ''}`;
        inputs.push({
          id: docId,
          source: 'saramin',
          signalType: 'job_posting',
          payload: { ...job, fetchKeyword: keyword },
          period,
          keywords: [keyword],
          confidence: 0.85,
          manuallyVerified: false,
          language: 'ko',
        });
      }
    } catch (err) {
      console.error('[etl/saramin] fetch error:', err, keyword);
    }
  }

  const result = await upsertSignalsBatch(inputs);
  return { ok: true, processed: result.processed, errors: result.errors };
}
