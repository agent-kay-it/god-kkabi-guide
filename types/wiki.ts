/**
 * v2 위키 도메인 타입 — 직업 / 진령 / 장비 / 스킬 / 콘텐츠 / 문파.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.7-2.11
 *      + source/godkkabi-guide/index.html (실데이터 추출 기준)
 *
 * v1 types/firestore.ts의 JinryeongId enum은 추측치였고 비활성 처리.
 * v2 위키 도메인은 본 모듈을 정설로 사용.
 */
import type { Timestamp } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────
// 직업 (wiki_classes)
// ─────────────────────────────────────────────────────────────────

export type WikiClassId = 'warrior' | 'swordsman' | 'medium';

/** 직업 색 카테고리 — design.md §3.0.1 4-색 시스템 매핑 */
export const CLASS_ACCENT: Record<WikiClassId, 'warrior' | 'swordsman' | 'mage'> = {
  warrior: 'warrior',
  swordsman: 'swordsman',
  medium: 'mage',
};

/**
 * V7 P5: 직업 메뉴/카드 아이콘 (webp, 220×220) — 모든 emoji 사용처 대체.
 * 작은 inline 영역 (탭 트리거, Select item, 점수 분포)에서는 사용하지 않음 — 텍스트만.
 */
export const CLASS_ICON_URL: Record<WikiClassId, string> = {
  warrior: '/images/wiki/class/warrior.webp',
  swordsman: '/images/wiki/class/swordsman.webp',
  medium: '/images/wiki/class/medium.webp',
};

/**
 * V7 P5: 직업 캐릭터 일러스트 (webp, 730×1214) — /class 페이지 카드 좌/우 표시용.
 * 페이지 새로고침마다 male/female 랜덤, 카드별 좌/우 배치 alternating.
 */
export const CLASS_CHARACTER_IMAGE_URL: Record<WikiClassId, { male: string; female: string }> = {
  warrior: {
    male: '/images/wiki/class/warrior-male.webp',
    female: '/images/wiki/class/warrior-female.webp',
  },
  swordsman: {
    male: '/images/wiki/class/swordsman-male.webp',
    female: '/images/wiki/class/swordsman-female.webp',
  },
  medium: {
    male: '/images/wiki/class/medium-male.webp',
    female: '/images/wiki/class/medium-female.webp',
  },
};

