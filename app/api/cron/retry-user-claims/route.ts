/**
 * Cron — setUserClaims retry queue drain (Sprint V3 CA2-I11).
 *
 * Vercel cron 또는 외부 트리거가 호출하여 user_claims_retry_queue/{} pending 문서를
 * 최대 25개씩 drain. 5회 실패 시 status='failed' 마킹.
 *
 * 보안: Vercel cron 헤더 `Authorization: Bearer ${CRON_SECRET}` 검증.
 */
import 'server-only';

import { NextResponse, type NextRequest } from 'next/server';

import { drainUserClaimsRetryQueue } from '@/lib/firebase/claims-retry-queue';

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
  try {
    const result = await drainUserClaimsRetryQueue();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ ok: false, error: 'INTERNAL', message }, { status: 500 });
  }
}
