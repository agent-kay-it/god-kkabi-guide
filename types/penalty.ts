/**
 * 신고 페널티 도메인 타입 — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/firestore-schema-v1.md §1.4
 *      + moderation-policy.md §1
 *
 * 자동 페널티 룰:
 *  - 5건 누적: warning (경고 + warningCount++)
 *  - 10건 누적: ban_7d (7일 정지 + bannedUntil)
 *  - 20건 누적: ban_permanent (영구 정지 + custom claim role=banned)
 *
 * 운영자 우회:
 *  - recoverFromPenalty: reportedTotal -= 1 + revokedBy/revokedAt 기록
 *  - unbanUser: claim 복원 (별도 moderation Server Action)
 */

export type PenaltyLevel = 'warning' | 'ban_7d' | 'ban_permanent';

export const PENALTY_LEVEL_LABEL: Record<PenaltyLevel, string> = {
  warning: '경고',
  ban_7d: '7일 정지',
  ban_permanent: '영구 정지',
};

export type PenaltyReason = 'auto_threshold' | 'manual_admin';

export const PENALTY_REASON_LABEL: Record<PenaltyReason, string> = {
  auto_threshold: '신고 누적 임계값 도달',
  manual_admin: '운영자 수동 처리',
};

/** Firestore `penalties/{penaltyId}` 문서. */
export interface PenaltyDoc {
  readonly id: string;
  readonly targetUid: string;
  readonly level: PenaltyLevel;
  readonly reason: PenaltyReason;
  /** 'system' = 자동, string = adminUid (수동) */
  readonly appliedBy: 'system' | string;
  readonly appliedAtMs: number;
  /** ban_7d만 필수, 만료 시각 (ms) */
  readonly expiresAtMs?: number;
  /** 페널티 발동 시점 reportedTotal snapshot */
  readonly reportedCountAtTime: number;
  /** false positive 복구 시 adminUid */
  readonly revokedBy?: string;
  readonly revokedAtMs?: number;
}

/** 누적 신고 → 페널티 임계값 매핑 (moderation-policy.md §1.1) */
export const PENALTY_THRESHOLDS = {
  warning: 5,
  ban_7d: 10,
  ban_permanent: 20,
} as const;

/** ban_7d 지속 시간 (ms) */
export const BAN_7D_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** 누적 신고 수 → 페널티 단계 결정 (단조 증가) */
export function determinePenaltyLevel(reportedTotal: number): PenaltyLevel | null {
  if (reportedTotal >= PENALTY_THRESHOLDS.ban_permanent) return 'ban_permanent';
  if (reportedTotal >= PENALTY_THRESHOLDS.ban_7d) return 'ban_7d';
  if (reportedTotal >= PENALTY_THRESHOLDS.warning) return 'warning';
  return null;
}

export interface RecordReportResult {
  readonly ok: boolean;
  readonly newTotal?: number;
  readonly penaltyApplied?: PenaltyLevel | null;
  readonly error?: 'INTERNAL';
  readonly message?: string;
}