/** 직업 한국어 이름 + 부직업 (도깨비/무당/저승사자) */
export interface WikiClassDoc {
  id: WikiClassId;
  name: string;
  subName: string; // "· 도깨비" 식 부제
  emoji: string;
  tagline: string; // 한 줄 요약
  summary: string; // 본문 (2-3 문장)
  imageUrl: string; // public/images/wiki/...
  recommendedFor: string[]; // 추천 대상 (3-4 항목)
  strengths: string[]; // 핵심 강점 (3-5 항목)
  weaknesses: string[]; // 약점 (2-3 항목)
  recommendedJinryeong: string[]; // 추천 진령 이름 배열 (3종)
  jinryeongNote: string; // 진령 조합 메모
  rankingNote: string; // 채용률/메타 메모
  tier: 0 | 1 | 2 | 3; // 메타 티어
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// 진령 (wiki_jinryeong)
// ─────────────────────────────────────────────────────────────────

export type JinryeongFaction = 'sin' | 'yo' | 'in'; // 신 · 요 · 인
export type JinryeongRarity = 'rare_ssr' | 'ssr' | 'sr' | 'r';
export type JinryeongRole = 'dealer' | 'buffer' | 'healer' | 'support' | 'debuff';

/** 진령 ID (snake_case slug) */
export type WikiJinryeongId =
  | 'hong_gildong'
  | 'seohaeyongwang'
  | 'eumyeonggwi'
  | 'myeongwang'
  | 'chiwoo'
  | 'gyeoktugwi'
  | 'gumiyoho'
  | 'taeyangyeosin'
  | 'gunggwi'
  | 'hangah'
  | 'sansin';

export interface WikiJinryeongDoc {
  id: WikiJinryeongId;
  name: string; // 한국어 이름
  tier: 0 | 1 | 2; // 메타 티어
  rarity: JinryeongRarity;
  faction: JinryeongFaction;
  role: JinryeongRole;
  effectShort: string; // 표/카드용 한 줄
  effectLong: string; // 카드 본문 (2-3 문장)
  recommendedFor: string[]; // 추천 상황 (콘텐츠/직업)
  recommendedClasses?: WikiClassId[]; // 가장 잘 맞는 직업
  combosWith?: WikiJinryeongId[]; // 시너지 진령
  featured?: boolean; // 메타 핵심 (서해용왕 같은)
  imageUrl?: string;
  updatedAt?: Timestamp;
}

export const FACTION_LABEL: Record<JinryeongFaction, string> = {
  sin: '신(神)',
  yo: '요(妖)',
  in: '인(人)',
};

export const FACTION_ACCENT: Record<JinryeongFaction, 'indigo' | 'jade' | 'bronze'> = {
  sin: 'indigo',
  yo: 'jade',
  in: 'bronze',
};

export const ROLE_LABEL: Record<JinryeongRole, string> = {
  dealer: '딜러',
  buffer: '버퍼',
  healer: '힐러',
  support: '서포터',
  debuff: '방해',
};

export const RARITY_LABEL: Record<JinryeongRarity, string> = {
  rare_ssr: '희귀 SSR',
  ssr: 'SSR',
  sr: 'SR',
  r: 'R',
};

// ─────────────────────────────────────────────────────────────────
// Tips (tips) — P3.B에서 정적 시드, P3.C에서 Firestore 어댑터화
// ─────────────────────────────────────────────────────────────────

export type TipCategory = 'general' | 'beginner' | 'advanced' | 'pvp';

export interface WikiTipDoc {
  id: string;
  title: string;
  content: string;
  category: TipCategory;
  authorName?: string;
  authorRole?: 'admin' | 'community';
  createdAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// 스킬 (wiki_skills)
// ─────────────────────────────────────────────────────────────────

export type SkillKind = 'core' | 'active' | 'passive';

export const SKILL_KIND_LABEL: Record<SkillKind, string> = {
  core: '코어',
  active: '액티브',
  passive: '패시브',
};

export const SKILL_KIND_ACCENT: Record<SkillKind, 'vermilion' | 'bronze' | 'indigo'> = {
  core: 'vermilion',
  active: 'bronze',
  passive: 'indigo',
};

export interface WikiSkillDoc {
  id: string; // slug (예: 'warrior-cheontalchanggyeong')
  name: string;
  classId: WikiClassId;
  kind: SkillKind;
  description: string; // 본문 (1-2 문장)
  /** 메타 운영 메모 (선택) */
  metaNote?: string;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// 콘텐츠 (wiki_contents) — 던전 / PvP / 이벤트 / 메커니즘
// ─────────────────────────────────────────────────────────────────

export type WikiContentKind =
  | 'dungeon' // 진령 던전, 무한 던전, 보스 던전, 비경
  | 'pvp' // 결투장
  | 'event' // 출석/누적/확률업/콜라보/시즌/일일
  | 'mechanic' // 소환풀/천장/원신/초기화/별레벨 등
  | 'meta'; // 자동사냥/제련 메커니즘

export type ContentSchedule =
  | 'daily'
  | 'weekly'
  | 'limited'
  | 'permanent'
  | 'event'
  | 'collab'
  | 'season';

export const CONTENT_KIND_LABEL: Record<WikiContentKind, string> = {
  dungeon: '던전',
  pvp: 'PvP',
  event: '이벤트',
  mechanic: '메커니즘',
  meta: '메타 운영',
};

export const SCHEDULE_LABEL: Record<ContentSchedule, string> = {
  daily: '매일',
  weekly: '매주',
  limited: '한정',
  permanent: '상시',
  event: '이벤트',
  collab: '콜라보',
  season: '시즌',
};

export const SCHEDULE_ACCENT: Record<
  ContentSchedule,
  'bronze' | 'jade' | 'vermilion' | 'indigo'
> = {
  daily: 'bronze',
  weekly: 'jade',
  limited: 'vermilion',
  permanent: 'jade',
  event: 'bronze',
  collab: 'indigo',
  season: 'vermilion',
};

export interface WikiContentDoc {
  id: string;
  name: string;
  kind: WikiContentKind;
  schedule: ContentSchedule;
  /** 짧은 요약 (카드/리스트용) */
  summary: string;
  /** 긴 본문 (상세 카드) */
  description?: string;
  /** 핵심 행동 지침 (불릿) */
  keyPoints?: string[];
  /** 보상/특이사항 */
  rewardNote?: string;
  /** 카테고리 라벨 추가 (예: DAILY/ENDLESS/BOSS/COOP) */
  badge?: string;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// 장비 가이드 (wiki_equipment) — 제련 시스템 중심 12-15 카드
// ─────────────────────────────────────────────────────────────────

export type EquipmentTopic =
  | 'system'     // 제련 시스템 기본
  | 'priority'   // 자원 우선순위
  | 'enchant'    // 강화수정
  | 'gacha'      // 999뽑기/확률업
  | 'decompose'  // 분해/환원
  | 'set';       // 세트효과 (V1+ 추가 예정)

export const EQUIPMENT_TOPIC_LABEL: Record<EquipmentTopic, string> = {
  system: '시스템',
  priority: '우선순위',
  enchant: '강화',
  gacha: '뽑기',
  decompose: '분해',
  set: '세트',
};

export interface WikiEquipmentDoc {
  id: string;
  name: string;
  topic: EquipmentTopic;
  summary: string;
  description?: string;
  keyPoints?: string[];
  warningNote?: string;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────────────
// 문파 가이드 (wiki_munpa_guide) — V1+ 실시간 랭킹 별도
// ─────────────────────────────────────────────────────────────────

export interface WikiMunpaGuideDoc {
  id: string;
  title: string;
  category: 'benefit' | 'criteria' | 'etiquette';
  summary: string;
  bullets?: string[];
}

// ─────────────────────────────────────────────────────────────────
// 6 위키 카테고리 — 홈 그리드에 노출
// ─────────────────────────────────────────────────────────────────

export type WikiCategoryId =
  | 'class'
  | 'jinryeong'
  | 'equipment'
  | 'skill'
  | 'munpa'
  | 'content';

export interface WikiCategoryMeta {
  id: WikiCategoryId;
  label: string;
  description: string;
  href: string;
  /** 폴백 이모지 — iconUrl 미제공 시 사용 */
  emoji: string;
  /** Sprint V7 P5: 메뉴 아이콘 (webp). 128×128 권장 — public/images/wiki/menu/*.webp */
  iconUrl?: string;
  accent: 'bronze' | 'jade' | 'vermilion' | 'indigo';
  itemCount: number; // 현재 시드/Firestore 카운트
  active: boolean; // false = P3.C/D에서 활성
}
