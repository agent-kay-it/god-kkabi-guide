/**
 * lib/subscription/actions.ts — Server Actions 단위 테스트.
 * Sprint 20 F20-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
    delete: vi.fn(() => ({ __fv: 'delete' })),
  },
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('@/lib/firebase/claims-retry-queue', () => ({
  setUserClaimsWithRetry: vi.fn(() => Promise.resolve()),
}));
vi.mock('./toss-client', () => ({
  tossConfirmPayment: vi.fn(),
}));

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { tossConfirmPayment } from './toss-client';
import {
  confirmSubscription,
  cancelSubscription,
  getActiveSubscription,
} from './actions';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedToss = vi.mocked(tossConfirmPayment);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

function session(uid = 'u1', role: 'user' | 'admin' | 'banned' = 'user') {
  return { user: { id: uid, registered: true, role, nickname: 'k' } };
}

const validInput = {
  orderId: 'order-1',
  paymentKey: 'pk-1',
  amount: 4900,
};

describe('confirmSubscription — guards', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const r = await confirmSubscription(validInput);
    expect(r).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('NOT_REGISTERED', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: false },
    } as never);
    const r = await confirmSubscription(validInput);
    expect(r).toMatchObject({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('BANNED', async () => {
    mockedAuth.mockResolvedValue(session('u1', 'banned') as never);
    const r = await confirmSubscription(validInput);
    expect(r).toMatchObject({ ok: false, error: 'BANNED' });
  });

  it('ADMIN_NOT_CONFIGURED', async () => {
    mockedAuth.mockResolvedValue(session() as never);
    mockedHasAdmin.mockReturnValue(false);
    const r = await confirmSubscription(validInput);
    expect(r).toMatchObject({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });

  it('AMOUNT_MISMATCH — amount != 4900', async () => {
    mockedAuth.mockResolvedValue(session() as never);
    const r = await confirmSubscription({ ...validInput, amount: 9900 });
    expect(r).toMatchObject({ ok: false, error: 'AMOUNT_MISMATCH' });
  });
});

describe('confirmSubscription — fast-path 멱등성', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(session() as never);
  });

  it('이미 처리된 orderId → fast-path return', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({
                status: 'completed',
                subscriptionId: 'sub-existing',
                uid: 'u1',
              }),
            }),
          ),
        })),
      })),
    } as never);

    const r = await confirmSubscription(validInput);
    expect(r).toMatchObject({ ok: true, subscriptionId: 'sub-existing' });
    expect(mockedToss).not.toHaveBeenCalled(); // Toss API 재호출 없음
  });
});

describe('confirmSubscription — Toss 실패', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(session() as never);
    // fast-path miss
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
        })),
      })),
    } as never);
  });

  it('Toss API throw → TOSS_CONFIRM_FAILED', async () => {
    mockedToss.mockRejectedValue(new Error('network'));
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await confirmSubscription(validInput);
    expect(r).toMatchObject({
      ok: false,
      error: 'TOSS_CONFIRM_FAILED',
      message: 'network',
    });
    consoleErr.mockRestore();
  });

  it('Toss status != DONE → TOSS_CONFIRM_FAILED', async () => {
    mockedToss.mockResolvedValue({ status: 'CANCELED' } as never);
    const r = await confirmSubscription(validInput);
    expect(r).toMatchObject({ ok: false, error: 'TOSS_CONFIRM_FAILED' });
  });
});

describe('confirmSubscription — happy', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(session() as never);
    mockedToss.mockResolvedValue({ status: 'DONE', method: 'CARD' } as never);
  });

  it('정상 결제 → subscription 생성 + claim 변경 + revalidate', async () => {
    const subRef = { id: 'sub-new' };
    const histRef = {
      get: vi.fn(() => Promise.resolve({ exists: false })),
    };
    const subscriptionsColl = {
      doc: vi.fn(() => subRef),
      where: vi.fn(function (this: unknown) {
        return this;
      }),
      limit: vi.fn(function (this: unknown) {
        return this;
      }),
    };
    const tx = {
      get: vi
        .fn()
        // 0) histSnap (멱등성 체크) — 미존재
        .mockResolvedValueOnce({ exists: false })
        // 1) existingSnap (active 구독 체크) — empty
        .mockResolvedValueOnce({ empty: true }),
      set: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'payment_history') {
          return {
            doc: vi.fn(() => histRef),
          };
        }
        if (name === 'subscriptions') return subscriptionsColl;
        if (name === 'users') {
          return { doc: vi.fn(() => ({})) };
        }
        return {};
      }),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const r = await confirmSubscription(validInput);
    expect(r).toMatchObject({ ok: true, subscriptionId: 'sub-new' });
    expect(tx.set).toHaveBeenCalledTimes(3); // sub + hist + user.tier
  });

  it('ALREADY_ACTIVE → 같은 user 이미 active', async () => {
    const histRef = {
      get: vi.fn(() => Promise.resolve({ exists: false })),
    };
    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ exists: false })
        .mockResolvedValueOnce({ empty: false }),
      set: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'payment_history') return { doc: vi.fn(() => histRef) };
        if (name === 'subscriptions') {
          return {
            doc: vi.fn(() => ({ id: 'sub-x' })),
            where: vi.fn(function (this: unknown) {
              return this;
            }),
            limit: vi.fn(function (this: unknown) {
              return this;
            }),
          };
        }
        return { doc: vi.fn(() => ({})) };
      }),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const r = await confirmSubscription(validInput);
    expect(r).toMatchObject({ ok: false, error: 'ALREADY_ACTIVE' });
  });
});

describe('cancelSubscription', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const r = await cancelSubscription();
    expect(r).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('NOT_FOUND — active 구독 없음', async () => {
    mockedAuth.mockResolvedValue(session() as never);
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
      })),
    } as never);
    const r = await cancelSubscription();
    expect(r).toMatchObject({ ok: false, error: 'NOT_FOUND' });
  });

  it('happy: status canceled', async () => {
    mockedAuth.mockResolvedValue(session() as never);
    const updateMock = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            empty: false,
            docs: [{ ref: { id: 'sub-1', update: updateMock } }],
          }),
        ),
      })),
    } as never);
    const r = await cancelSubscription();
    expect(r).toMatchObject({ ok: true, subscriptionId: 'sub-1' });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'canceled' }),
    );
  });
});

describe('getActiveSubscription', () => {
  it('null — 로그인 안 함', async () => {
    mockedAuth.mockResolvedValue(null as never);
    expect(await getActiveSubscription()).toBeNull();
  });

  it('null — admin creds 없음', async () => {
    mockedAuth.mockResolvedValue(session() as never);
    mockedHasAdmin.mockReturnValue(false);
    expect(await getActiveSubscription()).toBeNull();
  });

  it('null — 구독 없음', async () => {
    mockedAuth.mockResolvedValue(session() as never);
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
        get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
      })),
    } as never);
    expect(await getActiveSubscription()).toBeNull();
  });

  it('happy: 최근 구독 doc 반환', async () => {
    mockedAuth.mockResolvedValue(session() as never);
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
            empty: false,
            docs: [
              {
                data: () => ({
                  id: 'sub-1',
                  uid: 'u1',
                  plan: 'premium_monthly',
                  status: 'active',
                }),
              },
            ],
          }),
        ),
      })),
    } as never);
    const r = await getActiveSubscription();
    expect(r).toMatchObject({ id: 'sub-1', status: 'active' });
  });
});
