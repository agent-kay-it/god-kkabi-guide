/**
 * F3.4 쿠폰 자동 검증 — 커뮤니티 제보 + admin 승인.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §4
 *
 * **TOS 회피**: 실 게임 쿠폰 자동 호출 X. 사용자 제보 → admin 승인 워크플로.
 */

import type { Timestamp } from 'firebase/firestore';

export type CouponStatus = 'pending' | 'verified' | 'expired' | 'rejected';

export interface CouponDoc {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly rewards: string; // free-text 보상 설명
  readonly expiresAtMs: number;
  readonly status: CouponStatus;
  readonly submittedBy: string;
  readonly submittedByNickname: string;
  readonly verifiedBy?: string;
  readonly verifiedAt?: Timestamp | null;
  readonly reportedAt: Timestamp | null;
  readonly upvotes: number;
  readonly downvotes: number;
  readonly rejectionReason?: string;
}

export interface CouponInput {
  readonly code: string;
  readonly title: string;
  readonly rewards: string;
  readonly expiresAtMs: number;
}

export const COUPON_LIMITS = {
  code: { min: 4, max: 24 },
  title: { min: 2, max: 60 },
  rewards: { min: 2, max: 200 },
} as const;

export const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  pending: '검토 대기',
  verified: '확인됨',
  expired: '만료',
  rejected: '거절',
};

export const COUPON_STATUS_COLOR: Record<
  CouponStatus,
  'bronze' | 'jade' | 'muted' | 'vermilion'
> = {
  pending: 'bronze',
  verified: 'jade',
  expired: 'muted',
  rejected: 'vermilion',
};
