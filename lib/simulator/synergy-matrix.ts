/**
 * 진령 시너지 매트릭스 시드 — Sprint V2 F3.1.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §1.2
 *
 * 11 진령 × 11 × 11 / 3! = 165 조합 중 핵심 ~20 시드.
 * 매칭 안 되는 조합은 default B tier (score 50) 반환 — 운영자 점진 보강 가능.
 *
 * 시너지 평가 기준 (게임 메타 + 도메인 운영자 입력):
 *  - 직업 호환성 (warrior/swordsman/medium)
 *  - 스킬 시너지 (탱커-딜러-힐러 분담)
 *  - 자동 사냥 효율 (CPM cycle 적합도)
 */

import type {
  JinryeongSynergyDef,
  SynergyTier,
  ClassId,
} from '@/types/simulator';
import { buildComboId } from '@/types/simulator';
import type { WikiJinryeongId } from '@/types/wiki';

const J = {
  hongGildong: 'hong_gildong',
  seohaeyongwang: 'seohaeyongwang',
  eumyeonggwi: 'eumyeonggwi',
  myeongwang: 'myeongwang',
  chiwoo: 'chiwoo',
  hangah: 'hangah',
  gyeoktugwi: 'gyeoktugwi',
  gumiyoho: 'gumiyoho',
  taeyangyeosin: 'taeyangyeosin',
  gunggwi: 'gunggwi',
  sansin: 'sansin',
} as const satisfies Record<string, WikiJinryeongId>;

const SEED: readonly JinryeongSynergyDef[] = [
  {
    comboId: buildComboId([J.chiwoo, J.hangah, J.hongGildong]),
    jinryeongIds: [J.chiwoo, J.hangah, J.hongGildong],
    synergyScore: 95,
    tier: 'S',
    recommendedClass: 'warrior',
    description: '전사 메타 — 치우 광역 딜 + 항아 보호막 + 홍길동 군중 제어',
    note: '결투장 PvP 빌드 1티어',
  },
  {
    comboId: buildComboId([J.gyeoktugwi, J.taeyangyeosin, J.myeongwang]),
    jinryeongIds: [J.gyeoktugwi, J.taeyangyeosin, J.myeongwang],
    synergyScore: 92,
    tier: 'S',
    recommendedClass: 'swordsman',
    description: '검객 자동 사냥 — 격투귀 단일 폭딜 + 태양여신 광역 + 명왕 처형',
    note: '40+ 던전 효율 최상',
  },
  {
    comboId: buildComboId([J.gumiyoho, J.eumyeonggwi, J.sansin]),
    jinryeongIds: [J.gumiyoho, J.eumyeonggwi, J.sansin],
    synergyScore: 90,
    tier: 'S',
    recommendedClass: 'medium',
    description: '영매 디버프 — 구미호 매혹 + 음명귀 약화 + 산신 회복',
    note: '보스 레이드 보조 1티어',
  },
  {
    comboId: buildComboId([J.chiwoo, J.gyeoktugwi, J.gunggwi]),
    jinryeongIds: [J.chiwoo, J.gyeoktugwi, J.gunggwi],
    synergyScore: 88,
    tier: 'A',
    recommendedClass: 'warrior',
    description: '근딜 트리플 — 치우 + 격투귀 + 궁귀 (원거리 견제)',
  },
  {
    comboId: buildComboId([J.seohaeyongwang, J.taeyangyeosin, J.hangah]),
    jinryeongIds: [J.seohaeyongwang, J.taeyangyeosin, J.hangah],
    synergyScore: 86,
    tier: 'A',
    recommendedClass: 'medium',
    description: '광역 폭딜 + 보호막 (서해용왕 + 태양여신 + 항아)',
  },
  {
    comboId: buildComboId([J.myeongwang, J.eumyeonggwi, J.sansin]),
    jinryeongIds: [J.myeongwang, J.eumyeonggwi, J.sansin],
    synergyScore: 85,
    tier: 'A',
    recommendedClass: 'medium',
    description: '암흑 클러스터 — 명왕 + 음명귀 + 산신 (저주 시너지)',
  },
  {
    comboId: buildComboId([J.hongGildong, J.gunggwi, J.taeyangyeosin]),
    jinryeongIds: [J.hongGildong, J.gunggwi, J.taeyangyeosin],
    synergyScore: 80,
    tier: 'A',
    recommendedClass: 'swordsman',
    description: '원거리 견제 — 홍길동 분신 + 궁귀 + 태양여신 광역',
  },
  {
    comboId: buildComboId([J.hangah, J.sansin, J.gumiyoho]),
    jinryeongIds: [J.hangah, J.sansin, J.gumiyoho],
    synergyScore: 78,
    tier: 'A',
    recommendedClass: 'medium',
    description: '서포터 트리플 — 항아 + 산신 + 구미호 (보호막 + 회복 + 매혹)',
  },
  {
    comboId: buildComboId([J.chiwoo, J.hongGildong, J.gunggwi]),
    jinryeongIds: [J.chiwoo, J.hongGildong, J.gunggwi],
    synergyScore: 72,
    tier: 'B',
    description: '근원 혼합 — 치우 광역 + 홍길동 분신 + 궁귀 원거리',
  },
  {
    comboId: buildComboId([J.gyeoktugwi, J.eumyeonggwi, J.taeyangyeosin]),
    jinryeongIds: [J.gyeoktugwi, J.eumyeonggwi, J.taeyangyeosin],
    synergyScore: 70,
    tier: 'B',
    description: '단일/광역 균형 — 격투귀 + 음명귀 + 태양여신',
  },
];

const SEED_MAP: ReadonlyMap<string, JinryeongSynergyDef> = new Map(
  SEED.map((d) => [d.comboId, d]),
);

/**
 * 시너지 조회 — 시드에 없으면 default B tier (score 50) 반환.
 *
 * 미시드 조합의 default는 진령 직업 매칭 점수에 따라 score 조정 가능 (V3 carry).
 */
export function getSynergy(
  ids: readonly WikiJinryeongId[],
): JinryeongSynergyDef | null {
  if (ids.length !== 3) return null;
  const comboId = buildComboId(ids);
  const seeded = SEED_MAP.get(comboId);
  if (seeded) return seeded;
  return {
    comboId,
    jinryeongIds: [...ids].sort() as [WikiJinryeongId, WikiJinryeongId, WikiJinryeongId],
    synergyScore: 50,
    tier: 'B' as SynergyTier,
    description: '평균 시너지 — 게임 메타 평가 대기 (운영자 시드 보강 예정)',
  };
}

export function listAllSynergies(): readonly JinryeongSynergyDef[] {
  return SEED;
}

/** 클래스 추천 — 시너지 결과의 recommendedClass 또는 진령 클래스 태그 통계 */
export function suggestClass(
  synergy: JinryeongSynergyDef,
): ClassId | undefined {
  return synergy.recommendedClass;
}
