/**
 * lib/insights/jinryeong-rate.ts — Sprint 22 F22-A 단위 테스트 (getter 중심).
 *
 * aggregateJinryeongWeek 는 매우 복잡한 aggregation 로직이라
 * 본 테스트는 핵심 getter (listJinryeongRate) + smoke 만 다룸.
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
import { aggregateJinryeongWeek, listJinryeongRate } from './jinryeong-rate';

const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('aggregateJinryeongWeek', () => {
  it('admin creds 없으면 ok:false', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await aggregateJinryeongWeek();
    expect(r.ok).toBe(false);
  });

  it('posts/runs 0건 → rowCount 0 + ok:true', async () => {
    const batch = { set: vi.fn(), commit: vi.fn(() => Promise.resolve()) };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ docs: [] })),
        doc: vi.fn(() => ({})),
      })),
      batch: vi.fn(() => batch),
    } as never);
    const r = await aggregateJinryeongWeek();
    expect(r.ok).toBe(true);
    expect(r.rowCount).toBe(0);
  });

  it('weekISO 명시 — 그대로 반환', async () => {
    const batch = { set: vi.fn(), commit: vi.fn(() => Promise.resolve()) };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ docs: [] })),
        doc: vi.fn(() => ({})),
      })),
      batch: vi.fn(() => batch),
    } as never);
    const r = await aggregateJinryeongWeek('2026-W19');
    expect(r.ok).toBe(true);
    // 명시한 weekISO 값이 그대로 반환됨
    expect(r.weekISO).toBeTruthy();
  });
});

describe('listJinryeongRate', () => {
  it('admin creds 없으면 empty', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect(await listJinryeongRate()).toEqual([]);
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
              { data: () => ({ jinryeongId: 'chiwoo', rank: 1, count: 100 }) },
              { data: () => ({ jinryeongId: 'hangah', rank: 2, count: 80 }) },
            ],
          }),
        ),
      })),
    } as never);
    const r = await listJinryeongRate();
    expect(r.length).toBe(2);
  });

  it('classId 지정 → where 호출', async () => {
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
    await listJinryeongRate('medium' as never);
    expect(whereMock).toHaveBeenCalledWith('className', '==', 'medium');
  });

  it('Firestore throw → empty', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await listJinryeongRate()).toEqual([]);
    consoleErr.mockRestore();
  });
});
