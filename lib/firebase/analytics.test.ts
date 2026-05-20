/**
 * lib/firebase/analytics.ts — Sprint 25 F25-A 단위 테스트.
 * getAnalyticsClient + logEvent + setAnalyticsConsent + Firestore backup branch.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockIsSupported = vi.fn();
const mockGetAnalytics = vi.fn();
const mockLogEvent = vi.fn();
const mockSetUserProperties = vi.fn();
const mockAddDoc = vi.fn(() => Promise.resolve());
const mockCollection = vi.fn(() => ({ __collection: 'events' }));
const mockServerTimestamp = vi.fn(() => '__ts__');
const mockGetFirestoreClient = vi.fn(() => ({ __db: true }));

vi.mock('firebase/analytics', () => ({
  getAnalytics: (...args: never[]) => (mockGetAnalytics as (...a: never[]) => unknown)(...args),
  isSupported: (...args: never[]) => (mockIsSupported as (...a: never[]) => unknown)(...args),
  logEvent: (...args: never[]) => (mockLogEvent as (...a: never[]) => unknown)(...args),
  setUserProperties: (...args: never[]) =>
    (mockSetUserProperties as (...a: never[]) => unknown)(...args),
}));

vi.mock('./client', () => ({
  getFirebaseApp: vi.fn(() => ({ __app: 'firebase' })),
}));

vi.mock('firebase/firestore', () => ({
  addDoc: (...args: never[]) => (mockAddDoc as (...a: never[]) => unknown)(...args),
  collection: (...args: never[]) => (mockCollection as (...a: never[]) => unknown)(...args),
  serverTimestamp: (...args: never[]) =>
    (mockServerTimestamp as (...a: never[]) => unknown)(...args),
}));

vi.mock('./firestore', () => ({
  getFirestoreClient: (...args: never[]) =>
    (mockGetFirestoreClient as (...a: never[]) => unknown)(...args),
}));

// Reset module cache so analyticsInstance singleton state is per-test.
async function importFresh() {
  vi.resetModules();
  return await import('./analytics');
}

beforeEach(() => {
  mockIsSupported.mockReset();
  mockGetAnalytics.mockReset();
  mockLogEvent.mockReset();
  mockSetUserProperties.mockReset();
  mockAddDoc.mockClear();
  mockCollection.mockClear();
  mockServerTimestamp.mockClear();
  mockGetFirestoreClient.mockClear();

  mockIsSupported.mockResolvedValue(true);
  mockGetAnalytics.mockReturnValue({ __analytics: true });
  // sessionStorage 초기화
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getAnalyticsClient', () => {
  it('supported 면 Analytics 인스턴스 반환', async () => {
    const mod = await importFresh();
    const r = await mod.getAnalyticsClient();
    expect(r).toBeTruthy();
    expect(mockIsSupported).toHaveBeenCalledOnce();
  });

  it('unsupported 면 null', async () => {
    mockIsSupported.mockResolvedValue(false);
    const mod = await importFresh();
    const r = await mod.getAnalyticsClient();
    expect(r).toBeNull();
  });

  it('두번 호출해도 isSupported 한번만 — 캐싱', async () => {
    const mod = await importFresh();
    await mod.getAnalyticsClient();
    await mod.getAnalyticsClient();
    expect(mockIsSupported).toHaveBeenCalledTimes(1);
  });

  it('동시에 호출돼도 initPromise 공유 — race 보호', async () => {
    const mod = await importFresh();
    const [a, b] = await Promise.all([
      mod.getAnalyticsClient(),
      mod.getAnalyticsClient(),
    ]);
    expect(a).toBe(b);
    expect(mockIsSupported).toHaveBeenCalledTimes(1);
  });
});

describe('logEvent', () => {
  it('analytics 활성 시 fbLogEvent 호출', async () => {
    const mod = await importFresh();
    await mod.logEvent('page_view', { page_title: 'home' });
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.anything(),
      'page_view',
      { page_title: 'home' },
    );
  });

  it('analytics 비활성(unsupported) — fbLogEvent skip', async () => {
    mockIsSupported.mockResolvedValue(false);
    const mod = await importFresh();
    await mod.logEvent('page_view');
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it('core backup event — Firestore addDoc 호출', async () => {
    const mod = await importFresh();
    await mod.logEvent('coupon_copy', { code: 'X' });
    // backup 은 fire-and-forget + dynamic import 이므로 충분히 대기
    for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 0));
    expect(mockAddDoc).toHaveBeenCalled();
    const callArgs = (mockAddDoc.mock.calls[0] as unknown[])[1] as Record<string, unknown>;
    expect(callArgs.event_name).toBe('coupon_copy');
    expect(typeof callArgs.session_id).toBe('string');
  });

  it('non-backup event — Firestore addDoc 호출 안 함', async () => {
    const mod = await importFresh();
    await mod.logEvent('page_view');
    await Promise.resolve();
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('Firestore backup 실패해도 throw 안 함', async () => {
    mockAddDoc.mockRejectedValueOnce(new Error('boom'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await importFresh();
    await expect(mod.logEvent('coupon_copy')).resolves.toBeUndefined();
    await Promise.resolve();
    await Promise.resolve();
    warnSpy.mockRestore();
  });
});

describe('setAnalyticsConsent', () => {
  it('granted', async () => {
    const mod = await importFresh();
    await mod.setAnalyticsConsent({ analytics: true });
    expect(mockSetUserProperties).toHaveBeenCalledWith(
      expect.anything(),
      { consent_analytics: 'granted' },
    );
  });

  it('denied', async () => {
    const mod = await importFresh();
    await mod.setAnalyticsConsent({ analytics: false });
    expect(mockSetUserProperties).toHaveBeenCalledWith(
      expect.anything(),
      { consent_analytics: 'denied' },
    );
  });

  it('analytics 비활성 시 setUserProperties skip', async () => {
    mockIsSupported.mockResolvedValue(false);
    const mod = await importFresh();
    await mod.setAnalyticsConsent({ analytics: true });
    expect(mockSetUserProperties).not.toHaveBeenCalled();
  });
});

describe('session id 처리', () => {
  async function flushMicrotasks() {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  it('첫 호출 시 randomUUID 생성 + sessionStorage 저장', async () => {
    const cryptoStub = { randomUUID: vi.fn(() => 'uuid-1') };
    vi.stubGlobal('crypto', cryptoStub);
    const mod = await importFresh();
    await mod.logEvent('coupon_copy');
    await flushMicrotasks();
    expect(window.sessionStorage.getItem('gkg_session_id')).toBe('uuid-1');
  });

  it('이미 저장된 세션 ID 재사용', async () => {
    window.sessionStorage.setItem('gkg_session_id', 'existing-id');
    const mod = await importFresh();
    await mod.logEvent('coupon_copy');
    await flushMicrotasks();
    const callArgs = (mockAddDoc.mock.calls[0] as unknown[])[1] as Record<string, unknown>;
    expect(callArgs.session_id).toBe('existing-id');
  });
});
