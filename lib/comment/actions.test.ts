/**
 * lib/comment/actions.ts — createComment / updateComment / deleteComment / listComments 단위 테스트.
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
  createComment,
  updateComment,
  deleteComment,
  listComments,
} from './actions';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

function registeredSession(uid = 'u1', nickname = 'kay', role: 'user' | 'admin' | 'banned' = 'user') {
  return {
    user: { id: uid, registered: true, role, nickname },
  };
}

describe('createComment — 인증 가드', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await createComment('p1', { body: 'hi', parentCommentId: null });
    expect(result).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('NOT_REGISTERED (registered=false)', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: false },
    } as never);
    const result = await createComment('p1', { body: 'hi', parentCommentId: null });
    expect(result).toMatchObject({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('BANNED role', async () => {
    mockedAuth.mockResolvedValue(registeredSession('u1', 'k', 'banned') as never);
    const result = await createComment('p1', { body: 'hi', parentCommentId: null });
    expect(result).toMatchObject({ ok: false, error: 'BANNED' });
  });

  it('ADMIN_NOT_CONFIGURED', async () => {
    mockedAuth.mockResolvedValue(registeredSession() as never);
    mockedHasAdmin.mockReturnValue(false);
    const result = await createComment('p1', { body: 'hi', parentCommentId: null });
    expect(result).toMatchObject({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });

  it('NOT_REGISTERED — nickname 없음', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user', nickname: '' },
    } as never);
    const result = await createComment('p1', { body: 'hi', parentCommentId: null });
    expect(result).toMatchObject({ ok: false, error: 'NOT_REGISTERED' });
  });
});

describe('createComment — validation', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(registeredSession() as never);
  });

  it('body 빈 문자열은 VALIDATION_FAILED', async () => {
    const result = await createComment('p1', { body: '', parentCommentId: null });
    expect(result).toMatchObject({ ok: false, error: 'VALIDATION_FAILED' });
  });

  it('body 500자 초과는 VALIDATION_FAILED', async () => {
    const long = 'a'.repeat(501);
    const result = await createComment('p1', { body: long, parentCommentId: null });
    expect(result).toMatchObject({ ok: false, error: 'VALIDATION_FAILED' });
  });
});

describe('createComment — happy / business rules', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(registeredSession() as never);
  });

  it('depth 2 강제: 부모의 부모가 non-null → DEPTH_EXCEEDED', async () => {
    const tx = {
      get: vi
        .fn()
        // post snap
        .mockResolvedValueOnce({ exists: true, data: () => ({}) })
        // parent comment snap
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ parentCommentId: 'c0' }), // 이미 깊이 2
        }),
      set: vi.fn(),
      update: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn(() => ({ id: 'c-new' })) })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await createComment('p1', { body: '깊이 초과', parentCommentId: 'c1' });
    expect(result).toMatchObject({ ok: false, error: 'DEPTH_EXCEEDED' });
  });

  it('post NOT_FOUND', async () => {
    const tx = {
      get: vi.fn().mockResolvedValueOnce({ exists: false }),
      set: vi.fn(),
      update: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn(() => ({ id: 'c-new' })) })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await createComment('p1', { body: '댓글', parentCommentId: null });
    expect(result).toMatchObject({ ok: false, error: 'NOT_FOUND' });
  });

  it('post status=deleted → NOT_FOUND', async () => {
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: 'deleted' }),
      }),
      set: vi.fn(),
      update: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn(() => ({ id: 'c-new' })) })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await createComment('p1', { body: '댓글', parentCommentId: null });
    expect(result).toMatchObject({ ok: false, error: 'NOT_FOUND' });
  });

  it('happy: top-level 댓글 작성', async () => {
    const commentRef = { id: 'c-new' };
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: 'published' }),
      }),
      set: vi.fn(),
      update: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn(() => commentRef) })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await createComment('p1', { body: '좋아요', parentCommentId: null });
    expect(result).toMatchObject({ ok: true, commentId: 'c-new' });
    expect(tx.set).toHaveBeenCalled();
    expect(tx.update).toHaveBeenCalled();
  });
});

describe('updateComment', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(registeredSession('u1', 'kay') as never);
  });

  it('VALIDATION_FAILED — empty body', async () => {
    const result = await updateComment('p1', 'c1', '');
    expect(result).toMatchObject({ ok: false, error: 'VALIDATION_FAILED' });
  });

  it('FORBIDDEN — 다른 사용자 댓글', async () => {
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({
          authorUid: 'other-user',
          createdAt: { toMillis: () => Date.now() },
        }),
      }),
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

    const result = await updateComment('p1', 'c1', '수정');
    expect(result).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('EDIT_WINDOW_EXPIRED — 5분 초과', async () => {
    const oldMs = Date.now() - 1000 * 60 * 10;
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({
          authorUid: 'u1',
          createdAt: { toMillis: () => oldMs },
        }),
      }),
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

    const result = await updateComment('p1', 'c1', '수정');
    expect(result).toMatchObject({ ok: false, error: 'EDIT_WINDOW_EXPIRED' });
  });

  it('happy: 본인의 5분 내 댓글 수정', async () => {
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({
          authorUid: 'u1',
          createdAt: { toMillis: () => Date.now() },
        }),
      }),
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

    const result = await updateComment('p1', 'c1', '수정된 본문');
    expect(result).toMatchObject({ ok: true });
    expect(tx.update).toHaveBeenCalled();
  });
});

describe('deleteComment', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const result = await deleteComment('p1', 'c1');
    expect(result).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('FORBIDDEN — 본인 댓글 아님', async () => {
    mockedAuth.mockResolvedValue(registeredSession() as never);
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ authorUid: 'other' }),
      }),
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

    const result = await deleteComment('p1', 'c1');
    expect(result).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('happy: 본인 삭제 (soft delete)', async () => {
    mockedAuth.mockResolvedValue(registeredSession() as never);
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ authorUid: 'u1' }),
      }),
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

    const result = await deleteComment('p1', 'c1');
    expect(result).toMatchObject({ ok: true });
    const arg = tx.update.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(arg.body).toBe('[삭제된 댓글]');
    expect(arg.hidden).toBe(true);
    expect(arg.deletedByOperator).toBe(false);
  });

  it('admin이 타인 댓글 삭제 — deletedByOperator=true + moderation_logs 기록', async () => {
    mockedAuth.mockResolvedValue(registeredSession('a1', 'admin', 'admin') as never);
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ authorUid: 'u-someone' }),
      }),
      update: vi.fn(),
    };
    const logAdd = vi.fn(() => Promise.resolve({ id: 'log-1' }));
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'moderation_logs') return { add: logAdd };
        return {
          doc: vi.fn(() => ({
            collection: vi.fn(() => ({ doc: vi.fn() })),
          })),
        };
      }),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const result = await deleteComment('p1', 'c1');
    expect(result).toMatchObject({ ok: true });
    const arg = tx.update.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(arg.deletedByOperator).toBe(true);
    expect(logAdd).toHaveBeenCalled();
  });
});

describe('listComments', () => {
  it('admin creds 없으면 empty', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const result = await listComments('p1', false);
    expect(result).toEqual([]);
  });

  it('일반 viewer: hidden && !keptByOperator 필터', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({
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
                    data: () => ({
                      id: 'c1',
                      postId: 'p1',
                      authorUid: 'u1',
                      authorNickname: 'k',
                      body: '보임',
                      parentCommentId: null,
                      hidden: false,
                      keptByOperator: false,
                      deletedByOperator: false,
                      createdAt: { toMillis: () => 1700000000000 },
                      updatedAt: { toMillis: () => 1700000001000 },
                    }),
                  },
                  {
                    data: () => ({
                      id: 'c2',
                      postId: 'p1',
                      authorUid: 'u2',
                      authorNickname: 'm',
                      body: '숨김',
                      parentCommentId: null,
                      hidden: true,
                      keptByOperator: false,
                      deletedByOperator: false,
                      createdAt: { toMillis: () => 1700000010000 },
                      updatedAt: { toMillis: () => 1700000010000 },
                    }),
                  },
                  {
                    data: () => ({
                      id: 'c3',
                      postId: 'p1',
                      authorUid: 'u3',
                      authorNickname: 'n',
                      body: '운영 keep',
                      parentCommentId: null,
                      hidden: true,
                      keptByOperator: true,
                      deletedByOperator: false,
                      createdAt: { toMillis: () => 1700000020000 },
                      updatedAt: { toMillis: () => 1700000020000 },
                    }),
                  },
                ],
              }),
            ),
          })),
        })),
      })),
    } as never);

    const result = await listComments('p1', false);
    expect(result.length).toBe(2);
    expect(result.find((c) => c.id === 'c2')).toBeUndefined();
    expect(result.find((c) => c.id === 'c3')).toBeDefined();
  });

  it('admin viewer: hidden도 모두 표시', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({
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
                    data: () => ({
                      id: 'c2',
                      postId: 'p1',
                      authorUid: 'u2',
                      authorNickname: 'm',
                      body: '숨김',
                      parentCommentId: null,
                      hidden: true,
                      keptByOperator: false,
                      deletedByOperator: false,
                    }),
                  },
                ],
              }),
            ),
          })),
        })),
      })),
    } as never);

    const result = await listComments('p1', true);
    expect(result.length).toBe(1);
  });

  it('firestore throw → empty', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const result = await listComments('p1', false);
    expect(result).toEqual([]);
  });
});
