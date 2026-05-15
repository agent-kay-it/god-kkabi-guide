/**
 * Cron — external_signals ETL (Sprint V3 P3.D F4.1).
 *
 * 일 1회 (03:00 KST = 18:00 UTC 전일) 실행 권장.
 * 각 source는 API key 누락 시 skip → 일부 실패해도 전체는 OK.
 *
 * 보안: Vercel cron 헤더 `Authorization: Bearer ${CRON_SECRET}` 검증.
 */
import 'server-only';

import { NextResponse, type NextRequest } from 'next/server';

import { fetchSaraminJobPostings } from '@/lib/etl/saramin';
import { fetchGoogleNewsArticles } from '@/lib/etl/google-news';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get('authorization');
    if (header !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
  }
  const [saramin, news] = await Promise.all([
    fetchSaraminJobPostings().catch((err) => {
      console.error('[etl-external-signals] saramin top-level error:', err);
      return { ok: false, processed: 0, errors: 1 };
    }),
    fetchGoogleNewsArticles().catch((err) => {
      console.error('[etl-external-signals] google-news top-level error:', err);
      return { ok: false, processed: 0, errors: 1 };
    }),
  ]);
  // GAP-V3-MAJ-1: B2B funnel server-side audit log.
  // GA4 측 측정은 추후 measurement protocol 도입 시 server-side fire — 본 cron은 audit log로 우선 보존.
  console.info(
    JSON.stringify({
      event: 'external_signal_fetch',
      saraminProcessed: saramin.processed,
      saraminErrors: saramin.errors,
      saraminSkipped: 'skipped' in saramin ? saramin.skipped : false,
      googleNewsProcessed: news.processed,
      googleNewsErrors: news.errors,
      googleNewsSkipped: 'skipped' in news ? news.skipped : false,
      timestamp: new Date().toISOString(),
    }),
  );
  return NextResponse.json({
    ok: true,
    saramin,
    googleNews: news,
  });
}
