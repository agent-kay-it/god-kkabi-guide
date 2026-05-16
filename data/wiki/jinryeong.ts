/**
 * 진령 11종 시드 데이터 — source/godkkabi-guide/index.html §진령 (lines 1540-1660) 정밀 추출.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.8 (wiki_jinryeong)
 *
 * 메타 (2026년 5월) 기준:
 *  - 0티어: 홍길동, 서해용왕
 *  - 1티어: 음영귀, 명왕, 치우, 항아
 *  - 2티어: 격투귀, 구미요호, 태양여신, 궁귀, 산신
 *
 * 진영 (3분류):
 *  - 신(神): 음영귀, 우사(미시드), 나무신(미시드), 명왕(인이지만 신적 위계로 일부 분류)
 *  - 요(妖): 서해용왕, 사냥깨비(미시드), 영지깨비(미시드), 두루미깨비(미시드), 구미요호
 *  - 인(人): 홍길동, 항아, 저승차사(미시드), 치우
 *
 * featured = 메타 핵심 (서해용왕은 모든 직업 공통 핵심 — source line 1633)
 */
import type { WikiJinryeongDoc } from '@/types/wiki';

export const WIKI_JINRYEONG_SEED: readonly Omit<WikiJinryeongDoc, 'updatedAt'>[] = [
  // ─── 0티어 ───
  {
    id: 'hong_gildong',
    name: '홍길동',
    tier: 0,
    rarity: 'rare_ssr',
    faction: 'in',
    role: 'dealer',
    effectShort: '1초마다 공격력 30% 지속 피해',
    effectLong:
      '모든 콘텐츠에서 안정적인 DPS를 제공하는 핵심 딜러. 1초마다 발동되는 지속 피해는 자동 사냥·보스전 모두에서 균등한 효율을 보장한다.',
    recommendedFor: ['모든 콘텐츠', '딜러 슬롯', '자동 사냥', '보스전'],
    recommendedClasses: ['warrior', 'swordsman'],
    combosWith: ['seohaeyongwang', 'chiwoo'],
  },
  {
    id: 'seohaeyongwang',
    name: '서해용왕',
    tier: 0,
    rarity: 'rare_ssr',
    faction: 'yo',
    role: 'buffer',
    effectShort: '치명타 회심 + 파티 딜 효율',
    effectLong:
      '0티어 진령 중에서도 직업과 빌드를 가리지 않고 채용되는 만능 버퍼. 치명타 회심 버프는 전사·검객·영매 모두에게 동일하게 적용되며, 파티 전체의 딜 효율을 평균 30% 이상 끌어올린다.',
    recommendedFor: ['치명타 빌드 필수', '모든 직업 공통', '메타 정석'],
    recommendedClasses: ['warrior', 'swordsman', 'medium'],
    combosWith: ['hong_gildong', 'eumyeonggwi', 'chiwoo'],
    featured: true,
    imageUrl: '/images/wiki/jinryeong-detail-yongwang.webp',
  },

  // ─── 1티어 ───
  {
    id: 'eumyeonggwi',
    name: '음영귀',
    tier: 1,
    rarity: 'rare_ssr',
    faction: 'sin',
    role: 'dealer',
    effectShort: '치명타 확률·피해량 동시 상승',
    effectLong:
      '치명타 확률과 피해량을 동시에 끌어올리는 폭딜형 딜 보조. 검객의 메타 정석 조합에 필수로 채용되며, 보스전에서는 명왕으로 교체하는 변형이 일반적.',
    recommendedFor: ['검객 메타', '폭딜 빌드', 'PvE 후반'],
    recommendedClasses: ['swordsman'],
    combosWith: ['seohaeyongwang', 'hong_gildong'],
  },
  {
    id: 'myeongwang',
    name: '명왕',
    tier: 1,
    rarity: 'rare_ssr',
    faction: 'in',
    role: 'dealer',
    effectShort: '코어 스킬 피해량 ↑',
    effectLong:
      '코어 스킬 피해량을 증폭하는 보스전 특화 딜 증폭형. 음영귀를 명왕으로 교체하면 단일 보스 DPS가 크게 상승한다.',
    recommendedFor: ['보스전 폭딜', '단일 콘텐츠'],
    recommendedClasses: ['swordsman', 'medium'],
    combosWith: ['seohaeyongwang'],
  },
  {
    id: 'chiwoo',
    name: '치우',
    tier: 1,
    rarity: 'rare_ssr',
    faction: 'in',
    role: 'support',
    effectShort: '공·방 동시 강화',
    effectLong:
      '공격력과 방어력을 동시에 강화하는 밸런스형. 장기 사냥과 무한던전에서 안정적인 효율을 제공한다.',
    recommendedFor: ['장기 사냥', '무한던전', '밸런스 빌드'],
    recommendedClasses: ['warrior', 'swordsman'],
    combosWith: ['hong_gildong', 'seohaeyongwang'],
  },
  {
    id: 'hangah',
    name: '항아',
    tier: 1,
    rarity: 'rare_ssr',
    faction: 'in',
    role: 'healer',
    effectShort: '지속 회복 효과',
    effectLong:
      '지속 회복을 제공하는 정통 힐러. 영매처럼 방어력이 낮은 직업의 생존을 책임지며, 장기전에서는 필수에 가깝다.',
    recommendedFor: ['영매 필수', '장기전', '회복형 빌드'],
    recommendedClasses: ['medium'],
    combosWith: ['seohaeyongwang', 'gumiyoho'],
  },

  // ─── 2티어 ───
  {
    id: 'gyeoktugwi',
    name: '격투귀',
    tier: 2,
    rarity: 'ssr',
    faction: 'yo',
    role: 'debuff',
    effectShort: '적 무장해제 · 스킬 차단',
    effectLong: '적의 무장해제·스킬 차단으로 보스전과 PvP에서 변수를 만드는 방해형.',
    recommendedFor: ['보스전', 'PvP 결투장'],
  },
  {
    id: 'gumiyoho',
    name: '구미요호',
    tier: 2,
    rarity: 'ssr',
    faction: 'yo',
    role: 'buffer',
    effectShort: '전체 피해량 증가',
    effectLong: '전체 피해량 버프로 광역 사냥에 최적. 영매의 추천 조합에 자주 등장한다.',
    recommendedFor: ['광역 사냥', '영매 빌드'],
    recommendedClasses: ['medium'],
    combosWith: ['seohaeyongwang', 'hangah'],
  },
  {
    id: 'taeyangyeosin',
    name: '태양여신',
    tier: 2,
    rarity: 'ssr',
    faction: 'sin',
    role: 'buffer',
    effectShort: '공격 속도 · 급속 ↑',
    effectLong: '공격 속도 강화로 초반 진도 밀기에 효과적. 자동 사냥 효율 보강용.',
    recommendedFor: ['초반 진도', '자동 사냥'],
  },
  {
    id: 'gunggwi',
    name: '궁귀',
    tier: 2,
    rarity: 'ssr',
    faction: 'yo',
    role: 'dealer',
    effectShort: '단일 대상 추가 피해',
    effectLong: '단일 대상에 추가 피해를 가하는 보스 특화 딜러.',
    recommendedFor: ['보스전', '단일 콘텐츠'],
  },
  {
    id: 'sansin',
    name: '산신',
    tier: 2,
    rarity: 'ssr',
    faction: 'sin',
    role: 'debuff',
    effectShort: '적 회복 차단',
    effectLong: '적의 회복을 차단하는 카운터형. 힐러형 보스와 PvP에서 활용도가 높다.',
    recommendedFor: ['힐러 보스', 'PvP'],
  },
];

