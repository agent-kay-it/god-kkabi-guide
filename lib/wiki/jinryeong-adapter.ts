/**
 * 진령 위키 어댑터 — Firestore wiki_jinryeong → WikiJinryeongDoc.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.8
 */
import 'server-only';

import { hasAdminCredentials, getAdminFirestore } from '@/lib/firebase/admin';
import { WIKI_JINRYEONG_SEED } from '@/data/wiki/jinryeong';
import type { WikiJinryeongDoc, WikiJinryeongId } from '@/types/wiki';

type WikiJinryeongData = Omit<WikiJinryeongDoc, 'updatedAt'>;

export async function listWikiJinryeong(): Promise<readonly WikiJinryeongData[]> {
  if (!hasAdminCredentials()) {
    return WIKI_JINRYEONG_SEED;
  }
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('wiki_jinryeong')
      .orderBy('tier', 'asc')
      .get();
    if (snap.empty) {
      return WIKI_JINRYEONG_SEED;
    }
    return snap.docs.map((doc) => doc.data() as WikiJinryeongData);
  } catch {
    return WIKI_JINRYEONG_SEED;
  }
}

export async function getWikiJinryeongById(
  id: WikiJinryeongId,
): Promise<WikiJinryeongData | null> {
  if (!hasAdminCredentials()) {
    return WIKI_JINRYEONG_SEED.find((j) => j.id === id) ?? null;
  }
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('wiki_jinryeong').doc(id).get();
    if (!doc.exists) {
      return WIKI_JINRYEONG_SEED.find((j) => j.id === id) ?? null;
    }
    return doc.data() as WikiJinryeongData;
  } catch {
    return WIKI_JINRYEONG_SEED.find((j) => j.id === id) ?? null;
  }
}
