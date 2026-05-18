/**
 * vitest — Sprint 11 Phase B presigned-url unit tests.
 * 출처: docs/sprint/11-sprint-images/design.md §14.1 (`presigned-url.test.ts`)
 *
 * 6 cases:
 *  1. 성공 경로 — 유효 input → presignedUrl + cdnUrl + objectKey
 *  2. MIME 거부 — image/svg+xml 등 화이트리스트 외
 *  3. size 초과 — 5MB+1
 *  4. uid 정규식 거부 — 특수문자 포함
 *  5. ULID 시간순 정렬 — 두 번째 호출이 첫 번째보다 sort 시 뒤
 *  6. cdnUrl 조합 — env trailing slash 정규화
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(async () => 'https://kkaebizigi-staging.s3.ap-northeast-2.amazonaws.com/MOCK_SIGNED_URL'),
}));

vi.mock('@aws-sdk/client-s3', () => {
  class FakePutObjectCommand {
    constructor(public readonly input: Record<string, unknown>) {}
  }
  class FakeS3Client {
    constructor(public readonly config: Record<string, unknown>) {}
    async send(): Promise<void> { /* unused — getSignedUrl is mocked */ }
  }
  return { PutObjectCommand: FakePutObjectCommand, S3Client: FakeS3Client };
});

import {
  createPresignedUploadUrl,
  MAX_SIZE_BYTES,
  PRESIGN_EXPIRES_IN_SECONDS,
} from '../presigned-url';
import { __resetS3ClientCacheForTest } from '../s3-adapter';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  __resetS3ClientCacheForTest();
  process.env = {
    ...ORIGINAL_ENV,
    AWS_S3_REGION: 'ap-northeast-2',
    AWS_S3_ACCESS_KEY_ID: 'AKIATEST',
    AWS_S3_SECRET_ACCESS_KEY: 'SECRETTEST',
    AWS_S3_BUCKET: 'kkaebizigi-staging',
    NEXT_PUBLIC_CDN_URL: 'https://cdn-staging.kkaebizigi.com/',
  };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('createPresignedUploadUrl', () => {
  it('returns presigned + cdn URL on valid input', async () => {
    const result = await createPresignedUploadUrl({
      kind: 'posts',
      uid: 'user-abc-123',
      contentType: 'image/webp',
      sizeBytes: 200_000,
    });
    expect(result.presignedUrl).toContain('MOCK_SIGNED_URL');
    expect(result.cdnUrl).toMatch(
      /^https:\/\/cdn-staging\.kkaebizigi\.com\/posts\/user-abc-123\/\d{8}\/[a-z0-9]+\.webp$/,
    );
    expect(result.objectKey).toMatch(/^posts\/user-abc-123\/\d{8}\/[a-z0-9]+\.webp$/);
    expect(result.expiresInSeconds).toBe(PRESIGN_EXPIRES_IN_SECONDS);
    expect(result.headers['Content-Type']).toBe('image/webp');
  });

  it('strips trailing slash from CDN base URL', async () => {
    const result = await createPresignedUploadUrl({
      kind: 'chat',
      uid: 'u1',
      contentType: 'image/png',
      sizeBytes: 1024,
    });
    expect(result.cdnUrl.startsWith('https://cdn-staging.kkaebizigi.com/')).toBe(true);
    expect(result.cdnUrl.startsWith('https://cdn-staging.kkaebizigi.com//')).toBe(false);
  });

  it('rejects non-whitelist MIME', async () => {
    await expect(
      createPresignedUploadUrl({
        kind: 'posts',
        uid: 'u1',
        contentType: 'image/svg+xml' as never,
        sizeBytes: 1024,
      }),
    ).rejects.toThrow(/UNSUPPORTED_TYPE/);
  });

  it('rejects size exceeding 5MB', async () => {
    await expect(
      createPresignedUploadUrl({
        kind: 'posts',
        uid: 'u1',
        contentType: 'image/jpeg',
        sizeBytes: MAX_SIZE_BYTES + 1,
      }),
    ).rejects.toThrow(/SIZE_EXCEEDED/);
  });

  it('rejects uid with special characters', async () => {
    await expect(
      createPresignedUploadUrl({
        kind: 'posts',
        uid: '../../etc/passwd',
        contentType: 'image/jpeg',
        sizeBytes: 1024,
      }),
    ).rejects.toThrow(/INVALID_UID/);
  });

  it('rejects zero or negative size', async () => {
    await expect(
      createPresignedUploadUrl({
        kind: 'posts',
        uid: 'u1',
        contentType: 'image/jpeg',
        sizeBytes: 0,
      }),
    ).rejects.toThrow(/INVALID_SIZE/);
  });

  it('generates time-orderable keys (later call > earlier call)', async () => {
    const first = await createPresignedUploadUrl({
      kind: 'posts',
      uid: 'u1',
      contentType: 'image/jpeg',
      sizeBytes: 1024,
    });
    await new Promise((r) => setTimeout(r, 5));
    const second = await createPresignedUploadUrl({
      kind: 'posts',
      uid: 'u1',
      contentType: 'image/jpeg',
      sizeBytes: 1024,
    });
    expect(second.objectKey > first.objectKey).toBe(true);
  });

  it('uses correct extension per MIME (jpeg→jpg, png/webp/gif unchanged)', async () => {
    const jpg = await createPresignedUploadUrl({
      kind: 'posts',
      uid: 'u1',
      contentType: 'image/jpeg',
      sizeBytes: 100,
    });
    expect(jpg.objectKey.endsWith('.jpg')).toBe(true);

    const png = await createPresignedUploadUrl({
      kind: 'posts',
      uid: 'u1',
      contentType: 'image/png',
      sizeBytes: 100,
    });
    expect(png.objectKey.endsWith('.png')).toBe(true);

    const gif = await createPresignedUploadUrl({
      kind: 'posts',
      uid: 'u1',
      contentType: 'image/gif',
      sizeBytes: 100,
    });
    expect(gif.objectKey.endsWith('.gif')).toBe(true);
  });
});
