/**
 * Tips 시드 데이터 — 12개 (admin 큐레이션).
 * 출처: source/godkkabi-guide/index.html §SECTION TIPS (lines 2025-2066) + 운영자 추가 큐레이션.
 *
 * P3.B: 5개 → P3.C: 12개로 확장.
 * P3.D: Firestore 어댑터 + 운영자 작성 폼.
 */
import type { WikiTipDoc } from '@/types/wiki';

export const WIKI_TIPS_SEED: readonly Omit<WikiTipDoc, 'createdAt'>[] = [
  {
    id: 'tip-01-gacha-timing',
    title: '뽑기는 확정 시점을 노려라',
    content:
      '999뽑기 무료권은 일단 모아두고, 확률업/테마 뽑기 이벤트가 열릴 때 한 번에 소진하세요. SSR 획득 확률이 유의미하게 상승합니다.',
    category: 'beginner',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-02-auto-hunt-check',
    title: '자동 사냥 ON 후 한 번 더 확인',
    content:
      '장비가 너무 강해도/약해도 클리어 효율이 떨어집니다. 보상 획득률이 급감하면 몇 단계 낮은 스테이지로 내려가는 것이 더 효율적입니다.',
    category: 'general',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-03-morning-daily',
    title: '일일 콘텐츠는 아침에',
    content:
      '매일 초기화되는 콘텐츠는 오전 시간대에 우선 소화하세요. 누적 보상 + 방치 수익률 상승 효과가 동시에 적용됩니다.',
    category: 'general',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-04-resource-priority',
    title: '자원 우선순위 엄수',
    content:
      '무기 → 스킬 → 진령 → 장비 제련 순으로 자원을 투자하세요. 코스튬·탈것·펫은 후순위. 제련석은 이벤트 상점 할인 시기까지 아껴둘 것.',
    category: 'beginner',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-05-quest-condition',
    title: '퀘스트 조건 미리 확인',
    content:
      '메인·도전 퀘스트는 특정 장비 착용·강화 조건을 포함합니다. 스테이지 밀기 전 조건을 확인하고 동시 진행하면 효율이 2배입니다.',
    category: 'advanced',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-06-event-shop-daily',
    title: '이벤트 상점 매일 점검',
    content:
      '접속만 해도 무료 재화나 소량 코인 상점이 열리는 경우가 있습니다. 광고 시청 후 1회 갱신 기능으로 유용 아이템도 노릴 수 있어요.',
    category: 'general',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-07-pvp-pick-only',
    title: '결투장은 이길 상대만',
    content:
      '자동 매칭을 사용하지 마세요. 수동 선택 후 전투 로그로 상성을 분석한 뒤 도전하세요. 패배 시 포인트 + 재도전 비용 이중 손해입니다.',
    category: 'pvp',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-08-join-munpa-now',
    title: '문파 즉시 가입',
    content:
      '개방 즉시 문파에 가입하세요. 출석·기부로 무료 자원이 추가되며, 도깨비 보스 협동 공략 시 효율이 극대화됩니다.',
    category: 'beginner',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-09-jinryeong-priority',
    title: '진령 강화는 서해용왕부터',
    content:
      '서해용왕은 모든 직업·빌드에 공통으로 채용되는 0티어 진령입니다. 별 등급(★) 강화는 서해용왕 → 본인 직업 추천 0~1티어 → 추가 빌드 시너지 순으로 진행하세요.',
    category: 'beginner',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-10-critical-build-swordsman',
    title: '검객 치명타 빌드 완성 순서',
    content:
      '검객의 메타 정석은 홍길동 + 서해용왕 + 음영귀입니다. 보스전에서는 음영귀를 명왕으로 교체해 단일 폭딜 셋업으로 변형하세요. 치명타 확률 50% / 치명타 피해 250% 도달을 1차 목표로 합니다.',
    category: 'advanced',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-11-pvp-counter',
    title: 'PvP 결투장 카운터 진령',
    content:
      '상대가 회복형 진령(항아 등)을 채용했다면 산신을 편성해 회복을 차단하세요. 격투귀의 무장해제는 보스전과 PvP에서 변수를 만드는 핵심 진령입니다.',
    category: 'pvp',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'tip-12-enchant-now',
    title: '강화는 미루지 말 것',
    content:
      '제련으로 더 좋은 장비가 나와도 기존 장비의 강화 수치가 자동 이전됩니다. "더 좋은 장비를 위해 강화를 미루는" 것은 자원 낭비입니다. 현재 장비에 즉시 강화수정을 투자하세요.',
    category: 'advanced',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
];

export function getWikiTip(id: string): Omit<WikiTipDoc, 'createdAt'> | null {
  return WIKI_TIPS_SEED.find((t) => t.id === id) ?? null;
}

export function getTipsByCategory(
  category: WikiTipDoc['category'],
): Omit<WikiTipDoc, 'createdAt'>[] {
  return WIKI_TIPS_SEED.filter((t) => t.category === category);
}
