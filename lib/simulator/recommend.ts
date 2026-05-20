/**
 * 진령 추천 알고리즘 — Sprint 20 F20-H (마스터 V2 F3.5 1차).
 * 출처: docs/sprint/20-sprint-coverage-master-v2/design.md §8
 *
 * 목적: 사용자의 보유 진령 + 직업을 기반으로 top-3 시너지 빌드 추천.
 * 부족한 진령은 missing 필드로 명시.
 *
 * Pure function — Firestore 의존 없음. 단위 테스트 100% 가능.
 */

import {
  getSynergy,
  listAllSynergies,
} from './synergy-matrix';
import type {
  ClassId,
  JinryeongSynergyDef,
} from '@/types/simulator';
import type { WikiJinryeongId } from '@/types/wiki';

export interface RecommendationInput {
  /** 사용자가 보유한 진령 ID 목록 (중복 허용 — 내부에서 set 변환) */
  readonly ownedJinryeong: readonly WikiJinryeongId[];
  /** 선택한 직업 (optional — 일치 시 우선 정렬) */
  readonly classId?: ClassId;
}

export interface RankedSynergy {
  readonly synergy: JinryeongSynergyDef;
  /** 1, 2, 3 */
  readonly rank: number;
  /** 시너지의 jinryeongIds 중 사용자가 보유하지 않은 것 */
  readonly missingFromOwned: readonly WikiJinryeongId[];
  /** classId 가 시너지의 recommendedClass 와 일치하는지 */
  readonly matchesClass: boolean;
}

export interface RecommendationResult {
  readonly synergies: readonly RankedSynergy[];
  /** 보유 진령 3개+ 여부 */
  readonly hasEnoughJinryeong: boolean;
  /** 보유 진령 count (중복 제거) */
  readonly ownedCount: number;
}

const MAX_RECOMMENDATIONS = 3;

/**
 * top-3 시너지 추천.
 *
 * 알고리즘:
 * 1. 보유 진령 set 정규화 (중복 제거)
 * 2. 보유 진령 ≥ 3 이면:
 *    - 모든 C(n,3) 조합 생성 (보유 진령에서)
 *    - 각 조합 getSynergy() 호출
 *    - score desc + classId match 우선 정렬
 *    - top 3 반환 (missing = 빈 배열)
 * 3. 보유 진령 < 3 이면:
 *    - 전체 시너지 (51+ seed) 에서 score desc 정렬
 *    - classId filter (optional, soft)
 *    - top 3 반환 (missing = 사용자 미보유 진령)
 */
export function recommendBuilds(
  input: RecommendationInput,
): RecommendationResult {
  // 1. 정규화
  const owned = new Set<WikiJinryeongId>(input.ownedJinryeong);
  const ownedCount = owned.size;
  const hasEnoughJinryeong = ownedCount >= 3;

  // 2. 보유 진령 3개 미만 → 전체 시너지 추천
  if (!hasEnoughJinryeong) {
    return {
      ownedCount,
      hasEnoughJinryeong: false,
      synergies: pickGlobalTopSynergies(owned, input.classId).map(
        (synergy, idx) => ({
          synergy,
          rank: idx + 1,
          missingFromOwned: synergy.jinryeongIds.filter((id) => !owned.has(id)),
          matchesClass: synergy.recommendedClass === input.classId,
        }),
      ),
    };
  }

  // 3. 보유 진령 3+ → 보유 진령 조합 추천
  const ownedList = [...owned];
  const combinations: WikiJinryeongId[][] = [];
  for (let i = 0; i < ownedList.length - 2; i++) {
    for (let j = i + 1; j < ownedList.length - 1; j++) {
      for (let k = j + 1; k < ownedList.length; k++) {
        combinations.push([ownedList[i]!, ownedList[j]!, ownedList[k]!]);
      }
    }
  }

  const ranked = combinations
    .map((combo) => getSynergy(combo))
    .filter((s): s is JinryeongSynergyDef => s !== null)
    .sort((a, b) => sortByScoreAndClass(a, b, input.classId))
    .slice(0, MAX_RECOMMENDATIONS);

  return {
    ownedCount,
    hasEnoughJinryeong: true,
    synergies: ranked.map((synergy, idx) => ({
      synergy,
      rank: idx + 1,
      missingFromOwned: [], // 보유 진령으로만 조합한 경우 missing 없음
      matchesClass: synergy.recommendedClass === input.classId,
    })),
  };
}

/**
 * 전체 시너지에서 top-N 선택 (보유 진령 < 3 시).
 */
function pickGlobalTopSynergies(
  owned: ReadonlySet<WikiJinryeongId>,
  classId?: ClassId,
): readonly JinryeongSynergyDef[] {
  const all = listAllSynergies();
  return [...all]
    .sort((a, b) => sortByScoreAndClass(a, b, classId))
    .slice(0, MAX_RECOMMENDATIONS);
}

/**
 * Score desc + classId 일치 우선 정렬.
 * 동률 score 시 classId match 가 우선.
 */
function sortByScoreAndClass(
  a: JinryeongSynergyDef,
  b: JinryeongSynergyDef,
  classId?: ClassId,
): number {
  if (classId) {
    const aMatch = a.recommendedClass === classId ? 1 : 0;
    const bMatch = b.recommendedClass === classId ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch; // match 우선
  }
  return b.synergyScore - a.synergyScore; // score desc
}

/**
 * 단일 시너지 추천 — 사용자가 진령 3개 정확히 가졌을 때.
 * (helper — recommendBuilds 의 특수 케이스)
 */
export function recommendSingleBuild(
  ownedJinryeong: readonly WikiJinryeongId[],
): JinryeongSynergyDef | null {
  if (ownedJinryeong.length !== 3) return null;
  return getSynergy(ownedJinryeong);
}
