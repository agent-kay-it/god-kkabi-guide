/**
 * 직업 3종 시드 데이터 — source/godkkabi-guide/index.html §직업별 전략 정밀 추출 (lines 1351-1512).
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.7 (wiki_classes)
 *
 * 본 시드는 Firestore에 wiki_classes/{id} 문서로 적재되기 전 fallback.
 * P3.B 단계에서는 정적 import으로 사용, P3.D operator gates 이후 Firestore 활성화.
 */
import type { WikiClassDoc } from '@/types/wiki';

export const WIKI_CLASSES_SEED: readonly Omit<WikiClassDoc, 'updatedAt'>[] = [
  {
    id: 'warrior',
    name: '전사',
    subName: '도깨비',
    emoji: '⚔️',
    tagline: '[ MELEE · SUSTAIN ]',
    summary:
      '빠른 연속 타격과 지속 피해에 강한 근거리 공격형. 손쉬운 조작과 직관적인 타격감으로 전투 몰입감을 중시하는 유저에게 적합하다. 탱·딜 겸직이 가능해 사망 위험이 가장 낮다.',
    imageUrl: '/images/wiki/banner-demon-king.webp',
    recommendedFor: ['초보·무과금', '심플한 조작 선호', '자동 사냥 위주', '사망 위험 최소화'],
    strengths: [
      '빠른 공격 속도, 자동 사냥 정리 효율 최상',
      '탱·딜 겸직 가능 — 사망 위험 최소',
      '조작 부담 적고 직관적',
    ],
    weaknesses: ['광역 공격력 부족 → 다수 적 콘텐츠 불리', '화려한 연출보다는 정직한 타격'],
    recommendedJinryeong: ['홍길동', '서해용왕', '치우'],
    jinryeongNote:
      '본체 생존력이 강하므로 딜 보조형 진령 2 + 회복형 1 조합이 무난. 항아로 치우를 교체하면 장기전에 대비.',
    rankingNote: '심플한 플레이를 선호하면 추천. 상위 랭커 풀에서는 검객 채용률이 더 높음.',
    tier: 1,
  },
  {
    id: 'swordsman',
    name: '검객',
    subName: '무당',
    emoji: '🗡️',
    tagline: '[ HYBRID · META ]',
    summary:
      '검술 기반의 하이브리드형. 공격·방어 밸런스가 우수하고 치명타 수치가 높다. 검기·공중 칼 소환 연출이 화려해 시각적 만족도와 실전 효율을 모두 갖춘 검증된 메타 직업.',
    imageUrl: '/images/wiki/banner-coop-battle.webp',
    recommendedFor: ['중수·메타 추구', 'PvE 전반 최적화', '치명타 빌드 선호', '화려한 연출'],
    strengths: [
      '치명타 기반 높은 순간 폭딜',
      '딜·생존 모두 확보 가능',
      '거의 모든 PvE 콘텐츠에서 우수',
      '화려한 스킬 연출',
    ],
    weaknesses: ['치명타·치피 스탯 의존도 높음', '초반 장비 빈약 시 활약 지연'],
    recommendedJinryeong: ['홍길동', '서해용왕', '음영귀'],
    jinryeongNote:
      '치명타 의존도가 높아 서해용왕 + 음영귀 시너지가 핵심. 보스전은 음영귀를 명왕(코어 강화)으로 교체.',
    rankingNote: '상위 랭커 풀에서 채용률 최고. PvE 메타 직업으로 검증.',
    tier: 0,
  },
  {
    id: 'medium',
    name: '영매',
    subName: '저승사자',
    emoji: '🔮',
    tagline: '[ RANGED · AOE ]',
    summary:
      '원거리에서 불·천둥 원소를 다루는 광역 특화 직업. 다수 적 동시 제압이 강점이지만 방어력이 낮아 회복형 진령이 거의 필수. 화려한 마법 연출을 선호하는 유저에 적합.',
    imageUrl: '/images/wiki/banner-fantasy-explore.webp',
    recommendedFor: [
      '스테이지 빠른 밀기',
      '광역 사냥 선호',
      '시각적 화려함 선호',
      '원거리 안전 플레이',
    ],
    strengths: [
      '다수 적 동시 처리 → 초반 진도 최고',
      '원거리 안전 거리 확보',
      '후반 조합 따라 강력한 화력',
      '시각적으로 가장 화려한 직업',
    ],
    weaknesses: [
      '방어력 낮음, 보스전 사망 위험',
      '회복형 진령 거의 필수',
      '단일 보스 DPS 상대적으로 낮음',
    ],
    recommendedJinryeong: ['서해용왕', '구미요호', '항아'],
    jinryeongNote:
      '생존이 가장 취약 → 항아의 지속 회복이 핵심. 보스전엔 항아 대신 명왕으로 폭딜 마무리.',
    rankingNote: '광역 콘텐츠에서 우월. 단일 보스 콘텐츠에선 검객/전사 대비 효율 낮음.',
    tier: 1,
  },
];

/** ID로 빠른 조회 */
export function getWikiClass(id: WikiClassDoc['id']): Omit<WikiClassDoc, 'updatedAt'> | null {
  return WIKI_CLASSES_SEED.find((c) => c.id === id) ?? null;
}
