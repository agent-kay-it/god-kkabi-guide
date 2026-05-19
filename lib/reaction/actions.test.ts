/**
 * lib/reaction/actions.ts — toggleReaction Server Action 단위 테스트.
 * Sprint 19 F19-A — Server Actions mocking 표준.
 *
 * 시나리오:
 *  - UNAUTHENTICATED / NOT_REGISTERED / ADMIN_NOT_CONFIGURED 가드
 *  - happy path (post like ON)
 *  - happy path (post like OFF — 토글 OFF)
 *  - SELF_REACTION (본인 게시물 좋아요 차단)
 *  - TARGET_NOT_FOUND (대상 게시물 없음)
 *  - getMyReactionsForPosts chunk (postIds 0 / 일반)
 *  - getMyReactionsForComments
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── module mocks (hoisted)
vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    increment: vi.fn((n: number) => ({ __fv: 'increment', n })),
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
    arrayUnion: vi.fn((...items: unknown[]) => ({ __fv: 'arrayUnion', items })),
    arrayRemove: vi.fn((...items: unknown[]) => ({ __fv: 'arrayRemove', items })),
    delete: vi.fn(() => ({ __fv: 'delete' })),
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
  toggleReaction,
  getMyReactionsForPosts,
  getMyReactionsForComments,
} from './actions';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedRevalidate = vi.mocked(revalidatePath);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('toggleReaction (post)', () => {
  it('returns UNAUTHENTICATED when no session', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await toggleReaction({
      targetType: 'post',
      targetId: 'p1',
    });
    expect(result).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('returns NOT_REGISTERED when user has no registered flag', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: false },
    } as never);
    const result = await toggleReaction({
      targetType: 'post',
      targetId: 'p1',
    });
    expect(result).toEqual({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('returns ADMIN_NOT_CONFIGURED when admin creds missing', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    mockedHasAdmin.mockReturnValue(false);
    const result = await toggleReaction({
      targetType: 'post',
      targetId: 'p1',
    });
    expect(result).toEqual({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });

  it('toggles ON when reaction not yet exists (happy path)', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const reactionDocRef = {
      get: vi.fn(),
    };
    const targetDocRef = {
      get: vi.fn(),
      collection: vi.fn(() => ({
        doc: vi.fn(() => reactionDocRef),
      })),
    };

    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ authorUid: 'other-user', likeCount: 5 }),
        })
        .mockResolvedValueOnce({ exists: false }),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => targetDocRef),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await toggleReaction({
      targetType: 'post',
      targetId: 'p1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.isLiked).toBe(true);
      expect(result.likeCount).toBe(6);
    }
    expect(tx.set).toHaveBeenCalled();
    expect(tx.update).toHaveBeenCalled();
    expect(mockedRevalidate).toHaveBeenCalledWith('/post/p1');
  });

  it('toggles OFF when reaction already exists', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const reactionDocRef = { get: vi.fn() };
    const targetDocRef = {
      get: vi.fn(),
      collection: vi.fn(() => ({ doc: vi.fn(() => reactionDocRef) })),
    };

    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ authorUid: 'other', likeCount: 3 }),
        })
        .mockResolvedValueOnce({ exists: true }),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => targetDocRef) })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await toggleReaction({
      targetType: 'post',
      targetId: 'p1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.isLiked).toBe(false);
      expect(result.likeCount).toBe(2);
    }
    expect(tx.delete).toHaveBeenCalled();
  });

  it('returns TARGET_NOT_FOUND when post does not exist', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ exists: false })
        .mockResolvedValueOnce({ exists: false }),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
          collection: vi.fn(() => ({ doc: vi.fn(() => ({ get: vi.fn() })) })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await toggleReaction({
      targetType: 'post',
      targetId: 'p1',
    });
    expect(result).toMatchObject({ ok: false, error: 'TARGET_NOT_FOUND' });
  });

  it('blocks SELF_REACTION when authorUid matches uid', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ authorUid: 'u1', likeCount: 0 }),
        })
        .mockResolvedValueOnce({ exists: false }),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
          collection: vi.fn(() => ({ doc: vi.fn(() => ({ get: vi.fn() })) })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await toggleReaction({
      targetType: 'post',
      targetId: 'p1',
    });
    expect(result).toMatchObject({ ok: false, error: 'SELF_REACTION' });
  });
});

describe('toggleReaction (comment)', () => {
  it('uses postId for revalidatePath', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ authorUid: 'other', likeCount: 0 }),
        })
        .mockResolvedValueOnce({ exists: false }),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
          collection: vi.fn(() => ({
            doc: vi.fn(() => ({
              get: vi.fn(),
              collection: vi.fn(() => ({ doc: vi.fn(() => ({ get: vi.fn() })) })),
            })),
          })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await toggleReaction({
      targetType: 'comment',
      targetId: 'c1',
      postId: 'p99',
    });

    expect(result.ok).toBe(true);
    expect(mockedRevalidate).toHaveBeenCalledWith('/post/p99');
  });
});

describe('getMyReactionsForPosts', () => {
  it('returns empty Map when no session', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await getMyReactionsForPosts(['p1', 'p2']);
    expect(result.size).toBe(0);
  });

  it('returns empty Map when postIds empty', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    const result = await getMyReactionsForPosts([]);
    expect(result.size).toBe(0);
  });

  it('returns map with exists status per post', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    const docGet1 = vi.fn(() => Promise.resolve({ exists: true }));
    const docGet2 = vi.fn(() => Promise.resolve({ exists: false }));

    let postIdx = 0;
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({
            doc: vi.fn(() => ({
              get: postIdx++ === 0 ? docGet1 : docGet2,
            })),
          })),
        })),
      })),
    } as never);

    const result = await getMyReactionsForPosts(['p1', 'p2']);
    expect(result.size).toBe(2);
    expect(result.get('p1')).toBe(true);
    expect(result.get('p2')).toBe(false);
  });

  it('returns empty when firestore throws', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await getMyReactionsForPosts(['p1']);
    expect(result.size).toBe(0);
    consoleErr.mockRestore();
  });
});

describe('getMyReactionsForComments', () => {
  it('returns empty when commentIds empty', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);
    const result = await getMyReactionsForComments('p1', []);
    expect(result.size).toBe(0);
  });

  it('returns empty when no session', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await getMyReactionsForComments('p1', ['c1']);
    expect(result.size).toBe(0);
  });

  it('handles 35+ commentIds (chunk split)', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true },
    } as never);

    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({
            doc: vi.fn(() => ({
              collection: vi.fn(() => ({
                doc: vi.fn(() => ({
                  get: vi.fn(() => Promise.resolve({ exists: true })),
                })),
              })),
            })),
          })),
        })),
      })),
    } as never);

    const ids = Array.from({ length: 35 }, (_, i) => `c${i}`);
    const result = await getMyReactionsForComments('p1', ids);
    expect(result.size).toBe(35);
    expect(result.get('c34')).toBe(true);
  });
});
