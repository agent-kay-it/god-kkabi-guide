/**
 * Sentry client (browser) config — Sprint 10 / Phase F-final Task #32.
 * 출처: docs/sprint/10-sprint-launch/design.md §9.1
 *
 * Next.js 16에서 `instrumentation-client.ts`는 자동 로드되어 브라우저
 * 번들 진입점에서 실행 (sentry.client.config.ts의 신패턴).
 *
 * 정책:
 *  - DSN 미설정 시 graceful skip (콘솔 노이즈 없음)
 *  - Replay 비활성 — privacy 우선 (PIPA), 추후 opt-in 검토
 *  - PII 마스킹: uid/email — beforeSend hook
 *  - tracesSampleRate: 0.1 (client는 trafficked)
 */
import * as Sentry from '@sentry/nextjs';

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? '';
const ENV =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
  process.env.NEXT_PUBLIC_VERCEL_ENV ??
  process.env.NODE_ENV ??
  'development';

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend(event) {
      // PII 마스킹 — client-side
      if (event.user) {
        if (event.user.id) event.user.id = '[REDACTED]';
        if (event.user.email) event.user.email = '[REDACTED]';
      }
      if (event.request) {
        if (event.request.cookies) event.request.cookies = { masked: '[REDACTED]' };
      }
      // breadcrumb 마스킹 — 가끔 form 데이터에 email 들어감
      if (event.breadcrumbs) {
        for (const bc of event.breadcrumbs) {
          if (bc.data && typeof bc.data === 'object') {
            for (const k of Object.keys(bc.data)) {
              if (/email|uid|user_?id|token/i.test(k)) {
                (bc.data as Record<string, unknown>)[k] = '[REDACTED]';
              }
            }
          }
        }
      }
      return event;
    },
  });
}

// onRouterTransitionStart for App Router (Next.js 16) — used by browserTracingIntegration
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
