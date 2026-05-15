/**
 * F3.3 결투장 빌드 트렌드 — Firestore aggregation.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §3
 *
 * Source: posts.tags includes 'pvp:*' 또는 category='build' + 'mode:pvp' 태그.
 * 결과: pvp_stats/{weekISO_comboId} weekly rank 시리즈.
 */
import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { toWeekISO, type PvpTrendRow } from '@/types/insights';
import { buildComboId } from '@/types/simulator';
import type { WikiJinryeongId } from '@/types/wiki';
import type { ClassId } from '@/types/simulator';

interface BuildPostDoc {
  readonly tags?: readonly string[];
  readonly authorClassId?: ClassId;
  readonly createdAt?: { toMillis(): number };
}

export async function aggregatePvpWeek(): Promise<{ ok: boolean; weekISO: string; rowCount: number }> {
  if (!hasAdminCredentials()) return { ok: false, weekISO: '', rowCount: 0 };

  const previousWeek = new Date(Date.now() - 7 * 86400000);
  const w = toWeekISO(previousWeek);

  const db = getAdminFirestore();
  const counts = new Map<string, PvpTrendRow & { _count: number }>();
  try {
    const postsSnap = await db
      .collection('posts')
      .where('status', '==', 'published')
      .where('category', '==', 'build')
      .where('createdAt', '>=', new Date(w.startMs))
      .where('createdAt', '<=', new Date(w.endMs))
      .get();
    for (const doc of postsSnap.docs) {
      const data = doc.data() as BuildPostDoc;
      const tags = data.tags ?? [];
      const isPvp = tags.some((t) => t === 'mode:pvp' || t.startsWith('pvp:'));
      if (!isPvp) continue;
      const jinryeongIds = tags
        .filter((t) => t.startsWith('jinryeong:'))
        .map((t) => t.slice('jinryeong:'.length) as WikiJinryeongId);
      if (jinryeongIds.length < 3) continue;
      const ids = jinryeongIds.slice(0, 3);
      const comboId = buildComboId(ids);
      const cls = data.authorClassId;
      const key = `${comboId}__${cls ?? '_'}`;
      const prev = counts.get(key);
      if (prev) {
        prev._count += 1;
      } else {
        counts.set(key, {
          weekISO: w.value,
          comboId,
          jinryeongIds: ids,
          ...(cls ? { className: cls } : {}),
          count: 1,
          rank: 0,
          _count: 1,
        });
      }
    }
  } catch (err) {
    console.error('[lib/insights/pvp-trend] aggregatePvpWeek:', err);
    return { ok: false, weekISO: w.value, rowCount: 0 };
  }

  const groups = new Map<string, (PvpTrendRow & { _count: number })[]>();
  for (const v of counts.values()) {
    const k = v.className ?? '_';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(v);
  }

  const batch = db.batch();
  let rowCount = 0;
  for (const [, rows] of groups) {
    rows.sort((a, b) => b._count - a._count);
    rows.forEach((row, idx) => {
      const rank = idx + 1;
      const docId = `${w.value}_${row.comboId}_${row.className ?? '_'}`;
      const ref = db.collection('pvp_stats').doc(docId);
      const { _count, ...rest } = row;
      batch.set(ref, {
        ...rest,
        count: _count,
        rank,
        aggregatedAt: FieldValue.serverTimestamp(),
      });
      rowCount++;
    });
  }
  try {
    await batch.commit();
  } catch (err) {
    console.error('[lib/insights/pvp-trend] batch commit:', err);
    return { ok: false, weekISO: w.value, rowCount: 0 };
  }
  return { ok: true, weekISO: w.value, rowCount };
}

export async function listPvpTrend(
  className?: ClassId,
  weeks = 4,
): Promise<readonly PvpTrendRow[]> {
  if (!hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    let q: FirebaseFirestore.Query = db
      .collection('pvp_stats')
      .orderBy('weekISO', 'desc')
      .orderBy('rank', 'asc')
      .limit(weeks * 30);
    if (className) q = q.where('className', '==', className);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as PvpTrendRow);
  } catch (err) {
    console.error('[lib/insights/pvp-trend] listPvpTrend:', err);
    return [];
  }
}
