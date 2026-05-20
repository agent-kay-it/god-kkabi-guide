/**
 * lib/wiki/equipment-adapter.ts — Sprint 21 F21-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('@/data/wiki/equipment', () => ({
  WIKI_EQUIPMENT_SEED: [
    { id: 'e1', name: 'A 장비' },
    { id: 'e2', name: 'B 장비' },
  ],
}));

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { listWikiEquipment } from './equipment-adapter';

const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('listWikiEquipment', () => {
  it('no admin → SEED', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect((await listWikiEquipment()).length).toBe(2);
  });

  it('Firestore empty → SEED', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
      })),
    } as never);
    expect((await listWikiEquipment()).length).toBe(2);
  });

  it('Firestore docs', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        get: vi.fn(() =>
          Promise.resolve({
            empty: false,
            docs: [{ data: () => ({ id: 'live', name: 'live 장비' }) }],
          }),
        ),
      })),
    } as never);
    const r = await listWikiEquipment();
    expect(r[0]?.name).toBe('live 장비');
  });

  it('Firestore throw → SEED', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    expect((await listWikiEquipment()).length).toBe(2);
  });
});
