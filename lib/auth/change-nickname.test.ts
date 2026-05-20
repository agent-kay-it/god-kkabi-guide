/**
 * lib/auth/change-nickname.ts — Sprint 21 F21-E 단위 테스트.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
  },
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));
vi.mock('@/lib/firebase/claims-retry-queue', () => ({
  setUserClaimsWithRetry: vi.fn(() => Promise.resolve()),
}));

import { auth } from './auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { setUserClaimsWithRetry } from '@/lib/firebase/claims-retry-queue';
import { changeNickname, NICKNAME_COOLDOWN_MS } from './change-nickname';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedSetClaims = vi.mocked(setUserClaimsWithRetry);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

function userSession(opts: { uid?: string; registered?: boolean; role?: string } = {}) {
  return {
    user: {
      id: opts.uid ?? 'u1',
      registered: opts.registered ?? true,
      role: opts.role ?? 'user',
      nickname: 'old-nick',
    },
  };
}

describe('changeNickname — guards', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const r = await changeNickname({ newNickname: 'new12' });
    expect(r).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('NOT_REGISTERED', async () => {
    mockedAuth.mockResolvedValue(userSession({ registered: false }) as never);
    const r = await changeNickname({ newNickname: 'new12' });
    expect(r).toMatchObject({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('ADMIN_NOT_CONFIGURED', async () => {
    mockedAuth.mockResolvedValue(userSession() as never);
    mockedHasAdmin.mockReturnValue(false);
    const r = await changeNickname({ newNickname: 'new12' });
    expect(r).toMatchObject({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });
});

describe('changeNickname — validation', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(userSession() as never);
  });

  it('1자 → VALIDATION_FAILED', async () => {
    const r = await changeNickname({ newNickname: '가' });
    expect(r).toMatchObject({ ok: false, error: 'VALIDATION_FAILED' });
  });

  it('13자 → VALIDATION_FAILED', async () => {
    const r = await changeNickname({ newNickname: 'a'.repeat(13) });
    expect(r).toMatchObject({ ok: false, error: 'VALIDATION_FAILED' });
  });

  it('특수문자 포함 → VALIDATION_FAILED', async () => {
    const r = await changeNickname({ newNickname: 'kay!' });
    expect(r).toMatchObject({ ok: false, error: 'VALIDATION_FAILED' });
  });

  it('한글 닉네임 허용', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({ nickname: 'old' }),
            }),
          ),
          update: vi.fn(),
        })),
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
      })),
      runTransaction: vi.fn(async (cb) => cb({ update: vi.fn(), set: vi.fn() } as never)),
    } as never);
    const r = await changeNickname({ newNickname: '깨비지기' });
    expect(r).toMatchObject({ ok: true });
  });
});

describe('changeNickname — business rules', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(userSession() as never);
  });

  it('NOT_REGISTERED — user doc 없음', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
        })),
      })),
    } as never);
    const r = await changeNickname({ newNickname: 'new_nick' });
    expect(r).toMatchObject({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('현재 닉네임과 동일 → VALIDATION_FAILED', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({ nickname: 'same' }),
            }),
          ),
        })),
      })),
    } as never);
    const r = await changeNickname({ newNickname: 'same' });
    expect(r).toMatchObject({
      ok: false,
      error: 'VALIDATION_FAILED',
      message: '현재 닉네임과 동일',
    });
  });

  it('COOLDOWN — 30일 미경과', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({
                nickname: 'old',
                nicknameChangedAtMs: Date.now() - 1000 * 60 * 60 * 24, // 1일 전
              }),
            }),
          ),
        })),
      })),
    } as never);
    const r = await changeNickname({ newNickname: 'new_nick' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBe('COOLDOWN');
      expect(r.cooldownRemainingMs).toBeGreaterThan(0);
    }
  });

  it('DUPLICATE — 다른 사용자가 동일 닉네임 보유', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({ nickname: 'old' }),
            }),
          ),
        })),
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            empty: false,
            docs: [{ id: 'other-user' }],
          }),
        ),
      })),
    } as never);
    const r = await changeNickname({ newNickname: 'taken' });
    expect(r).toMatchObject({ ok: false, error: 'DUPLICATE' });
  });

  it('happy: 닉네임 변경 + claim 재발급 + history 기록', async () => {
    const txUpdate = vi.fn();
    const txSet = vi.fn();
    const historyDocRef = { id: 'history-1' };

    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'nickname_history') {
          return { doc: vi.fn(() => historyDocRef) };
        }
        return {
          doc: vi.fn(() => ({
            get: vi.fn(() =>
              Promise.resolve({
                exists: true,
                data: () => ({
                  nickname: 'old',
                  serverId: 'srv-1',
                  munpa: 'munpa-1',
                }),
              }),
            ),
          })),
          where: vi.fn(function (this: unknown) {
            return this;
          }),
          limit: vi.fn(function (this: unknown) {
            return this;
          }),
          get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
        };
      }),
      runTransaction: vi.fn(async (cb) => cb({ update: txUpdate, set: txSet } as never)),
    } as never);

    const r = await changeNickname({ newNickname: 'new_nick' });
    expect(r).toEqual({ ok: true });
    expect(txUpdate).toHaveBeenCalled();
    expect(txSet).toHaveBeenCalled();
    expect(mockedSetClaims).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        role: 'user',
        registered: true,
        serverId: 'srv-1',
        munpaId: 'srv-1_munpa-1',
      }),
    );
  });

  it('첫 변경 (nicknameChangedAtMs 없음) → cooldown 검증 통과', async () => {
    const txUpdate = vi.fn();
    const txSet = vi.fn();
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({ nickname: 'old' }),
            }),
          ),
        })),
        where: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
      })),
      runTransaction: vi.fn(async (cb) => cb({ update: txUpdate, set: txSet } as never)),
    } as never);
    const r = await changeNickname({ newNickname: 'new_nick' });
    expect(r).toEqual({ ok: true });
  });

  it('Firestore throw → INTERNAL', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await changeNickname({ newNickname: 'new_nick' });
    expect(r).toMatchObject({ ok: false, error: 'INTERNAL', message: 'boom' });
    consoleErr.mockRestore();
  });
});

describe('NICKNAME_COOLDOWN_MS', () => {
  it('30일', () => {
    expect(NICKNAME_COOLDOWN_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
