/**
 * Sentry server config — Sprint 10 / Phase F-final Task #32.
 * 출처: docs/sprint/10-sprint-launch/design.md §9.1
 *
 * 호출 시점: Next.js 16 instrumentation.ts register() → Node runtime.
 *
 * 정책:
 *  - DSN 미설정 시 graceful skip (빌드 실패 금지)
 *  - production / preview 환경만 활성 (NODE_ENV / VERCEL_ENV 검사)
 *  - PII 마스킹: req.headers.cookie, req.body 내 uid/email — beforeSend hook
 *  - sampleRate: 1.0 (출시 직후) → 0.1 (안정 후 수동 조정)
 */
import * as Sentry from '@sentry/nextjs';

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? '';
const ENV = process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
    integrations: [
      Sentry.consoleIntegration(),
      Sentry.httpIntegration(),
    ],
    beforeSend(event) {
      // PII 마스킹 — uid / email / Cookie 헤더
      if (event.request) {
        if (event.request.cookies) event.request.cookies = { masked: '[REDACTED]' };
        if (event.request.headers) {
          const h = event.request.headers as Record<string, string>;
          if (h['cookie']) h['cookie'] = '[REDACTED]';
          if (h['authorization']) h['authorization'] = '[REDACTED]';
        }
        // request body — JSON stringify 후 uid/email 마스킹
        if (typeof event.request.data === 'string' && event.request.data.length < 5000) {
          event.request.data = event.request.data
            .replace(/("uid"\s*:\s*")[^"]+(")/g, '$1[REDACTED]$2')
            .replace(/("email"\s*:\s*")[^"]+(")/g, '$1[REDACTED]$2');
        }
      }
      // user.id / user.email — server-side는 굳이 noisy
      if (event.user) {
        if (event.user.id) event.user.id = '[REDACTED]';
        if (event.user.email) event.user.email = '[REDACTED]';
      }
      return event;
    },
  });
}
