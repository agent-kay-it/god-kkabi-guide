/**
 * B2B v1 — GET /api/v1/pain-points — Sprint V3 P3.B.
 * 필터: weekISO / category / limit
 */
import 'server-only';

import { createB2bRoute } from '@/lib/b2b/handler';
import { fetchPainPoints } from '@/lib/b2b/data-sources';
import type { PainCategory } from '@/types/nlp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_PAIN_CATEGORIES: readonly PainCategory[] = [
  'bug',
  'balance',
  'monetization',
  'qol',
  'event',
  'class',
];

function parseCategory(v: string | null): PainCategory | undefined {
  if (!v) return undefined;
  return (VALID_PAIN_CATEGORIES as readonly string[]).includes(v)
    ? (v as PainCategory)
    : undefined;
}

function parseLimit(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

const WEEK_RE = /^\d{4}-W\d{2}$/;
function parseWeek(v: string | null): string | undefined {
  if (!v) return undefined;
  return WEEK_RE.test(v) ? v : undefined;
}

export const { GET, OPTIONS } = createB2bRoute(async (req) => {
  const url = new URL(req.url);
  const weekISO = parseWeek(url.searchParams.get('weekISO'));
  const category = parseCategory(url.searchParams.get('category'));
  const limit = parseLimit(url.searchParams.get('limit'));
  return fetchPainPoints({
    ...(weekISO ? { weekISO } : {}),
    ...(category ? { category } : {}),
    ...(limit !== undefined ? { limit } : {}),
  });
});
