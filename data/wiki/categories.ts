/**
 * 위키 6 카테고리 메타데이터 — 홈 그리드에 노출.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §위키 카테고리
 *
 * P3.B → P3.C: 4 카테고리 추가 활성 (장비/스킬/문파/콘텐츠).
 * P3.D에서 문파 실시간 랭킹 데이터 + 운영자 콘솔 추가 시 itemCount 동적.
 */
import type { WikiCategoryMeta } from '@/types/wiki';

import { WIKI_CLASSES_SEED } from './classes';
import { WIKI_JINRYEONG_SEED } from './jinryeong';
import { WIKI_SKILLS_SEED } from './skills';
import { WIKI_CONTENTS_SEED } from './contents';
import { WIKI_EQUIPMENT_SEED } from './equipment';
import { WIKI_MUNPA_GUIDE_SEED } from './munpa-guide';

export const WIKI_CATEGORIES: readonly WikiCategoryMeta[] = [
  {
    id: 'class',
    label: '직업',
    description: '전사 · 검객 · 영매 3종 비교',
    href: '/class',
    emoji: '⚔️',
    accent: 'bronze',
    itemCount: WIKI_CLASSES_SEED.length,
    active: true,
  },
  {
    id: 'jinryeong',
    label: '진령',
    description: '0-2티어 11종 + 진영 + 시너지',
    href: '/jinryeong',
    emoji: '🔮',
    accent: 'indigo',
    itemCount: WIKI_JINRYEONG_SEED.length,
    active: true,
  },
  {
    id: 'skill',
    label: '스킬',
    description: '직업별 코어 · 액티브 · 패시브 31종',
    href: '/skill',
    emoji: '✨',
    accent: 'bronze',
    itemCount: WIKI_SKILLS_SEED.length,
    active: true,
  },
  {
    id: 'equipment',
    label: '장비',
    description: '제련 시스템 · 강화 룰 · 우선순위',
    href: '/equipment',
    emoji: '🛡️',
    accent: 'jade',
    itemCount: WIKI_EQUIPMENT_SEED.length,
    active: true,
  },
  {
    id: 'content',
    label: '콘텐츠',
    description: '던전 · PvP · 이벤트 · 메커니즘',
    href: '/content',
    emoji: '🎯',
    accent: 'vermilion',
    itemCount: WIKI_CONTENTS_SEED.length,
    active: true,
  },
  {
    id: 'munpa',
    label: '문파',
    description: '가입 이점 + 선택 기준 (V1+ 실시간 랭킹)',
    href: '/munpa',
    emoji: '🏯',
    accent: 'jade',
    itemCount: WIKI_MUNPA_GUIDE_SEED.length,
    active: true,
  },
];
