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
  emoji: string;
  accent: 'bronze' | 'jade' | 'vermilion' | 'indigo';
  itemCount: number; // 현재 시드/Firestore 카운트
  active: boolean; // false = P3.C/D에서 활성
}
