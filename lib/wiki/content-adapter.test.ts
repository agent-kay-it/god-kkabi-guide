/**
 * lib/wiki/content-adapter.ts — Sprint 21 F21-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('@/data/wiki/contents', () => ({
  WIKI_CONTENTS_SEED: [{ id: 'c1', title: 'A' }, { id: 'c2', title: 'B' }],
}));

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { listWikiContents } from './content-adapter';

const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('listWikiContents', () => {
  it('no admin → SEED', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect((await listWikiContents()).length).toBe(2);
  });

  it('Firestore empty → SEED', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
      })),
    } as never);
    expect((await listWikiContents()).length).toBe(2);
  });

  it('Firestore docs 반환', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        get: vi.fn(() =>
          Promise.resolve({
            empty: false,
            docs: [{ data: () => ({ id: 'live-1', title: 'live' }) }],
          }),
        ),
      })),
    } as never);
    const r = await listWikiContents();
    expect(r[0]?.id).toBe('live-1');
  });

  it('Firestore throw → SEED', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    expect((await listWikiContents()).length).toBe(2);
  });
});
