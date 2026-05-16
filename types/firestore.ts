/**
 * Firestore 6 컬렉션 스키마 타입 정의
 * 출처: docs/sprint/02-sprint-mvp/design.md §5 (Sprint 0 schema-validation §4.1 옵션 A)
 *
 * 활성/비활성 매트릭스:
 * - MVP 활성:    coupons, events
 * - MVP 부분활성: builds (admin-seed 1건)
 * - V1+ 활성:    users, tier_votes
 * - V2+ 활성:    pain_topics
 */

import type { Timestamp } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────
// 공용 도메인 enum
// ─────────────────────────────────────────────────────────────────

/** 직업 3종 */
export type ClassId = 'warrior' | 'swordsman' | 'medium';

/**
 * 빌드 태그 11종 — Sprint 0 schema-validation §4.1 옵션 A 채택 (2026-05-14)
 * BuildDoc.tags 필드는 REQUIRED (default []). V1 빌드 작성 폼 multi-select와 1:1 일치.
 */
export type BuildTag =
  | 'pve'
  | 'pvp'
  | 'boss'
  | '결투장'
  | '무한던전'
  | '비경'
  | '초보'
  | '중수'
  | '고수'
  | 'meta'
  | 'experimental';

export const BUILD_TAGS: readonly BuildTag[] = [
  'pve',
  'pvp',
  'boss',
  '결투장',
  '무한던전',
  '비경',
  '초보',
  '중수',
  '고수',
  'meta',
  'experimental',
] as const;

/** 진령 티어 (티어 리스트 표시) */
export type JinryeongTier = 0 | 1 | 2;

/** 진령 ID 11종 (Sprint 0 data-inventory §3) */
export type JinryeongId =
  | 'eumyeong_gwi' // 음영귀
  | 'baekho_su' // 백호수
  | 'cheonggu_yo' // 청구요
  | 'gangrim_do' // 강림도
  | 'manjeokmu_su' // 만적무수
  | 'baekho_seon' // 백호선
  | 'sancheonjeong' // 산천정
  | 'eumyangja' // 음양자
  | 'gucheonmyeong' // 구천명
  | 'wanggwireul' // 왕귀를
  | 'baekrimyeong'; // 백림명

// ─────────────────────────────────────────────────────────────────
// MVP 활성 컬렉션
// ─────────────────────────────────────────────────────────────────

export type CouponStatus = 'valid' | 'expired' | 'unknown';
export type CouponSource = 'official' | 'community' | 'admin';

/** `coupons` 컬렉션 (MVP 활성) — design.md §5.2 */
export interface CouponDoc {
  id: string;
  code: string;
  description: string;
  reward: string;
  status: CouponStatus;
  starts_at: Timestamp;
  expires_at?: Timestamp;
  reported_invalid_count: number;
  last_verified_at: Timestamp;
  source: CouponSource;
}

export type ReferrerSource =
  | 'organic'
  | 'dc'
  | 'naver_cafe'
  | 'kakao_talk'
  | 'youtube'
  | 'ruliweb'
  | 'direct';

/** `events` 컬렉션 (MVP 활성, GA4 백업 3개 이벤트 한정) — design.md §5.3 */
export interface EventDoc {
  id: string;
  event_name: string;
  uid?: string;
  session_id: string;
  page: string;
  payload: Record<string, string | number | boolean | null>;
  timestamp: Timestamp;
  user_agent_hash: string;
  referrer_source?: ReferrerSource;
}

// ─────────────────────────────────────────────────────────────────
// MVP 부분활성 컬렉션 (admin-seed 1건)
// ─────────────────────────────────────────────────────────────────

export type BuildSource = 'self_report' | 'screenshot' | 'manual_admin';

/** `builds` 컬렉션 (MVP 부분활성 — admin-seed 1건 `__admin_seed__`) — design.md §5.5 */
export interface BuildDoc {
  id: string;
  uid: string;
  class: ClassId;
  jinryeong_3: JinryeongId[];
  skill_set: {
    core: string;
    active: string;
    passive: string;
  };
  equipment_grade: number;
  description?: string;
  tags: BuildTag[];
  is_public: boolean;
  likes_count: number;
  bookmarks_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  source: BuildSource;
}

// ─────────────────────────────────────────────────────────────────
// V1+ 활성 컬렉션 (MVP는 스키마만)
// ─────────────────────────────────────────────────────────────────

export type SignupVia = 'google' | 'anonymous';

/** `users` 컬렉션 (V1+ 활성) — design.md §5.4 */
export interface UserDoc {
  uid: string;
  display_name?: string;
  email_hash?: string;
  created_at: Timestamp;
  last_login_at: Timestamp;
  signed_up_via: SignupVia;
  consent: {
    analytics: boolean;
    profile_public: boolean;
    consented_at: Timestamp;
  };
}

export type TierVote = 'S' | 'A' | 'B' | 'C' | 'D';

/** `tier_votes` 컬렉션 (V1+ 활성) — design.md §5.6 */
export interface TierVoteDoc {
  id: string;
  uid: string;
  jinryeong_id: JinryeongId;
  vote: TierVote;
  voter_class?: ClassId;
  voter_level_estimate?: number;
  week: string;
  created_at: Timestamp;
}

/** `pain_topics` 컬렉션 (V2+ NLP 활성, V1 raw 수집) — design.md §5.7 */
export interface PainTopicDoc {
  id: string;
  topic: string;
  sentiment: -1 | 0 | 1;
  frequency: number;
  week: string;
  source: 'comment' | 'dc_curation';
  sample_quotes: string[];
  raw_text?: string;
  processed: boolean;
}

// ─────────────────────────────────────────────────────────────────
// 헬퍼 type guard
// ─────────────────────────────────────────────────────────────────

export function isBuildTag(value: string): value is BuildTag {
  return (BUILD_TAGS as readonly string[]).includes(value);
}

export function isClassId(value: string): value is ClassId {
  return value === 'warrior' || value === 'swordsman' || value === 'medium';
}
