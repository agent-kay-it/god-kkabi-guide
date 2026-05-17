/**
 * Sentry helper — Sprint 10 / Phase F-final Task #32.
 * 출처: docs/sprint/10-sprint-launch/design.md §9.1
 *
 * 코드베이스 어디서나 안전하게 호출 가능한 wrapper:
 *  - DSN 미설정 시 no-op (성능/번들 영향 최소)
 *  - PII 마스킹은 sentry.{client,server,edge}.config.ts beforeSend에서 처리
 *  - 본 모듈은 export 형태로만 노출 — Sentry SDK 직접 노출 X (Clean Arch R1 정신)
 *
 * 사용:
 *   import { captureException, addBreadcrumb, withScope } from '@/lib/sentry/config';
 *   captureException(err, { tags: { feature: 'chat-send-message' } });
 */
import * as Sentry from '@sentry/nextjs';

const DSN_AVAILABLE =
  typeof process !== 'undefined' &&
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

export interface CaptureOptions {
  readonly tags?: Readonly<Record<string, string | number | boolean>>;
  readonly extra?: Readonly<Record<string, unknown>>;
  readonly level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

export function captureException(error: unknown, opts: CaptureOptions = {}): void {
  if (!DSN_AVAILABLE) {
    // dev/no-DSN: 콘솔로 fallback (Vercel logs에 남음)
    if (typeof console !== 'undefined') console.error('[sentry:noop]', error, opts);
    return;
  }
  Sentry.withScope((scope) => {
    if (opts.tags) {
      for (const [k, v] of Object.entries(opts.tags)) scope.setTag(k, v);
    }
    if (opts.extra) {
      for (const [k, v] of Object.entries(opts.extra)) scope.setExtra(k, v);
    }
    if (opts.level) scope.setLevel(opts.level);
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, opts: CaptureOptions = {}): void {
  if (!DSN_AVAILABLE) return;
  Sentry.withScope((scope) => {
    if (opts.tags) for (const [k, v] of Object.entries(opts.tags)) scope.setTag(k, v);
    if (opts.extra) for (const [k, v] of Object.entries(opts.extra)) scope.setExtra(k, v);
    if (opts.level) scope.setLevel(opts.level);
    Sentry.captureMessage(message);
  });
}

export interface BreadcrumbInput {
  readonly category: string;
  readonly message: string;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

export function addBreadcrumb(b: BreadcrumbInput): void {
  if (!DSN_AVAILABLE) return;
  Sentry.addBreadcrumb({
    category: b.category,
    message: b.message,
    level: b.level ?? 'info',
    ...(b.data ? { data: { ...b.data } } : {}),
  });
}

/**
 * Phase E 패턴 통합 — chat rate-limit 차단 시 자동 metric 호출.
 * 출처: design.md §9.1 (Phase E rate-limit 차단 metric).
 */
export function reportRateLimitHit(input: {
  readonly channelId: string;
  readonly uid: string;
  readonly burstCount: number;
}): void {
  captureMessage('chat:rate_limit_exceeded', {
    level: 'warning',
    tags: { feature: 'chat', kind: 'rate_limit' },
    extra: {
      channelId: input.channelId,
      uidMask: input.uid.slice(0, 4) + '***',
      burstCount: input.burstCount,
    },
  });
}

/**
 * Phase D 패턴 통합 — OG preview/SSRF 차단 시 자동 metric.
 */
export function reportSsrfBlocked(input: {
  readonly url: string;
  readonly reason: string;
}): void {
  captureMessage('post:ssrf_blocked', {
    level: 'warning',
    tags: { feature: 'post', kind: 'ssrf' },
    extra: { url: input.url, reason: input.reason },
  });
}

export const sentryConfig = {
  dsnAvailable: DSN_AVAILABLE,
} as const;
