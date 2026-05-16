/**
 * F3.2 진령 채용률 — Firestore aggregation + 조회 helper.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §2
 *
 * 소스:
 *  - `simulator_runs` collection (F3.1 통계)
 *  - `posts.tags` `jinryeong:<id>` (사용자 빌드 게시물)
 *
 * 결과:
 *  - `jinryeong_stats/{weekISO_jinryeongId_className?}` 주간 docs
 *  - rank + delta(prevRank) 계산
 *
 * cron 주기: 매주 월요일 00:00 KST (Vercel cron)
 */
import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { toWeekISO, type JinryeongRateRow } from '@/types/insights';
import type { WikiJinryeongId } from '@/types/wiki';
import type { ClassId } from '@/types/simulator';

interface PostStubDoc {
  readonly tags?: readonly string[];
  readonly authorClassId?: ClassId;
  readonly createdAt?: { toMillis(): number };
}

interface RunStubDoc {
  readonly jinryeongIds?: readonly WikiJinryeongId[];
  readonly classId?: ClassId;
  readonly timestamp?: { toMillis(): number };
}

interface AggregatedCount {
  jinryeongId: WikiJinryeongId;
  className?: ClassId;
  count: number;
}

/**
 * 1주 윈도우 내 진령 채용 카운트 집계.
 * cron route handler에서 호출하여 Firestore `jinryeong_stats` 컬렉션에 저장.
 */
export async function aggregateJinryeongWeek(
  weekISOValue?: string,
): Promise<{ ok: boolean; weekISO: string; rowCount: number }> {
  if (!hasAdminCredentials()) {
    return { ok: false, weekISO: weekISOValue ?? '', rowCount: 0 };
  }

  const now = new Date();
  const previousWeek = new Date(now.getTime() - 7 * 86400000);
  const targetWeek = weekISOValue
    ? { value: weekISOValue, year: 0, week: 0, startMs: 0, endMs: 0 }
    : toWeekISO(previousWeek);

  const window = targetWeek.startMs > 0
    ? { startMs: targetWeek.startMs, endMs: targetWeek.endMs }
    : (() => {
        const w = toWeekISO(previousWeek);
        return { startMs: w.startMs, endMs: w.endMs };
      })();

  const db = getAdminFirestore();

  // 1) posts.tags from window
  const postCounts = new Map<string, AggregatedCount>();
  try {
    const postsSnap = await db
      .collection('posts')
      .where('status', '==', 'published')
      .where('createdAt', '>=', new Date(window.startMs))
      .where('createdAt', '<=', new Date(window.endMs))
      .get();
    for (const doc of postsSnap.docs) {
      const data = doc.data() as PostStubDoc;
      const tags = data.tags ?? [];
      for (const tag of tags) {
        if (!tag.startsWith('jinryeong:')) continue;
        const id = tag.slice('jinryeong:'.length) as WikiJinryeongId;
        const cls = data.authorClassId;
        const key = `${id}__${cls ?? '_'}`;
        const prev = postCounts.get(key);
        if (prev) prev.count += 1;
        else
          postCounts.set(key, {
            jinryeongId: id,
            ...(cls ? { className: cls } : {}),
            count: 1,
          });
      }
    }
  } catch (err) {
    console.error('[lib/insights/jinryeong-rate] posts aggregation:', err);
  }

  // 2) simulator_runs from window
  const runCounts = new Map<string, AggregatedCount>();
  try {
    const runsSnap = await db
      .collection('simulator_runs')
      .where('timestamp', '>=', new Date(window.startMs))
      .where('timestamp', '<=', new Date(window.endMs))
      .get();
    for (const doc of runsSnap.docs) {
      const data = doc.data() as RunStubDoc;
      const ids = data.jinryeongIds ?? [];
      const cls = data.classId;
      for (const id of ids) {
        const key = `${id}__${cls ?? '_'}`;
        const prev = runCounts.get(key);
        if (prev) prev.count += 1;
        else
          runCounts.set(key, {
            jinryeongId: id,
            ...(cls ? { className: cls } : {}),
            count: 1,
          });
      }
    }
  } catch (err) {
    console.error('[lib/insights/jinryeong-rate] runs aggregation:', err);
  }

  // 3) Merge posts + simulator (combined)
  const combined = new Map<string, AggregatedCount>();
  for (const [k, v] of postCounts) {
    combined.set(k, { ...v });
  }
  for (const [k, v] of runCounts) {
    const prev = combined.get(k);
    if (prev) prev.count += v.count;
    else combined.set(k, { ...v });
  }

  // 4) Rank within (className) groups
  const byClass = new Map<string, AggregatedCount[]>();
  for (const v of combined.values()) {
    const key = v.className ?? '_';
    if (!byClass.has(key)) byClass.set(key, []);
    byClass.get(key)!.push(v);
  }

  // 5) Read prev week ranks for delta
  const prevWeek = toWeekISO(new Date(window.startMs - 7 * 86400000)).value;
  const prevRankMap = new Map<string, number>();
  try {
    const prevSnap = await db
      .collection('jinryeong_stats')
      .where('weekISO', '==', prevWeek)
      .get();
    for (const doc of prevSnap.docs) {
      const d = doc.data() as Omit<JinryeongRateRow, 'rank'> & { rank: number };
      const key = `${d.jinryeongId}__${d.className ?? '_'}`;
      prevRankMap.set(key, d.rank);
    }
  } catch (err) {
    console.error('[lib/insights/jinryeong-rate] prev rank fetch:', err);
  }

  // 6) Write current week rows
  const weekISO = (window.startMs > 0 ? toWeekISO(new Date(window.startMs)) : toWeekISO(previousWeek)).value;
  const batch = db.batch();
  let rowCount = 0;
  for (const [cls, rows] of byClass) {
    rows.sort((a, b) => b.count - a.count);
    rows.forEach((row, idx) => {
      const rank = idx + 1;
      const key = `${row.jinryeongId}__${cls}`;
      const prevRank = prevRankMap.get(key);
      const docId = `${weekISO}_${row.jinryeongId}_${cls}`;
      const docRef = db.collection('jinryeong_stats').doc(docId);
      batch.set(docRef, {
        weekISO,
        jinryeongId: row.jinryeongId,
        ...(row.className ? { className: row.className } : {}),
        count: row.count,
        rank,
        ...(prevRank !== undefined ? { prevRank, delta: prevRank - rank } : {}),
        source: 'combined',
        aggregatedAt: FieldValue.serverTimestamp(),
      });
      rowCount++;
    });
  }
  try {
    await batch.commit();
  } catch (err) {
    console.error('[lib/insights/jinryeong-rate] batch commit:', err);
    return { ok: false, weekISO, rowCount: 0 };
  }
  return { ok: true, weekISO, rowCount };
}

/** UI 조회: 최근 N주 채용률 row. */
export async function listJinryeongRate(
  className?: ClassId,
  weeks = 4,
): Promise<readonly JinryeongRateRow[]> {
  if (!hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    let q: FirebaseFirestore.Query = db
      .collection('jinryeong_stats')
      .orderBy('weekISO', 'desc')
      .orderBy('rank', 'asc')
      .limit(weeks * 30); // 11 진령 * (weeks * 3 클래스 + all) 여유
    if (className) q = q.where('className', '==', className);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as JinryeongRateRow);
  } catch (err) {
    console.error('[lib/insights/jinryeong-rate] listJinryeongRate:', err);
    return [];
  }
}
