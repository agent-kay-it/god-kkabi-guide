/**
 * lib/firebase/realtime-db.ts — Sprint 22 F22-A.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn((_app: unknown, url: string) => ({ url })),
}));
vi.mock('./client', () => ({
  getFirebaseApp: vi.fn(() => ({ name: 'app' })),
}));

import { getDatabase } from 'firebase/database';
import { getRealtimeDB, hasRealtimeDB } from './realtime-db';

const mockedGetDatabase = vi.mocked(getDatabase);

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
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
});
