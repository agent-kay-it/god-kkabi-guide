/**
 * lib/wiki/valid-ids-cache.ts — Sprint 21 F21-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('./classes-adapter', () => ({
  listWikiClasses: vi.fn(() => Promise.resolve([{ id: 'warrior' }, { id: 'swordsman' }])),
}));
vi.mock('./jinryeong-adapter', () => ({
  listWikiJinryeong: vi.fn(() => Promise.resolve([{ id: 'chiwoo' }, { id: 'hangah' }])),
}));
vi.mock('./content-adapter', () => ({
  listWikiContents: vi.fn(() => Promise.resolve([{ id: 'c1' }])),
}));
vi.mock('./skill-adapter', () => ({
  listWikiSkills: vi.fn(() => Promise.resolve([{ id: 's1' }, { id: 's2' }])),
}));
vi.mock('./equipment-adapter', () => ({
  listWikiEquipment: vi.fn(() => Promise.resolve([{ id: 'e1' }])),
}));

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { loadValidWikiIdSets, invalidateValidWikiIdsCache } from './valid-ids-cache';

const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
  invalidateValidWikiIdsCache();
});

function setupMunpaMock(ids: string[]) {
  mockedFirestore.mockReturnValue({
    collection: vi.fn(() => ({
      select: vi.fn(function (this: unknown) {
        return this;
      }),
      get: vi.fn(() =>
        Promise.resolve({
          docs: ids.map((id) => ({ id })),
        }),
      ),
    })),
  } as never);
}

describe('loadValidWikiIdSets', () => {
  it('admin creds 없으면 EMPTY_SETS', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await loadValidWikiIdSets();
    expect(r.class.size).toBe(0);
    expect(r.jinryeong.size).toBe(0);
  });

  it('happy: 6 카테고리 모두 채워짐', async () => {
    setupMunpaMock(['m1', 'm2']);
    const r = await loadValidWikiIdSets();
    expect(r.class.size).toBe(2);
    expect(r.jinryeong.size).toBe(2);
    expect(r.content.size).toBe(1);
    expect(r.skill.size).toBe(2);
    expect(r.equipment.size).toBe(1);
    expect(r.munpa.size).toBe(2);
    expect(r.class.has('warrior')).toBe(true);
  });

  it('cache hit — 두 번째 호출 시 adapter 재호출 X', async () => {
    setupMunpaMock([]);
    await loadValidWikiIdSets();
    const classesAdapter = await import('./classes-adapter');
    const callsBeforeSecondLoad = vi.mocked(classesAdapter.listWikiClasses).mock.calls.length;
    await loadValidWikiIdSets();
    const callsAfterSecondLoad = vi.mocked(classesAdapter.listWikiClasses).mock.calls.length;
    expect(callsAfterSecondLoad).toBe(callsBeforeSecondLoad); // 같음 (cache hit)
  });

  it('invalidate 후 재호출 시 adapter 재실행', async () => {
    setupMunpaMock([]);
    await loadValidWikiIdSets();
    invalidateValidWikiIdsCache();
    const classesAdapter = await import('./classes-adapter');
    const callsBeforeSecondLoad = vi.mocked(classesAdapter.listWikiClasses).mock.calls.length;
    await loadValidWikiIdSets();
    const callsAfterSecondLoad = vi.mocked(classesAdapter.listWikiClasses).mock.calls.length;
    expect(callsAfterSecondLoad).toBeGreaterThan(callsBeforeSecondLoad);
  });

  it('munpa Firestore throw → munpa 빈 set + 나머지는 정상', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        select: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.reject(new Error('munpa-fail'))),
      })),
    } as never);
    const r = await loadValidWikiIdSets();
    // munpa 0, 나머지 carry on
    expect(r.munpa.size).toBe(0);
    expect(r.class.size).toBe(2);
  });
});
