/**
 * vitest — Sprint 11 Phase B delete-image unit tests.
 * 출처: docs/sprint/11-sprint-images/design.md §14.1 (`delete-image.test.ts`)
 *
 * 4+ cases:
 *  1. extractObjectKey 정상 — prod 도메인
 *  2. extractObjectKey staging 도메인
 *  3. extractObjectKey mismatch → null
 *  4. extractObjectKey empty/null input → null
 *  5. deleteImageObject INVALID_URL on bad input
 *  6. deleteImageObject success path (S3Client mocked)
 *  7. deleteImageObject S3 failure path
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockSend = vi.fn();

vi.mock('@aws-sdk/client-s3', () => {
  class FakeDeleteObjectCommand {
    constructor(public readonly input: Record<string, unknown>) {}
  }
  class FakeS3Client {
    async send(cmd: unknown): Promise<unknown> {
      return mockSend(cmd);
    }
  }
  return { DeleteObjectCommand: FakeDeleteObjectCommand, S3Client: FakeS3Client };
});

import { deleteImageObject, extractObjectKey } from '../delete-image';
import { __resetS3ClientCacheForTest } from '../s3-adapter';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  __resetS3ClientCacheForTest();
  mockSend.mockReset();
  mockSend.mockResolvedValue({});
  process.env = {
    ...ORIGINAL_ENV,
    AWS_S3_REGION: 'ap-northeast-2',
    AWS_S3_ACCESS_KEY_ID: 'AKIATEST',
    AWS_S3_SECRET_ACCESS_KEY: 'SECRETTEST',
    AWS_S3_BUCKET: 'kkaebizigi-staging',
    NEXT_PUBLIC_CDN_URL: 'https://cdn-staging.kkaebizigi.com',
  };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('extractObjectKey', () => {
  it('extracts key from staging CDN URL', () => {
    expect(
      extractObjectKey('https://cdn-staging.kkaebizigi.com/post/u1/20260518/abc.webp'),
    ).toBe('post/u1/20260518/abc.webp');
  });

  it('extracts key from prod CDN URL', () => {
    process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.kkaebizigi.com';
    expect(
      extractObjectKey('https://cdn.kkaebizigi.com/chat/u2/20260518/xyz.png'),
    ).toBe('chat/u2/20260518/xyz.png');
  });

  it('returns null for mismatched origin', () => {
    expect(
      extractObjectKey('https://attacker.com/post/u1/img.webp'),
    ).toBeNull();
  });

  it('returns null for empty / null / undefined input', () => {
    expect(extractObjectKey('')).toBeNull();
    expect(extractObjectKey(null as unknown as string)).toBeNull();
    expect(extractObjectKey(undefined as unknown as string)).toBeNull();
  });

  it('returns null when CDN URL has no path after base', () => {
    expect(extractObjectKey('https://cdn-staging.kkaebizigi.com/')).toBeNull();
  });
});

describe('deleteImageObject', () => {
  it('returns INVALID_URL for non-CDN URL', async () => {
    const result = await deleteImageObject('https://example.com/whatever.jpg');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('INVALID_URL');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('returns success and calls DeleteObjectCommand', async () => {
    const result = await deleteImageObject(
      'https://cdn-staging.kkaebizigi.com/chat/u1/20260518/abc.webp',
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.objectKey).toBe('chat/u1/20260518/abc.webp');
    expect(mockSend).toHaveBeenCalledTimes(1);
    const cmd = mockSend.mock.calls[0]?.[0] as { input: { Bucket: string; Key: string } };
    expect(cmd.input.Bucket).toBe('kkaebizigi-staging');
    expect(cmd.input.Key).toBe('chat/u1/20260518/abc.webp');
  });

  it('returns S3_DELETE_FAILED when SDK throws', async () => {
    mockSend.mockRejectedValueOnce(new Error('AccessDenied'));
    const result = await deleteImageObject(
      'https://cdn-staging.kkaebizigi.com/post/u1/20260518/zzz.jpg',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('S3_DELETE_FAILED');
      expect(result.message).toContain('AccessDenied');
    }
  });
});
