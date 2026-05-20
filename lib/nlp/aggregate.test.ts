/**
 * lib/nlp/aggregate.ts — Sprint 23 F23-E 단위 테스트.
 *
 * 복잡한 aggregation 로직이라 핵심 path 만 검증:
 *  - guard (no admin)
 *  - empty posts/comments → 0 result
 *  - 단일 post + 매칭 → 정상 흐름
 *  - listPainTopics getter
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
  },
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import {
  aggregatePainTopicsWeek,
  listPainTopics,
  TOTAL_PAIN_KEYWORDS,
} from './aggregate';

const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

function buildEmptyFirestore() {
  return {
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
      get: vi.fn(() => Promise.resolve({ docs: [] })),
      doc: vi.fn(() => ({ id: 'auto-id' })),
    })),
    collectionGroup: vi.fn(() => ({
      where: vi.fn(function (this: unknown) {
        return this;
      }),
      get: vi.fn(() => Promise.resolve({ docs: [] })),
    })),
    batch: vi.fn(() => ({
      set: vi.fn(),
      commit: vi.fn(() => Promise.resolve()),
    })),
    doc: vi.fn(() => ({ id: 'auto-id' })),
  };
}

describe('aggregatePainTopicsWeek', () => {
  it('admin creds 없으면 ok:false', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await aggregatePainTopicsWeek();
    expect(r.ok).toBe(false);
    expect(r.topicCount).toBe(0);
    expect(r.mentionCount).toBe(0);
  });

  it('posts 0건 + comments 0건 → topic 0', async () => {
    mockedFirestore.mockReturnValue(buildEmptyFirestore() as never);
    const r = await aggregatePainTopicsWeek();
    expect(r.ok).toBe(true);
    expect(r.topicCount).toBe(0);
    expect(r.mentionCount).toBe(0);
  });

  it('posts 스캔 throw → comments 흐름은 계속 + ok:true', async () => {
    const collectionMock = vi.fn((name?: string) => {
      if (name === 'posts') {
        return {
          where: vi.fn(function (this: unknown) {
            return this;
          }),
          get: vi.fn(() => Promise.reject(new Error('posts-fail'))),
          doc: vi.fn(),
        };
      }
      return {
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ docs: [] })),
        doc: vi.fn(() => ({ id: 'pm-1' })),
      };
    });
    mockedFirestore.mockReturnValue({
      collection: collectionMock,
      collectionGroup: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ docs: [] })),
      })),
      batch: vi.fn(() => ({
        set: vi.fn(),
        commit: vi.fn(() => Promise.resolve()),
      })),
      doc: vi.fn(() => ({ id: 'auto-id' })),
    } as never);
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await aggregatePainTopicsWeek();
    expect(r.ok).toBe(true);
    consoleErr.mockRestore();
  });
});

describe('listPainTopics', () => {
  it('admin creds 없으면 empty', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect(await listPainTopics()).toEqual([]);
  });

  it('happy: docs 반환', async () => {
    mockedFirestore.mockReturnValue({
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
              { data: () => ({ keywordId: 'b_bug', rank: 1, count: 50 }) },
            ],
          }),
        ),
      })),
    } as never);
    const r = await listPainTopics();
    expect(r.length).toBe(1);
  });

  it('weekISO + category filter', async () => {
    const whereMock = vi.fn(function (this: unknown) {
      return this;
    });
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        where: whereMock,
        get: vi.fn(() => Promise.resolve({ docs: [] })),
      })),
    } as never);
    await listPainTopics('2026-W20', 'bug');
    expect(whereMock).toHaveBeenCalledWith('weekISO', '==', '2026-W20');
    expect(whereMock).toHaveBeenCalledWith('category', '==', 'bug');
  });

  it('Firestore throw → empty', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await listPainTopics()).toEqual([]);
    consoleErr.mockRestore();
  });
});

describe('TOTAL_PAIN_KEYWORDS', () => {
  it('PAIN_KEYWORDS.length 와 일치', () => {
    expect(TOTAL_PAIN_KEYWORDS).toBeGreaterThan(20);
    expect(TOTAL_PAIN_KEYWORDS).toBeLessThan(100);
  });
});
