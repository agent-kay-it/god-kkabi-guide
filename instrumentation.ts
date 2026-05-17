/**
 * Next.js instrumentation entry — Sprint 10 / Phase F-final Task #32.
 * 출처: docs/sprint/10-sprint-launch/design.md §9.1
 *
 * Next.js 16에서 이 파일은 server / edge runtime 초기화 시 자동 실행됨.
 * Sentry SDK init은 runtime별 dynamic import (Edge에 Node API가 새지 않도록).
 *
 * DSN 미설정 시 양쪽 모두 graceful skip — register는 import만 시키고 본체에서 빠짐.
 */
import * as Sentry from '@sentry/nextjs';

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Server-side error capture for App Router (captures errors from Server Components / Server Actions)
export const onRequestError = Sentry.captureRequestError;
