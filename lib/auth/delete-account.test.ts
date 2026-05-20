/**
 * lib/auth/delete-account.ts — Sprint 27 F27-B 단위 테스트.
 * 회원 탈퇴 Server Action — PIPA 30일 cooldown + 2-step 확인.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockTxUpdate = vi.fn();
const mockTxGet = vi.fn(() => Promise.resolve({ exists: true, data: () => ({}) }));
const mockRunTransaction = vi.fn(async (fn: (tx: unknown) => Promise<void>) => {
  await fn({ get: mockTxGet, update: mockTxUpdate });
});
const mockUserGet = vi.fn();
const mockUserRef = { get: mockUserGet };
const mockDocRef = vi.fn();
const mockCollection = vi.fn((name: string) => ({
  doc: (id: string) => {
    if (name === 'users' && id === 'u1') return mockUserRef;
    return { id, name, ref: 'mock' };
  },
}));
const mockFirestore = {
  collection: mockCollection,
  runTransaction: mockRunTransaction,
};
const mockAuth = vi.fn();
const mockSignOut = vi.fn(() => Promise.resolve());
const mockHasCredentials = vi.fn(() => true);
const mockSetClaimsWithRetry = vi.fn(() => Promise.resolve());

vi.mock('@/lib/auth/auth', () => ({
  auth: (...a: never[]) => (mockAuth as (...x: never[]) => unknown)(...a),
  signOut: (...a: never[]) => (mockSignOut as (...x: never[]) => unknown)(...a),
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => mockFirestore,
  hasAdminCredentials: () => mockHasCredentials(),
}));
vi.mock('@/lib/firebase/claims-retry-queue', () => ({
  setUserClaimsWithRetry: (...a: never[]) =>
    (mockSetClaimsWithRetry as (...x: never[]) => unknown)(...a),
}));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: () => '__ts__',
    increment: (n: number) => ({ __inc: n }),
  },
}));

import { requestAccountDeletion } from './delete-account';

beforeEach(() => {
  mockTxUpdate.mockClear();
  mockTxGet.mockClear();
  mockRunTransaction.mockClear();
  mockUserGet.mockReset();
  mockDocRef.mockClear();
  mockAuth.mockReset();
  mockSignOut.mockClear();
  mockHasCredentials.mockReturnValue(true);
  mockSetClaimsWithRetry.mockReset().mockResolvedValue(undefined);
});

describe('requestAccountDeletion', () => {
  it('UNAUTHENTICATED', async () => {
    mockAuth.mockResolvedValue(null);
    const r = await requestAccountDeletion({
      nicknameConfirm: 'x',
      keywordConfirm: '탈퇴',
    });
    expect(r).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('NOT_REGISTERED', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: false } });
    const r = await requestAccountDeletion({
      nicknameConfirm: 'x',
      keywordConfirm: '탈퇴',
    });
    expect(r).toEqual({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('ADMIN_NOT_CONFIGURED', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockHasCredentials.mockReturnValue(false);
    const r = await requestAccountDeletion({
      nicknameConfirm: 'x',
      keywordConfirm: '탈퇴',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('ADMIN_NOT_CONFIGURED');
  });

  it('NOT_REGISTERED — user 문서 없음', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockUserGet.mockResolvedValue({ exists: false });
    const r = await requestAccountDeletion({
      nicknameConfirm: 'kay',
      keywordConfirm: '탈퇴',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('NOT_REGISTERED');
  });

  it('CONFIRMATION_FAILED — nickname 불일치', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({
        nickname: 'kay',
        serverId: 'S1',
        munpa: 'M1',
      }),
    });
    const r = await requestAccountDeletion({
      nicknameConfirm: 'wrong',
      keywordConfirm: '탈퇴',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('CONFIRMATION_FAILED');
  });

  it('CONFIRMATION_FAILED — keyword 불일치', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({ nickname: 'kay', serverId: 'S1', munpa: 'M1' }),
    });
    const r = await requestAccountDeletion({
      nicknameConfirm: 'kay',
      keywordConfirm: '취소',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('CONFIRMATION_FAILED');
  });

  it('idempotent — 이미 pending_deletion 인 사용자 → ok 즉시', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({
        nickname: 'kay',
        serverId: 'S1',
        munpa: 'M1',
        status: 'pending_deletion',
      }),
    });
    const r = await requestAccountDeletion({
      nicknameConfirm: 'kay',
      keywordConfirm: '탈퇴',
    });
    expect(r).toEqual({ ok: true });
    expect(mockRunTransaction).not.toHaveBeenCalled();
  });

  it('happy: 트랜잭션 + claims revoke + signOut', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({
        nickname: 'kay',
        serverId: 'S1',
        munpa: 'M1',
      }),
    });
    const r = await requestAccountDeletion({
      nicknameConfirm: 'kay',
      keywordConfirm: '탈퇴',
    });
    expect(r).toEqual({ ok: true });
    // 트랜잭션 실행 + users 업데이트
    expect(mockRunTransaction).toHaveBeenCalled();
    expect(mockTxUpdate).toHaveBeenCalledWith(
      mockUserRef,
      expect.objectContaining({
        status: 'pending_deletion',
        nickname: '삭제된 사용자',
        photoURL: null,
        registered: false,
      }),
    );
    // claims revoke
    expect(mockSetClaimsWithRetry).toHaveBeenCalledWith('u1', {
      role: 'user',
      registered: false,
      serverId: '',
      munpaId: '',
    });
    // signOut
    expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
  });

  it('happy: serverId/munpa 없는 사용자도 처리 (등록 미완료 케이스)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({ nickname: 'kay' }), // serverId/munpa 없음
    });
    const r = await requestAccountDeletion({
      nicknameConfirm: 'kay',
      keywordConfirm: '탈퇴',
    });
    expect(r).toEqual({ ok: true });
  });

  it('INTERNAL — userRef.get throw', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockUserGet.mockRejectedValue(new Error('Firestore down'));
    const r = await requestAccountDeletion({
      nicknameConfirm: 'kay',
      keywordConfirm: '탈퇴',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('INTERNAL');
  });

  it('INTERNAL — runTransaction throw', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({ nickname: 'kay', serverId: 'S1', munpa: 'M1' }),
    });
    mockRunTransaction.mockRejectedValueOnce(new Error('tx fail'));
    const r = await requestAccountDeletion({
      nicknameConfirm: 'kay',
      keywordConfirm: '탈퇴',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBe('INTERNAL');
      expect(r.message).toBe('tx fail');
    }
  });
});
