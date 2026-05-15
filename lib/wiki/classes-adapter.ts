/**
 * 직업 위키 어댑터 — Firestore 데이터 → WikiClassDoc.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.7
 *
 * 동작:
 *  - Firestore에 wiki_classes 컬렉션이 존재하면 그 데이터를 사용
 *  - 미존재 시 data/wiki/classes.ts 시드로 fallback (P3.B 단계)
 *  - P3.D에서 admin 콘솔로 데이터 갱신 가능
 *
 * Server Component에서만 import (Firestore Admin 사용).
 */
import 'server-only';

import { hasAdminCredentials, getAdminFirestore } from '@/lib/firebase/admin';
import { WIKI_CLASSES_SEED } from '@/data/wiki/classes';
import type { WikiClassDoc, WikiClassId } from '@/types/wiki';

type WikiClassData = Omit<WikiClassDoc, 'updatedAt'>;

/** 직업 3종 목록 조회 — Firestore 또는 시드 fallback */
export async function listWikiClasses(): Promise<readonly WikiClassData[]> {
  if (!hasAdminCredentials()) {
    return WIKI_CLASSES_SEED;
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection('wiki_classes').get();
    if (snap.empty) {
      return WIKI_CLASSES_SEED;
    }
    return snap.docs.map((doc) => doc.data() as WikiClassData);
  } catch {
    // Firestore 일시 에러 시 시드 fallback (UX 보호)
    return WIKI_CLASSES_SEED;
  }
}

/** 단일 직업 조회 */
export async function getWikiClassById(id: WikiClassId): Promise<WikiClassData | null> {
  if (!hasAdminCredentials()) {
    return WIKI_CLASSES_SEED.find((c) => c.id === id) ?? null;
  }

  try {
    const db = getAdminFirestore();
    const doc = await db.collection('wiki_classes').doc(id).get();
    if (!doc.exists) {
      return WIKI_CLASSES_SEED.find((c) => c.id === id) ?? null;
    }
    return doc.data() as WikiClassData;
  } catch {
    return WIKI_CLASSES_SEED.find((c) => c.id === id) ?? null;
  }
}
