/**
 * vitest — Sprint 11 Phase B upload-rate-limit unit tests.
 * 출처: docs/sprint/11-sprint-images/design.md §14.1 (`upload-rate-limit.test.ts`)
 *
 * 4 cases (Firestore admin mocked via in-memory store):
 *  1. 첫 호출 통과 → count=1
 *  2. 분당 10회 통과 / 11번째 거부
 *  3. 시간당 50회 통과 / 51번째 거부
 *  4. 분 윈도 만료 후 다시 통과
 *  5. uid 빈 문자열 → 거부
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  enforceUploadRateLimit,
  RATE_LIMIT_PER_HOUR,
  RATE_LIMIT_PER_MINUTE,
} from '../upload-rate-limit';

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' },
}));

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => makeFakeFirestore(),
}));

interface FakeDoc {
  data: () => Record<string, unknown> | undefined;
}

function makeFakeFirestore() {
  const store = new Map<string, Record<string, unknown>>();
  const db = {
    collection(_name: string) {
      return {
        doc(uid: string) {
          return {
            uid,
            get() {
              return Promise.resolve({
                data: () => store.get(uid),
              } as FakeDoc);
            },
          };
        },
      };
    },
    runTransaction<T>(fn: (tx: FakeTx) => Promise<T>): Promise<T> {
      const tx: FakeTx = {
        async get(ref) {
          return { data: () => store.get(ref.uid) } as FakeDoc;
        },
        set(ref, data, options) {
          const prev = options?.merge ? store.get(ref.uid) ?? {} : {};
          store.set(ref.uid, { ...prev, ...data });
        },
      };
      return fn(tx);
    },
  };
  return db;
}

interface FakeRef {
  uid: string;
}
interface FakeTx {
  get(ref: FakeRef): Promise<FakeDoc>;
  set(ref: FakeRef, data: Record<string, unknown>, options?: { merge?: boolean }): void;
}

describe('enforceUploadRateLimit', () => {
  let now: number;
  let dbInstance: ReturnType<typeof makeFakeFirestore>;

  beforeEach(() => {
    now = 1_700_000_000_000;
    dbInstance = makeFakeFirestore();
  });

  it('rejects empty uid', async () => {
    const result = await enforceUploadRateLimit('', now, dbInstance as never);
    expect(result.ok).toBe(false);
  });

  it('allows first call (count=1)', async () => {
    const result = await enforceUploadRateLimit('u1', now, dbInstance as never);
    expect(result.ok).toBe(true);
  });

  it('allows up to RATE_LIMIT_PER_MINUTE then rejects', async () => {
    for (let i = 0; i < RATE_LIMIT_PER_MINUTE; i++) {
      const r = await enforceUploadRateLimit('u1', now, dbInstance as never);
      expect(r.ok).toBe(true);
    }
    const denied = await enforceUploadRateLimit('u1', now, dbInstance as never);
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.reason).toBe('minute');
      expect(denied.retryAfterMs).toBeGreaterThan(0);
      expect(denied.retryAfterMs).toBeLessThanOrEqual(60_000);
    }
  });

  it('resets minute window after 61s', async () => {
    for (let i = 0; i < RATE_LIMIT_PER_MINUTE; i++) {
      await enforceUploadRateLimit('u1', now, dbInstance as never);
    }
    const denied = await enforceUploadRateLimit('u1', now, dbInstance as never);
    expect(denied.ok).toBe(false);

    const future = now + 61_000;
    const allowed = await enforceUploadRateLimit('u1', future, dbInstance as never);
    expect(allowed.ok).toBe(true);
  });

  it('rejects when hourly limit exceeded', async () => {
    // Spread 50 successful calls across 5 separate minute windows to bypass minute limit
    for (let m = 0; m < 5; m++) {
      const winStart = now + m * 61_000;
      for (let i = 0; i < RATE_LIMIT_PER_HOUR / 5; i++) {
        const r = await enforceUploadRateLimit('u1', winStart, dbInstance as never);
        expect(r.ok).toBe(true);
      }
    }
    const denied = await enforceUploadRateLimit(
      'u1',
      now + 5 * 61_000 + 1000,
      dbInstance as never,
    );
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.reason).toBe('hour');
  });
});
