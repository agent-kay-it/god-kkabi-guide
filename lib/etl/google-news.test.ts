/**
 * lib/etl/google-news.ts — Sprint 22 F22-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./repo', () => ({
  upsertSignalsBatch: vi.fn(() => Promise.resolve({ processed: 0, errors: 0 })),
}));

import { upsertSignalsBatch } from './repo';
import { fetchGoogleNewsArticles } from './google-news';

const mockedUpsert = vi.mocked(upsertSignalsBatch);

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('fetchGoogleNewsArticles', () => {
  it('API key 없으면 skipped:true', async () => {
    vi.stubEnv('NEWS_API_KEY', '');
    const r = await fetchGoogleNewsArticles();
    expect(r).toMatchObject({ ok: false, skipped: true });
  });

  it('articles 변환 — upsertSignalsBatch 호출', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          articles: [
            { url: 'https://news.example/a1', title: 'A1', publishedAt: '2026-05-20' },
            { url: 'https://news.example/a2', title: 'A2', publishedAt: '2026-05-20' },
          ],
        }),
        { status: 200 },
      ),
    );
    mockedUpsert.mockResolvedValue({ processed: 2, errors: 0 });
    const r = await fetchGoogleNewsArticles({
      apiKey: 'k',
      keywords: ['갓깨비'],
    });
    expect(r).toMatchObject({ ok: true, processed: 2 });
    const inputs = mockedUpsert.mock.calls[0]?.[0];
    expect(inputs?.[0]?.source).toBe('google_news');
  });

  it('url 없는 article 은 skip', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          articles: [
            { title: 'no-url' },
            { url: 'https://news.example/ok', title: 'ok' },
          ],
        }),
        { status: 200 },
      ),
    );
    await fetchGoogleNewsArticles({ apiKey: 'k', keywords: ['x'] });
    const inputs = mockedUpsert.mock.calls[0]?.[0];
    expect(inputs?.length).toBe(1);
  });

  it('pageSize clamp — max 100', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ articles: [] }), { status: 200 }),
    );
    await fetchGoogleNewsArticles({
      apiKey: 'k',
      keywords: ['x'],
      pageSize: 999,
    });
    const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
    expect(new URL(calledUrl).searchParams.get('pageSize')).toBe('100');
    fetchSpy.mockRestore();
  });

  it('HTTP 에러 → 다음 keyword 진행', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ articles: [] }), { status: 200 }));
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await fetchGoogleNewsArticles({
      apiKey: 'k',
      keywords: ['k1', 'k2'],
    });
    expect(r.ok).toBe(true);
    fetchSpy.mockRestore();
    consoleErr.mockRestore();
  });
});
