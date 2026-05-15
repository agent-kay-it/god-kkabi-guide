/**
 * Cron — 주간 진령 채용률 집계 (F3.2).
 * 매주 월요일 00:00 KST. Vercel cron 호출.
 *
 * 보안:
 *  - CRON_SECRET env 검증 (`Authorization: Bearer ${CRON_SECRET}`)
 *  - 또는 Vercel cron 자동 헤더 검증 (`x-vercel-signature` 또는 `vercel-cron`)
 */
import { NextResponse } from 'next/server';

import { aggregateJinryeongWeek } from '@/lib/insights/jinryeong-rate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  // Vercel cron 검증: `x-vercel-cron` 헤더 OR Authorization Bearer CRON_SECRET
  const cronHeader = request.headers.get('x-vercel-cron');
  const auth = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  const isVercelCron = cronHeader === '1';
  const isAuthorized =
    expectedSecret && auth === `Bearer ${expectedSecret}`;

  if (!isVercelCron && !isAuthorized) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const result = await aggregateJinryeongWeek();
  return NextResponse.json(result);
}
