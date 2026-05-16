/**
 * B2B v1 — GET /api/v1/simulator-results — Sprint V3 P3.B.
 * Pro+ only — tier=starter는 403 (FORBIDDEN).
 * 필터: limit
 */
import 'server-only';

import { createB2bRoute } from '@/lib/b2b/handler';
import { fetchSimulatorResults } from '@/lib/b2b/data-sources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseLimit(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export const { GET, OPTIONS } = createB2bRoute(
  async (req) => {
    const url = new URL(req.url);
    const limit = parseLimit(url.searchParams.get('limit'));
    return fetchSimulatorResults({
      ...(limit !== undefined ? { limit } : {}),
    });
  },
  { minTier: 'pro' },
);
