/**
 * 구조화된 감사 로그 — Sprint V5 P3.A.
 *
 * 서버사이드 audit event (B2B API call, ETL run, 운영 액션 등)를 JSON 한 줄로
 * stdout에 emit. Vercel / DataDog / CloudWatch 등 로그 수집기가 line-based JSON을
 * 자동 파싱한다.
 *
 * 정책:
 *  - console.info는 ESLint `no-console`에서 금지 (warn/error만 허용).
 *  - 본 함수는 console.warn을 사용 — "noteworthy operational event" 시맨틱.
 *  - 절대 PII (이메일, 사용자명 등) 포함 금지 — uid 등 ID만 기록.
 *
 * 사용:
 *   emitAuditLog('b2b_api_call', { tenantId, tier, path, status });
 */
import 'server-only';

export interface AuditLogPayload {
  readonly [key: string]: unknown;
}

export function emitAuditLog(event: string, payload: AuditLogPayload = {}): void {
  console.warn(
    JSON.stringify({
      event,
      ts: Date.now(),
      ...payload,
    }),
  );
}
