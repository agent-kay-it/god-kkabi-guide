/**
 * lib/auth/update-owned-jinryeong.ts — Sprint 26 F26-B 단위 테스트.
 * Server Action 보안 가드 + Zod 검증 + Firestore set 시나리오 검증.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSet = vi.fn(() => Promise.resolve());
const mockDoc = vi.fn(() => ({ set: mockSet }));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));
const mockFirestore = { collection: mockCollection };
const mockAuth = vi.fn();
const mockRevalidate = vi.fn();

vi.mock('@/lib/auth/auth', () => ({
  auth: (...args: never[]) => (mockAuth as (...a: never[]) => unknown)(...args),
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => mockFirestore,
  hasAdminCredentials: () => true,
}));
vi.mock('next/cache', () => ({
  revalidatePath: (...args: never[]) =>
    (mockRevalidate as (...a: never[]) => unknown)(...args),
}));

import { updateOwnedJinryeong } from './update-owned-jinryeong';

beforeEach(() => {
  mockSet.mockClear();
  mockDoc.mockClear();
  mockCollection.mockClear();
  mockAuth.mockReset();
  mockRevalidate.mockClear();
});

describe('updateOwnedJinryeong', () => {
  it('UNAUTHENTICATED — session 없음', async () => {
    mockAuth.mockResolvedValue(null);
    const r = await updateOwnedJinryeong({ uids: ['hong_gildong'] });
    expect(r).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('UNAUTHENTICATED — user.id 누락', async () => {
    mockAuth.mockResolvedValue({ user: {} });
    const r = await updateOwnedJinryeong({ uids: ['hong_gildong'] });
    expect(r).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('NOT_REGISTERED — registered 미설정', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: false } });
    const r = await updateOwnedJinryeong({ uids: ['hong_gildong'] });
    expect(r).toEqual({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('BANNED — role=banned', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'banned' },
    });
    const r = await updateOwnedJinryeong({ uids: ['hong_gildong'] });
    expect(r).toEqual({ ok: false, error: 'BANNED' });
  });

  it('INVALID_INPUT — 진령 id 화이트리스트 외', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user' },
    });
    const r = await updateOwnedJinryeong({ uids: ['unknown_jinryeong'] });
    expect(r).toEqual({ ok: false, error: 'INVALID_INPUT' });
  });

  it('INVALID_INPUT — 20개 초과', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user' },
    });
    const r = await updateOwnedJinryeong({
      uids: new Array(21).fill('hong_gildong'),
    });
    expect(r).toEqual({ ok: false, error: 'INVALID_INPUT' });
  });

  it('happy: 정상 저장 + 정렬 + 중복 제거 + revalidate', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user' },
    });
    const r = await updateOwnedJinryeong({
      uids: ['seohaeyongwang', 'hong_gildong', 'seohaeyongwang', 'chiwoo'],
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 중복 제거 + 정렬 (a-z)
      expect(r.saved).toEqual(['chiwoo', 'hong_gildong', 'seohaeyongwang']);
    }
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith('u1');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        ownedJinryeong: ['chiwoo', 'hong_gildong', 'seohaeyongwang'],
        ownedJinryeongUpdatedAt: expect.any(Number),
      }),
      { merge: true },
    );
    expect(mockRevalidate).toHaveBeenCalledWith('/me');
    expect(mockRevalidate).toHaveBeenCalledWith('/simulator');
  });

  it('happy: 빈 배열도 정상 저장 (선택 해제)', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user' },
    });
    const r = await updateOwnedJinryeong({ uids: [] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.saved).toEqual([]);
    expect(mockSet).toHaveBeenCalled();
  });

  it('INTERNAL — Firestore set throw', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user' },
    });
    mockSet.mockRejectedValueOnce(new Error('Firestore down'));
    const r = await updateOwnedJinryeong({ uids: ['hong_gildong'] });
    expect(r).toEqual({ ok: false, error: 'INTERNAL' });
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it('전체 11개 진령 동시 저장', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', registered: true, role: 'user' },
    });
    const all = [
      'hong_gildong',
      'seohaeyongwang',
      'eumyeonggwi',
      'myeongwang',
      'chiwoo',
      'hangah',
      'gyeoktugwi',
      'gumiyoho',
      'taeyangyeosin',
      'gunggwi',
      'sansin',
    ];
    const r = await updateOwnedJinryeong({ uids: all });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.saved.length).toBe(11);
  });
});
