/**
 * lib/etl/saramin.ts — Sprint 22 F22-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./repo', () => ({
  upsertSignalsBatch: vi.fn(() => Promise.resolve({ processed: 0, errors: 0 })),
}));

import { upsertSignalsBatch } from './repo';
import { fetchSaraminJobPostings } from './saramin';

const mockedUpsert = vi.mocked(upsertSignalsBatch);

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('fetchSaraminJobPostings', () => {
  it('API key 없으면 skipped:true', async () => {
    vi.stubEnv('SARAMIN_API_KEY', '');
    const r = await fetchSaraminJobPostings();
    expect(r).toMatchObject({ ok: false, skipped: true, processed: 0 });
  });

  it('opts.accessKey 우선 사용', async () => {
    vi.stubEnv('SARAMIN_API_KEY', '');
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ jobs: { job: [] } }), { status: 200 }),
    );
    await fetchSaraminJobPostings({ accessKey: 'override-key', keywords: ['test'] });
    expect(fetchSpy).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('HTTP error 시 다음 keyword 진행', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobs: { job: [] } }), { status: 200 }));
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await fetchSaraminJobPostings({
      accessKey: 'key',
      keywords: ['k1', 'k2'],
    });
    expect(r.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    fetchSpy.mockRestore();
    consoleErr.mockRestore();
  });

  it('jobs 변환 — upsertSignalsBatch 호출', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          jobs: {
            job: [
              { id: 'j1', title: 'Engineer', url: 'https://example.com/j1', active: 1 },
              { id: 'j2', title: 'Designer', url: 'https://example.com/j2', active: 1 },
            ],
          },
        }),
        { status: 200 },
      ),
    );
    mockedUpsert.mockResolvedValue({ processed: 2, errors: 0 });
    const r = await fetchSaraminJobPostings({
      accessKey: 'k',
      keywords: ['갓깨비'],
    });
    expect(r).toMatchObject({ ok: true, processed: 2 });
    const inputs = mockedUpsert.mock.calls[0]?.[0];
    expect(inputs).toBeDefined();
    expect(inputs?.[0]?.source).toBe('saramin');
  });

  it('count clamp — 110 max', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ jobs: { job: [] } }), { status: 200 }),
    );
    await fetchSaraminJobPostings({
      accessKey: 'k',
      keywords: ['x'],
      count: 200, // out of range
    });
    const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
    expect(new URL(calledUrl).searchParams.get('count')).toBe('110');
    fetchSpy.mockRestore();
  });

  it('count clamp — 1 min', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ jobs: { job: [] } }), { status: 200 }),
    );
    await fetchSaraminJobPostings({
      accessKey: 'k',
      keywords: ['x'],
      count: 0,
    });
    const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
    expect(new URL(calledUrl).searchParams.get('count')).toBe('1');
    fetchSpy.mockRestore();
  });

  it('fetch throw → 다음 keyword 진행', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobs: { job: [] } }), { status: 200 }));
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await fetchSaraminJobPostings({
      accessKey: 'k',
      keywords: ['k1', 'k2'],
    });
    expect(r.ok).toBe(true);
    fetchSpy.mockRestore();
    consoleErr.mockRestore();
  });
});
