/**
 * 진령 시너지 매트릭스 시드 — Sprint V2 F3.1.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §1.2
 *
 * 11 진령 × 11 × 11 / 3! = 165 조합. 본 시드는 30+ 핵심 조합 정의 (18.2% 커버리지).
 * 매칭 안 되는 조합은 default B tier (score 50) 반환 — 운영자 점진 보강 가능.
 *
 * 시너지 평가 기준 (게임 메타 + 도메인 운영자 입력):
 *  - 직업 호환성 (warrior/swordsman/medium)
 *  - 스킬 시너지 (탱커-딜러-힐러 분담)
 *  - 자동 사냥 효율 (CPM cycle 적합도)
 *
 * Sprint 18 F18-D 보강: 10 → 32 조합 확장.
 *  - warrior 8 / swordsman 8 / medium 8 / balanced 8
 *  - 운영자 실 게임 메타 입력 검증 시 score 미세 조정 가능
 *
 * Sprint 19 F19-E 보강: 32 → 51 조합 확장.
 *  - warrior +2 (탱딜 보강), swordsman +3 (PvP 추가),
 *    medium +4 (저주/회복 분기), balanced +4 (혼합 빌드),
 *    미할당 +6 (직업 추천 의도적 제거, 운영자 메타 검증 대기)
 *  - 기존 32 조합 score 변경 X (회귀 보호)
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

  // ─── Sprint 18 F18-D — Warrior 추가 (5 신규) ───
  {
    comboId: buildComboId([J.seohaeyongwang, J.chiwoo, J.hongGildong]),
    jinryeongIds: [J.seohaeyongwang, J.chiwoo, J.hongGildong],
    synergyScore: 93,
    tier: 'S',
    recommendedClass: 'warrior',
    description: '전사 정석 — 서해용왕 만능 + 치우 광역 + 홍길동 분신',
    note: 'PvE 자동사냥/PvP 결투장 모두 안정',
  },
  {
    comboId: buildComboId([J.chiwoo, J.hangah, J.gyeoktugwi]),
    jinryeongIds: [J.chiwoo, J.hangah, J.gyeoktugwi],
    synergyScore: 87,
    tier: 'A',
    recommendedClass: 'warrior',
    description: '전사 탱딜 — 치우 광역 + 항아 보호막 + 격투귀 단일',
    note: '결투장 1대1 전향 빌드',
  },
  {
    comboId: buildComboId([J.seohaeyongwang, J.hongGildong, J.gyeoktugwi]),
    jinryeongIds: [J.seohaeyongwang, J.hongGildong, J.gyeoktugwi],
    synergyScore: 84,
    tier: 'A',
    recommendedClass: 'warrior',
    description: '전사 폭딜 — 서해용왕 회심 + 홍길동 지속 + 격투귀 단일',
  },
  {
    comboId: buildComboId([J.chiwoo, J.taeyangyeosin, J.gyeoktugwi]),
    jinryeongIds: [J.chiwoo, J.taeyangyeosin, J.gyeoktugwi],
    synergyScore: 81,
    tier: 'A',
    recommendedClass: 'warrior',
    description: '전사 광역 — 치우 + 태양여신 + 격투귀 (PvE 던전)',
  },
  {
    comboId: buildComboId([J.hongGildong, J.chiwoo, J.myeongwang]),
    jinryeongIds: [J.hongGildong, J.chiwoo, J.myeongwang],
    synergyScore: 76,
    tier: 'A',
    recommendedClass: 'warrior',
    description: '전사 보스킬러 — 홍길동 + 치우 + 명왕 처형',
  },

  // ─── Sprint 18 F18-D — Swordsman 추가 (5 신규) ───
  {
    comboId: buildComboId([J.seohaeyongwang, J.eumyeonggwi, J.myeongwang]),
    jinryeongIds: [J.seohaeyongwang, J.eumyeonggwi, J.myeongwang],
    synergyScore: 94,
    tier: 'S',
    recommendedClass: 'swordsman',
    description: '검객 정석 — 서해용왕 회심 + 음명귀 치명 + 명왕 처형',
    note: '40+ 보스전 1티어',
  },
  {
    comboId: buildComboId([J.eumyeonggwi, J.hongGildong, J.myeongwang]),
    jinryeongIds: [J.eumyeonggwi, J.hongGildong, J.myeongwang],
    synergyScore: 89,
    tier: 'A',
    recommendedClass: 'swordsman',
    description: '검객 단일 폭딜 — 음명귀 + 홍길동 지속 + 명왕 처형',
  },
  {
    comboId: buildComboId([J.gyeoktugwi, J.eumyeonggwi, J.gunggwi]),
    jinryeongIds: [J.gyeoktugwi, J.eumyeonggwi, J.gunggwi],
    synergyScore: 83,
    tier: 'A',
    recommendedClass: 'swordsman',
    description: '검객 원거리 — 격투귀 + 음명귀 + 궁귀 (PvP)',
  },
  {
    comboId: buildComboId([J.seohaeyongwang, J.taeyangyeosin, J.eumyeonggwi]),
    jinryeongIds: [J.seohaeyongwang, J.taeyangyeosin, J.eumyeonggwi],
    synergyScore: 79,
    tier: 'A',
    recommendedClass: 'swordsman',
    description: '검객 광역 — 서해용왕 + 태양여신 + 음명귀',
  },
  {
    comboId: buildComboId([J.eumyeonggwi, J.gunggwi, J.myeongwang]),
    jinryeongIds: [J.eumyeonggwi, J.gunggwi, J.myeongwang],
    synergyScore: 74,
    tier: 'B',
    recommendedClass: 'swordsman',
    description: '검객 단일 정밀 — 음명귀 + 궁귀 + 명왕',
  },

  // ─── Sprint 18 F18-D — Medium 추가 (5 신규) ───
  {
    comboId: buildComboId([J.seohaeyongwang, J.gumiyoho, J.sansin]),
    jinryeongIds: [J.seohaeyongwang, J.gumiyoho, J.sansin],
    synergyScore: 91,
    tier: 'S',
    recommendedClass: 'medium',
    description: '영매 정석 — 서해용왕 + 구미요호 매혹 + 산신 회복',
    note: '레이드 보조 1티어',
  },
  {
    comboId: buildComboId([J.hangah, J.sansin, J.myeongwang]),
    jinryeongIds: [J.hangah, J.sansin, J.myeongwang],
    synergyScore: 84,
    tier: 'A',
    recommendedClass: 'medium',
    description: '영매 디버프 — 항아 보호 + 산신 회복 + 명왕 저주',
  },
  {
    comboId: buildComboId([J.gumiyoho, J.myeongwang, J.sansin]),
    jinryeongIds: [J.gumiyoho, J.myeongwang, J.sansin],
    synergyScore: 82,
    tier: 'A',
    recommendedClass: 'medium',
    description: '영매 매혹 — 구미요호 + 명왕 + 산신',
  },
  {
    comboId: buildComboId([J.hangah, J.eumyeonggwi, J.gumiyoho]),
    jinryeongIds: [J.hangah, J.eumyeonggwi, J.gumiyoho],
    synergyScore: 77,
    tier: 'A',
    recommendedClass: 'medium',
    description: '영매 보조 — 항아 + 음명귀 + 구미요호',
  },
  {
    comboId: buildComboId([J.sansin, J.hangah, J.taeyangyeosin]),
    jinryeongIds: [J.sansin, J.hangah, J.taeyangyeosin],
    synergyScore: 73,
    tier: 'B',
    recommendedClass: 'medium',
    description: '영매 광역 회복 — 산신 + 항아 + 태양여신',
  },

  // ─── Sprint 18 F18-D — Balanced/Universal 추가 (7 신규) ───
  {
    comboId: buildComboId([J.seohaeyongwang, J.hongGildong, J.eumyeonggwi]),
    jinryeongIds: [J.seohaeyongwang, J.hongGildong, J.eumyeonggwi],
    synergyScore: 88,
    tier: 'A',
    description: '범용 폭딜 — 서해용왕 + 홍길동 + 음명귀 (직업 무관)',
    note: '신규 사용자 안정 추천',
  },
  {
    comboId: buildComboId([J.seohaeyongwang, J.chiwoo, J.gyeoktugwi]),
    jinryeongIds: [J.seohaeyongwang, J.chiwoo, J.gyeoktugwi],
    synergyScore: 80,
    tier: 'A',
    description: '근딜 클러스터 — 서해용왕 + 치우 + 격투귀',
  },
  {
    comboId: buildComboId([J.seohaeyongwang, J.myeongwang, J.sansin]),
    jinryeongIds: [J.seohaeyongwang, J.myeongwang, J.sansin],
    synergyScore: 78,
    tier: 'A',
    description: '균형 보스 빌드 — 서해용왕 + 명왕 + 산신',
  },
  {
    comboId: buildComboId([J.hongGildong, J.eumyeonggwi, J.sansin]),
    jinryeongIds: [J.hongGildong, J.eumyeonggwi, J.sansin],
    synergyScore: 71,
    tier: 'B',
    description: '균형 — 홍길동 + 음명귀 + 산신',
  },
  {
    comboId: buildComboId([J.chiwoo, J.myeongwang, J.taeyangyeosin]),
    jinryeongIds: [J.chiwoo, J.myeongwang, J.taeyangyeosin],
    synergyScore: 68,
    tier: 'B',
    description: '광역 폭딜 — 치우 + 명왕 + 태양여신',
  },
  {
    comboId: buildComboId([J.gunggwi, J.taeyangyeosin, J.sansin]),
    jinryeongIds: [J.gunggwi, J.taeyangyeosin, J.sansin],
    synergyScore: 65,
    tier: 'B',
    description: '원거리 + 광역 — 궁귀 + 태양여신 + 산신',
  },
  {
    comboId: buildComboId([J.hangah, J.gumiyoho, J.gunggwi]),
    jinryeongIds: [J.hangah, J.gumiyoho, J.gunggwi],
    synergyScore: 60,
    tier: 'B',
    description: '보조 + 원거리 — 항아 + 구미요호 + 궁귀',
  },

  // ─── Sprint 19 F19-E — Warrior 추가 (2 신규) ───
  {
    comboId: buildComboId([J.chiwoo, J.gyeoktugwi, J.sansin]),
    jinryeongIds: [J.chiwoo, J.gyeoktugwi, J.sansin],
    synergyScore: 89,
    tier: 'A',
    recommendedClass: 'warrior',
    description: '전사 지속 — 치우 광역 + 격투귀 단일 + 산신 회복',
    note: '40+ 던전 장기전 1티어',
  },
  {
    comboId: buildComboId([J.hongGildong, J.hangah, J.sansin]),
    jinryeongIds: [J.hongGildong, J.hangah, J.sansin],
    synergyScore: 75,
    tier: 'A',
    recommendedClass: 'warrior',
    description: '전사 생존 — 홍길동 분신 + 항아 보호 + 산신 회복 (장기전)',
  },

  // ─── Sprint 19 F19-E — Swordsman 추가 (3 신규) ───
  {
    comboId: buildComboId([J.eumyeonggwi, J.taeyangyeosin, J.gunggwi]),
    jinryeongIds: [J.eumyeonggwi, J.taeyangyeosin, J.gunggwi],
    synergyScore: 86,
    tier: 'A',
    recommendedClass: 'swordsman',
    description: '검객 광역 폭딜 — 음명귀 치명 + 태양여신 광역 + 궁귀 원거리',
    note: '결투장 후방 견제 1티어',
  },
  {
    comboId: buildComboId([J.myeongwang, J.gyeoktugwi, J.hangah]),
    jinryeongIds: [J.myeongwang, J.gyeoktugwi, J.hangah],
    synergyScore: 78,
    tier: 'A',
    recommendedClass: 'swordsman',
    description: '검객 처형 — 명왕 + 격투귀 단일 + 항아 보호막',
  },
  {
    comboId: buildComboId([J.seohaeyongwang, J.gunggwi, J.myeongwang]),
    jinryeongIds: [J.seohaeyongwang, J.gunggwi, J.myeongwang],
    synergyScore: 72,
    tier: 'B',
    recommendedClass: 'swordsman',
    description: '검객 원거리 정밀 — 서해용왕 + 궁귀 + 명왕',
  },

  // ─── Sprint 19 F19-E — Medium 추가 (4 신규) ───
  {
    comboId: buildComboId([J.gumiyoho, J.hangah, J.taeyangyeosin]),
    jinryeongIds: [J.gumiyoho, J.hangah, J.taeyangyeosin],
    synergyScore: 87,
    tier: 'A',
    recommendedClass: 'medium',
    description: '영매 매혹 광역 — 구미요호 + 항아 보호 + 태양여신',
    note: '레이드 안정형 1티어',
  },
  {
    comboId: buildComboId([J.eumyeonggwi, J.sansin, J.hangah]),
    jinryeongIds: [J.eumyeonggwi, J.sansin, J.hangah],
    synergyScore: 80,
    tier: 'A',
    recommendedClass: 'medium',
    description: '영매 저주 — 음명귀 약화 + 산신 회복 + 항아 보호',
  },
  {
    comboId: buildComboId([J.gumiyoho, J.eumyeonggwi, J.myeongwang]),
    jinryeongIds: [J.gumiyoho, J.eumyeonggwi, J.myeongwang],
    synergyScore: 76,
    tier: 'A',
    recommendedClass: 'medium',
    description: '영매 처형 — 구미요호 매혹 + 음명귀 + 명왕',
  },
  {
    comboId: buildComboId([J.sansin, J.gumiyoho, J.gunggwi]),
    jinryeongIds: [J.sansin, J.gumiyoho, J.gunggwi],
    synergyScore: 67,
    tier: 'B',
    recommendedClass: 'medium',
    description: '영매 원거리 — 산신 + 구미요호 + 궁귀',
  },

  // ─── Sprint 19 F19-E — Balanced/Universal 추가 (4 신규) ───
  {
    comboId: buildComboId([J.chiwoo, J.eumyeonggwi, J.hangah]),
    jinryeongIds: [J.chiwoo, J.eumyeonggwi, J.hangah],
    synergyScore: 83,
    tier: 'A',
    description: '균형 빌드 — 치우 광역 + 음명귀 단일 + 항아 보호 (직업 무관)',
    note: '범용 사냥/PvP 안정',
  },
  {
    comboId: buildComboId([J.gyeoktugwi, J.gumiyoho, J.sansin]),
    jinryeongIds: [J.gyeoktugwi, J.gumiyoho, J.sansin],
    synergyScore: 74,
    tier: 'B',
    description: '균형 단일 — 격투귀 + 구미요호 매혹 + 산신 회복',
  },
  {
    comboId: buildComboId([J.hongGildong, J.taeyangyeosin, J.sansin]),
    jinryeongIds: [J.hongGildong, J.taeyangyeosin, J.sansin],
    synergyScore: 69,
    tier: 'B',
    description: '균형 광역 보조 — 홍길동 + 태양여신 + 산신',
  },
  {
    comboId: buildComboId([J.gyeoktugwi, J.myeongwang, J.gumiyoho]),
    jinryeongIds: [J.gyeoktugwi, J.myeongwang, J.gumiyoho],
    synergyScore: 63,
    tier: 'B',
    description: '균형 처형 — 격투귀 + 명왕 + 구미요호',
  },

  // ─── Sprint 19 F19-E — 미할당 (6 신규, 직업 추천 의도적 보류) ───
  // 신규 사용자가 직업 미결정 단계에서 참고용. 운영자 메타 검증 후 직업 추가 예정.
  {
    comboId: buildComboId([J.chiwoo, J.seohaeyongwang, J.sansin]),
    jinryeongIds: [J.chiwoo, J.seohaeyongwang, J.sansin],
    synergyScore: 64,
    tier: 'B',
    description: '미정 — 치우 + 서해용왕 + 산신 (직업 메타 검증 대기)',
    note: '운영자 메타 평가 대기 — V20 carry',
  },
  {
    comboId: buildComboId([J.gumiyoho, J.taeyangyeosin, J.eumyeonggwi]),
    jinryeongIds: [J.gumiyoho, J.taeyangyeosin, J.eumyeonggwi],
    synergyScore: 62,
    tier: 'B',
    description: '미정 — 구미요호 + 태양여신 + 음명귀',
    note: '광역/매혹 시너지 검증 대기',
  },
  {
    comboId: buildComboId([J.hangah, J.chiwoo, J.gunggwi]),
    jinryeongIds: [J.hangah, J.chiwoo, J.gunggwi],
    synergyScore: 60,
    tier: 'B',
    description: '미정 — 항아 + 치우 + 궁귀',
  },
  {
    comboId: buildComboId([J.gyeoktugwi, J.sansin, J.hongGildong]),
    jinryeongIds: [J.gyeoktugwi, J.sansin, J.hongGildong],
    synergyScore: 58,
    tier: 'B',
    description: '미정 — 격투귀 + 산신 + 홍길동',
  },
  {
    comboId: buildComboId([J.gunggwi, J.gumiyoho, J.myeongwang]),
    jinryeongIds: [J.gunggwi, J.gumiyoho, J.myeongwang],
    synergyScore: 55,
    tier: 'B',
    description: '미정 — 궁귀 + 구미요호 + 명왕',
  },
  {
    comboId: buildComboId([J.hangah, J.myeongwang, J.taeyangyeosin]),
    jinryeongIds: [J.hangah, J.myeongwang, J.taeyangyeosin],
    synergyScore: 52,
    tier: 'B',
    description: '미정 — 항아 + 명왕 + 태양여신',
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
