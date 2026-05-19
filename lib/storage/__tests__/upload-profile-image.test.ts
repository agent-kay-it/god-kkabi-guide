/**
 * @vitest-environment jsdom
 *
 * Sprint 17 / F17-H — uploadProfileImage() unit test.
 *
 * 아바타 업로드 (512px) — chat/post 와 동일 흐름.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('browser-image-compression', () => ({
  default: vi.fn(async (file: File) => {
    const bytes = new Uint8Array(1024);
    return new File([bytes], file.name, { type: 'image/webp' });
  }),
}));

import { uploadProfileImage } from '../upload-profile-image';

const ORIGINAL_FETCH = global.fetch;

function makeFile(opts: { type?: string; size?: number } = {}): File {
  const size = opts.size ?? 1024;
  return new File([new Uint8Array(size)], 'avatar', {
    type: opts.type ?? 'image/png',
  });
}

function mockOk(): void {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url === '/api/storage/presign') {
      return new Response(
        JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/avatar.webp' }),
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

describe('uploadProfileImage() — input validation', () => {
  it('UNSUPPORTED_TYPE 거부', async () => {
    const result = await uploadProfileImage({ file: makeFile({ type: 'application/octet-stream' }) });
    expect(result).toEqual({ ok: false, error: 'UNSUPPORTED_TYPE' });
  });

  it('TOO_LARGE_BEFORE_COMPRESS — 5MB 초과 거부', async () => {
    const result = await uploadProfileImage({ file: makeFile({ size: 6 * 1024 * 1024 }) });
    expect(result).toEqual({ ok: false, error: 'TOO_LARGE_BEFORE_COMPRESS' });
  });

  it('image/jpeg 허용', async () => {
    mockOk();
    const result = await uploadProfileImage({ file: makeFile({ type: 'image/jpeg' }) });
    expect(result.ok).toBe(true);
  });
});

describe('uploadProfileImage() — error mapping', () => {
  it('NOT_REGISTERED → NOT_REGISTERED', async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: 'NOT_REGISTERED' }), { status: 403 }),
    ) as typeof fetch;
    const result = await uploadProfileImage({ file: makeFile({ type: 'image/png' }) });
    expect(result).toEqual({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('presign 5xx → PRESIGN_FAILED', async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({}), { status: 500 }),
    ) as typeof fetch;
    const result = await uploadProfileImage({ file: makeFile({ type: 'image/png' }) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('PRESIGN_FAILED');
  });

  it('S3 PUT 실패 → S3_PUT_FAILED', async () => {
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url === '/api/storage/presign') {
        return new Response(
          JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/x' }),
          { status: 200 },
        );
      }
      throw new Error('s3 down');
    }) as typeof fetch;
    const result = await uploadProfileImage({ file: makeFile({ type: 'image/png' }) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('S3_PUT_FAILED');
  });
});

describe('uploadProfileImage() — 성공', () => {
  it('성공 시 cdnUrl 반환', async () => {
    mockOk();
    const result = await uploadProfileImage({ file: makeFile({ type: 'image/png' }) });
    expect(result).toEqual({ ok: true, url: 'https://cdn/avatar.webp' });
  });

  it('GIF 는 압축 skip', async () => {
    mockOk();
    const result = await uploadProfileImage({ file: makeFile({ type: 'image/gif' }) });
    expect(result.ok).toBe(true);
  });
});
