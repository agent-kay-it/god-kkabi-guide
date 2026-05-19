/**
 * lib/penalty/actions.ts — recordReport / recoverFromPenalty / liftExpiredBan 단위 테스트.
 * Sprint 19 F19-A.
 *
 * 자동 페널티 룰 검증:
 *  - reportedTotal < 5 → no penalty
 *  - 4 → 5 transition: warning
 *  - 9 → 10 transition: ban_7d
 *  - 19 → 20 transition: ban_permanent
 *  - 동일 level 유지: no trigger
 *  - admin not configured / firestore error
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    increment: vi.fn((n: number) => ({ __fv: 'increment', n })),
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
    delete: vi.fn(() => ({ __fv: 'delete' })),
  },
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('@/lib/firebase/claims-retry-queue', () => ({
  setUserClaimsWithRetry: vi.fn(),
}));

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { setUserClaimsWithRetry } from '@/lib/firebase/claims-retry-queue';
import {
  recordReport,
  recoverFromPenalty,
  liftExpiredBan,
} from './actions';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedSetClaims = vi.mocked(setUserClaimsWithRetry);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

function buildFirestoreForReport(opts: {
  currentReportedTotal: number;
  addLog?: ReturnType<typeof vi.fn>;
}) {
  const tx = {
    get: vi.fn(() =>
      Promise.resolve({
        data: () => ({ reportedTotal: opts.currentReportedTotal }),
      }),
    ),
    set: vi.fn(),
  };
  const penaltyDocRef = { id: 'penalty-doc-1' };
  const addLog = opts.addLog ?? vi.fn(() => Promise.resolve({ id: 'log-1' }));

  return {
    tx,
    firestore: {
      collection: vi.fn((name: string) => {
        if (name === 'users') {
          return {
            doc: vi.fn(() => ({})),
          };
        }
        if (name === 'penalties') {
          return {
            doc: vi.fn(() => penaltyDocRef),
          };
        }
        if (name === 'moderation_logs') {
          return { add: addLog };
        }
        return { doc: vi.fn() };
      }),
      runTransaction: vi.fn(async (cb: (t: typeof tx) => Promise<void>) => cb(tx)),
    },
    addLog,
  };
}

describe('recordReport — 자동 페널티 임계값', () => {
  const input = {
    targetUid: 'target-1',
    source: 'post' as const,
    sourceId: 'p1',
  };

  it('admin_not_configured 시 INTERNAL 반환', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const result = await recordReport(input);
    expect(result).toMatchObject({ ok: false, error: 'INTERNAL', message: 'admin_not_configured' });
  });

  it('reportedTotal 0 → 1: 임계값 미달, no penalty', async () => {
    const { firestore, tx } = buildFirestoreForReport({ currentReportedTotal: 0 });
    mockedFirestore.mockReturnValue(firestore as never);

    const result = await recordReport(input);
    expect(result).toMatchObject({ ok: true, newTotal: 1, penaltyApplied: null });
    expect(tx.set).toHaveBeenCalledTimes(1); // users.set만 — penalties.set 없음
  });

  it('reportedTotal 4 → 5: warning 페널티', async () => {
    const { firestore, tx } = buildFirestoreForReport({ currentReportedTotal: 4 });
    mockedFirestore.mockReturnValue(firestore as never);

    const result = await recordReport(input);
    expect(result).toMatchObject({ ok: true, newTotal: 5, penaltyApplied: 'warning' });
    expect(tx.set).toHaveBeenCalledTimes(2); // users + penalties
  });

  it('reportedTotal 9 → 10: ban_7d 페널티', async () => {
    const { firestore, tx } = buildFirestoreForReport({ currentReportedTotal: 9 });
    mockedFirestore.mockReturnValue(firestore as never);

    const result = await recordReport(input);
    expect(result).toMatchObject({ ok: true, newTotal: 10, penaltyApplied: 'ban_7d' });

    // users.set call 의 두 번째 인자 검증
    const usersCall = tx.set.mock.calls.find(
      (c) => (c[1] as Record<string, unknown>).banned === true,
    );
    expect(usersCall).toBeDefined();
    expect((usersCall![1] as Record<string, unknown>).banReason).toContain('7일 정지');
  });

  it('reportedTotal 19 → 20: ban_permanent + claim 변경', async () => {
    const { firestore, tx } = buildFirestoreForReport({ currentReportedTotal: 19 });
    mockedFirestore.mockReturnValue(firestore as never);

    const result = await recordReport(input);
    expect(result).toMatchObject({ ok: true, newTotal: 20, penaltyApplied: 'ban_permanent' });
    expect(mockedSetClaims).toHaveBeenCalledWith('target-1', { role: 'banned' });

    const usersCall = tx.set.mock.calls.find(
      (c) => (c[1] as Record<string, unknown>).banReason !== undefined,
    );
    expect((usersCall![1] as Record<string, unknown>).banReason).toContain('영구 정지');
  });

  it('동일 level 유지: 6 → 7, no penalty trigger', async () => {
    const { firestore, tx } = buildFirestoreForReport({ currentReportedTotal: 6 });
    mockedFirestore.mockReturnValue(firestore as never);

    const result = await recordReport(input);
    expect(result).toMatchObject({ ok: true, newTotal: 7, penaltyApplied: null });
    expect(tx.set).toHaveBeenCalledTimes(1); // users만
    expect(mockedSetClaims).not.toHaveBeenCalled();
  });

  it('firestore error 시 INTERNAL 반환', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn() })),
      runTransaction: vi.fn(async () => {
        throw new Error('tx-failed');
      }),
    } as never);

    const result = await recordReport(input);
    expect(result).toMatchObject({ ok: false, error: 'INTERNAL', message: 'tx-failed' });
  });
});

describe('recoverFromPenalty — admin 권한 검증', () => {
  it('admin이 아니면 FORBIDDEN', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', role: 'user' },
    } as never);
    const result = await recoverFromPenalty('target-1', 'false positive');
    expect(result).toEqual({ ok: false, error: 'FORBIDDEN' });
  });

  it('admin creds 없으면 ADMIN_NOT_CONFIGURED', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'admin-1', role: 'admin' },
    } as never);
    mockedHasAdmin.mockReturnValue(false);
    const result = await recoverFromPenalty('target-1', 'false positive');
    expect(result).toEqual({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });

  it('admin이고 recent penalty 있으면 revoke 호출', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'admin-1', role: 'admin' },
    } as never);

    const recentDocRefUpdate = vi.fn(() => Promise.resolve());
    const userUpdate = vi.fn(() => Promise.resolve());
    const logAdd = vi.fn(() => Promise.resolve({ id: 'log-1' }));

    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'users') {
          return { doc: vi.fn(() => ({ update: userUpdate })) };
        }
        if (name === 'penalties') {
          return {
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
                    ref: { update: recentDocRefUpdate },
                  },
                ],
              }),
            ),
          };
        }
        if (name === 'moderation_logs') {
          return { add: logAdd };
        }
        return {};
      }),
    } as never);

    const result = await recoverFromPenalty('target-1', 'false positive');
    expect(result).toEqual({ ok: true });
    expect(userUpdate).toHaveBeenCalled();
    expect(recentDocRefUpdate).toHaveBeenCalled();
    expect(logAdd).toHaveBeenCalled();
  });

  it('admin이고 recent penalty 없어도 user.reportedTotal 감소', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'admin-1', role: 'admin' },
    } as never);

    const userUpdate = vi.fn(() => Promise.resolve());

    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'users') {
          return { doc: vi.fn(() => ({ update: userUpdate })) };
        }
        if (name === 'penalties') {
          return {
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
                empty: true,
                docs: [],
              }),
            ),
          };
        }
        if (name === 'moderation_logs') {
          return { add: vi.fn(() => Promise.resolve({ id: 'log-1' })) };
        }
        return {};
      }),
    } as never);

    const result = await recoverFromPenalty('target-1', 'false positive');
    expect(result).toEqual({ ok: true });
    expect(userUpdate).toHaveBeenCalled();
  });
});

describe('liftExpiredBan — 만료된 7일 정지 lazy 해제', () => {
  it('admin creds 없으면 silent return', async () => {
    mockedHasAdmin.mockReturnValue(false);
    await expect(liftExpiredBan('u1')).resolves.toBeUndefined();
  });

  it('banned=false 면 noop', async () => {
    const userUpdate = vi.fn();
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              data: () => ({ banned: false }),
            }),
          ),
          update: userUpdate,
        })),
      })),
    } as never);

    await liftExpiredBan('u1');
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it('bannedUntil 미래면 noop', async () => {
    const userUpdate = vi.fn();
    const futureMs = Date.now() + 1000 * 60 * 60; // 1시간 후
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              data: () => ({
                banned: true,
                bannedUntil: { toMillis: () => futureMs },
              }),
            }),
          ),
          update: userUpdate,
        })),
      })),
    } as never);

    await liftExpiredBan('u1');
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it('bannedUntil 과거면 ban 해제', async () => {
    const userUpdate = vi.fn(() => Promise.resolve());
    const logAdd = vi.fn(() => Promise.resolve({ id: 'log-1' }));
    const pastMs = Date.now() - 1000 * 60 * 60; // 1시간 전
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'users') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn(() =>
                Promise.resolve({
                  data: () => ({
                    banned: true,
                    bannedUntil: { toMillis: () => pastMs },
                  }),
                }),
              ),
              update: userUpdate,
            })),
          };
        }
        if (name === 'moderation_logs') {
          return { add: logAdd };
        }
        return {};
      }),
    } as never);

    await liftExpiredBan('u1');
    expect(userUpdate).toHaveBeenCalled();
    expect(logAdd).toHaveBeenCalled();
  });

  it('firestore throw 시 silent 처리', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    await expect(liftExpiredBan('u1')).resolves.toBeUndefined();
  });
});
