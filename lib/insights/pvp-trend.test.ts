/**
 * lib/insights/pvp-trend.ts — Sprint 22 F22-A 단위 테스트.
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
import { aggregatePvpWeek, listPvpTrend } from './pvp-trend';

const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('aggregatePvpWeek', () => {
  it('admin creds 없으면 ok:false', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await aggregatePvpWeek();
    expect(r.ok).toBe(false);
  });

  it('posts 0건 → rowCount 0', async () => {
    const batch = { set: vi.fn(), commit: vi.fn(() => Promise.resolve()) };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ docs: [] })),
        doc: vi.fn(),
      })),
      batch: vi.fn(() => batch),
    } as never);
    const r = await aggregatePvpWeek();
    expect(r.ok).toBe(true);
    expect(r.rowCount).toBe(0);
  });

  it('PvP 빌드 1건 → 1 row + rank=1', async () => {
    const batch = { set: vi.fn(), commit: vi.fn(() => Promise.resolve()) };
    const docRef = { id: 'pvp-1' };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            docs: [
              {
                data: () => ({
                  tags: [
                    'mode:pvp',
                    'jinryeong:chiwoo',
                    'jinryeong:hangah',
                    'jinryeong:hong_gildong',
                  ],
                  authorClassId: 'warrior',
                  createdAt: { toMillis: () => Date.now() },
                }),
              },
            ],
          }),
        ),
        doc: vi.fn(() => docRef),
      })),
      batch: vi.fn(() => batch),
    } as never);
    const r = await aggregatePvpWeek();
    expect(r.ok).toBe(true);
    expect(r.rowCount).toBe(1);
    expect(batch.set).toHaveBeenCalled();
  });

  it('PvP 아닌 빌드 → skip', async () => {
    const batch = { set: vi.fn(), commit: vi.fn(() => Promise.resolve()) };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            docs: [
              {
                data: () => ({
                  tags: ['jinryeong:chiwoo', 'jinryeong:hangah', 'jinryeong:hong_gildong'],
                  authorClassId: 'warrior',
                }),
              },
            ],
          }),
        ),
        doc: vi.fn(() => ({ id: 'x' })),
      })),
      batch: vi.fn(() => batch),
    } as never);
    const r = await aggregatePvpWeek();
    expect(r.rowCount).toBe(0);
    expect(batch.set).not.toHaveBeenCalled();
  });

  it('Firestore throw → ok:false', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.reject(new Error('boom'))),
      })),
    } as never);
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await aggregatePvpWeek();
    expect(r.ok).toBe(false);
    consoleErr.mockRestore();
  });
});

describe('listPvpTrend', () => {
  it('admin creds 없으면 empty', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect(await listPvpTrend()).toEqual([]);
  });

  it('happy: weekISO desc + rank asc 정렬 데이터', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            docs: [
              { data: () => ({ comboId: 'a_b_c', rank: 1, count: 5 }) },
              { data: () => ({ comboId: 'd_e_f', rank: 2, count: 3 }) },
            ],
          }),
        ),
      })),
    } as never);
    const r = await listPvpTrend();
    expect(r.length).toBe(2);
  });

  it('classId 지정 — where 호출', async () => {
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
    await listPvpTrend('warrior' as never);
    expect(whereMock).toHaveBeenCalledWith('className', '==', 'warrior');
  });

  it('Firestore throw → empty', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await listPvpTrend()).toEqual([]);
    consoleErr.mockRestore();
  });
});
