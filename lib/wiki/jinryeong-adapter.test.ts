/**
 * lib/wiki/jinryeong-adapter.ts — Sprint 21 F21-A 단위 테스트.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('@/data/wiki/jinryeong', () => ({
  WIKI_JINRYEONG_SEED: [
    { id: 'chiwoo', name: '치우', tier: 1 },
    { id: 'hangah', name: '항아', tier: 0 },
  ],
}));

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { listWikiJinryeong, getWikiJinryeongById } from './jinryeong-adapter';

const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('listWikiJinryeong', () => {
  it('admin creds 없으면 SEED fallback', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await listWikiJinryeong();
    expect(r.length).toBe(2);
    expect(r[0]?.id).toBe('chiwoo');
  });

  it('Firestore 비어 있으면 SEED fallback', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
      })),
    } as never);
    const r = await listWikiJinryeong();
    expect(r.length).toBe(2);
  });

  it('Firestore docs 반환', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            empty: false,
            docs: [
              { data: () => ({ id: 'fire-1', name: '파이어1', tier: 0 }) },
              { data: () => ({ id: 'fire-2', name: '파이어2', tier: 1 }) },
            ],
          }),
        ),
      })),
    } as never);
    const r = await listWikiJinryeong();
    expect(r.length).toBe(2);
    expect(r[0]?.id).toBe('fire-1');
  });

  it('Firestore throw → SEED fallback', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const r = await listWikiJinryeong();
    expect(r.length).toBe(2);
    expect(r[0]?.id).toBe('chiwoo');
  });
});

describe('getWikiJinryeongById', () => {
  it('admin creds 없으면 SEED 검색', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await getWikiJinryeongById('chiwoo' as never);
    expect(r?.id).toBe('chiwoo');
  });

  it('SEED 에 없는 id → null', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await getWikiJinryeongById('unknown' as never);
    expect(r).toBeNull();
  });

  it('Firestore doc 존재 → 반환', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({ id: 'chiwoo', name: '치우 update', tier: 1 }),
            }),
          ),
        })),
      })),
    } as never);
    const r = await getWikiJinryeongById('chiwoo' as never);
    expect(r?.name).toBe('치우 update');
  });

  it('Firestore doc 없음 → SEED fallback', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
        })),
      })),
    } as never);
    const r = await getWikiJinryeongById('chiwoo' as never);
    expect(r?.id).toBe('chiwoo'); // SEED 값
  });

  it('Firestore throw → SEED fallback', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const r = await getWikiJinryeongById('chiwoo' as never);
    expect(r?.id).toBe('chiwoo');
  });
});
