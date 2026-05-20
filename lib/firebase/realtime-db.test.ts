/**
 * lib/firebase/realtime-db.ts — Sprint 22 F22-A.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn((_app: unknown, url?: string) => ({ url })),
}));
const mockIsEmulator = vi.fn(() => false);
vi.mock('./client', () => ({
  getFirebaseApp: vi.fn(() => ({ name: 'app' })),
  isFirebaseEmulator: () => mockIsEmulator(),
}));

import { getDatabase } from 'firebase/database';
import { getRealtimeDB, hasRealtimeDB } from './realtime-db';

const mockedGetDatabase = vi.mocked(getDatabase);

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  mockIsEmulator.mockReturnValue(false);
});

describe('getRealtimeDB', () => {
  it('NEXT_PUBLIC_FIREBASE_DATABASE_URL 우선 사용', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', 'https://custom.example.com');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'proj-id');
    getRealtimeDB();
    expect(mockedGetDatabase).toHaveBeenCalledWith(
      { name: 'app' },
      'https://custom.example.com',
    );
  });

  it('NEXT_PUBLIC_FIREBASE_DATABASE_URL = "" 일 때 그대로 빈 문자열 사용 (?? 는 nullish 만)', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'proj-id');
    getRealtimeDB();
    const calledUrl = mockedGetDatabase.mock.calls[0]?.[1];
    // ?? 연산자는 null/undefined 만 fallback 적용. '' 는 그대로 사용됨.
    expect(calledUrl).toBe('');
  });

  // Sprint 28 F28-B — emulator 모드 분기 회귀 방지
  it('emulator 모드 — getDatabase(app) 만 호출 (URL 두번째 인자 생략)', () => {
    mockIsEmulator.mockReturnValue(true);
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', '');
    getRealtimeDB();
    expect(mockedGetDatabase).toHaveBeenCalledWith({ name: 'app' });
    // 두번째 인자 (URL) 가 전달되지 않아 app config 의 emulator databaseURL 사용
    expect(mockedGetDatabase.mock.calls[0]?.[1]).toBeUndefined();
  });

  it('emulator 모드는 env 무시 — DATABASE_URL 이 있어도 app config 사용', () => {
    mockIsEmulator.mockReturnValue(true);
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', 'https://should-be-ignored.example');
    getRealtimeDB();
    expect(mockedGetDatabase.mock.calls[0]?.[1]).toBeUndefined();
  });
});

describe('hasRealtimeDB', () => {
  it('NEXT_PUBLIC_FIREBASE_DATABASE_URL 있으면 true', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', 'https://x');
    expect(hasRealtimeDB()).toBe(true);
  });

  it('NEXT_PUBLIC_FIREBASE_PROJECT_ID 있으면 true', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'p');
    expect(hasRealtimeDB()).toBe(true);
  });

  it('둘 다 없으면 false', () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', '');
    expect(hasRealtimeDB()).toBe(false);
  });

  // Sprint 28 F28-B
  it('emulator 모드 — env 없어도 true (항상 사용 가능)', () => {
    mockIsEmulator.mockReturnValue(true);
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', '');
    expect(hasRealtimeDB()).toBe(true);
  });
});
