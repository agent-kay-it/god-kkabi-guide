/**
 * Google News API adapter — Sprint V3 P3.D (F4.1).
 *
 * Google Custom Search API (Free tier 100 queries/day) 또는 NewsAPI.org 사용.
 * 환경변수 NEWS_API_KEY 미설정 시 skip.
 *
 * 검색 키워드: 4399 / Joy Net Games / 갓깨비 / 동양 IP 키우기
 */
import 'server-only';

import { upsertSignalsBatch } from './repo';
import type { UpsertSignalInput } from '@/types/etl';

const ENDPOINT = 'https://newsapi.org/v2/everything';
const DEFAULT_KEYWORDS = ['4399', 'Joy Net Games', '갓깨비', '방치형 RPG'] as const;

interface NewsArticle {
  readonly source?: { id?: string; name?: string };
  readonly author?: string;
  readonly title?: string;
  readonly description?: string;
  readonly url?: string;
  readonly publishedAt?: string;
}

interface NewsApiResponse {
  readonly status?: string;
  readonly articles?: NewsArticle[];
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchGoogleNewsArticles(opts: {
  readonly keywords?: readonly string[];
  readonly apiKey?: string;
  readonly pageSize?: number;
} = {}): Promise<{ ok: boolean; skipped?: boolean; processed: number; errors: number }> {
  const apiKey = opts.apiKey ?? process.env.NEWS_API_KEY;
  if (!apiKey) {
    return { ok: false, skipped: true, processed: 0, errors: 0 };
  }
  const keywords = opts.keywords ?? DEFAULT_KEYWORDS;
  const pageSize = Math.min(Math.max(1, opts.pageSize ?? 20), 100);
  const inputs: UpsertSignalInput[] = [];

  for (const keyword of keywords) {
    const url = new URL(ENDPOINT);
    url.searchParams.set('q', keyword);
    url.searchParams.set('pageSize', String(pageSize));
    url.searchParams.set('sortBy', 'publishedAt');

    try {
      const res = await fetch(url.toString(), {
        cache: 'no-store',
        headers: { 'X-Api-Key': apiKey },
      });
      if (!res.ok) {
        console.error('[etl/google-news] http error:', res.status, keyword);
        continue;
      }
      const json = (await res.json()) as NewsApiResponse;
      const articles = json.articles ?? [];
      const day = todayKey();
      for (const a of articles) {
        if (!a.url) continue;
        // url을 deterministic id로 활용 (deduplication)
        const docId = `news_${encodeBase64Url(a.url).slice(0, 40)}_${day}`;
        inputs.push({
          id: docId,
          source: 'google_news',
          signalType: 'news_article',
          payload: { ...a, fetchKeyword: keyword },
          keywords: [keyword],
          confidence: 0.6,
          manuallyVerified: false,
        });
      }
    } catch (err) {
      console.error('[etl/google-news] fetch error:', err, keyword);
    }
  }

  const result = await upsertSignalsBatch(inputs);
  return { ok: true, processed: result.processed, errors: result.errors };
}

/** URL을 short id로 — Buffer base64url (Node 환경). */
function encodeBase64Url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url');
}
