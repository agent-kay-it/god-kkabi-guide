/**
 * lib/wiki/classes-adapter.ts — Sprint 21 F21-A 단위 테스트.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('@/data/wiki/classes', () => ({
  WIKI_CLASSES_SEED: [
    { id: 'warrior', name: '전사' },
    { id: 'swordsman', name: '검객' },
    { id: 'medium', name: '영매' },
  ],
}));

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { listWikiClasses, getWikiClassById } from './classes-adapter';

const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('listWikiClasses', () => {
  it('admin creds 없으면 SEED', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect((await listWikiClasses()).length).toBe(3);
  });

  it('Firestore empty → SEED', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
      })),
    } as never);
    expect((await listWikiClasses()).length).toBe(3);
  });

  it('Firestore docs 반환', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        get: vi.fn(() =>
          Promise.resolve({
            empty: false,
            docs: [{ data: () => ({ id: 'warrior', name: '전사 V2' }) }],
          }),
        ),
      })),
    } as never);
    const r = await listWikiClasses();
    expect(r[0]?.name).toBe('전사 V2');
  });

  it('Firestore throw → SEED', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    expect((await listWikiClasses()).length).toBe(3);
  });
});

describe('getWikiClassById', () => {
  it('SEED 없는 id → null (no admin)', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect(await getWikiClassById('unknown' as never)).toBeNull();
  });

  it('Firestore doc 존재 → 반환', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({ id: 'warrior', name: 'override' }),
            }),
          ),
        })),
      })),
    } as never);
    expect((await getWikiClassById('warrior' as never))?.name).toBe('override');
  });

  it('Firestore doc 없음 → SEED fallback', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
        })),
      })),
    } as never);
    expect((await getWikiClassById('warrior' as never))?.name).toBe('전사');
  });

  it('Firestore throw → SEED fallback', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    expect((await getWikiClassById('warrior' as never))?.name).toBe('전사');
  });
});