/** ID로 진령 조회 */
export function getWikiJinryeong(
  id: WikiJinryeongDoc['id'],
): Omit<WikiJinryeongDoc, 'updatedAt'> | null {
  return WIKI_JINRYEONG_SEED.find((j) => j.id === id) ?? null;
}

/** 이름(한국어)으로 진령 조회 — 직업 카드의 추천 진령 chip 매핑용 */
export function getWikiJinryeongByName(
  name: string,
): Omit<WikiJinryeongDoc, 'updatedAt'> | null {
  return WIKI_JINRYEONG_SEED.find((j) => j.name === name) ?? null;
}

/** 티어별 그룹화 (0/1/2 순) */
export function groupJinryeongByTier(): Record<0 | 1 | 2, Omit<WikiJinryeongDoc, 'updatedAt'>[]> {
  return {
    0: WIKI_JINRYEONG_SEED.filter((j) => j.tier === 0),
    1: WIKI_JINRYEONG_SEED.filter((j) => j.tier === 1),
    2: WIKI_JINRYEONG_SEED.filter((j) => j.tier === 2),
  };
}

/** 진영별 그룹화 */
export function groupJinryeongByFaction(): Record<
  'sin' | 'yo' | 'in',
  Omit<WikiJinryeongDoc, 'updatedAt'>[]
> {
  return {
    sin: WIKI_JINRYEONG_SEED.filter((j) => j.faction === 'sin'),
    yo: WIKI_JINRYEONG_SEED.filter((j) => j.faction === 'yo'),
    in: WIKI_JINRYEONG_SEED.filter((j) => j.faction === 'in'),
  };
}
