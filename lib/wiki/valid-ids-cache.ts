/**
 * Wiki seed valid IDs 캐시 — Sprint V2 P3.A (CA-M1).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §0 (carry-over CA-M1)
 *
 * 책임:
 *  - 6 wiki 카테고리 (class / jinryeong / content / skill / equipment / munpa) 의 valid IDs Set을 5분 캐시
 *  - lib/post/schema.ts validateTagMembership에서 사용 → 태그 prefix:value 의 value가 실제 wiki seed ID인지 검증
 *
 * 캐시 정책:
 *  - server-side memory (Node 인스턴스 별)
 *  - TTL 5분 → 시드 갱신 시 자동 반영
 *  - Admin SDK 미설정 시 빈 Sets 반환 (fail-open: 형식 검증만 적용)
 *
 * munpa는 별도 어댑터가 없어 시드 데이터 직접 참조 (lib/wiki/munpa-seed.ts 또는 Firestore 'munpa-guide' 컬렉션).
 */
import 'server-only';

import type { WikiIdSets } from '@/lib/post/schema';
import { listWikiClasses } from './classes-adapter';
import { listWikiJinryeong } from './jinryeong-adapter';
import { listWikiContents } from './content-adapter';
import { listWikiSkills } from './skill-adapter';
import { listWikiEquipment } from './equipment-adapter';
import { hasAdminCredentials, getAdminFirestore } from '@/lib/firebase/admin';

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { data: WikiIdSets; expiresAt: number } | null = null;

const EMPTY_SETS: WikiIdSets = {
  class: new Set(),
  jinryeong: new Set(),
  content: new Set(),
  skill: new Set(),
  equipment: new Set(),
  munpa: new Set(),
};

/**
 * Munpa IDs — 'munpa-guide' Firestore 컬렉션에서 조회.
 * 어댑터가 없어 직접 fetch.
 */
async function loadMunpaIds(): Promise<ReadonlySet<string>> {
  if (!hasAdminCredentials()) return new Set();
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('munpa-guide').select('id').get();
    return new Set(snap.docs.map((d) => d.id));
  } catch {
    return new Set();
  }
}

export async function loadValidWikiIdSets(): Promise<WikiIdSets> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;

  if (!hasAdminCredentials()) {
    // fail-open — 형식 검증만 적용
    return EMPTY_SETS;
  }

  try {
    const [classes, jinryeong, contents, skills, equipment, munpa] = await Promise.all([
      listWikiClasses(),
      listWikiJinryeong(),
      listWikiContents(),
      listWikiSkills(),
      listWikiEquipment(),
      loadMunpaIds(),
    ]);

    const data: WikiIdSets = {
      class: new Set(classes.map((c) => c.id)),
      jinryeong: new Set(jinryeong.map((j) => j.id)),
      content: new Set(contents.map((c) => c.id)),
      skill: new Set(skills.map((s) => s.id)),
      equipment: new Set(equipment.map((e) => e.id)),
      munpa,
    };
    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch (err) {
    console.error('[wiki/valid-ids-cache] loadValidWikiIdSets:', err);
    return EMPTY_SETS;
  }
}

/** Test/admin용 — 캐시 무효화 */
export function invalidateValidWikiIdsCache(): void {
  cache = null;
}
