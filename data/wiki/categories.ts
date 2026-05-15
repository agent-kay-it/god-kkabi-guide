/**
 * 위키 6 카테고리 메타데이터 — 홈 그리드에 노출.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §위키 카테고리
 *
 * active=false는 P3.C/D에서 데이터 시드 후 활성화 예정.
 */
import type { WikiCategoryMeta } from '@/types/wiki';

export const WIKI_CATEGORIES: readonly WikiCategoryMeta[] = [
  {
    id: 'class',
    label: '직업',
    description: '전사 · 검객 · 영매 3종 비교',
    href: '/class',
    emoji: '⚔️',
    accent: 'bronze',
    itemCount: 3,
    active: true,
  },
  {
    id: 'jinryeong',
    label: '진령',
    description: '0-2티어 11종 + 진영 + 시너지',
    href: '/jinryeong',
    emoji: '🔮',
    accent: 'indigo',
    itemCount: 11,
    active: true,
  },
  {
    id: 'equipment',
    label: '장비',
    description: '부위 · 등급 · 옵션 · 세트',
    href: '/equipment',
    emoji: '🛡️',
    accent: 'jade',
    itemCount: 0,
    active: false,
  },
  {
    id: 'skill',
    label: '스킬',
    description: '직업별 코어 · 액티브 · 패시브',
    href: '/skill',
    emoji: '✨',
    accent: 'bronze',
    itemCount: 0,
    active: false,
  },
  {
    id: 'munpa',
    label: '문파',
    description: '서버별 문파 랭킹 + 가입 가이드',
    href: '/munpa',
    emoji: '🏯',
    accent: 'vermilion',
    itemCount: 0,
    active: false,
  },
  {
    id: 'content',
    label: '콘텐츠',
    description: '비경 · 무한던전 · 보스 · 이벤트',
    href: '/content',
    emoji: '🎯',
    accent: 'jade',
    itemCount: 0,
    active: false,
  },
];
