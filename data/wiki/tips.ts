/**
 * Tips 시드 데이터 — source/godkkabi-guide/index.html §꿀팁 추출.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.12 (tips)
 *
 * P3.B 단계: 정적 데이터 (admin 작성).
 * P3.C 단계: Firestore 어댑터 + 운영자 추가 작성 폼.
 */
import type { WikiTipDoc } from '@/types/wiki';

export const WIKI_TIPS_SEED: readonly Omit<WikiTipDoc, 'createdAt'>[] = [
  {
    id: 'gokkebi-999-draw',
    title: '999회 무료 뽑기 활용법',
    content:
      '신규 가입 시 제공되는 999회 뽑기는 한 번에 소진하는 것이 효율적입니다. 진령 별 등급 합성 자원이 모이는 속도가 빨라지기 때문에 분할보다는 일괄 소진을 권장합니다.',
    category: 'beginner',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'auto-hunt-class',
    title: '자동 사냥 효율은 검객·전사가 우수',
    content:
      '검객과 전사는 단일 타격형 직업이라 자동 사냥에서 별다른 개입 없이도 안정적으로 진도를 밀어 올립니다. 영매는 광역기 위주라 잡몹은 빠르나 단일 보스에서 멈춤 현상이 잦아 수동 개입이 필요한 경우가 있습니다.',
    category: 'general',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'jinryeong-priority',
    title: '진령 강화는 서해용왕부터',
    content:
      '서해용왕은 모든 직업·빌드에 공통으로 채용되는 0티어 진령입니다. 별 등급(★) 강화는 서해용왕 → 본인 직업 추천 0~1티어 → 추가 빌드 시너지 순으로 진행하세요.',
    category: 'beginner',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'critical-build-swordsman',
    title: '검객 치명타 빌드 완성 순서',
    content:
      '검객의 메타 정석은 홍길동 + 서해용왕 + 음영귀입니다. 보스전에서는 음영귀를 명왕으로 교체해 단일 폭딜 셋업으로 변형하세요. 치명타 확률 50% / 치명타 피해 250% 도달을 1차 목표로 합니다.',
    category: 'advanced',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
  {
    id: 'pvp-counter-pick',
    title: 'PvP 결투장 카운터 진령',
    content:
      '상대가 회복형 진령(항아 등)을 채용했다면 산신을 편성해 회복을 차단하세요. 격투귀의 무장해제는 보스전과 PvP에서 변수를 만드는 핵심 진령입니다.',
    category: 'pvp',
    authorName: '깨비지기',
    authorRole: 'admin',
  },
];

export function getWikiTip(id: string): Omit<WikiTipDoc, 'createdAt'> | null {
  return WIKI_TIPS_SEED.find((t) => t.id === id) ?? null;
}
