/**
 * lib/auth/update-profile-photo.ts — Sprint 27 F27-B 단위 테스트.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSet = vi.fn(() => Promise.resolve());
const mockDoc = vi.fn(() => ({ set: mockSet }));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));
const mockFirestore = { collection: mockCollection };
const mockAuth = vi.fn();
const mockHasCredentials = vi.fn(() => true);
const FIELD_DELETE_SENTINEL = { __delete: true };
const FIELD_TS_SENTINEL = { __ts: true };

vi.mock('@/lib/auth/auth', () => ({
  auth: (...args: never[]) => (mockAuth as (...a: never[]) => unknown)(...args),
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => mockFirestore,
  hasAdminCredentials: () => mockHasCredentials(),
}));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    delete: () => FIELD_DELETE_SENTINEL,
    serverTimestamp: () => FIELD_TS_SENTINEL,
  },
}));

import { updateProfilePhoto } from './update-profile-photo';

beforeEach(() => {
  mockSet.mockClear();
  mockDoc.mockClear();
  mockCollection.mockClear();
  mockAuth.mockReset();
  mockHasCredentials.mockReturnValue(true);
});

describe('updateProfilePhoto', () => {
  it('UNAUTHENTICATED — session 없음', async () => {
    mockAuth.mockResolvedValue(null);
    const r = await updateProfilePhoto({ photoUrl: 'https://cdn.kkaebizigi.com/profiles/x.png' });
    expect(r).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('NOT_REGISTERED', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: false } });
    const r = await updateProfilePhoto({ photoUrl: 'https://cdn.kkaebizigi.com/profiles/x.png' });
    expect(r).toEqual({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('ADMIN_NOT_CONFIGURED', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockHasCredentials.mockReturnValue(false);
    const r = await updateProfilePhoto({ photoUrl: 'https://cdn.kkaebizigi.com/profiles/x.png' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('ADMIN_NOT_CONFIGURED');
  });

  it('VALIDATION_FAILED — CDN 도메인 외 URL', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    const r = await updateProfilePhoto({ photoUrl: 'https://attacker.com/x.png' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('VALIDATION_FAILED');
  });

  it('VALIDATION_FAILED — http (https 아님)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    const r = await updateProfilePhoto({ photoUrl: 'http://cdn.kkaebizigi.com/profiles/x.png' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('VALIDATION_FAILED');
  });

  it('happy: production CDN URL 저장', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    const r = await updateProfilePhoto({
      photoUrl: 'https://cdn.kkaebizigi.com/profiles/u1.png',
    });
    expect(r).toEqual({ ok: true });
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        customPhotoURL: 'https://cdn.kkaebizigi.com/profiles/u1.png',
        updatedAt: FIELD_TS_SENTINEL,
      }),
      { merge: true },
    );
  });

  it('happy: staging CDN URL 도 허용', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    const r = await updateProfilePhoto({
      photoUrl: 'https://cdn-staging.kkaebizigi.com/profiles/u1.png',
    });
    expect(r).toEqual({ ok: true });
  });

  it('happy: photoUrl=null → FieldValue.delete() 설정', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    const r = await updateProfilePhoto({ photoUrl: null });
    expect(r).toEqual({ ok: true });
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        customPhotoURL: FIELD_DELETE_SENTINEL,
      }),
      { merge: true },
    );
  });

  it('INTERNAL — Firestore set throw', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', registered: true } });
    mockSet.mockRejectedValueOnce(new Error('boom'));
    const r = await updateProfilePhoto({
      photoUrl: 'https://cdn.kkaebizigi.com/profiles/u1.png',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBe('INTERNAL');
      expect(r.message).toBe('boom');
    }
  });
});
