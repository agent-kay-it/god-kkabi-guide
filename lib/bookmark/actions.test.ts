/**
 * lib/bookmark/actions.ts — Server Actions 단위 테스트.
 * Sprint 19 F19-A.
 *
 * 시나리오:
 *  - addBookmark / removeBookmark / listMyBookmarks / isBookmarked
 *  - 인증 가드 + 200개 LIMIT_EXCEEDED + 멱등 처리
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
import { revalidatePath } from 'next/cache';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import {
  addBookmark,
  removeBookmark,
  listMyBookmarks,
  isBookmarked,
} from './actions';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedRevalidate = vi.mocked(revalidatePath);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('addBookmark', () => {
  const input = {
    targetType: 'post' as const,
    targetId: 'p1',
    title: '제목',
    href: '/post/p1',
  };

  it('returns UNAUTHENTICATED when no session', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await addBookmark(input);
    expect(result).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('returns NOT_REGISTERED when registered=false', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: false },
    } as never);
    const result = await addBookmark(input);
    expect(result).toEqual({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('returns ADMIN_NOT_CONFIGURED when no admin creds', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    mockedHasAdmin.mockReturnValue(false);
    const result = await addBookmark(input);
    expect(result).toEqual({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });

  it('returns LIMIT_EXCEEDED when bookmarkCount >= 200 and new entry', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: () => ({ bookmarkCount: 200 }) })
        .mockResolvedValueOnce({ exists: false }),
      set: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await addBookmark(input);
    expect(result).toMatchObject({ ok: false, error: 'LIMIT_EXCEEDED' });
  });

  it('adds bookmark successfully (happy path)', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: () => ({ bookmarkCount: 5 }) })
        .mockResolvedValueOnce({ exists: false }),
      set: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await addBookmark(input);
    expect(result).toEqual({ ok: true });
    expect(tx.set).toHaveBeenCalledTimes(2); // items + users
    expect(mockedRevalidate).toHaveBeenCalledWith('/me/bookmarks');
    expect(mockedRevalidate).toHaveBeenCalledWith('/post/p1');
  });

  it('handles existing bookmark (no count increment)', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: () => ({ bookmarkCount: 5 }) })
        .mockResolvedValueOnce({ exists: true }),
      set: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await addBookmark(input);
    expect(result).toEqual({ ok: true });
    expect(tx.set).toHaveBeenCalledTimes(1); // items only — users.set 호출 안 함
  });

  it('wraps unexpected error as INTERNAL', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async () => {
        throw new Error('connection-refused');
      }),
    } as never);

    const result = await addBookmark(input);
    expect(result).toMatchObject({ ok: false, error: 'INTERNAL', message: 'connection-refused' });
  });

  it('preserves emoji when provided', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: () => ({ bookmarkCount: 0 }) })
        .mockResolvedValueOnce({ exists: false }),
      set: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await addBookmark({ ...input, emoji: '⭐' });
    expect(result).toEqual({ ok: true });
    const firstCall = tx.set.mock.calls[0];
    expect(firstCall?.[1]).toMatchObject({ emoji: '⭐' });
  });
});

describe('removeBookmark', () => {
  it('returns UNAUTHENTICATED when no session', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await removeBookmark('post', 'p1');
    expect(result).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('returns ADMIN_NOT_CONFIGURED when no admin creds', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    mockedHasAdmin.mockReturnValue(false);
    const result = await removeBookmark('post', 'p1');
    expect(result).toEqual({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });

  it('removes existing bookmark', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const tx = {
      get: vi.fn(() => Promise.resolve({ exists: true })),
      delete: vi.fn(),
      set: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await removeBookmark('post', 'p1');
    expect(result).toEqual({ ok: true });
    expect(tx.delete).toHaveBeenCalled();
    expect(tx.set).toHaveBeenCalled();
  });

  it('handles non-existing bookmark idempotently', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const tx = {
      get: vi.fn(() => Promise.resolve({ exists: false })),
      delete: vi.fn(),
      set: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await removeBookmark('post', 'p1');
    expect(result).toEqual({ ok: true });
    expect(tx.delete).not.toHaveBeenCalled();
  });
});

describe('listMyBookmarks', () => {
  it('returns empty array when not authenticated', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await listMyBookmarks();
    expect(result).toEqual([]);
  });

  it('returns empty array when admin creds missing', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    mockedHasAdmin.mockReturnValue(false);
    const result = await listMyBookmarks();
    expect(result).toEqual([]);
  });

  it('returns bookmarks with createdAtMs', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const queryResult = {
      docs: [
        {
          data: () => ({
            id: 'post:p1',
            targetType: 'post',
            targetId: 'p1',
            title: '제목 1',
            href: '/post/p1',
            emoji: '⭐',
            createdAt: { toMillis: () => 1700000000000 },
          }),
        },
        {
          data: () => ({
            id: 'wiki:w1',
            targetType: 'wiki',
            targetId: 'w1',
            title: '위키 항목',
            href: '/wiki/w1',
            createdAt: undefined,
          }),
        },
      ],
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                get: vi.fn(() => Promise.resolve(queryResult)),
              })),
            })),
          })),
        })),
      })),
    } as never);

    const result = await listMyBookmarks();
    expect(result.length).toBe(2);
    expect(result[0]?.emoji).toBe('⭐');
    expect(result[0]?.createdAtMs).toBe(1700000000000);
    expect(result[1]?.createdAtMs).toBe(0); // undefined fallback
  });

  it('returns empty array when firestore throws', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const result = await listMyBookmarks();
    expect(result).toEqual([]);
  });
});

describe('isBookmarked', () => {
  it('returns false when not authenticated', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await isBookmarked('post', 'p1');
    expect(result).toBe(false);
  });

  it('returns false when admin creds missing', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    mockedHasAdmin.mockReturnValue(false);
    const result = await isBookmarked('post', 'p1');
    expect(result).toBe(false);
  });

  it('returns true when doc exists', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({
            doc: vi.fn(() => ({
              get: vi.fn(() => Promise.resolve({ exists: true })),
            })),
          })),
        })),
      })),
    } as never);
    const result = await isBookmarked('post', 'p1');
    expect(result).toBe(true);
  });

  it('returns false when firestore throws', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const result = await isBookmarked('post', 'p1');
    expect(result).toBe(false);
  });
});
