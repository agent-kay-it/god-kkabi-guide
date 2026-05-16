/**
 * 장비 위키 어댑터 — Firestore + seed fallback.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.9
 */
import 'server-only';

import { hasAdminCredentials, getAdminFirestore } from '@/lib/firebase/admin';
import { WIKI_EQUIPMENT_SEED } from '@/data/wiki/equipment';
import type { WikiEquipmentDoc } from '@/types/wiki';

type WikiEquipmentData = Omit<WikiEquipmentDoc, 'updatedAt'>;

export async function listWikiEquipment(): Promise<readonly WikiEquipmentData[]> {
  if (!hasAdminCredentials()) return WIKI_EQUIPMENT_SEED;
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('wiki_equipment').get();
    if (snap.empty) return WIKI_EQUIPMENT_SEED;
    return snap.docs.map((d) => d.data() as WikiEquipmentData);
  } catch {
    return WIKI_EQUIPMENT_SEED;
  }
}
