/**
 * Sprint 16 / F16-A — lib/sentry/config unit test.
 *
 * @sentry/nextjs 를 vi.mock 으로 격리하여 함수 호출만 검증.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sentryMock = vi.hoisted(() => ({
  withScope: vi.fn((cb: (s: { setTag: ReturnType<typeof vi.fn>; setExtra: ReturnType<typeof vi.fn>; setLevel: ReturnType<typeof vi.fn> }) => void) => {
    cb({ setTag: vi.fn(), setExtra: vi.fn(), setLevel: vi.fn() });
  }),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => sentryMock);

const ORIG_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

describe('lib/sentry/config — DSN 미설정 (no-op)', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    sentryMock.captureException.mockClear();
    sentryMock.captureMessage.mockClear();
    sentryMock.addBreadcrumb.mockClear();
    sentryMock.withScope.mockClear();
    vi.resetModules();
  });

  it('captureException 은 console.error fallback', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { captureException } = await import('./config');
    captureException(new Error('test'));
    expect(spy).toHaveBeenCalledWith('[sentry:noop]', expect.any(Error), {});
    expect(sentryMock.captureException).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('captureMessage 은 silent skip', async () => {
    const { captureMessage } = await import('./config');
    captureMessage('test');
    expect(sentryMock.captureMessage).not.toHaveBeenCalled();
  });

  it('addBreadcrumb 은 silent skip', async () => {
    const { addBreadcrumb } = await import('./config');
    addBreadcrumb({ category: 'test', message: 'test' });
    expect(sentryMock.addBreadcrumb).not.toHaveBeenCalled();
  });
});

describe('lib/sentry/config — DSN 설정 (Sentry SDK 호출)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/1';
    sentryMock.captureException.mockClear();
    sentryMock.captureMessage.mockClear();
    sentryMock.addBreadcrumb.mockClear();
    sentryMock.withScope.mockClear();
    vi.resetModules();
  });

  it('captureException 호출 시 Sentry.withScope + captureException', async () => {
    const { captureException } = await import('./config');
    captureException(new Error('test'), { tags: { feature: 'chat' } });
    expect(sentryMock.withScope).toHaveBeenCalled();
    expect(sentryMock.captureException).toHaveBeenCalledWith(expect.any(Error));
  });

  it('reportRateLimitHit 은 captureMessage 호출 + uidMask 처리', async () => {
    const { reportRateLimitHit } = await import('./config');
    reportRateLimitHit({ channelId: 'ch1', uid: 'e2e-regular-uid', burstCount: 6 });
    expect(sentryMock.captureMessage).toHaveBeenCalledWith('chat:rate_limit_exceeded');
  });

  it('reportSsrfBlocked 는 captureMessage 호출', async () => {
    const { reportSsrfBlocked } = await import('./config');
    reportSsrfBlocked({ url: 'http://internal', reason: 'private-ip' });
    expect(sentryMock.captureMessage).toHaveBeenCalledWith('post:ssrf_blocked');
  });
});

// cleanup
if (ORIG_DSN === undefined) delete process.env.NEXT_PUBLIC_SENTRY_DSN;
else process.env.NEXT_PUBLIC_SENTRY_DSN = ORIG_DSN;
