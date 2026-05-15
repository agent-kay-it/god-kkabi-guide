/**
 * B2B API + Admin SaaS types — Sprint V3 P3.B.
 * 출처: docs/sprint/05-sprint-v3/design.md §2-3
 *
 * 3 컬렉션:
 *  - api_clients/{clientId}: tenant 정보 + API Key 해시 + tier
 *  - api_usage/{usageId}: 일일 호출 카운트
 *  - tenant_themes/{tenantId}: whitelabel 테마 (선택)
 */

/** API tier — Starter 100/day / Pro 1K/day / Enterprise 무제한 */
export type ApiTier = 'starter' | 'pro' | 'enterprise';

export const API_RATE_LIMITS: Readonly<Record<ApiTier, number>> = {
  starter: 100,
  pro: 1_000,
  enterprise: Number.POSITIVE_INFINITY,
};

/** API Key 길이 (생성 시) — 32 chars hex (16 random bytes) */
export const API_KEY_BYTE_LENGTH = 16;

export interface ApiClientDoc {
  readonly id: string;
  /** sha256 hex digest of plaintext API Key (plaintext는 발급 시점에만 반환) */
  readonly apiKeyHash: string;
  /** 표시용 prefix (예: "gkg_a1b2c3...") — UI에서 식별 가능, 보안 영향 없음 */
  readonly apiKeyPrefix: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly tenantEmail: string;
  readonly tier: ApiTier;
  readonly contractStartsAtMs: number;
  readonly contractEndsAtMs: number;
  readonly monthlyFeeKrw: number;
  readonly isActive: boolean;
  readonly createdAtMs: number;
  readonly notes?: string;
}

export interface ApiUsageDoc {
  readonly id: string;
  /** doc id = `${apiKeyHash}_${dateUTC}` (멱등성) */
  readonly apiKeyHash: string;
  /** YYYY-MM-DD (UTC) */
  readonly date: string;
  readonly count: number;
  readonly lastCalledAtMs: number;
}

export interface TenantThemeDoc {
  readonly id: string;
  readonly tenantId: string;
  /** Firebase Storage URL */
  readonly logoUrl?: string;
  /** 게임사 main 컬러 (HEX). 기본 디자인 토큰 over-ride 용. */
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly fontFamily?: string;
  readonly customDomain?: string;
  readonly createdAtMs: number;
  readonly updatedAtMs?: number;
}

/** REST 응답 표준 envelope */
export interface ApiResponseEnvelope<T> {
  readonly data: T;
  readonly meta: {
    readonly source: 'god-kkabi-guide';
    readonly tier: ApiTier;
    readonly rateLimitRemaining: number;
    readonly rateLimitResetAtMs: number;
    readonly tookMs: number;
    readonly version: 'v1';
  };
}

/** Error envelope */
export interface ApiErrorEnvelope {
  readonly error: {
    readonly code:
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'RATE_LIMITED'
      | 'BAD_REQUEST'
      | 'NOT_FOUND'
      | 'INTERNAL';
    readonly message: string;
    readonly retryAfterMs?: number;
  };
}

/** 발급 시점에만 반환되는 plaintext API Key (Firestore에는 hash만 저장) */
export interface ApiClientIssueResult {
  readonly client: ApiClientDoc;
  readonly apiKeyPlaintext: string;
}
