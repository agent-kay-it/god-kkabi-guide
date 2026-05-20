/**
 * lib/b2b/tenant-theme.ts — Sprint 27 F27-C 단위 테스트.
 * sanitizeHex/sanitizeUrl + getTenantTheme Firestore + CSS style helper.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockDoc = vi.fn(() => ({ get: mockGet }));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));
const mockFirestore = { collection: mockCollection };
const mockHasCredentials = vi.fn(() => true);

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => mockFirestore,
  hasAdminCredentials: () => mockHasCredentials(),
}));

import { getTenantTheme, tenantThemeStyle } from './tenant-theme';

beforeEach(() => {
  mockGet.mockReset();
  mockDoc.mockClear();
  mockCollection.mockClear();
  mockHasCredentials.mockReturnValue(true);
});

describe('getTenantTheme', () => {
  it('tenantId 없음 → null', async () => {
    expect(await getTenantTheme(undefined)).toBeNull();
    expect(await getTenantTheme('')).toBeNull();
  });

  it('credential 없음 → null (Firestore 호출 X)', async () => {
    mockHasCredentials.mockReturnValue(false);
    expect(await getTenantTheme('t1')).toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('Firestore doc 없음 → null', async () => {
    mockGet.mockResolvedValue({ exists: false });
    expect(await getTenantTheme('t1')).toBeNull();
  });

  it('happy: 모든 필드 sanitize 후 반환', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        tenantName: 'Game Co',
        logoUrl: 'https://storage.googleapis.com/x/logo.png',
        primaryColor: '#ffaa00',
        secondaryColor: '#00bb88',
      }),
    });
    const r = await getTenantTheme('t1');
    expect(r).toEqual({
      tenantId: 't1',
      tenantName: 'Game Co',
      logoUrl: 'https://storage.googleapis.com/x/logo.png',
      primaryColor: '#ffaa00',
      secondaryColor: '#00bb88',
    });
  });

  it('logoUrl http (https 아님) → undefined 처리', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        logoUrl: 'http://attacker.com/logo.png',
        primaryColor: '#ff0000',
      }),
    });
    const r = await getTenantTheme('t1');
    expect(r?.logoUrl).toBeUndefined();
    expect(r?.primaryColor).toBe('#ff0000');
  });

  it('logoUrl 잘못된 URL → undefined', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ logoUrl: 'not-a-url' }),
    });
    const r = await getTenantTheme('t1');
    expect(r?.logoUrl).toBeUndefined();
  });

  it('primaryColor 형식 위반 → undefined (XSS 방어)', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        primaryColor: 'red',
        secondaryColor: '#zzz',
      }),
    });
    const r = await getTenantTheme('t1');
    expect(r?.primaryColor).toBeUndefined();
    expect(r?.secondaryColor).toBeUndefined();
  });

  it('Firestore throw → null + console.error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGet.mockRejectedValue(new Error('Firestore down'));
    expect(await getTenantTheme('t1')).toBeNull();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('non-string value 안전 처리', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        primaryColor: 123, // number
        secondaryColor: null,
      }),
    });
    const r = await getTenantTheme('t1');
    expect(r?.primaryColor).toBeUndefined();
    expect(r?.secondaryColor).toBeUndefined();
  });
});

describe('tenantThemeStyle', () => {
  it('null → 빈 객체', () => {
    expect(tenantThemeStyle(null)).toEqual({});
  });

  it('primaryColor + secondaryColor → CSS variable', () => {
    const style = tenantThemeStyle({
      tenantId: 't1',
      primaryColor: '#ff8800',
      secondaryColor: '#00bb88',
    }) as Record<string, string>;
    expect(style['--bronze']).toBe('#ff8800');
    expect(style['--jade']).toBe('#00bb88');
  });

  it('color 없는 경우 → 빈 객체', () => {
    const style = tenantThemeStyle({ tenantId: 't1' }) as Record<string, string>;
    expect(style['--bronze']).toBeUndefined();
    expect(style['--jade']).toBeUndefined();
  });
});
