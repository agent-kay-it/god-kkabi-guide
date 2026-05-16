/**
 * B2B v1 — GET /api/v1/builds — Sprint V3 P3.B.
 * 필터: classId / category / limit
 */
import 'server-only';

import { createB2bRoute } from '@/lib/b2b/handler';
import { fetchBuilds } from '@/lib/b2b/data-sources';
import type { ClassId } from '@/types/simulator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_CLASS_IDS: readonly ClassId[] = ['warrior', 'swordsman', 'medium'];
const VALID_CATEGORIES = ['build', 'guide', 'review'] as const;
type ValidCategory = (typeof VALID_CATEGORIES)[number];

function parseClassId(v: string | null): ClassId | undefined {
  if (!v) return undefined;
  return (VALID_CLASS_IDS as readonly string[]).includes(v) ? (v as ClassId) : undefined;
}

function parseCategory(v: string | null): ValidCategory | undefined {
  if (!v) return undefined;
  return (VALID_CATEGORIES as readonly string[]).includes(v) ? (v as ValidCategory) : undefined;
}

function parseLimit(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export const { GET, OPTIONS } = createB2bRoute(async (req) => {
  const url = new URL(req.url);
  const classId = parseClassId(url.searchParams.get('classId'));
  const category = parseCategory(url.searchParams.get('category'));
  const limit = parseLimit(url.searchParams.get('limit'));
  return fetchBuilds({
    ...(classId ? { classId } : {}),
    ...(category ? { category } : {}),
    ...(limit !== undefined ? { limit } : {}),
  });
});
