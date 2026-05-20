/**
 * lib/firebase/claims-retry-queue.ts — Sprint 21 F21-A 단위 테스트.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
  },
}));
vi.mock('./admin', () => ({
  getAdminAuth: vi.fn(),
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));

import {
  getAdminAuth,
  getAdminFirestore,
  hasAdminCredentials,
} from './admin';
import {
  setUserClaimsWithRetry,
  drainUserClaimsRetryQueue,
} from './claims-retry-queue';

const mockedAuth = vi.mocked(getAdminAuth);
const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('setUserClaimsWithRetry', () => {
  it('primary 성공 → { ok: true } (queued 없음)', async () => {
    const setCustomUserClaims = vi.fn(() => Promise.resolve());
    mockedAuth.mockReturnValue({ setCustomUserClaims } as never);

    const r = await setUserClaimsWithRetry('u1', { role: 'user' });
    expect(r).toEqual({ ok: true });
    expect(setCustomUserClaims).toHaveBeenCalledWith('u1', { role: 'user' });
  });

  it('primary 실패 + admin creds 없음 → ok:true (queue 미사용)', async () => {
    mockedAuth.mockReturnValue({
      setCustomUserClaims: vi.fn(() => Promise.reject(new Error('boom'))),
    } as never);
    mockedHasAdmin.mockReturnValue(false);
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await setUserClaimsWithRetry('u1', { role: 'user' });
    expect(r).toEqual({ ok: true });
    consoleErr.mockRestore();
  });

  it('primary 실패 + queue 성공 → ok:true + queued:true', async () => {
    mockedAuth.mockReturnValue({
      setCustomUserClaims: vi.fn(() => Promise.reject(new Error('boom'))),
    } as never);
    const setMock = vi.fn<(data: Record<string, unknown>) => Promise<void>>(
      () => Promise.resolve(),
    );
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({ id: 'queue-1', set: setMock })),
      })),
    } as never);
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await setUserClaimsWithRetry('u1', { role: 'banned', bannedReason: '욕설' });
    expect(r).toEqual({ ok: true, queued: true });
    const setArg = setMock.mock.calls[0]![0];
    expect(setArg).toMatchObject({
      uid: 'u1',
      claims: { role: 'banned', bannedReason: '욕설' },
      attempts: 0,
      status: 'pending',
      lastError: 'boom',
    });
    consoleErr.mockRestore();
  });

  it('primary 실패 + queue 실패 → ok:true (silent)', async () => {
    mockedAuth.mockReturnValue({
      setCustomUserClaims: vi.fn(() => Promise.reject(new Error('boom'))),
    } as never);
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          set: vi.fn(() => Promise.reject(new Error('enqueue-fail'))),
        })),
      })),
    } as never);
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await setUserClaimsWithRetry('u1', { role: 'user' });
    expect(r).toEqual({ ok: true });
    consoleErr.mockRestore();
  });
});

describe('drainUserClaimsRetryQueue', () => {
  function buildDoc(opts: {
    id: string;
    uid: string;
    claims: { role: 'user' | 'admin' | 'banned' };
    attempts?: number;
    updateMock?: ReturnType<typeof vi.fn>;
    deleteMock?: ReturnType<typeof vi.fn>;
  }) {
    return {
      id: opts.id,
      data: () => ({
        id: opts.id,
        uid: opts.uid,
        claims: opts.claims,
        attempts: opts.attempts ?? 0,
        status: 'pending',
      }),
      ref: {
        update: opts.updateMock ?? vi.fn(() => Promise.resolve()),
        delete: opts.deleteMock ?? vi.fn(() => Promise.resolve()),
      },
    };
  }

  it('admin creds 없으면 zero 결과', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await drainUserClaimsRetryQueue();
    expect(r).toEqual({ processed: 0, succeeded: 0, failed: 0, exhausted: 0 });
  });

  it('drain 1 성공 + 1 실패 + 1 exhausted', async () => {
    const setCustom = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('iam'))
      .mockRejectedValueOnce(new Error('iam-exhausted'));
    mockedAuth.mockReturnValue({ setCustomUserClaims: setCustom } as never);

    const doc1 = buildDoc({ id: 'q1', uid: 'u1', claims: { role: 'user' } });
    const doc2 = buildDoc({ id: 'q2', uid: 'u2', claims: { role: 'user' } });
    const doc3 = buildDoc({
      id: 'q3',
      uid: 'u3',
      claims: { role: 'banned' },
      attempts: 4, // 다음 시도 5 → exhausted
    });

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            size: 3,
            docs: [doc1, doc2, doc3],
          }),
        ),
      })),
    } as never);

    const r = await drainUserClaimsRetryQueue();
    expect(r).toEqual({
      processed: 3,
      succeeded: 1,
      failed: 1,
      exhausted: 1,
    });
    // doc1 succeeded → delete
    expect(doc1.ref.delete).toHaveBeenCalled();
    // doc2 failed (attempts < 5) → update with attempts:1 (status 키 자체 없음)
    const doc2Update = doc2.ref.update.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(doc2Update.attempts).toBe(1);
    expect('status' in doc2Update).toBe(false);
    // doc3 (attempts:4 + 1 = 5) → exhausted → status='failed'
    expect(doc3.ref.update).toHaveBeenCalledWith(
      expect.objectContaining({ attempts: 5, status: 'failed' }),
    );
  });

  it('빈 queue → zero', async () => {
    mockedAuth.mockReturnValue({ setCustomUserClaims: vi.fn() } as never);
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ size: 0, docs: [] })),
      })),
    } as never);
    const r = await drainUserClaimsRetryQueue();
    expect(r).toEqual({
      processed: 0,
      succeeded: 0,
      failed: 0,
      exhausted: 0,
    });
  });
});
