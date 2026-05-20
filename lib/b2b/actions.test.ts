/**
 * lib/b2b/actions.ts — Server Actions 단위 테스트.
 * Sprint 20 F20-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/auth', () => ({ auth: vi.fn() }));
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
vi.mock('./api-key', () => ({
  generateApiKey: vi.fn(() => 'KKB-TEST-12345-RANDOM'),
  hashApiKey: vi.fn((key: string) => `hash(${key})`),
  maskApiKey: vi.fn((key: string) => `${key.slice(0, 8)}…`),
}));

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import {
  issueApiClient,
  listApiClients,
  revokeApiClient,
  getApiUsageDaily,
} from './actions';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

function adminSession(uid = 'a1') {
  return { user: { id: uid, role: 'admin', registered: true, nickname: 'admin' } };
}

const validIssueInput = {
  tenantId: 'tenant-1',
  tenantName: '거래처 A',
  tenantEmail: 'a@example.com',
  tier: 'pro' as const,
  contractStartsAtMs: 1700000000000,
  contractEndsAtMs: 1731536000000,
  monthlyFeeKrw: 500000,
};

describe('issueApiClient — admin guard', () => {
  it('UNAUTHENTICATED', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const r = await issueApiClient(validIssueInput);
    expect(r).toMatchObject({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('FORBIDDEN — non-admin', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', role: 'user' },
    } as never);
    const r = await issueApiClient(validIssueInput);
    expect(r).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('ADMIN_NOT_CONFIGURED', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    mockedHasAdmin.mockReturnValue(false);
    const r = await issueApiClient(validIssueInput);
    expect(r).toMatchObject({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  });
});

describe('issueApiClient — input validation', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(adminSession() as never);
  });

  it('빈 tenantId → INTERNAL missing_required_fields', async () => {
    const r = await issueApiClient({ ...validIssueInput, tenantId: '' });
    expect(r).toMatchObject({
      ok: false,
      error: 'INTERNAL',
      message: 'missing_required_fields',
    });
  });

  it('contractEndsAtMs <= contractStartsAtMs → INTERNAL invalid_contract_window', async () => {
    const r = await issueApiClient({
      ...validIssueInput,
      contractEndsAtMs: validIssueInput.contractStartsAtMs,
    });
    expect(r).toMatchObject({
      ok: false,
      error: 'INTERNAL',
      message: 'invalid_contract_window',
    });
  });
});

describe('issueApiClient — happy', () => {
  beforeEach(() => {
    mockedAuth.mockResolvedValue(adminSession() as never);
  });

  it('정상 발급 — apiKeyPlaintext 1회 반환', async () => {
    const setMock = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({ id: 'client-1', set: setMock })),
      })),
    } as never);

    const r = await issueApiClient(validIssueInput);
    if (!r.ok) throw new Error('expected ok');
    expect(r.result.client.id).toBe('client-1');
    expect(r.result.client.apiKeyHash).toContain('hash(');
    expect(r.result.client.isActive).toBe(true);
    expect(r.result.apiKeyPlaintext).toBe('KKB-TEST-12345-RANDOM');
  });

  it('notes 옵션 전달', async () => {
    const setMock = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({ id: 'client-2', set: setMock })),
      })),
    } as never);

    const r = await issueApiClient({ ...validIssueInput, notes: '특별 계약' });
    if (!r.ok) throw new Error('expected ok');
    expect(r.result.client.notes).toBe('특별 계약');
  });

  it('firestore throw → INTERNAL', async () => {
    const setMock = vi.fn(() => Promise.reject(new Error('write-fail')));
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({ id: 'client-x', set: setMock })),
      })),
    } as never);
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await issueApiClient(validIssueInput);
    expect(r).toMatchObject({
      ok: false,
      error: 'INTERNAL',
      message: 'write-fail',
    });
    consoleErr.mockRestore();
  });
});

describe('listApiClients', () => {
  it('non-admin → empty', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', role: 'user' },
    } as never);
    expect(await listApiClients()).toEqual([]);
  });

  it('admin: list 조회', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
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
              { data: () => ({ id: 'c1', tenantId: 't1' }) },
              { data: () => ({ id: 'c2', tenantId: 't2' }) },
            ],
          }),
        ),
      })),
    } as never);
    const r = await listApiClients();
    expect(r.length).toBe(2);
  });

  it('firestore throw → empty', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await listApiClients()).toEqual([]);
    consoleErr.mockRestore();
  });
});

describe('revokeApiClient', () => {
  it('FORBIDDEN — non-admin', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', role: 'user' },
    } as never);
    const r = await revokeApiClient('c1');
    expect(r).toMatchObject({ ok: false, error: 'FORBIDDEN' });
  });

  it('NOT_FOUND', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
          update: vi.fn(),
        })),
      })),
    } as never);
    const r = await revokeApiClient('c1');
    expect(r).toMatchObject({ ok: false, error: 'NOT_FOUND' });
  });

  it('happy: revoke', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    const updateMock = vi.fn(() => Promise.resolve());
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: true })),
          update: updateMock,
        })),
      })),
    } as never);
    const r = await revokeApiClient('c1');
    expect(r).toMatchObject({ ok: true });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
  });
});

describe('getApiUsageDaily', () => {
  it('non-admin → empty', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', role: 'user' },
    } as never);
    expect(await getApiUsageDaily('c1')).toEqual([]);
  });

  it('client 없음 → empty', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
        })),
      })),
    } as never);
    expect(await getApiUsageDaily('c1')).toEqual([]);
  });

  it('happy: usage 행 변환', async () => {
    mockedAuth.mockResolvedValue(adminSession() as never);
    mockedFirestore.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'api_clients') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn(() =>
                Promise.resolve({
                  exists: true,
                  data: () => ({ apiKeyHash: 'h1' }),
                }),
              ),
            })),
          };
        }
        // api_usage
        return {
          where: vi.fn(function (this: unknown) {
            return this;
          }),
          orderBy: vi.fn(function (this: unknown) {
            return this;
          }),
          limit: vi.fn(function (this: unknown) {
            return this;
          }),
          get: vi.fn(() =>
            Promise.resolve({
              docs: [
                { data: () => ({ date: '2026-05-19', count: 100 }) },
                { data: () => ({ date: '2026-05-18', count: 200 }) },
              ],
            }),
          ),
        };
      }),
    } as never);
    const r = await getApiUsageDaily('c1', 7);
    expect(r.length).toBe(2);
    expect(r[0]).toMatchObject({ date: '2026-05-19', count: 100 });
  });
});
