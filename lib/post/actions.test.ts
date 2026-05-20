/**
 * lib/post/actions.ts — Server Actions 단위 테스트.
 * Sprint 20 F20-A — Coverage 50%+ 도전.
 *
 * 시나리오:
 *  - createPost (validation + tag membership + happy)
 *  - updatePost (24h window + pendingEdit)
 *  - deletePost (본인 / admin soft delete)
 *  - listPosts (status filter + pagination + isOwnerView)
 *  - getPost (incrementView + status=deleted)
 *  - reportPostOrComment (중복 차단 + auto hide + 페널티)
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
vi.mock('@/lib/wiki/valid-ids-cache', () => ({
  loadValidWikiIdSets: vi.fn(() =>
    Promise.resolve({
      class: new Set(['warrior', 'swordsman', 'medium']),
      jinryeong: new Set(['hong_gildong', 'chiwoo']),
      content: new Set(),
      skill: new Set(),
      equipment: new Set(),
      munpa: new Set(),
    }),
  ),
}));
vi.mock('@/lib/penalty/actions', () => ({
  recordReport: vi.fn(() => Promise.resolve({ ok: true, newTotal: 1, penaltyApplied: null })),
}));

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { recordReport } from '@/lib/penalty/actions';
import {
  createPost,
  updatePost,
  deletePost,
  listPosts,
  getPost,
  reportPostOrComment,
} from './actions';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedRecordReport = vi.mocked(recordReport);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

function userSession(uid = 'u1', nickname = 'kay', role: 'user' | 'admin' | 'banned' = 'user') {
  return { user: { id: uid, registered: true, role, nickname } };
}

const validInput = {
  title: '내 빌드 공유',
  body: '본문 내용 입니다 충분한 길이로 작성합니다 본문 내용 입니다 본문 내용 입니다 더 길게 작성합니다.',
  category: 'build' as const,
  tags: ['jinryeong:hong_gildong'],
  imageUrls: [],
};

describe('createPost — 인증 가드', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const r = await createPost(validInput);
    expect(r).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('NOT_REGISTERED', async () => {
    mockedAuth.mockResolvedValue({ user: { id: 'u1', registered: false } } as never);
    const r = await createPost(validInput);
    expect(r).toMatchObject({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('BANNED', async () => {
    mockedAuth.mockResolvedValue(userSession('u1', 'k', 'banned') as never);
    const r = await createPost(validInput);
    expect(r).toMatchObject({ ok: false, error: 'BANNED' });
  });

  it('ADMIN_NOT_CONFIGURED', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    mockedHasAdmin.mockReturnValue(false);
    const r = await createPost(validInput);
    expect(r).toMatchObject({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });

  it('NOT_REGISTERED — nickname 빈 문자열', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user', nickname: '' },
    } as never);
    const r = await createPost(validInput);
    expect(r).toMatchObject({ ok: false, error: 'NOT_REGISTERED' });
  });
});

describe('createPost — validation', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(userSession() as never);
  });

  it('VALIDATION_FAILED — title 빈 문자열', async () => {
    const r = await createPost({ ...validInput, title: '' });
    if (r.ok) throw new Error('expected fail');
    expect(r.error).toBe('VALIDATION_FAILED');
    expect(r.fieldErrors?.title).toBeDefined();
  });

  it('VALIDATION_FAILED — invalid tag (wiki id 아님)', async () => {
    const r = await createPost({ ...validInput, tags: ['jinryeong:unknown'] });
    if (r.ok) throw new Error('expected fail');
    expect(r.error).toBe('VALIDATION_FAILED');
    expect(r.fieldErrors?.tags).toContain('존재하지 않는');
  });

  it('빈 tags 는 허용', async () => {
    const tx = {
      get: vi.fn().mockResolvedValueOnce({ exists: true, data: () => ({}) }),
      set: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => ({ id: 'p1' })) })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);
    const r = await createPost({ ...validInput, tags: [] });
    expect(r.ok).toBe(true);
  });
});

describe('createPost — happy', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(userSession() as never);
  });

  it('정상 저장 — postId 반환 + tx.set 2회 (post + user)', async () => {
    const postRef = { id: 'p-new' };
    const tx = { set: vi.fn() };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => postRef) })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);

    const r = await createPost(validInput);
    expect(r).toMatchObject({ ok: true, postId: 'p-new' });
    expect(tx.set).toHaveBeenCalledTimes(2);
  });

  it('firestore throw → INTERNAL', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => ({ id: 'p1' })) })),
      runTransaction: vi.fn(async () => {
        throw new Error('connection-refused');
      }),
    } as never);
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await createPost(validInput);
    expect(r).toMatchObject({ ok: false, error: 'INTERNAL', message: 'connection-refused' });
    consoleErr.mockRestore();
  });
});

describe('updatePost — 인증/권한', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const r = await updatePost('p1', validInput);
    expect(r).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('VALIDATION_FAILED', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const r = await updatePost('p1', { ...validInput, title: '' });
    expect(r).toMatchObject({ ok: false, error: 'VALIDATION_FAILED' });
  });

  it('FORBIDDEN — 다른 사용자 글', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
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
      collection: vi.fn(() => ({ doc: vi.fn() })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);
    const r = await updatePost('p1', validInput);
    expect(r).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('NOT_FOUND — 글 없음', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const tx = {
      get: vi.fn().mockResolvedValueOnce({ exists: false }),
      update: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn() })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);
    const r = await updatePost('p1', validInput);
    expect(r).toMatchObject({ ok: false, error: 'NOT_FOUND' });
  });
});

describe('updatePost — 24h 윈도우 분기', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(userSession() as never);
  });

  it('24h 이내 → 직접 수정 (status 변경 X)', async () => {
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({
          authorUid: 'u1',
          createdAt: { toMillis: () => Date.now() - 1000 * 60 * 60 }, // 1시간 전
        }),
      }),
      update: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn() })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);
    const r = await updatePost('p1', validInput);
    expect(r).toMatchObject({ ok: true });
    const updateArg = tx.update.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(updateArg.title).toBe(validInput.title);
    expect(updateArg.status).toBeUndefined(); // 직접 수정은 status 변경 안 함
  });

  it('24h 후 → pendingEdit 큐 (status=pending_edit)', async () => {
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({
          authorUid: 'u1',
          createdAt: { toMillis: () => Date.now() - 1000 * 60 * 60 * 25 }, // 25시간 전
        }),
      }),
      update: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn() })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);
    const r = await updatePost('p1', validInput);
    expect(r).toMatchObject({ ok: true });
    const updateArg = tx.update.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(updateArg.status).toBe('pending_edit');
    expect(updateArg.pendingEdit).toBeDefined();
  });
});

describe('deletePost', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const r = await deletePost('p1');
    expect(r).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('FORBIDDEN — 본인 글 아님 + non-admin', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ authorUid: 'other-user' }),
      }),
      update: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn() })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);
    const r = await deletePost('p1');
    expect(r).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('happy: 본인 soft delete + users.postCount--', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ authorUid: 'u1' }),
      }),
      update: vi.fn(),
      set: vi.fn(),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn() })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);
    const r = await deletePost('p1');
    expect(r).toMatchObject({ ok: true });
    expect(tx.update.mock.calls[0]?.[1]).toMatchObject({ status: 'deleted' });
    expect(tx.set).toHaveBeenCalled(); // users.postCount--
  });

  it('admin 이 타인 글 삭제 → moderation_logs 기록', async () => {
    mockedAuth.mockResolvedValue(userSession('a1', 'admin', 'admin') as never);
    const tx = {
      get: vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ authorUid: 'u-someone' }),
      }),
      update: vi.fn(),
      set: vi.fn(),
    };
    const logAdd = vi.fn(() => Promise.resolve({ id: 'log-1' }));
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'moderation_logs') return { add: logAdd };
        return { doc: vi.fn() };
      }),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);
    const r = await deletePost('p1');
    expect(r).toMatchObject({ ok: true });
    expect(logAdd).toHaveBeenCalled();
    expect(tx.set).not.toHaveBeenCalled(); // 본인 글이 아니므로 users.postCount-- X
  });
});

describe('listPosts', () => {
  it('admin creds 없으면 empty', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await listPosts({ sort: 'latest' });
    expect(r).toEqual({ items: [], nextCursor: null });
  });

  function buildQueryChain(docs: ReadonlyArray<{ data: () => Record<string, unknown> }>) {
    const chain: Record<string, unknown> = {};
    chain.where = vi.fn(() => chain);
    chain.orderBy = vi.fn(() => chain);
    chain.startAfter = vi.fn(() => chain);
    chain.limit = vi.fn(() => chain);
    chain.get = vi.fn(() => Promise.resolve({ docs }));
    return chain;
  }

  it('published 글 nextCursor 없는 결과', async () => {
    const chain = buildQueryChain([
      {
        data: () => ({
          id: 'p1',
          authorUid: 'u1',
          authorNickname: 'kay',
          category: 'build',
          title: '제목',
          bodyExcerpt: 'excerpt',
          status: 'published',
          tags: [],
          imageUrls: [],
          likeCount: 1,
          commentCount: 0,
          viewCount: 5,
          reportedCount: 0,
          createdAt: { toMillis: () => 1000 },
          updatedAt: { toMillis: () => 2000 },
        }),
      },
    ]);
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => chain),
    } as never);
    const r = await listPosts({ sort: 'latest' });
    expect(r.items.length).toBe(1);
    expect(r.nextCursor).toBeNull();
  });

  it('isOwnerView 시 pending_edit 도 포함', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const chain = buildQueryChain([]);
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => chain),
    } as never);
    await listPosts({ sort: 'latest', authorUid: 'u1' });
    const whereCalls = (chain.where as ReturnType<typeof vi.fn>).mock.calls;
    // status 가 ['published', 'pending_edit'] in 으로 호출됨
    const statusCall = whereCalls.find((c) => c[0] === 'status');
    expect(statusCall?.[1]).toBe('in');
    expect(statusCall?.[2]).toEqual(['published', 'pending_edit']);
  });

  it('firestore throw → empty', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const r = await listPosts({ sort: 'latest' });
    expect(r).toEqual({ items: [], nextCursor: null });
  });
});

describe('getPost', () => {
  it('admin creds 없으면 null', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await getPost('p1');
    expect(r).toBeNull();
  });

  it('not found → null', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
        })),
      })),
    } as never);
    const r = await getPost('p1');
    expect(r).toBeNull();
  });

  it('status=deleted → null', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              ref: { update: vi.fn() },
              data: () => ({ status: 'deleted' }),
            }),
          ),
        })),
      })),
    } as never);
    const r = await getPost('p1');
    expect(r).toBeNull();
  });

  it('happy: data 변환', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              ref: { update: vi.fn() },
              data: () => ({
                id: 'p1',
                authorUid: 'u1',
                authorNickname: 'kay',
                category: 'build',
                title: '제목',
                body: '본문',
                bodyExcerpt: 'excerpt',
                tags: ['hong_gildong'],
                imageUrls: [],
                status: 'published',
                viewCount: 10,
                likeCount: 5,
                commentCount: 2,
                reportedCount: 0,
                createdAt: { toMillis: () => 1000 },
                updatedAt: { toMillis: () => 2000 },
              }),
            }),
          ),
        })),
      })),
    } as never);
    const r = await getPost('p1');
    expect(r?.id).toBe('p1');
    expect(r?.likeCount).toBe(5);
  });

  it('incrementView 옵션 활성화 시 ref.update 호출', async () => {
    const updateMock = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              ref: { update: updateMock },
              data: () => ({
                id: 'p1',
                authorUid: 'u1',
                authorNickname: 'k',
                category: 'build',
                title: 't',
                body: 'b',
                bodyExcerpt: 'e',
                tags: [],
                imageUrls: [],
                status: 'published',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                reportedCount: 0,
              }),
            }),
          ),
        })),
      })),
    } as never);
    await getPost('p1', { incrementView: true });
    expect(updateMock).toHaveBeenCalled();
  });

  it('firestore throw → null', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const r = await getPost('p1');
    expect(r).toBeNull();
  });
});

describe('reportPostOrComment', () => {
  const reportInput = {
    targetType: 'post' as const,
    targetId: 'p1',
    postId: 'p1',
    reportedUid: 'other-user',
    reasons: ['spam' as const],
    snapshot: '제목 — 본문 — k',
  };

  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const r = await reportPostOrComment(reportInput);
    expect(r).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('SELF_REPORT 차단', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const r = await reportPostOrComment({ ...reportInput, reportedUid: 'u1' });
    expect(r).toMatchObject({ ok: false, error: 'SELF_REPORT' });
  });

  it('NO_REASON', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const r = await reportPostOrComment({ ...reportInput, reasons: [] });
    expect(r).toMatchObject({ ok: false, error: 'NO_REASON' });
  });

  it('happy: 신고 + auto hide (5+ 누적)', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ exists: false }) // 기존 report 없음
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ reportedCount: 4 }),
        }), // 5번째 신고
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
    const r = await reportPostOrComment(reportInput);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.autoHidden).toBe(true);
    }
    expect(mockedRecordReport).toHaveBeenCalledWith({
      targetUid: 'other-user',
      source: 'post',
      sourceId: 'p1',
    });
  });

  it('중복 신고는 silent skip', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ exists: true }) // 이미 신고함
        .mockResolvedValueOnce({ exists: true, data: () => ({ reportedCount: 1 }) }),
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
    const r = await reportPostOrComment(reportInput);
    expect(r.ok).toBe(true);
    expect(tx.set).not.toHaveBeenCalled();
  });

  it('TARGET_NOT_FOUND', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    const tx = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ exists: false })
        .mockResolvedValueOnce({ exists: false }),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn() })),
        })),
      })),
      runTransaction: vi.fn(async (cb) => cb(tx as never)),
    } as never);
    const r = await reportPostOrComment(reportInput);
    expect(r).toMatchObject({ ok: false, error: 'TARGET_NOT_FOUND' });
  });
});
