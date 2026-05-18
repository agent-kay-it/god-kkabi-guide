/**
 * Sentry client (browser) config — Sprint 10 / Phase F-final Task #32.
 * 출처: docs/sprint/10-sprint-launch/design.md §9.1
 *
 * Sprint 12 / F12-B-3 — 동적 import + idle init.
 *
 * Next.js 16의 instrumentation-client.ts 는 브라우저 번들 진입점에서 자동 실행되므로
 * 정적 `import * as Sentry from '@sentry/nextjs'` 를 하면 SDK (~50KB gzip) 가
 * critical bundle 에 포함되어 모바일 LCP 16s 회귀 원인 중 하나.
 *
 * 본 파일은:
 *  1) Sentry import 를 동적으로 변경 → 별도 chunk 로 분리 (initial bundle 경량화)
 *  2) requestIdleCallback (또는 3초 fallback) 후 비동기 init 호출
 *  3) onRouterTransitionStart export 는 lazy proxy — init 전에는 no-op
 *
 * 트레이드오프:
 *  - 첫 3초 (또는 첫 user idle 까지) 발생하는 client error 는 capture 안됨
 *  - 모바일 LCP 절감 효과: -200~500ms 추정 (Sprint 12 F12-B-6 측정에서 검증)
 *
 * 정책:
 *  - DSN 미설정 시 동적 import 자체 skip (production 외 환경)
 *  - Replay 비활성 — privacy 우선 (PIPA), 추후 opt-in 검토
 *  - PII 마스킹: uid/email — beforeSend hook
 *  - tracesSampleRate: 0.1 (client는 trafficked)
 */

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? '';
const ENV =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
  process.env.NEXT_PUBLIC_VERCEL_ENV ??
  process.env.NODE_ENV ??
  'development';

// Sentry instance 캐시 — onRouterTransitionStart proxy 가 init 완료 후 사용.
let sentryRef: typeof import('@sentry/nextjs') | null = null;

async function initSentry(): Promise<void> {
  if (!DSN || typeof window === 'undefined') return;
  try {
    const Sentry = await import('@sentry/nextjs');
    sentryRef = Sentry;
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
        // breadcrumb 마스킹 — form 데이터에 email 들어가는 케이스
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
  } catch {
    // Sentry import 실패 — silent (perf 우선, 진단 가능)
  }
}

if (typeof window !== 'undefined' && DSN) {
  const requestIdle =
    typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback.bind(window)
      : (cb: () => void) => window.setTimeout(cb, 3000);
  requestIdle(() => {
    void initSentry();
  });
}

/**
 * onRouterTransitionStart — Next.js 16 App Router 가 직접 import.
 * Sprint 12 F12-B-3 변경: init 전(idle 도달 전)에는 no-op,
 *                       init 후에는 Sentry.captureRouterTransitionStart 로 위임.
 */
export const onRouterTransitionStart = (...args: unknown[]): void => {
  const sentry = sentryRef;
  if (!sentry) return;
  // @ts-expect-error — Sentry SDK 의 동적 시그니처
  return sentry.captureRouterTransitionStart(...args);
};
