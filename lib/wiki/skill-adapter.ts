/**
 * 스킬 위키 어댑터 — Firestore + seed fallback.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.10
 */
import 'server-only';

import { hasAdminCredentials, getAdminFirestore } from '@/lib/firebase/admin';
import { WIKI_SKILLS_SEED } from '@/data/wiki/skills';
import type { WikiSkillDoc, WikiClassId } from '@/types/wiki';

type WikiSkillData = Omit<WikiSkillDoc, 'updatedAt'>;

export async function listWikiSkills(): Promise<readonly WikiSkillData[]> {
  if (!hasAdminCredentials()) return WIKI_SKILLS_SEED;
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('wiki_skills').orderBy('classId').orderBy('kind').get();
    if (snap.empty) return WIKI_SKILLS_SEED;
    return snap.docs.map((d) => d.data() as WikiSkillData);
  } catch {
    return WIKI_SKILLS_SEED;
  }
}

export async function listWikiSkillsByClass(
  classId: WikiClassId,
): Promise<readonly WikiSkillData[]> {
  const all = await listWikiSkills();
  return all.filter((s) => s.classId === classId);
}
