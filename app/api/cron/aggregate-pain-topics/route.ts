/**
 * Cron — 주간 Pain Topic 집계 (F3.5).
 */
import { NextResponse } from 'next/server';

import { aggregatePainTopicsWeek } from '@/lib/nlp/aggregate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5분 (cron 큰 윈도우 대응)

export async function GET(request: Request): Promise<NextResponse> {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const expectedSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (!isVercelCron && !(expectedSecret && auth === `Bearer ${expectedSecret}`)) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const result = await aggregatePainTopicsWeek();
  return NextResponse.json(result);
}
