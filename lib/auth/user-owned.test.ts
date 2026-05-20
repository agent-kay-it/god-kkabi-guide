/**
 * lib/auth/user-owned.ts — Sprint 23 F23-A 단위 테스트.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { getUserOwnedJinryeong } from './user-owned';

const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

describe('getUserOwnedJinryeong', () => {
  it('uid 없음 → 빈 배열', async () => {
    expect(await getUserOwnedJinryeong(undefined)).toEqual([]);
    expect(await getUserOwnedJinryeong(null)).toEqual([]);
    expect(await getUserOwnedJinryeong('')).toEqual([]);
  });

  it('admin creds 없음 → 빈 배열', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect(await getUserOwnedJinryeong('u1')).toEqual([]);
  });

  it('user doc 없음 → 빈 배열', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
        })),
      })),
    } as never);
    expect(await getUserOwnedJinryeong('u1')).toEqual([]);
  });

  it('ownedJinryeong 필드 없음 → 빈 배열', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({ nickname: 'kay' }),
            }),
          ),
        })),
      })),
    } as never);
    expect(await getUserOwnedJinryeong('u1')).toEqual([]);
  });

  it('ownedJinryeong 필드 있음 → 배열 반환', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({
                ownedJinryeong: ['chiwoo', 'hangah', 'hong_gildong'],
              }),
            }),
          ),
        })),
      })),
    } as never);
    const r = await getUserOwnedJinryeong('u1');
    expect(r.length).toBe(3);
    expect(r).toContain('chiwoo');
  });

  it('Firestore throw → 빈 배열 (silent)', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await getUserOwnedJinryeong('u1')).toEqual([]);
    consoleErr.mockRestore();
  });
});
