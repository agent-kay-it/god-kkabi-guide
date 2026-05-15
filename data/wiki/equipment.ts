/**
 * 장비 가이드 시드 — 제련 시스템 중심 12 카드.
 * 출처: source/godkkabi-guide/index.html §SECTION SKILL / 제련 (lines 1800-1834, 2310-2340)
 *
 * 주의: 실제 게임 내 개별 장비 데이터 (예: '진룡검 +10')는 명시되지 않았으므로
 *      제련 시스템 메커니즘 + 자원 우선순위 + 강화 룰 중심으로 구성.
 *      P3.D admin 콘솔 또는 사용자 제보로 개별 장비 데이터 추가 예정.
 */
import type { WikiEquipmentDoc } from '@/types/wiki';

type Equipment = Omit<WikiEquipmentDoc, 'updatedAt'>;

export const WIKI_EQUIPMENT_SEED: readonly Equipment[] = [
  // ─── 시스템 기본 ───
  {
    id: 'eq-jeryeon-system',
    name: '제련 시스템',
    topic: 'system',
    summary: '제련석으로 확률적 뽑기. 반복할수록 레벨 상승.',
    description:
      '장비는 제련석으로 확률적으로 뽑는 시스템. 반복할수록 제련 레벨이 상승하고 고등급 장비 등장 확률이 올라간다.',
    keyPoints: [
      '제련석 = 장비 뽑기 재화',
      '제련 횟수 = 제련 레벨 상승',
      '제련 레벨 = 고등급 장비 확률',
    ],
  },
  {
    id: 'eq-set-effect',
    name: '세트 효과',
    topic: 'system',
    summary: '같은 세트 부위 모으면 추가 효과.',
    description:
      '동일 세트 부위를 모으면 추가 시너지 효과 발생. 세트 효과는 콘텐츠별로 가성비가 달라지므로 보스/PvP에 맞춰 슬롯 교체.',
    keyPoints: ['세트 부위 = 5~6 부위 묶음', '콘텐츠별 세트 운용', '범용 세트 1 + 특화 세트 1 권장'],
  },

  // ─── 자원 우선순위 ───
  {
    id: 'eq-priority-1-weapon',
    name: '우선순위 01 · 무기 강화',
    topic: 'priority',
    summary: '자원 투자의 최우선.',
    description: '전투력 영향력이 가장 큰 슬롯. 자원이 부족해도 무기 강화에 먼저 투자.',
  },
  {
    id: 'eq-priority-2-skill',
    name: '우선순위 02 · 스킬 레벨업',
    topic: 'priority',
    summary: '직업 메인 화력 강화.',
    description: '코어 + 액티브 스킬을 우선 레벨업. 패시브는 별 등급 우선.',
  },
  {
    id: 'eq-priority-3-jinryeong',
    name: '우선순위 03 · 진령 강화',
    topic: 'priority',
    summary: '서해용왕 부터 별 등급 강화.',
    description: '0티어 진령부터 별 등급 강화. 메타 정석 1~2종에 집중 투자.',
  },
  {
    id: 'eq-priority-4-equipment',
    name: '우선순위 04 · 장비 제련',
    topic: 'priority',
    summary: '제련석 비축 후 일괄 사용.',
    description: '이벤트 상점 할인 시 제련석 대량 매수 → 일괄 사용이 최적 패턴.',
  },
  {
    id: 'eq-priority-5-cosmetic',
    name: '우선순위 05 · 코스튬·탈것·펫',
    topic: 'priority',
    summary: '후순위 — 수치 대비 비용 큼.',
    description:
      '코스튬·탈것·펫은 수치 증가 대비 비용이 매우 크므로 후순위. 무기·스킬·진령 완료 후 고려.',
    warningNote: '⚠️ 절대 먼저 사지 말 것 — 가장 흔한 함정',
  },

  // ─── 강화 (enchant) ───
  {
    id: 'eq-enchant-transfer-rule',
    name: '강화 수치는 교환 장비에도 적용',
    topic: 'enchant',
    summary: '아낌없이 강화수정 투자해도 손해 없음.',
    description:
      '제련으로 더 좋은 장비를 새로 뽑았을 때, 기존 장비의 강화 수치가 새 장비로 자동 이전된다. "혹시 더 좋은 게 나올까봐 강화를 미루는" 것은 자원 낭비.',
    keyPoints: ['강화 수치 자동 이전', '미루기 = 자원 낭비', '현재 장비 즉시 강화'],
  },
  {
    id: 'eq-rerolling-jump',
    name: '제련 레벨 단계 점프 확률',
    topic: 'enchant',
    summary: '제련 횟수가 등급 확률을 결정.',
    description:
      '제련 횟수 자체가 제련 레벨을 올리고, 일정 구간을 넘으면 고등급 장비 등장 확률이 단계적으로 점프한다. 자원 모아두기보다 횟수를 빠르게 채우는 것이 우선.',
  },

  // ─── 뽑기 (gacha) ───
  {
    id: 'eq-999-draw',
    name: '999회 무료 뽑기 활용',
    topic: 'gacha',
    summary: '확률업/테마 이벤트에 몰아서 사용.',
    description:
      '초반 제공되는 999회 무료 뽑기는 즉시 모두 사용하지 말 것. 확률업 이벤트나 테마 뽑기가 시작될 때 몰아서 돌리면 SSR 등급 장비·코스튬 획득 확률이 유의미하게 상승.',
    keyPoints: ['바로 소진 금지', '확률업/테마 이벤트 타이밍', '일괄 소진 = 효율 극대'],
  },

  // ─── 분해 (decompose) ───
  {
    id: 'eq-decompose',
    name: '분해 우선순위',
    topic: 'decompose',
    summary: '불필요한 장비는 즉시 분해해 자원 환원.',
    description:
      '저등급/중복 장비는 분해해 제련석/강화수정 등으로 환원. 인벤토리 관리도 동시 해결.',
    keyPoints: ['저등급 즉시 분해', '중복 장비 환원', '인벤토리 정리 효과'],
  },
];

export function getEquipmentByTopic(
  topic: WikiEquipmentDoc['topic'],
): Equipment[] {
  return WIKI_EQUIPMENT_SEED.filter((e) => e.topic === topic);
}
