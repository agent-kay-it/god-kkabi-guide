/**
 * F3.5 Pain Topic 주간 집계 — Sprint V2 P3.D.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §5.2
 *
 * 흐름:
 *  1) 1주 윈도우 posts + collection-group comments 순회
 *  2) extractPainKeywords로 키워드 매칭 + excerpt 저장 → pain_mentions
 *  3) 키워드별 카운트 집계 → pain_topics (rank + delta)
 */
import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { toWeekISO } from '@/types/insights';
import { PAIN_KEYWORDS, extractPainKeywords, excerptAround, getKeywordById } from './keyword-dict';
import type { PainTopicDoc } from '@/types/nlp';

const MAX_MENTIONS_PER_TOPIC = 50;

interface PostStub {
  readonly id?: string;
  readonly body?: string;
  readonly createdAt?: { toMillis(): number };
}

interface CommentStub {
  readonly id?: string;
  readonly postId?: string;
  readonly body?: string;
  readonly createdAt?: { toMillis(): number };
}

export async function aggregatePainTopicsWeek(): Promise<{
  ok: boolean;
  weekISO: string;
  topicCount: number;
  mentionCount: number;
}> {
  if (!hasAdminCredentials()) return { ok: false, weekISO: '', topicCount: 0, mentionCount: 0 };

  const previousWeek = new Date(Date.now() - 7 * 86400000);
  const w = toWeekISO(previousWeek);
  const db = getAdminFirestore();

  const counts = new Map<string, number>();
  const mentionsByKeyword = new Map<string, string[]>();
  let mentionCount = 0;

  // posts
  try {
    const snap = await db
      .collection('posts')
      .where('status', '==', 'published')
      .where('createdAt', '>=', new Date(w.startMs))
      .where('createdAt', '<=', new Date(w.endMs))
      .get();
    for (const doc of snap.docs) {
      const data = doc.data() as PostStub;
      const body = data.body ?? '';
      const matches = extractPainKeywords(body);
      if (matches.length === 0) continue;
      const ts = data.createdAt?.toMillis() ?? Date.now();
      for (const m of matches) {
        counts.set(m.keywordId, (counts.get(m.keywordId) ?? 0) + m.count);
        const arr = mentionsByKeyword.get(m.keywordId) ?? [];
        if (arr.length < MAX_MENTIONS_PER_TOPIC) {
          const excerpt = excerptAround(body, m.firstIndex);
          const mentionRef = db.collection('pain_mentions').doc();
          arr.push(mentionRef.id);
          await mentionRef.set({
            id: mentionRef.id,
            sourceType: 'post',
            sourceId: doc.id,
            keywordId: m.keywordId,
            excerpt,
            timestampMs: ts,
          });
          mentionCount++;
        }
        mentionsByKeyword.set(m.keywordId, arr);
      }
    }
  } catch (err) {
    console.error('[lib/nlp/aggregate] posts scan:', err);
  }

  // comments (collection group)
  try {
    const snap = await db
      .collectionGroup('comments')
      .where('createdAt', '>=', new Date(w.startMs))
      .where('createdAt', '<=', new Date(w.endMs))
      .get();
    for (const doc of snap.docs) {
      const data = doc.data() as CommentStub;
      const body = data.body ?? '';
      const matches = extractPainKeywords(body);
      if (matches.length === 0) continue;
      const ts = data.createdAt?.toMillis() ?? Date.now();
      const parentPostRef = doc.ref.parent.parent;
      const parentPostId = parentPostRef?.id ?? data.postId;
      for (const m of matches) {
        counts.set(m.keywordId, (counts.get(m.keywordId) ?? 0) + m.count);
        const arr = mentionsByKeyword.get(m.keywordId) ?? [];
        if (arr.length < MAX_MENTIONS_PER_TOPIC) {
          const excerpt = excerptAround(body, m.firstIndex);
          const mentionRef = db.collection('pain_mentions').doc();
          arr.push(mentionRef.id);
          await mentionRef.set({
            id: mentionRef.id,
            sourceType: 'comment',
            sourceId: doc.id,
            ...(parentPostId ? { postId: parentPostId } : {}),
            keywordId: m.keywordId,
            excerpt,
            timestampMs: ts,
          });
          mentionCount++;
        }
        mentionsByKeyword.set(m.keywordId, arr);
      }
    }
  } catch (err) {
    console.error('[lib/nlp/aggregate] comments scan:', err);
  }

  // Rank
  const sorted = Array.from(counts.entries())
    .map(([keywordId, count]) => ({ keywordId, count }))
    .sort((a, b) => b.count - a.count);

  // Prev week ranks for delta
  const prevWeek = toWeekISO(new Date(w.startMs - 7 * 86400000)).value;
  const prevRankMap = new Map<string, number>();
  try {
    const prevSnap = await db.collection('pain_topics').where('weekISO', '==', prevWeek).get();
    for (const doc of prevSnap.docs) {
      const d = doc.data() as PainTopicDoc;
      prevRankMap.set(d.keywordId, d.rank);
    }
  } catch (err) {
    console.error('[lib/nlp/aggregate] prev rank fetch:', err);
  }

  // Write topics
  const batch = db.batch();
  let topicCount = 0;
  sorted.forEach((row, idx) => {
    const rank = idx + 1;
    const kw = getKeywordById(row.keywordId);
    if (!kw) return;
    const docId = `${w.value}_${row.keywordId}`;
    const docRef = db.collection('pain_topics').doc(docId);
    const prevRank = prevRankMap.get(row.keywordId);
    batch.set(docRef, {
      id: docId,
      weekISO: w.value,
      keywordId: row.keywordId,
      term: kw.term,
      category: kw.category,
      severity: kw.severity,
      count: row.count,
      rank,
      ...(prevRank !== undefined ? { prevRank, delta: prevRank - rank } : {}),
      mentionIds: (mentionsByKeyword.get(row.keywordId) ?? []).slice(0, 20),
      aggregatedAt: FieldValue.serverTimestamp(),
    });
    topicCount++;
  });
  try {
    await batch.commit();
  } catch (err) {
    console.error('[lib/nlp/aggregate] batch commit:', err);
    return { ok: false, weekISO: w.value, topicCount: 0, mentionCount };
  }
  return { ok: true, weekISO: w.value, topicCount, mentionCount };
}

export async function listPainTopics(
  weekISO?: string,
  category?: string,
): Promise<readonly PainTopicDoc[]> {
  if (!hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    let q: FirebaseFirestore.Query = db.collection('pain_topics').orderBy('weekISO', 'desc').orderBy('rank', 'asc').limit(50);
    if (weekISO) q = q.where('weekISO', '==', weekISO);
    if (category) q = q.where('category', '==', category);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as PainTopicDoc);
  } catch (err) {
    console.error('[lib/nlp/aggregate] listPainTopics:', err);
    return [];
  }
}

// Re-export PAIN_KEYWORDS count for admin sanity
export const TOTAL_PAIN_KEYWORDS = PAIN_KEYWORDS.length;
