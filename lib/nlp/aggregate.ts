/**
 * F3.5 Pain Topic 주간 집계 — Sprint V2 P3.D + P5 (CA2-I5+I6).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §5.2
 *
 * 흐름:
 *  1) 1주 윈도우 posts + collection-group comments 순회
 *  2) extractPainKeywords (matchAll 기반)로 키워드 매칭 + excerpt 저장 → pain_mentions
 *  3) 키워드별 카운트 집계 → pain_topics (rank + delta)
 *
 * P5 개선:
 *  - I5: mention/topic 쓰기를 BATCH_LIMIT(500) 단위 chunked batch.commit으로 묶음
 *        → 직렬 await 호출 제거로 cron 실행 시간 단축 + RPS 압력 완화.
 *  - I6: keyword-dict matchAll 사용 (firstIndex 정확도 향상 — extractPainKeywords 내부).
 */
import 'server-only';

import { FieldValue, type WriteBatch } from 'firebase-admin/firestore';

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { toWeekISO } from '@/types/insights';
import { PAIN_KEYWORDS, extractPainKeywords, excerptAround, getKeywordById } from './keyword-dict';
import type { PainTopicDoc } from '@/types/nlp';

const MAX_MENTIONS_PER_TOPIC = 50;
const MAX_MENTION_IDS_PER_TOPIC = 20;
/** Firestore Admin SDK batch 한계 = 500. 안전 여유 확보 */
const BATCH_LIMIT = 450;

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

interface PendingMention {
  readonly id: string;
  readonly data: Record<string, unknown>;
}

interface BatchedWriter {
  add: (refPath: string, data: Record<string, unknown>) => Promise<void>;
  flush: () => Promise<void>;
}

/**
 * Chunked batch writer — BATCH_LIMIT 단위로 자동 commit + 누적 op count 추적.
 * 호출 순서는 add()의 호출 순서로 결정 (Firestore는 batch 내부 순서 보존하지 않으므로 단일 doc 순서만 의미).
 */
function makeBatchedWriter(db: FirebaseFirestore.Firestore): BatchedWriter {
  let batch: WriteBatch = db.batch();
  let count = 0;
  let chain: Promise<void> = Promise.resolve();
  return {
    add: (refPath, data) => {
      const ref = db.doc(refPath);
      batch.set(ref, data);
      count++;
      if (count >= BATCH_LIMIT) {
        const toCommit = batch;
        batch = db.batch();
        count = 0;
        chain = chain.then(() => toCommit.commit().then(() => undefined));
      }
      return chain;
    },
    flush: () => {
      if (count > 0) {
        const toCommit = batch;
        batch = db.batch();
        count = 0;
        chain = chain.then(() => toCommit.commit().then(() => undefined));
      }
      return chain;
    },
  };
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
  const pendingMentions: PendingMention[] = [];

  // ── 1. posts 스캔 ───────────────────────────────────────────────
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
          pendingMentions.push({
            id: mentionRef.id,
            data: {
              id: mentionRef.id,
              sourceType: 'post',
              sourceId: doc.id,
              keywordId: m.keywordId,
              excerpt,
              timestampMs: ts,
            },
          });
        }
        mentionsByKeyword.set(m.keywordId, arr);
      }
    }
  } catch (err) {
    console.error('[lib/nlp/aggregate] posts scan:', err);
  }

  // ── 2. comments 스캔 (collection-group) ─────────────────────────
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
          pendingMentions.push({
            id: mentionRef.id,
            data: {
              id: mentionRef.id,
              sourceType: 'comment',
              sourceId: doc.id,
              ...(parentPostId ? { postId: parentPostId } : {}),
              keywordId: m.keywordId,
              excerpt,
              timestampMs: ts,
            },
          });
        }
        mentionsByKeyword.set(m.keywordId, arr);
      }
    }
  } catch (err) {
    console.error('[lib/nlp/aggregate] comments scan:', err);
  }

  // ── 3. Rank + Delta ─────────────────────────────────────────────
  const sorted = Array.from(counts.entries())
    .map(([keywordId, count]) => ({ keywordId, count }))
    .sort((a, b) => b.count - a.count);

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

  // ── 4. Chunked batch writes ────────────────────────────────────
  // CA2-I5: mention + topic을 단일 writer로 묶어 BATCH_LIMIT 단위 자동 commit.
  const writer = makeBatchedWriter(db);
  let mentionCount = 0;
  let topicCount = 0;
  try {
    // 4-1. mention writes
    for (const m of pendingMentions) {
      await writer.add(`pain_mentions/${m.id}`, m.data);
      mentionCount++;
    }
    // 4-2. topic writes
    for (let idx = 0; idx < sorted.length; idx++) {
      const row = sorted[idx];
      if (!row) continue;
      const kw = getKeywordById(row.keywordId);
      if (!kw) continue;
      const rank = idx + 1;
      const docId = `${w.value}_${row.keywordId}`;
      const prevRank = prevRankMap.get(row.keywordId);
      const data: Record<string, unknown> = {
        id: docId,
        weekISO: w.value,
        keywordId: row.keywordId,
        term: kw.term,
        category: kw.category,
        severity: kw.severity,
        count: row.count,
        rank,
        mentionIds: (mentionsByKeyword.get(row.keywordId) ?? []).slice(0, MAX_MENTION_IDS_PER_TOPIC),
        aggregatedAt: FieldValue.serverTimestamp(),
      };
      if (prevRank !== undefined) {
        data['prevRank'] = prevRank;
        data['delta'] = prevRank - rank;
      }
      await writer.add(`pain_topics/${docId}`, data);
      topicCount++;
    }
    await writer.flush();
  } catch (err) {
    console.error('[lib/nlp/aggregate] batched writes:', err);
    return { ok: false, weekISO: w.value, topicCount, mentionCount };
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
