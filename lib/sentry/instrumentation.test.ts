/**
 * instrumentation.ts (root) + sentry config 통합 검증 — Sprint 26 F26-A.
 * Next.js 16 instrumentation hook 의 register() 가 runtime 별로 올바른 sentry config
 * 를 import 하는지 검증.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureRequestError: vi.fn(),
  consoleIntegration: vi.fn(() => ({ name: 'console' })),
  httpIntegration: vi.fn(() => ({ name: 'http' })),
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

describe('instrumentation.ts register()', () => {
  it('NEXT_RUNTIME=nodejs → sentry.server.config import', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    const { register } = await import('../../instrumentation');
    await register();
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).toHaveBeenCalled();
  });

  it('NEXT_RUNTIME=edge → sentry.edge.config import', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'edge');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    const { register } = await import('../../instrumentation');
    await register();
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).toHaveBeenCalled();
  });

  it('DSN 미설정 → graceful skip (Sentry.init 호출 안됨)', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
    const { register } = await import('../../instrumentation');
    await register();
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).not.toHaveBeenCalled();
  });

  it('onRequestError export = Sentry.captureRequestError', async () => {
    const mod = await import('../../instrumentation');
    const Sentry = await import('@sentry/nextjs');
    expect(mod.onRequestError).toBe(Sentry.captureRequestError);
  });
});

describe('sentry.server.config.ts', () => {
  it('production 환경에서 tracesSampleRate 0.1 적용', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    vi.stubEnv('SENTRY_ENVIRONMENT', 'production');
    await import('../../sentry.server.config');
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: 'production',
        tracesSampleRate: 0.1,
        sendDefaultPii: false,
      }),
    );
  });

  it('preview / development 환경에서 tracesSampleRate 1.0 적용', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    vi.stubEnv('SENTRY_ENVIRONMENT', 'preview');
    await import('../../sentry.server.config');
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: 'preview',
        tracesSampleRate: 1.0,
      }),
    );
  });

  it('beforeSend hook — PII 마스킹 (cookie/authorization/uid/email)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    vi.stubEnv('SENTRY_ENVIRONMENT', 'production');
    await import('../../sentry.server.config');
    const Sentry = await import('@sentry/nextjs');
    const call = vi.mocked(Sentry.init).mock.calls[0]?.[0];
    const beforeSend = call?.beforeSend as (e: unknown) => unknown;
    const event = {
      request: {
        cookies: { session: 'abc' },
        headers: { cookie: 'session=abc', authorization: 'Bearer xyz' },
        data: '{"uid":"user-1","email":"a@b.com","payload":"safe"}',
      },
      user: { id: 'user-1', email: 'a@b.com' },
    };
    const r = beforeSend({ ...event }) as typeof event;
    expect(r.request.cookies).toEqual({ masked: '[REDACTED]' });
    expect(r.request.headers.cookie).toBe('[REDACTED]');
    expect(r.request.headers.authorization).toBe('[REDACTED]');
    expect(r.request.data).toContain('[REDACTED]');
    expect(r.request.data).toContain('"payload":"safe"');
    expect(r.user.id).toBe('[REDACTED]');
    expect(r.user.email).toBe('[REDACTED]');
  });

  it('DSN 미설정 → init skip', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
    await import('../../sentry.server.config');
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).not.toHaveBeenCalled();
  });
});

describe('sentry.edge.config.ts', () => {
  it('production 에서 0.05 tracesSampleRate (edge 보수적)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://x@sentry.io/1');
    vi.stubEnv('SENTRY_ENVIRONMENT', 'production');
    await import('../../sentry.edge.config');
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: 'production',
        tracesSampleRate: 0.05,
      }),
    );
  });

  it('DSN 미설정 → init skip', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
    await import('../../sentry.edge.config');
    const Sentry = await import('@sentry/nextjs');
    expect(vi.mocked(Sentry.init)).not.toHaveBeenCalled();
  });
});
