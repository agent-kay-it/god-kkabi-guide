/**
 * 콘텐츠 위키 어댑터 — Firestore + seed fallback.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.11
 */
import 'server-only';

import { hasAdminCredentials, getAdminFirestore } from '@/lib/firebase/admin';
import { WIKI_CONTENTS_SEED } from '@/data/wiki/contents';
import type { WikiContentDoc } from '@/types/wiki';

type WikiContentData = Omit<WikiContentDoc, 'updatedAt'>;

export async function listWikiContents(): Promise<readonly WikiContentData[]> {
  if (!hasAdminCredentials()) return WIKI_CONTENTS_SEED;
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('wiki_contents').get();
    if (snap.empty) return WIKI_CONTENTS_SEED;
    return snap.docs.map((d) => d.data() as WikiContentData);
  } catch {
    return WIKI_CONTENTS_SEED;
  }
}
