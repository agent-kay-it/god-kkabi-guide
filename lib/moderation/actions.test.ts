/**
 * lib/moderation/actions.ts — Server Actions 단위 테스트.
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
  getAdminDatabase: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('@/lib/firebase/claims-retry-queue', () => ({
  setUserClaimsWithRetry: vi.fn(() => Promise.resolve()),
}));

import { auth } from '@/lib/auth/auth';
import {
  getAdminFirestore,
  getAdminDatabase,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import { setUserClaimsWithRetry } from '@/lib/firebase/claims-retry-queue';
import {
  banUser,
  unbanUser,
  resetUserRegistration,
  resolveReport,
  listPendingReports,
  listBannedUsers,
} from './actions';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedDatabase = vi.mocked(getAdminDatabase);
const mockedSetClaims = vi.mocked(setUserClaimsWithRetry);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

function adminSession(uid = 'a1') {
  return { user: { id: uid, role: 'admin', registered: true, nickname: 'admin' } };
}

function userSession() {
  return { user: { id: 'u1', role: 'user', registered: true, nickname: 'k' } };
}

describe('banUser — admin guard', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const r = await banUser('u1', '욕설');
    expect(r).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('FORBIDDEN — non-admin', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const r = await banUser('u1', '욕설');
    expect(r).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('ADMIN_NOT_CONFIGURED', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    mockedHasAdmin.mockReturnValue(false);
    const r = await banUser('u1', '욕설');
    expect(r).toMatchObject({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });

  it('happy: ban + claim 변경 + log', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    const updateMock = vi.fn(() => Promise.resolve());
    const logAdd = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'moderation_logs') return { add: logAdd };
        return { doc: vi.fn(() => ({ update: updateMock })) };
      }),
    } as never);

    const r = await banUser('u-target', '욕설');
    expect(r).toMatchObject({ ok: true });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ banned: true, banReason: '욕설' }),
    );
    expect(mockedSetClaims).toHaveBeenCalledWith('u-target', expect.objectContaining({ role: 'banned' }));
    expect(logAdd).toHaveBeenCalled();
  });

  it('reason 빈 문자열은 기본값 "운영자 정지" 사용', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    const updateMock = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({ update: updateMock })),
        add: vi.fn(),
      })),
    } as never);
    await banUser('u-target', '');
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ banReason: '운영자 정지' }),
    );
  });

  it('firestore throw → INTERNAL', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    const updateMock = vi.fn(() => Promise.reject(new Error('boom')));
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({ update: updateMock })),
      })),
    } as never);
    const r = await banUser('u-target', 'r');
    expect(r).toMatchObject({ ok: false, error: 'INTERNAL', message: 'boom' });
  });
});

describe('unbanUser', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(adminSession() as never);
  });

  it('FORBIDDEN — non-admin', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const r = await unbanUser('u1');
    expect(r).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('happy: ban 해제 + claim 복원 + log', async () => {
    const userRef = {
      get: vi.fn(() =>
        Promise.resolve({
          data: () => ({
            banned: true,
            serverId: 'srv-1',
            munpa: 'munpa-1',
            registered: true,
          }),
        }),
      ),
      update: vi.fn(() => Promise.resolve()),
    };
    const logAdd = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'moderation_logs') return { add: logAdd };
        return { doc: vi.fn(() => userRef) };
      }),
    } as never);

    const r = await unbanUser('u-target');
    expect(r).toMatchObject({ ok: true });
    expect(userRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ banned: false }),
    );
    const claimCall = mockedSetClaims.mock.calls[0]?.[1];
    expect(claimCall).toMatchObject({
      role: 'user',
      registered: true,
      serverId: 'srv-1',
      munpaId: 'srv-1_munpa-1',
    });
    expect(logAdd).toHaveBeenCalled();
  });

  it('serverId/munpa 없으면 빈 문자열로 fallback', async () => {
    const userRef = {
      get: vi.fn(() => Promise.resolve({ data: () => ({ banned: true }) })),
      update: vi.fn(() => Promise.resolve()),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => userRef),
        add: vi.fn(() => Promise.resolve()),
      })),
    } as never);

    await unbanUser('u-target');
    const claimCall = mockedSetClaims.mock.calls[0]?.[1];
    expect(claimCall).toMatchObject({ serverId: '', munpaId: '' });
  });
});

describe('resetUserRegistration', () => {
  it('FORBIDDEN — non-admin', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const r = await resetUserRegistration('u1');
    expect(r).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('happy: registered=false + 닉네임/문파 delete', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    const updateMock = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'moderation_logs') {
          return { add: vi.fn(() => Promise.resolve()) };
        }
        return { doc: vi.fn(() => ({ update: updateMock })) };
      }),
    } as never);
    const r = await resetUserRegistration('u-target');
    expect(r).toMatchObject({ ok: true });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ registered: false }),
    );
  });
});

describe('resolveReport', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(adminSession() as never);
  });

  it('FORBIDDEN — non-admin', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const r = await resolveReport('r1', 'deleted', 'm1', 'c1');
    expect(r).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('happy: deleted decision → RTDB + Firestore 업데이트', async () => {
    const fsUpdate = vi.fn(() => Promise.resolve());
    const rtdbUpdate = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'moderation_logs') {
          return { add: vi.fn(() => Promise.resolve()) };
        }
        return { doc: vi.fn(() => ({ update: fsUpdate })) };
      }),
    } as never);
    mockedDatabase.mockReturnValue({
      ref: vi.fn(() => ({ update: rtdbUpdate })),
    } as never);

    const r = await resolveReport('r1', 'deleted', 'm1', 'c1');
    expect(r).toMatchObject({ ok: true });
    expect(fsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ resolved: 'deleted' }),
    );
    expect(rtdbUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ deletedByOperator: true, hidden: true }),
    );
  });

  it('happy: kept_by_operator decision → RTDB hidden=false', async () => {
    const fsUpdate = vi.fn(() => Promise.resolve());
    const rtdbUpdate = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'moderation_logs') {
          return { add: vi.fn(() => Promise.resolve()) };
        }
        return { doc: vi.fn(() => ({ update: fsUpdate })) };
      }),
    } as never);
    mockedDatabase.mockReturnValue({
      ref: vi.fn(() => ({ update: rtdbUpdate })),
    } as never);

    const r = await resolveReport('r1', 'kept_by_operator', 'm1', 'c1');
    expect(r).toMatchObject({ ok: true });
    expect(rtdbUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ keptByOperator: true, hidden: false }),
    );
  });

  it('RTDB 실패해도 Firestore 결과 반환 (silent)', async () => {
    const fsUpdate = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'moderation_logs') return { add: vi.fn(() => Promise.resolve()) };
        return { doc: vi.fn(() => ({ update: fsUpdate })) };
      }),
    } as never);
    mockedDatabase.mockImplementation(() => {
      throw new Error('rtdb-fail');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await resolveReport('r1', 'deleted', 'm1', 'c1');
    expect(r).toMatchObject({ ok: true });
    consoleErr.mockRestore();
  });
});

describe('listPendingReports', () => {
  it('non-admin → empty', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    expect(await listPendingReports()).toEqual([]);
  });

  it('happy: 변환 + imageUrl optional', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
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
              {
                id: 'r1',
                data: () => ({
                  messageId: 'm1',
                  channelId: 'c1',
                  reporterUid: 'u-reporter',
                  reportedUid: 'u-target',
                  reasons: ['spam'],
                  message_snapshot: '메시지 내용',
                  imageUrl: 'https://cdn.x/y.jpg',
                  createdAt: { toMillis: () => 1700000000000 },
                }),
              },
              {
                id: 'r2',
                data: () => ({
                  messageId: 'm2',
                  channelId: 'c1',
                  reporterUid: 'u-reporter-2',
                  reportedUid: 'u-target-2',
                  message_snapshot: '두 번째',
                  createdAt: undefined,
                }),
              },
            ],
          }),
        ),
      })),
    } as never);
    const r = await listPendingReports();
    expect(r.length).toBe(2);
    expect(r[0]?.imageUrl).toBe('https://cdn.x/y.jpg');
    expect(r[1]?.imageUrl).toBeUndefined();
    expect(r[1]?.createdAtMs).toBe(0); // undefined fallback
  });

  it('firestore throw → empty', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    expect(await listPendingReports()).toEqual([]);
  });
});

describe('listBannedUsers', () => {
  it('non-admin → empty', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    expect(await listBannedUsers()).toEqual([]);
  });

  it('happy: 정지된 사용자 목록', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
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
            docs: [
              {
                id: 'u-1',
                data: () => ({
                  uid: 'u-1',
                  nickname: 'banned-user',
                  serverId: 'srv-1',
                  munpa: 'munpa-1',
                  banReason: '욕설',
                }),
              },
            ],
          }),
        ),
      })),
    } as never);
    const r = await listBannedUsers();
    expect(r.length).toBe(1);
    expect(r[0]?.nickname).toBe('banned-user');
  });
});
