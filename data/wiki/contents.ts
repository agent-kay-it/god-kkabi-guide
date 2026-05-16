/**
 * 콘텐츠 22종 시드 — 던전 4 + PvP 1 + 이벤트 6 + 메커니즘 6 + 메타 5.
 * 출처: source/godkkabi-guide/index.html §SECTION DUNGEON / EVENT / ADVANCED (lines 1837-2310)
 */
import type { WikiContentDoc } from '@/types/wiki';

type Content = Omit<WikiContentDoc, 'updatedAt'>;

export const WIKI_CONTENTS_SEED: readonly Content[] = [
  // ─── 던전 4 ───
  {
    id: 'dungeon-jinryeong',
    name: '진령 던전',
    kind: 'dungeon',
    schedule: 'daily',
    badge: 'DAILY',
    summary: '진령 강화 재료 획득. 매일 초기화.',
    description:
      '진령 강화의 핵심 재료 수급처. 매일 초기화되므로 오전 시간대 우선 소화하면 누적 보상 시너지가 발생한다.',
    keyPoints: [
      '오전 시간대 우선 클리어',
      '재료 보상 누적형 (방치 효율과 분리)',
      '본인 직업 추천 진령 우선 키우기',
    ],
  },
  {
    id: 'dungeon-endless',
    name: '무한 던전',
    kind: 'dungeon',
    schedule: 'weekly',
    badge: 'ENDLESS',
    summary: '층층이 누적 도전. 전투력 한계 측정.',
    description: '주간 단위 보상 갱신. 매주 본인 한계 층을 갱신하면 그에 비례하는 보상을 누적 수령.',
    keyPoints: ['전투력 측정 도구로 활용', '주간 단위 보상 갱신', '치우 같은 밸런스 진령이 효과적'],
  },
  {
    id: 'dungeon-boss',
    name: '보스 던전',
    kind: 'dungeon',
    schedule: 'daily',
    badge: 'BOSS',
    summary: '고등급 장비 · 진령 조각 보상.',
    description:
      '일일 보스는 매일 필수. 고등급 장비와 진령 조각 모두 본 던전 보상이 핵심 수급처. 명왕/궁귀 같은 단일 폭딜 진령 채용 시 효율 극대화.',
    keyPoints: [
      '일일 보스 매일 필수',
      '단일 폭딜 진령 채용 (명왕/궁귀)',
      '치명타 빌드 시 효율 최대',
    ],
    rewardNote: '고등급 장비 + 진령 조각',
  },
  {
    id: 'dungeon-bigyeong',
    name: '비경',
    kind: 'dungeon',
    schedule: 'permanent',
    badge: 'COOP',
    summary: '파티 기반 협동 — 문파 활용 ↑.',
    description:
      '조건 달성 시 단계적으로 개방되는 협동 콘텐츠. 문파 가입 시 파티 매칭이 빠르고, 보상도 분배되므로 솔로보다 효율이 압도적으로 높다.',
    keyPoints: [
      '문파 가입 필수 (파티 매칭)',
      '단계적 개방 — 조건 충족하며 진행',
      '보상 분배형 — 효율 극대화',
    ],
  },

  // ─── PvP 1 ───
  {
    id: 'pvp-arena',
    name: '결투장 (PvP)',
    kind: 'pvp',
    schedule: 'daily',
    badge: 'ARENA',
    summary: '"이길 상대만 골라서"가 정답.',
    description:
      '무차별 도전이 아닌 수동 매칭으로 상대를 직접 선택해야 한다. 전력 수치 비슷한 상대의 전투 로그를 먼저 확인해 상성을 분석한 뒤 도전.',
    keyPoints: [
      '자동 매칭 무시 → 수동 매칭으로 상대 선택',
      '전투 로그로 상성 분석 후 도전',
      '패배 시 포인트 + 재도전 비용 이중 손해',
      '일일 도전 횟수 모두 소진 (보상 누적형)',
    ],
    rewardNote: '결투장 코인 · 진령 조각',
  },

  // ─── 이벤트 6 ───
  {
    id: 'event-attendance',
    name: '출석 이벤트',
    kind: 'event',
    schedule: 'permanent',
    summary: '매일 접속만 해도 다이아 · 뽑기권 누적.',
    description:
      '7일/14일/30일 누적 시 대형 보상(SSR 포함). 무과금 핵심 재화 원천. 절대 빠뜨리지 말 것.',
  },
  {
    id: 'event-accumulated-spend',
    name: '누적 소비 이벤트',
    kind: 'event',
    schedule: 'event',
    summary: '홍길동 확정 라인 = 결제 타이밍.',
    description:
      '다이아 누적 사용량에 따른 보상. 홍길동 확정 라인이 여기 포함되므로 결제와 재화 사용은 이 기간에 맞출 것. 분산 금지.',
    rewardNote: '0티어 홍길동 확정 라인 포함',
  },
  {
    id: 'event-rateup-gacha',
    name: '확률업 뽑기',
    kind: 'event',
    schedule: 'limited',
    summary: '999뽑기 일괄 소진 타이밍.',
    description:
      '특정 SSR 진령/장비 확률 일시 상승. 무료 999뽑기권은 본 이벤트에 몰아서 사용해야 효율이 최대.',
  },
  {
    id: 'event-kakao-collab',
    name: '카카오프렌즈 콜라보',
    kind: 'event',
    schedule: 'collab',
    summary: '어피치 · 라이언 등 콜라보 진령.',
    description:
      'KAKAOFRIENDS 쿠폰으로 관련 보상 획득. 콜라보 진령은 대체 활용 가능 (전용 슬롯 없음).',
  },
  {
    id: 'event-seasonal',
    name: '시즌 한정',
    kind: 'event',
    schedule: 'season',
    summary: '신년 · 발렌타인 · 추석 · 할로윈 · 크리스마스.',
    description:
      '한정 진령 · 코스튬은 재발매 되지 않는다. 시즌 이벤트 라인업은 매번 모니터링 필요.',
    rewardNote: '한정 진령/코스튬 — 재발매 없음',
  },
  {
    id: 'event-daily-boss',
    name: '일일 보스 / 진령 던전',
    kind: 'event',
    schedule: 'daily',
    summary: '오전 우선 클리어 = 방치 효율 ↑.',
    description:
      '매일 초기화. 오전 시간대 우선 클리어 시 누적 보상 + 방치 수익률 상승 동시 효과.',
  },

  // ─── 메커니즘 6 (진령 시스템 심층) ───
  {
    id: 'mechanic-summon-pool',
    name: '소환풀 레벨업',
    kind: 'mechanic',
    schedule: 'permanent',
    summary: '천음령으로 풀 레벨 = SSR 확률 ↑.',
    description:
      '소환풀 레벨이 높을수록 희귀 SSR 등장 확률 자체가 상승. 단순히 뽑기 횟수 늘리는 것보다 풀 레벨업이 장기적으로 더 효율적.',
  },
  {
    id: 'mechanic-pity-system',
    name: '10회 천장 시스템',
    kind: 'mechanic',
    schedule: 'permanent',
    summary: '10회 시 SR 이상 1명 확정.',
    description:
      '연속으로 SR 이하만 뽑히는 상황은 없음. 9회 + 무료 보상 같은 절약 전략이 가능.',
  },
  {
    id: 'mechanic-essence-convert',
    name: '중복 진령 → 원신 자동 변환',
    kind: 'mechanic',
    schedule: 'permanent',
    summary: 'SSR 6원신, 희귀 SSR 30원신.',
    description:
      '이미 보유한 진령 중복 시 원신으로 자동 변환. 같은 진령의 별 등급 향상에 사용되므로 낭비가 아님.',
  },
  {
    id: 'mechanic-jinryeong-reset',
    name: '진령 초기화',
    kind: 'mechanic',
    schedule: 'permanent',
    summary: '잘못 키운 진령 재료 환급.',
    description:
      '메타 변경이나 새 1티어 진령 획득 시 망설이지 말고 환급 → 신규 진령 재투자. 자원 사장 방지 핵심.',
  },
  {
    id: 'mechanic-star-vs-skill',
    name: '별 등급 vs 스킬 품급',
    kind: 'mechanic',
    schedule: 'permanent',
    summary: '원신 → 별레벨 / 오도과 → 품급.',
    description:
      '별 등급은 같은 진령 원신으로 → 기본 스탯 상승. 스킬 품급은 오도과로 → 패시브 효과 강화. 두 경로 분리 원리는 패치 무관 유효.',
  },
  {
    id: 'mechanic-jinryeong-exp-sources',
    name: '진령 경험단 4대 수급처',
    kind: 'mechanic',
    schedule: 'permanent',
    summary: '파티 비경 · 선옥상점 · 자동사냥 · 신병 기원.',
    description:
      '진령 레벨업 재료의 주요 수급처 4가지. 하나만 의존하지 말고 골고루 챙길 것.',
  },

  // ─── 메타 운영 5 (자동사냥 / 제련 룰) ───
  {
    id: 'meta-auto-hunt-trap-1',
    name: '자동사냥 함정 1 — 강한 장비 = 빠른 클리어?',
    kind: 'meta',
    schedule: 'permanent',
    summary: '한 번에 처치할 수 있는 최저 난이도가 최고 수익률.',
    description:
      '스테이지가 너무 쉬우면 몬스터 리스폰 대기로 오히려 느려진다. 적정 난이도 유지가 핵심.',
  },
  {
    id: 'meta-auto-hunt-trap-2',
    name: '자동사냥 함정 2 — 무조건 최고 난이도?',
    kind: 'meta',
    schedule: 'permanent',
    summary: '사망 0회 + 100% 자동 클리어가 정답.',
    description:
      '몇 번 죽으면서 클리어하면 시간당 보상이 급락. 안정 클리어 가능한 최고 난이도가 정답.',
  },
  {
    id: 'meta-auto-hunt-trap-3',
    name: '자동사냥 함정 3 — 스킬은 자동이니 신경 OFF?',
    kind: 'meta',
    schedule: 'permanent',
    summary: '쿨타임 짧은/긴 스킬 교차 배치.',
    description:
      '쿨타임 긴 스킬을 한 슬롯에 몰면 화력 공백 발생. 교차 배치로 데미지가 끊기지 않게 구성.',
  },
  {
    id: 'meta-enchant-transfer',
    name: '강화 수치는 교환 장비에도 적용',
    kind: 'meta',
    schedule: 'permanent',
    summary: '현재 장비에 아낌없이 강화수정 투자.',
    description:
      '제련으로 새 장비를 뽑아도 기존 강화 수치가 자동 이전된다. "혹시 더 좋은 게 나올까봐"라는 이유로 강화 미루는 것은 자원 낭비.',
  },
  {
    id: 'meta-rerolling-level',
    name: '제련 레벨 = 등급 점프 확률',
    kind: 'meta',
    schedule: 'permanent',
    summary: '제련 횟수 빠르게 채우는 게 우선.',
    description:
      '제련 횟수 자체가 제련 레벨을 올리고, 일정 구간 넘으면 고등급 장비 등장 확률이 단계적으로 점프한다. 자원 모아두기보다 횟수 채우기가 우선.',
  },
];

export function getContentsByKind(
  kind: WikiContentDoc['kind'],
): Content[] {
  return WIKI_CONTENTS_SEED.filter((c) => c.kind === kind);
}

export function getContent(id: string): Content | null {
  return WIKI_CONTENTS_SEED.find((c) => c.id === id) ?? null;
}
