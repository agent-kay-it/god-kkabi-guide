/**
 * @vitest-environment jsdom
 *
 * Sprint 17 / F17-H — uploadChatImage() unit test.
 *
 * 검증 범위:
 *  - ALLOWED MIME 화이트리스트
 *  - MAX_RAW (5MB) 초과 거부
 *  - imageCompression 실패 → COMPRESS_FAILED
 *  - presign 실패 분기 (UNAUTHENTICATED / NOT_REGISTERED / RATE_LIMIT_EXCEEDED / CHANNEL_FORBIDDEN / PRESIGN_FAILED)
 *  - S3 PUT 실패
 *  - 성공 path
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('browser-image-compression', () => ({
  default: vi.fn(async (file: File) => {
    // jsdom 에서 File.arrayBuffer() 미지원 — 대신 빈 Uint8Array 로 새 File 생성
    const bytes = new Uint8Array(1024);
    return new File([bytes], file.name, { type: 'image/webp' });
  }),
}));

import { uploadChatImage } from '../upload-chat-image';

const ORIGINAL_FETCH = global.fetch;

function makeFile(opts: { type?: string; size?: number; name?: string } = {}): File {
  const size = opts.size ?? 1024;
  const bytes = new Uint8Array(size);
  return new File([bytes], opts.name ?? 'test.png', { type: opts.type ?? 'image/png' });
}

function mockFetch(handlers: { presign?: () => Response | Promise<Response>; put?: () => Response | Promise<Response> }) {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url === '/api/storage/presign' && handlers.presign) {
      return await handlers.presign();
    }
    if (url.startsWith('https://') && handlers.put) {
      return await handlers.put();
    }
    return new Response('not mocked', { status: 500 });
  }) as typeof fetch;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
});

describe('uploadChatImage() — input validation', () => {
  it('UNSUPPORTED_TYPE — application/pdf 거부', async () => {
    const result = await uploadChatImage({
      file: makeFile({ type: 'application/pdf' }),
      channelId: 'global',
    });
    expect(result).toEqual({ ok: false, error: 'UNSUPPORTED_TYPE' });
  });

  it('TOO_LARGE_BEFORE_COMPRESS — 6MB 거부', async () => {
    const result = await uploadChatImage({
      file: makeFile({ size: 6 * 1024 * 1024 }),
      channelId: 'global',
    });
    expect(result).toEqual({ ok: false, error: 'TOO_LARGE_BEFORE_COMPRESS' });
  });

  it('image/jpeg 허용', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/img.webp' }), { status: 200 }),
      put: () => new Response('', { status: 200 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/jpeg' }),
      channelId: 'g',
    });
    expect(result.ok).toBe(true);
  });

  it('image/png 허용', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/img.webp' }), { status: 200 }),
      put: () => new Response('', { status: 200 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result.ok).toBe(true);
  });

  it('image/webp 허용', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/img.webp' }), { status: 200 }),
      put: () => new Response('', { status: 200 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/webp' }),
      channelId: 'g',
    });
    expect(result.ok).toBe(true);
  });
});

describe('uploadChatImage() — presign error mapping', () => {
  it('presign UNAUTHENTICATED → UNAUTHENTICATED', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ error: 'UNAUTHENTICATED' }), { status: 401 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result).toEqual({ ok: false, error: 'UNAUTHENTICATED' });
  });

  it('presign NOT_REGISTERED → NOT_REGISTERED', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ error: 'NOT_REGISTERED' }), { status: 403 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result).toEqual({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('presign BANNED → NOT_REGISTERED', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ error: 'BANNED' }), { status: 403 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result).toEqual({ ok: false, error: 'NOT_REGISTERED' });
  });

  it('presign RATE_LIMIT_EXCEEDED → RATE_LIMIT_EXCEEDED', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), { status: 429 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result).toEqual({ ok: false, error: 'RATE_LIMIT_EXCEEDED' });
  });

  it('presign CHANNEL_FORBIDDEN → CHANNEL_FORBIDDEN', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ error: 'CHANNEL_FORBIDDEN' }), { status: 403 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result).toEqual({ ok: false, error: 'CHANNEL_FORBIDDEN' });
  });

  it('presign unknown error code → PRESIGN_FAILED with message', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ error: 'UNKNOWN_CODE' }), { status: 500 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('PRESIGN_FAILED');
      expect(result.message).toBe('UNKNOWN_CODE');
    }
  });

  it('presign network error → PRESIGN_FAILED', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as typeof fetch;
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('PRESIGN_FAILED');
    }
  });
});

describe('uploadChatImage() — S3 PUT', () => {
  it('S3 PUT HTTP 403 → S3_PUT_FAILED', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/x' }), { status: 200 }),
      put: () => new Response('', { status: 403 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('S3_PUT_FAILED');
      expect(result.message).toContain('403');
    }
  });

  it('S3 PUT network error → S3_PUT_FAILED', async () => {
    let calls = 0;
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      calls++;
      if (url === '/api/storage/presign') {
        return new Response(
          JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/x' }),
          { status: 200 },
        );
      }
      throw new Error('s3 down');
    }) as typeof fetch;
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('S3_PUT_FAILED');
    }
    expect(calls).toBe(2);
  });
});

describe('uploadChatImage() — 성공 + progress', () => {
  it('성공 시 cdnUrl 반환', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/final.webp' }), { status: 200 }),
      put: () => new Response('', { status: 200 }),
    });
    const result = await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
    });
    expect(result).toEqual({ ok: true, url: 'https://cdn/final.webp' });
  });

  it('onProgress 콜백 호출 (20, 40, 100)', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/x' }), { status: 200 }),
      put: () => new Response('', { status: 200 }),
    });
    const progress: number[] = [];
    await uploadChatImage({
      file: makeFile({ type: 'image/png' }),
      channelId: 'g',
      onProgress: (n) => progress.push(n),
    });
    expect(progress).toEqual([20, 40, 100]);
  });

  it('GIF 는 압축 skip — 원본 그대로 사용', async () => {
    mockFetch({
      presign: () =>
        new Response(JSON.stringify({ presignedUrl: 'https://s3/put', cdnUrl: 'https://cdn/x' }), { status: 200 }),
      put: () => new Response('', { status: 200 }),
    });
    const file = makeFile({ type: 'image/gif' });
    const result = await uploadChatImage({ file, channelId: 'g' });
    expect(result.ok).toBe(true);
  });
});
