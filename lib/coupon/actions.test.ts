/**
 * lib/coupon/actions.ts — submitCoupon / verifyCoupon / voteCoupon / list* 단위 테스트.
 * Sprint 19 F19-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    increment: vi.fn((n: number) => ({ __fv: 'increment', n })),
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
  },
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import {
  submitCoupon,
  verifyCoupon,
  voteCoupon,
  listCoupons,
  listPendingCouponsAdmin,
} from './actions';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

const validInput = {
  code: 'GIFT2026',
  title: '신년 선물',
  rewards: '다이아 100개',
  expiresAtMs: Date.now() + 1000 * 60 * 60 * 24,
};

describe('submitCoupon', () => {
  it('UNAUTHENTICATED 시 차단', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await submitCoupon(validInput);
    expect(result).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('NOT_REGISTERED 시 차단', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: false },
    } as never);
    const result = await submitCoupon(validInput);
    expect(result).toMatchObject({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('BANNED role 시 차단', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'banned' },
    } as never);
    const result = await submitCoupon(validInput);
    expect(result).toMatchObject({ ok: false, error: 'BANNED' });
  });

  it('ADMIN_NOT_CONFIGURED 시 차단', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user', nickname: 'k' },
    } as never);
    mockedHasAdmin.mockReturnValue(false);
    const result = await submitCoupon(validInput);
    expect(result).toMatchObject({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });

  it('validation 실패 시 fieldErrors 반환 (code 빈 문자열)', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user', nickname: 'k' },
    } as never);
    const result = await submitCoupon({ ...validInput, code: '' });
    if (result.ok) throw new Error('expected fail');
    expect(result.error).toBe('VALIDATION_FAILED');
    expect(result.fieldErrors?.code).toBeDefined();
  });

  it('validation 실패: code 특수문자 차단', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user', nickname: 'k' },
    } as never);
    const result = await submitCoupon({ ...validInput, code: 'GIFT@2026' });
    if (result.ok) throw new Error('expected fail');
    expect(result.error).toBe('VALIDATION_FAILED');
  });

  it('happy path: pending 상태 + uppercase code 저장', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user', nickname: 'kay' },
    } as never);

    const setMock = vi.fn<(data: Record<string, unknown>) => Promise<void>>(
      () => Promise.resolve(),
    );
    const ref = { id: 'coupon-1', set: setMock };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => ref) })),
    } as never);

    const result = await submitCoupon({ ...validInput, code: 'gift2026' });
    expect(result).toMatchObject({ ok: true, couponId: 'coupon-1' });
    const setArg = setMock.mock.calls[0]![0];
    expect(setArg.code).toBe('GIFT2026');
    expect(setArg.status).toBe('pending');
    expect(setArg.submittedBy).toBe('u1');
  });
});

describe('verifyCoupon (admin)', () => {
  it('admin이 아니면 FORBIDDEN', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', role: 'user' },
    } as never);
    const result = await verifyCoupon('c1', 'verified');
    expect(result).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('rejected 인데 reason 없으면 VALIDATION_FAILED', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'a1', role: 'admin' },
    } as never);
    const result = await verifyCoupon('c1', 'rejected');
    expect(result).toMatchObject({ ok: false, error: 'VALIDATION_FAILED' });
  });

  it('verified 전이 성공', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'a1', role: 'admin' },
    } as never);
    const updateMock = vi.fn<(data: Record<string, unknown>) => Promise<void>>(
      () => Promise.resolve(),
    );
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({ update: updateMock })),
      })),
    } as never);
    const result = await verifyCoupon('c1', 'verified');
    expect(result).toMatchObject({ ok: true, couponId: 'c1' });
    const arg = updateMock.mock.calls[0]![0];
    expect(arg.status).toBe('verified');
    expect(arg.verifiedBy).toBe('a1');
  });

  it('rejected 전이 + reason 저장', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'a1', role: 'admin' },
    } as never);
    const updateMock = vi.fn<(data: Record<string, unknown>) => Promise<void>>(
      () => Promise.resolve(),
    );
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({ update: updateMock })),
      })),
    } as never);
    const result = await verifyCoupon('c1', 'rejected', '미사용 코드');
    expect(result).toMatchObject({ ok: true, couponId: 'c1' });
    const arg = updateMock.mock.calls[0]![0];
    expect(arg.status).toBe('rejected');
    expect(arg.rejectionReason).toBe('미사용 코드');
  });
});

describe('voteCoupon', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user', nickname: 'kay' },
    } as never);
  });

  it('새 up 투표 → upvotes +1', async () => {
    const tx = {
      get: vi.fn(() => Promise.resolve({ data: () => undefined })),
      set: vi.fn<(ref: unknown, data: Record<string, unknown>) => void>(),
      update: vi.fn<(ref: unknown, data: Record<string, { n: number }>) => void>(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await voteCoupon('c1', 'up');
    expect(result).toMatchObject({ ok: true, couponId: 'c1' });
    const updates = tx.update.mock.calls[0]![1];
    expect(updates.upvotes!.n).toBe(1);
  });

  it('기존 up → down 전환: upvotes -1, downvotes +1', async () => {
    const tx = {
      get: vi.fn(() => Promise.resolve({ data: () => ({ direction: 'up' }) })),
      set: vi.fn<(ref: unknown, data: Record<string, unknown>) => void>(),
      update: vi.fn<(ref: unknown, data: Record<string, { n: number }>) => void>(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await voteCoupon('c1', 'down');
    expect(result).toMatchObject({ ok: true });
    const updates = tx.update.mock.calls[0]![1];
    expect(updates.upvotes!.n).toBe(-1);
    expect(updates.downvotes!.n).toBe(1);
  });

  it('동일 direction 재투표는 no-op', async () => {
    const tx = {
      get: vi.fn(() => Promise.resolve({ data: () => ({ direction: 'up' }) })),
      set: vi.fn(),
      update: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await voteCoupon('c1', 'up');
    expect(result).toMatchObject({ ok: true });
    expect(tx.set).not.toHaveBeenCalled();
    expect(tx.update).not.toHaveBeenCalled();
  });
});

describe('listCoupons', () => {
  it('admin creds 없으면 empty', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const result = await listCoupons('verified');
    expect(result).toEqual([]);
  });

  it('verified 목록 조회', async () => {
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
            docs: [
              { data: () => ({ id: 'c1', code: 'GIFT' }) },
              { data: () => ({ id: 'c2', code: 'GIFT2' }) },
            ],
          }),
        ),
      })),
    } as never);
    const result = await listCoupons('verified');
    expect(result.length).toBe(2);
    expect(result[0]?.code).toBe('GIFT');
  });

  it('firestore throw 시 empty', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await listCoupons('verified');
    expect(result).toEqual([]);
    consoleErr.mockRestore();
  });
});

describe('listPendingCouponsAdmin', () => {
  it('admin이 아니면 empty', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', role: 'user' },
    } as never);
    const result = await listPendingCouponsAdmin();
    expect(result).toEqual([]);
  });

  it('admin이고 admin creds 없으면 empty', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'a1', role: 'admin' },
    } as never);
    mockedHasAdmin.mockReturnValue(false);
    const result = await listPendingCouponsAdmin();
    expect(result).toEqual([]);
  });

  it('admin이면 pending 목록 반환', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'a1', role: 'admin' },
    } as never);
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
            docs: [{ data: () => ({ id: 'c1', status: 'pending' }) }],
          }),
        ),
      })),
    } as never);
    const result = await listPendingCouponsAdmin();
    expect(result.length).toBe(1);
  });
});
