/**
 * B2B v1 — GET /api/v1/coupons-trend — Sprint V3 P3.B.
 * 필터: limit
 */
import 'server-only';

import { createB2bRoute } from '@/lib/b2b/handler';
import { fetchCouponsTrend } from '@/lib/b2b/data-sources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseLimit(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export const { GET, OPTIONS } = createB2bRoute(async (req) => {
  const url = new URL(req.url);
  const limit = parseLimit(url.searchParams.get('limit'));
  return fetchCouponsTrend({
    ...(limit !== undefined ? { limit } : {}),
  });
});
