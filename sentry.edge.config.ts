/**
 * Sentry edge config — Sprint 10 / Phase F-final Task #32.
 * 출처: docs/sprint/10-sprint-launch/design.md §9.1
 *
 * 호출 시점: Next.js 16 instrumentation.ts register() → Edge runtime
 * (middleware + Edge Route Handlers).
 *
 * 정책:
 *  - DSN 미설정 시 graceful skip
 *  - Edge runtime은 Node API 미지원 — Sentry.init만 안전 호출
 *  - tracesSampleRate: edge는 hit 빈도가 높아 보수적 0.05
 */
import * as Sentry from '@sentry/nextjs';

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? '';
const ENV = process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: ENV === 'production' ? 0.05 : 1.0,
    sendDefaultPii: false,
  });
}
