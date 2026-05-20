/**
 * lib/firebase/client.ts — Sprint 24 F24-B 단위 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/app', () => ({
  getApp: vi.fn(),
  getApps: vi.fn(() => []),
  initializeApp: vi.fn<(opts: Record<string, unknown>) => { name: string; options: unknown }>(
    (opts) => ({ name: 'app', options: opts }),
  ),
}));

import { getApps, getApp, initializeApp } from 'firebase/app';
import { isFirebaseEmulator, getFirebaseApp } from './client';

const mockedGetApps = vi.mocked(getApps);
const mockedGetApp = vi.mocked(getApp);
const mockedInitializeApp = vi.mocked(initializeApp);

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('isFirebaseEmulator', () => {
  it('NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true → true', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_USE_EMULATOR', 'true');
    expect(isFirebaseEmulator()).toBe(true);
  });

  it('미설정 → false', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_USE_EMULATOR', '');
    expect(isFirebaseEmulator()).toBe(false);
  });

  it('false 문자열 → false', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_USE_EMULATOR', 'false');
    expect(isFirebaseEmulator()).toBe(false);
  });
});

describe('getFirebaseApp', () => {
  it('기존 app 존재 시 getApp() 반환', () => {
    mockedGetApps.mockReturnValue([{ name: 'existing' } as never]);
    mockedGetApp.mockReturnValue({ name: 'existing' } as never);
    const r = getFirebaseApp();
    expect(r.name).toBe('existing');
    expect(mockedInitializeApp).not.toHaveBeenCalled();
  });

  it('emulator 모드 — demo config 사용', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_USE_EMULATOR', 'true');
    mockedGetApps.mockReturnValue([]);
    getFirebaseApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calledConfig = (mockedInitializeApp.mock.calls[0] as any)?.[0];
    expect(calledConfig).toMatchObject({
      projectId: 'demo-kkaebizigi-test',
      apiKey: 'demo-api-key',
    });
  });

  it('production 모드 + env 누락 → throw', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_USE_EMULATOR', 'false');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', '');
    mockedGetApps.mockReturnValue([]);
    expect(() => getFirebaseApp()).toThrow(/Firebase config missing/);
  });

  it('production 모드 + 모든 env 설정 → config 사용', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_USE_EMULATOR', 'false');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'real-key');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'real.firebaseapp.com');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'real-proj');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'real-bucket');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', '1234567890');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_APP_ID', '1:1234:web:abc');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', 'G-XXX');
    mockedGetApps.mockReturnValue([]);
    getFirebaseApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calledConfig = (mockedInitializeApp.mock.calls[0] as any)?.[0];
    expect(calledConfig).toMatchObject({
      apiKey: 'real-key',
      projectId: 'real-proj',
    });
  });
});
