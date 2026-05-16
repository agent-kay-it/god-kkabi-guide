/**
 * Cron — 주간 PvP 빌드 트렌드 집계 (F3.3).
 */
import { NextResponse } from 'next/server';

import { aggregatePvpWeek } from '@/lib/insights/pvp-trend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const expectedSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (!isVercelCron && !(expectedSecret && auth === `Bearer ${expectedSecret}`)) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const result = await aggregatePvpWeek();
  return NextResponse.json(result);
}
