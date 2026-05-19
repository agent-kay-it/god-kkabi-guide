/**
 * @vitest-environment jsdom
 *
 * Sprint 17 / F17-H — uploadPostImage() unit test.
 *
 * uploadChatImage 와 동일 패턴 (channelId 없음) — 핵심 시나리오 위주.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('browser-image-compression', () => ({
  default: vi.fn(async (file: File) => {
    const bytes = new Uint8Array(1024);
    return new File([bytes], file.name, { type: 'image/webp' });
  }),
}));

import { uploadPostImage } from '../upload-post-image';

const ORIGINAL_FETCH = global.fetch;

function makeFile(opts: { type?: string; size?: number } = {}): File {
  const size = opts.size ?? 1024;
  return new File([new Uint8Array(size)], 'test', { type: opts.type ?? 'image/png' });
}

function mockOk(): void {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url === '/api/storage/presign') {
      return new Response(
        JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/x.webp' }),
        { status: 200 },
      );
    }
    return new Response('', { status: 200 });
  }) as typeof fetch;
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
});

describe('uploadPostImage() — input validation', () => {
  it('UNSUPPORTED_TYPE — application/pdf 거부', async () => {
    const result = await uploadPostImage({ file: makeFile({ type: 'application/pdf' }) });
    expect(result).toEqual({ ok: false, error: 'UNSUPPORTED_TYPE' });
  });

  it('TOO_LARGE_BEFORE_COMPRESS — 6MB 거부', async () => {
    const result = await uploadPostImage({ file: makeFile({ size: 6 * 1024 * 1024 }) });
    expect(result).toEqual({ ok: false, error: 'TOO_LARGE_BEFORE_COMPRESS' });
  });

  it('image/png 허용', async () => {
    mockOk();
    const result = await uploadPostImage({ file: makeFile({ type: 'image/png' }) });
    expect(result.ok).toBe(true);
  });

  it('image/webp 허용', async () => {
    mockOk();
    const result = await uploadPostImage({ file: makeFile({ type: 'image/webp' }) });
    expect(result.ok).toBe(true);
  });
});

describe('uploadPostImage() — error mapping', () => {
  it('UNAUTHENTICATED → UNAUTHENTICATED', async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: 'UNAUTHENTICATED' }), { status: 401 }),
    ) as typeof fetch;
    const result = await uploadPostImage({ file: makeFile({ type: 'image/png' }) });
    expect(result).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('RATE_LIMIT_EXCEEDED → RATE_LIMIT_EXCEEDED', async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), { status: 429 }),
    ) as typeof fetch;
    const result = await uploadPostImage({ file: makeFile({ type: 'image/png' }) });
    expect(result).toEqual({ ok: false, error: 'RATE_LIMIT_EXCEEDED' });
  });

  it('presign network error → PRESIGN_FAILED', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('network');
    }) as typeof fetch;
    const result = await uploadPostImage({ file: makeFile({ type: 'image/png' }) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('PRESIGN_FAILED');
  });

  it('S3 PUT 403 → S3_PUT_FAILED', async () => {
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url === '/api/storage/presign') {
        return new Response(
          JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/x' }),
          { status: 200 },
        );
      }
      return new Response('', { status: 403 });
    }) as typeof fetch;
    const result = await uploadPostImage({ file: makeFile({ type: 'image/png' }) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('S3_PUT_FAILED');
  });
});

describe('uploadPostImage() — 성공', () => {
  it('성공 시 cdnUrl 반환', async () => {
    mockOk();
    const result = await uploadPostImage({ file: makeFile({ type: 'image/png' }) });
    expect(result).toEqual({ ok: true, url: 'https://cdn/x.webp' });
  });

  it('onProgress 콜백 호출', async () => {
    mockOk();
    const progress: number[] = [];
    await uploadPostImage({
      file: makeFile({ type: 'image/png' }),
      onProgress: (n) => progress.push(n),
    });
    expect(progress).toContain(100);
  });

  it('GIF 는 압축 skip', async () => {
    mockOk();
    const result = await uploadPostImage({ file: makeFile({ type: 'image/gif' }) });
    expect(result.ok).toBe(true);
  });
});
