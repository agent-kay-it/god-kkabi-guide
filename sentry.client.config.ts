/**
 * Sentry client config — Sprint 26 F26-A.
 * 출처: docs/sprint/26-sprint-v3-ga-readiness/design.md §1.3
 *      + docs/sprint/10-sprint-launch/design.md §9.1
 *      + docs/05-policy/slo-policy.md (Sprint 24 SLO 정합)
 *
 * 호출 시점: Next.js 16 App Router — 브라우저에서 첫 페이지 load 시 자동 실행.
 *
 * 정책:
 *  - DSN 미설정 시 graceful skip (개발/PR preview 빌드 안전)
 *  - production 만 tracesSampleRate 0.1, dev 는 1.0 (디버깅용)
 *  - replaysSessionSampleRate 0 (비용 회피), replaysOnErrorSampleRate 1.0
 *  - sendDefaultPii false — PII 마스킹은 server config 와 동일 패턴
 *  - integrations 는 client 전용 (replayIntegration / browserTracingIntegration)
 *
 * Sprint 24 design.md §3 SLO 4 Golden Signals 와 연동:
 *  - P95 latency 1500ms → Sentry performance trace
 *  - 5xx error rate 0.5% → Sentry capture
 */
import * as Sentry from '@sentry/nextjs';

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? '';
const ENV =
  process.env.NEXT_PUBLIC_VERCEL_ENV ??
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
  'development';

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event) {
      // 브라우저 측 PII 마스킹 (uid/email/cookie/authorization)
      if (event.user) {
        if (event.user.id) event.user.id = '[REDACTED]';
        if (event.user.email) event.user.email = '[REDACTED]';
      }
      if (event.request?.headers) {
        const h = event.request.headers as Record<string, string>;
        if (h['cookie']) h['cookie'] = '[REDACTED]';
        if (h['authorization']) h['authorization'] = '[REDACTED]';
      }
      return event;
    },
    // Sprint 24 SLO: 알람 정책은 Sentry dashboard 측 alarm rule 로 별도 운영 (Sprint 27)
  });
}
