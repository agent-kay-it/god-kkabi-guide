/**
 * lib/wiki/skill-adapter.ts — Sprint 21 F21-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('@/data/wiki/skills', () => ({
  WIKI_SKILLS_SEED: [
    { id: 's-warrior-1', classId: 'warrior', name: '전사 스킬 1' },
    { id: 's-swordsman-1', classId: 'swordsman', name: '검객 스킬 1' },
    { id: 's-warrior-2', classId: 'warrior', name: '전사 스킬 2' },
  ],
}));

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { listWikiSkills, listWikiSkillsByClass } from './skill-adapter';

const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('listWikiSkills', () => {
  it('no admin → SEED', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect((await listWikiSkills()).length).toBe(3);
  });

  it('Firestore empty → SEED', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
      })),
    } as never);
    expect((await listWikiSkills()).length).toBe(3);
  });

  it('Firestore docs (orderBy chain)', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            empty: false,
            docs: [{ data: () => ({ id: 's-x', classId: 'warrior', name: 'live' }) }],
          }),
        ),
      })),
    } as never);
    const r = await listWikiSkills();
    expect(r[0]?.name).toBe('live');
  });

  it('Firestore throw → SEED', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    expect((await listWikiSkills()).length).toBe(3);
  });
});

describe('listWikiSkillsByClass', () => {
  it('no admin → SEED classId 필터', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await listWikiSkillsByClass('warrior' as never);
    expect(r.length).toBe(2);
    r.forEach((s) => expect(s.classId).toBe('warrior'));
  });

  it('Firestore docs + medium filter — client filter', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            empty: false,
            docs: [
              { data: () => ({ id: 'sx', classId: 'medium', name: '영매-X' }) },
              { data: () => ({ id: 'sy', classId: 'warrior', name: '전사-Y' }) },
            ],
          }),
        ),
      })),
    } as never);
    const r = await listWikiSkillsByClass('medium' as never);
    expect(r.length).toBe(1);
    expect(r[0]?.classId).toBe('medium');
  });

  it('SEED 필터 — swordsman 1개', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await listWikiSkillsByClass('swordsman' as never);
    expect(r.length).toBe(1);
    expect(r[0]?.classId).toBe('swordsman');
  });

  it('Firestore throw → SEED 필터', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const r = await listWikiSkillsByClass('warrior' as never);
    expect(r.length).toBe(2);
  });
});
