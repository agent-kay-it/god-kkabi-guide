/**
 * lib/post/og-preview.ts — Sprint 26 F26-C 단위 테스트.
 * SSRF 방어 + Firestore 캐시 + fetch limit + redirect 재검증.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGet = vi.fn();
const mockSet = vi.fn(() => Promise.resolve());
const mockDoc = vi.fn(() => ({ get: mockGet, set: mockSet }));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));
const mockFirestore = { collection: mockCollection };
const mockIsPrivate = vi.fn();
const mockParseOg = vi.fn();
const mockFetch = vi.fn();
const mockHasCredentials = vi.fn(() => true);

vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => mockFirestore,
  hasAdminCredentials: () => mockHasCredentials(),
}));
vi.mock('./ssrf-guard', () => ({
  isHostnamePrivate: (...args: never[]) =>
    (mockIsPrivate as (...a: never[]) => unknown)(...args),
}));
vi.mock('./og-parser', () => ({
  parseOgFromHtml: (...args: never[]) =>
    (mockParseOg as (...a: never[]) => unknown)(...args),
}));

import { fetchOgPreview } from './og-preview';

beforeEach(() => {
  mockGet.mockReset();
  mockSet.mockClear();
  mockDoc.mockClear();
  mockCollection.mockClear();
  mockIsPrivate.mockReset();
  mockParseOg.mockReset();
  mockFetch.mockReset();
  mockHasCredentials.mockReturnValue(true);
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => vi.unstubAllGlobals());

function mockOkHtml(html: string, contentType = 'text/html; charset=utf-8') {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    url: 'https://example.com/article',
    headers: {
      get: (k: string) => {
        if (k.toLowerCase() === 'content-type') return contentType;
        if (k.toLowerCase() === 'content-length') return String(html.length);
        return null;
      },
    },
    body: null,
    text: async () => html,
  });
}

describe('fetchOgPreview — URL 검증', () => {
  it('잘못된 URL → null', async () => {
    const r = await fetchOgPreview('not-a-url');
    expect(r).toBeNull();
  });

  it('http (https 아님) → null', async () => {
    const r = await fetchOgPreview('http://example.com');
    expect(r).toBeNull();
  });
});

describe('fetchOgPreview — SSRF', () => {
  it('private hostname → null (fetch 미호출)', async () => {
    mockIsPrivate.mockResolvedValue(true);
    const r = await fetchOgPreview('https://10.0.0.1');
    expect(r).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('fetchOgPreview — 캐시', () => {
  it('cache hit → fetch 미호출, 캐시 반환', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        url: 'https://example.com/x',
        title: 'Cached Title',
        description: 'Cached desc',
        image: 'https://example.com/img.png',
        domain: 'example.com',
        fetchedAt: { toMillis: () => Date.now() - 1000 },
        ttlExpiresAt: { toMillis: () => Date.now() + 10000 },
      }),
    });
    const r = await fetchOgPreview('https://example.com/x');
    expect(r).toMatchObject({
      url: 'https://example.com/x',
      title: 'Cached Title',
      description: 'Cached desc',
      image: 'https://example.com/img.png',
      domain: 'example.com',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('cache 만료 → fetch 호출 (TTL 지남)', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        url: 'https://example.com/x',
        title: 'Old',
        domain: 'example.com',
        fetchedAt: { toMillis: () => Date.now() - 99999999 },
        ttlExpiresAt: { toMillis: () => Date.now() - 1000 },
      }),
    });
    mockOkHtml('<html><head><title>New</title></head></html>');
    mockParseOg.mockReturnValue({
      title: 'New',
      domain: 'example.com',
    });
    const r = await fetchOgPreview('https://example.com/x');
    expect(r?.title).toBe('New');
    expect(mockFetch).toHaveBeenCalled();
  });

  it('cache miss → fetch + parse + 저장', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({ exists: false });
    mockOkHtml('<html><head><title>Fresh</title></head></html>');
    mockParseOg.mockReturnValue({
      title: 'Fresh',
      description: 'desc',
      image: 'https://example.com/img.png',
      domain: 'example.com',
    });
    const r = await fetchOgPreview('https://example.com/x');
    expect(r).toMatchObject({
      title: 'Fresh',
      description: 'desc',
      image: 'https://example.com/img.png',
      domain: 'example.com',
    });
    expect(mockSet).toHaveBeenCalled();
  });

  it('credential 없음 → 캐시 skip, 직접 fetch', async () => {
    mockHasCredentials.mockReturnValue(false);
    mockIsPrivate.mockResolvedValue(false);
    mockOkHtml('<html></html>');
    mockParseOg.mockReturnValue({ title: 'x', domain: 'example.com' });
    const r = await fetchOgPreview('https://example.com/x');
    expect(r?.title).toBe('x');
    expect(mockGet).not.toHaveBeenCalled();
  });
});

describe('fetchOgPreview — fetch 결과 검증', () => {
  it('res.ok=false → null', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({ exists: false });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      url: 'https://example.com/x',
      headers: { get: () => null },
    });
    const r = await fetchOgPreview('https://example.com/x');
    expect(r).toBeNull();
  });

  it('content-type !html → null', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({ exists: false });
    mockOkHtml('binary', 'application/pdf');
    const r = await fetchOgPreview('https://example.com/x');
    expect(r).toBeNull();
  });

  it('redirect 후 private IP → null', async () => {
    mockIsPrivate
      .mockResolvedValueOnce(false) // 첫번째 check (target)
      .mockResolvedValueOnce(true); // redirect 후 finalUrl
    mockGet.mockResolvedValue({ exists: false });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      url: 'https://192.168.1.1/x', // private IP redirect
      headers: {
        get: (k: string) =>
          k.toLowerCase() === 'content-type' ? 'text/html' : null,
      },
      body: null,
      text: async () => '<html></html>',
    });
    const r = await fetchOgPreview('https://example.com/x');
    expect(r).toBeNull();
  });

  it('redirect 후 http (https 아님) → null', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({ exists: false });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      url: 'http://example.com/x',
      headers: {
        get: (k: string) =>
          k.toLowerCase() === 'content-type' ? 'text/html' : null,
      },
      body: null,
      text: async () => '<html></html>',
    });
    const r = await fetchOgPreview('https://example.com/x');
    expect(r).toBeNull();
  });

  it('content-length 2MB 초과 → null', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({ exists: false });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      url: 'https://example.com/x',
      headers: {
        get: (k: string) => {
          if (k.toLowerCase() === 'content-type') return 'text/html';
          if (k.toLowerCase() === 'content-length') return String(3 * 1024 * 1024);
          return null;
        },
      },
      body: null,
      text: async () => '',
    });
    const r = await fetchOgPreview('https://example.com/x');
    expect(r).toBeNull();
  });

  it('parseOg 가 null 반환 → null (메타 부재)', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({ exists: false });
    mockOkHtml('<html></html>');
    mockParseOg.mockReturnValue(null);
    const r = await fetchOgPreview('https://example.com/x');
    expect(r).toBeNull();
  });

  it('fetch throw → null (네트워크 오류)', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({ exists: false });
    mockFetch.mockRejectedValueOnce(new Error('network'));
    const r = await fetchOgPreview('https://example.com/x');
    expect(r).toBeNull();
  });
});

describe('fetchOgPreview — Firestore 실패 격리', () => {
  it('cache get throw → 무시하고 fetch 진행', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockRejectedValue(new Error('Firestore down'));
    mockOkHtml('<html></html>');
    mockParseOg.mockReturnValue({ title: 'x', domain: 'example.com' });
    const r = await fetchOgPreview('https://example.com/x');
    expect(r?.title).toBe('x');
  });

  it('cache set throw → 결과는 반환 (best-effort)', async () => {
    mockIsPrivate.mockResolvedValue(false);
    mockGet.mockResolvedValue({ exists: false });
    mockOkHtml('<html></html>');
    mockParseOg.mockReturnValue({ title: 'x', domain: 'example.com' });
    mockSet.mockRejectedValueOnce(new Error('Firestore set fail'));
    const r = await fetchOgPreview('https://example.com/x');
    expect(r?.title).toBe('x');
  });
});
