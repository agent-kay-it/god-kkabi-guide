/**
 * B2B v1 — GET /api/v1/adoption-rate — Sprint V3 P3.B.
 * 필터: weekISO (YYYY-Wnn) / classId / limit
 */
import 'server-only';

import { createB2bRoute } from '@/lib/b2b/handler';
import { fetchAdoptionRate } from '@/lib/b2b/data-sources';
import type { ClassId } from '@/types/simulator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_CLASS_IDS: readonly ClassId[] = ['warrior', 'swordsman', 'medium'];

function parseClassId(v: string | null): ClassId | undefined {
  if (!v) return undefined;
  return (VALID_CLASS_IDS as readonly string[]).includes(v) ? (v as ClassId) : undefined;
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
  const classId = parseClassId(url.searchParams.get('classId'));
  const limit = parseLimit(url.searchParams.get('limit'));
  return fetchAdoptionRate({
    ...(weekISO ? { weekISO } : {}),
    ...(classId ? { classId } : {}),
    ...(limit !== undefined ? { limit } : {}),
  });
});
