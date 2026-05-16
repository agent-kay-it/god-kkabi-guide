/**
 * 문파 가이드 시드 — 가입 이점 / 선택 기준 / 매너.
 * 출처: source/godkkabi-guide/index.html §SECTION ADVANCED 문파 (lines 2230-2261)
 *
 * V1+ 단계에서 서버별 실시간 문파 랭킹 + 가입 신청 기능 추가 예정.
 */
import type { WikiMunpaGuideDoc } from '@/types/wiki';

export const WIKI_MUNPA_GUIDE_SEED: readonly WikiMunpaGuideDoc[] = [
  // ─── 가입 이점 ───
  {
    id: 'benefit-mission',
    title: '문파 미션 보상',
    category: 'benefit',
    summary: '개인 미션보다 보상 효율이 높음. 매일 빠짐없이 수행.',
  },
  {
    id: 'benefit-shop',
    title: '문파 상점',
    category: 'benefit',
    summary: '문파 코인 전용 매장 — 제련석, 진령경험단 등 고급 재료.',
  },
  {
    id: 'benefit-raid',
    title: '문파 던전 (보스 레이드)',
    category: 'benefit',
    summary: '강력한 장비 획득 핵심 경로. 솔로 불가, 문파원 공동 도전.',
  },
  {
    id: 'benefit-bonus',
    title: '출석·기부 보너스',
    category: 'benefit',
    summary: '단순 가입만으로도 일일 무료 자원 +α.',
  },

  // ─── 선택 기준 ───
  {
    id: 'criteria-size',
    title: '문파원 수',
    category: 'criteria',
    summary: '너무 적으면 보스 레이드 어려움 — 15명 이상 권장.',
  },
  {
    id: 'criteria-active',
    title: '최근 활동',
    category: 'criteria',
    summary: '문파장이 7일 이내 접속한 곳을 선택.',
  },
  {
    id: 'criteria-level',
    title: '문파 레벨',
    category: 'criteria',
    summary: '높을수록 문파 상점·던전 콘텐츠 해금이 많음.',
  },
  {
    id: 'criteria-requirement',
    title: '가입 조건',
    category: 'criteria',
    summary: '전투력 미달이면 한 단계 낮춰서 시작 후 이적.',
  },

  // ─── 매너 (운영자 권장) ───
  {
    id: 'etiquette-daily-mission',
    title: '일일 미션 수행',
    category: 'etiquette',
    summary: '본인 일일 문파 미션 완료가 매너의 시작.',
  },
  {
    id: 'etiquette-coop',
    title: '문파 보스 협동',
    category: 'etiquette',
    summary: '레이드 알림 시 가급적 참여. 보상 분배의 핵심.',
  },
  {
    id: 'etiquette-quiet-leave',
    title: '조용한 이적',
    category: 'etiquette',
    summary: '이적 결정 시 미리 운영진에게 알려 후임 정리. 갑작스러운 이탈 자제.',
  },
];

export function getMunpaGuideByCategory(
  category: WikiMunpaGuideDoc['category'],
): WikiMunpaGuideDoc[] {
  return WIKI_MUNPA_GUIDE_SEED.filter((g) => g.category === category);
}
