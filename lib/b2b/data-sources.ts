/**
 * B2B API data source adapters — Sprint V3 P3.B.
 *
 * 각 endpoint별 Firestore 쿼리 + 응답 가공.
 * V1/V2에서 만든 Firestore 구조를 직접 활용 (api_clients/api_usage는 별도).
 */
import 'server-only';

import { getAdminFirestore } from '@/lib/firebase/admin';
import type { PainCategory } from '@/types/nlp';
import type { ClassId } from '@/types/simulator';

export interface BuildSummary {
  readonly id: string;
  readonly slug: string;
  readonly classId: string;
  readonly tags: readonly string[];
  readonly likes: number;
  readonly createdAtMs: number;
  readonly category: string;
}

export interface AdoptionRateEntry {
  readonly weekISO: string;
  readonly classId: string;
  readonly jinryeongId: string;
  readonly rate: number;
  readonly rank: number;
  readonly totalRuns: number;
}

export interface PainPointEntry {
  readonly weekISO: string;
  readonly term: string;
  readonly category: PainCategory;
  readonly count: number;
  readonly rank: number;
  readonly delta?: number;
}

export interface CouponTrendEntry {
  readonly code: string;
  readonly status: string;
  readonly verifiedCount: number;
  readonly invalidCount: number;
  readonly submittedAtMs: number;
}

export interface SimulatorResultEntry {
  readonly comboId: string;
  readonly count: number;
  readonly avgSynergy: number;
}

const MAX_LIMIT = 100;

function clampLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit)) return 50;
  return Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);
}

export async function fetchBuilds(params: {
  classId?: ClassId;
  weekISO?: string;
  category?: string;
  limit?: number;
}): Promise<readonly BuildSummary[]> {
  const db = getAdminFirestore();
  let q: FirebaseFirestore.Query = db
    .collection('posts')
    .where('status', '==', 'published')
    .orderBy('createdAt', 'desc')
    .limit(clampLimit(params.limit));
  if (params.classId) q = q.where('classId', '==', params.classId);
  if (params.category) q = q.where('category', '==', params.category);
  const snap = await q.get();
  return snap.docs.map((doc) => {
    const data = doc.data() as {
      slug?: string;
      classId?: string;
      tags?: readonly string[];
      likes?: number;
      createdAt?: { toMillis(): number };
      category?: string;
    };
    return {
      id: doc.id,
      slug: data.slug ?? doc.id,
      classId: data.classId ?? '',
      tags: data.tags ?? [],
      likes: data.likes ?? 0,
      createdAtMs: data.createdAt?.toMillis() ?? 0,
      category: data.category ?? '',
    };
  });
}

export async function fetchAdoptionRate(params: {
  weekISO?: string;
  classId?: ClassId;
  limit?: number;
}): Promise<readonly AdoptionRateEntry[]> {
  const db = getAdminFirestore();
  let q: FirebaseFirestore.Query = db
    .collection('jinryeong_stats')
    .orderBy('weekISO', 'desc')
    .orderBy('rank', 'asc')
    .limit(clampLimit(params.limit));
  if (params.weekISO) q = q.where('weekISO', '==', params.weekISO);
  if (params.classId) q = q.where('classId', '==', params.classId);
  const snap = await q.get();
  return snap.docs.map((doc) => {
    const data = doc.data() as {
      weekISO?: string;
      classId?: string;
      jinryeongId?: string;
      rate?: number;
      rank?: number;
      totalRuns?: number;
    };
    return {
      weekISO: data.weekISO ?? '',
      classId: data.classId ?? '',
      jinryeongId: data.jinryeongId ?? '',
      rate: data.rate ?? 0,
      rank: data.rank ?? 0,
      totalRuns: data.totalRuns ?? 0,
    };
  });
}

export async function fetchPainPoints(params: {
  weekISO?: string;
  category?: PainCategory;
  limit?: number;
}): Promise<readonly PainPointEntry[]> {
  const db = getAdminFirestore();
  let q: FirebaseFirestore.Query = db
    .collection('pain_topics')
    .orderBy('weekISO', 'desc')
    .orderBy('rank', 'asc')
    .limit(clampLimit(params.limit));
  if (params.weekISO) q = q.where('weekISO', '==', params.weekISO);
  if (params.category) q = q.where('category', '==', params.category);
  const snap = await q.get();
  return snap.docs.map((doc) => {
    const data = doc.data() as {
      weekISO?: string;
      term?: string;
      category?: PainCategory;
      count?: number;
      rank?: number;
      delta?: number;
    };
    const entry: PainPointEntry = {
      weekISO: data.weekISO ?? '',
      term: data.term ?? '',
      category: (data.category ?? 'bug') as PainCategory,
      count: data.count ?? 0,
      rank: data.rank ?? 0,
      ...(data.delta !== undefined ? { delta: data.delta } : {}),
    };
    return entry;
  });
}

export async function fetchCouponsTrend(params: {
  limit?: number;
}): Promise<readonly CouponTrendEntry[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('coupons')
    .orderBy('submittedAt', 'desc')
    .limit(clampLimit(params.limit))
    .get();
  return snap.docs.map((doc) => {
    const data = doc.data() as {
      code?: string;
      status?: string;
      verifiedCount?: number;
      invalidCount?: number;
      submittedAt?: { toMillis(): number };
    };
    return {
      code: data.code ?? doc.id,
      status: data.status ?? 'pending',
      verifiedCount: data.verifiedCount ?? 0,
      invalidCount: data.invalidCount ?? 0,
      submittedAtMs: data.submittedAt?.toMillis() ?? 0,
    };
  });
}

export async function fetchSimulatorResults(params: {
  limit?: number;
}): Promise<readonly SimulatorResultEntry[]> {
  const db = getAdminFirestore();
  // simulator_runs aggregation은 매트릭스가 자동 안 함 — comboId별 count를 inline 집계.
  const snap = await db
    .collection('simulator_runs')
    .orderBy('timestamp', 'desc')
    .limit(500)
    .get();
  const acc = new Map<string, { count: number; synergySum: number }>();
  for (const doc of snap.docs) {
    const d = doc.data() as { comboId?: string; synergyScore?: number };
    const key = d.comboId ?? '';
    if (!key) continue;
    const cur = acc.get(key) ?? { count: 0, synergySum: 0 };
    cur.count += 1;
    cur.synergySum += d.synergyScore ?? 0;
    acc.set(key, cur);
  }
  const out = Array.from(acc.entries())
    .map(([comboId, { count, synergySum }]) => ({
      comboId,
      count,
      avgSynergy: count > 0 ? Math.round((synergySum / count) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, clampLimit(params.limit));
  return out;
}
