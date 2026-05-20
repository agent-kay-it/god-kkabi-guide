/**
 * lib/firebase/admin.ts — Sprint 25 F25-A 단위 테스트 (smoke + env 검증).
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('firebase-admin/app', () => ({
  cert: vi.fn(() => ({ __cert: true })),
  getApp: vi.fn(),
  getApps: vi.fn(() => []),
  initializeApp: vi.fn((opts: unknown) => ({ name: 'admin', options: opts })),
}));
vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    createCustomToken: vi.fn(() => Promise.resolve('custom-token-abc')),
    setCustomUserClaims: vi.fn(() => Promise.resolve()),
  })),
}));
vi.mock('firebase-admin/database', () => ({
  getDatabase: vi.fn(() => ({ ref: vi.fn() })),
}));
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({ collection: vi.fn() })),
}));

import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import {
  hasAdminCredentials,
  isAdminEmulator,
  getAdminAuth,
  createFirebaseCustomToken,
  setUserClaims,
} from './admin';

const mockedGetApps = vi.mocked(getApps);
const mockedInitializeApp = vi.mocked(initializeApp);
const mockedGetAuth = vi.mocked(getAuth);

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isAdminEmulator', () => {
  it('FIREBASE_USE_EMULATOR=true → true', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
    expect(isAdminEmulator()).toBe(true);
  });

  it('미설정 → false', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', '');
    expect(isAdminEmulator()).toBe(false);
  });

  it('false 문자열 → false', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'false');
    expect(isAdminEmulator()).toBe(false);
  });
});

describe('hasAdminCredentials', () => {
  it('FIREBASE_SERVICE_ACCOUNT_JSON 있음 → true', () => {
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT_JSON', '{}');
    expect(hasAdminCredentials()).toBe(true);
  });

  it('emulator 모드 → true (service account 불필요)', () => {
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT_JSON', '');
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
    expect(hasAdminCredentials()).toBe(true);
  });

  it('둘 다 없음 → false', () => {
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT_JSON', '');
    vi.stubEnv('FIREBASE_USE_EMULATOR', '');
    expect(hasAdminCredentials()).toBe(false);
  });
});

describe('getAdminAuth / Firestore / Database', () => {
  it('emulator 모드 — dummy project 로 init', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
    mockedGetApps.mockReturnValue([]);
    getAdminAuth();
    const calledConfig = mockedInitializeApp.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(calledConfig.projectId).toBe('demo-kkaebizigi-test');
  });

  it('emulator 모드 — FIRESTORE_EMULATOR_HOST 자동 설정', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
    delete process.env.FIRESTORE_EMULATOR_HOST;
    mockedGetApps.mockReturnValue([]);
    getAdminAuth();
    expect(process.env.FIRESTORE_EMULATOR_HOST).toBe('localhost:8080');
  });

  it('emulator 모드 — 다른 emulator host 들 자동 설정', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    delete process.env.STORAGE_EMULATOR_HOST;
    delete process.env.FIREBASE_DATABASE_EMULATOR_HOST;
    mockedGetApps.mockReturnValue([]);
    getAdminAuth();
    expect(process.env.FIREBASE_AUTH_EMULATOR_HOST).toBe('localhost:9099');
    expect(process.env.STORAGE_EMULATOR_HOST).toBe('http://localhost:9199');
    expect(process.env.FIREBASE_DATABASE_EMULATOR_HOST).toBe('localhost:9000');
  });

  it('production 모드 — SERVICE_ACCOUNT_JSON 없음 → throw', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'false');
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT_JSON', '');
    mockedGetApps.mockReturnValue([]);
    expect(() => getAdminAuth()).toThrow(/FIREBASE_SERVICE_ACCOUNT_JSON/);
  });

  it('production 모드 + base64 SERVICE_ACCOUNT_JSON 처리', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'false');
    const sa = {
      project_id: 'real-proj',
      client_email: 'admin@x.com',
      private_key: 'KEY',
    };
    const base64 = Buffer.from(JSON.stringify(sa), 'utf8').toString('base64');
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT_JSON', base64);
    mockedGetApps.mockReturnValue([]);
    getAdminAuth();
    // initializeApp 호출됨
    expect(mockedInitializeApp).toHaveBeenCalled();
  });

  it('production 모드 + JSON SERVICE_ACCOUNT_JSON 처리', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'false');
    const sa = {
      project_id: 'real-proj',
      client_email: 'admin@x.com',
      private_key: 'KEY\\nLINE2',
    };
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT_JSON', JSON.stringify(sa));
    mockedGetApps.mockReturnValue([]);
    getAdminAuth();
    expect(mockedInitializeApp).toHaveBeenCalled();
  });

  it('SERVICE_ACCOUNT_JSON 필드 누락 → throw', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'false');
    vi.stubEnv(
      'FIREBASE_SERVICE_ACCOUNT_JSON',
      JSON.stringify({ project_id: 'p' }),
    );
    mockedGetApps.mockReturnValue([]);
    expect(() => getAdminAuth()).toThrow(/누락/);
  });

  it('이미 init 됐으면 재사용 — initializeApp 호출 안 함', () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
    mockedGetApps.mockReturnValue([{ name: 'admin' } as never]);
    getAdminAuth();
    expect(mockedInitializeApp).not.toHaveBeenCalled();
  });
});

describe('createFirebaseCustomToken', () => {
  it('uid + optional claims 로 token 생성', async () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
    mockedGetApps.mockReturnValue([]);
    const r = await createFirebaseCustomToken('u1', { role: 'user' });
    expect(r).toBe('custom-token-abc');
  });
});

describe('setUserClaims', () => {
  it('role + claims set 성공', async () => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
    mockedGetApps.mockReturnValue([]);
    const setCustomUserClaims = vi.fn(() => Promise.resolve());
    mockedGetAuth.mockReturnValue({
      createCustomToken: vi.fn(),
      setCustomUserClaims,
    } as never);
    await setUserClaims('u1', { role: 'banned', bannedReason: '욕설' });
    expect(setCustomUserClaims).toHaveBeenCalledWith('u1', {
      role: 'banned',
      bannedReason: '욕설',
    });
  });
});
