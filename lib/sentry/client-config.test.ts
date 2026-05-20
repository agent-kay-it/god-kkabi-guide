/**
 * sentry.client.config.ts — Sprint 26 F26-A 단위 테스트.
 * 브라우저 측 Sentry init 동작 검증.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: 'browserTracing' })),
  replayIntegration: vi.fn((opts: unknown) => ({ name: 'replay', opts })),
}));

beforeEach(async () => {
  vi.resetModules();
  vi.unstubAllEnvs();
  const Sentry = await import('@sentry/nextjs');
  vi.mocked(Sentry.init).mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('sentry.client.config.ts', () => {
  it('production 환경 — tracesSampleRate 0.1 + replayOnError 1.0', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    await import('../../sentry.client.config');
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: 'production',
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.0,
        replaysOnErrorSampleRate: 1.0,
        sendDefaultPii: false,
      }),
    );
  });

  it('preview / development — tracesSampleRate 1.0 (디버깅)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
    await import('../../sentry.client.config');
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: 'preview',
        tracesSampleRate: 1.0,
      }),
    );
  });

  it('beforeSend — PII 마스킹 (user.id/email, headers.cookie/authorization)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    await import('../../sentry.client.config');
    const Sentry = await import('@sentry/nextjs');
    const call = vi.mocked(Sentry.init).mock.calls[0]?.[0];
    const beforeSend = call?.beforeSend as (e: unknown) => unknown;
    const event = {
      user: { id: 'u1', email: 'a@b.com' },
      request: {
        headers: { cookie: 'session=x', authorization: 'Bearer abc' },
      },
    };
    const r = beforeSend({ ...event }) as typeof event;
    expect(r.user.id).toBe('[REDACTED]');
    expect(r.user.email).toBe('[REDACTED]');
    expect(r.request.headers.cookie).toBe('[REDACTED]');
    expect(r.request.headers.authorization).toBe('[REDACTED]');
  });

  it('integrations 에 browserTracing + replay 포함', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    await import('../../sentry.client.config');
    const Sentry = await import('@sentry/nextjs');
    const call = vi.mocked(Sentry.init).mock.calls[0]?.[0];
    const integrations = call?.integrations as Array<{ name: string }>;
    expect(integrations.map((i) => i.name)).toEqual(
      expect.arrayContaining(['browserTracing', 'replay']),
    );
  });

  it('replayIntegration maskAllText true + blockAllMedia true', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    await import('../../sentry.client.config');
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.replayIntegration)).toHaveBeenCalledWith({
      maskAllText: true,
      blockAllMedia: true,
    });
  });

  it('DSN 미설정 → init skip', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
    await import('../../sentry.client.config');
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).not.toHaveBeenCalled();
  });
});
