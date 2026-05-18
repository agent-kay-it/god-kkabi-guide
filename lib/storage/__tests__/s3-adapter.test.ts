/**
 * vitest — Sprint 11 Phase B s3-adapter unit tests.
 * 출처: docs/sprint/11-sprint-images/design.md §14.1 (`s3-adapter.test.ts`)
 *
 * 4 cases:
 *  1. env 누락 시 throw (region/access-key/secret 각각)
 *  2. region 정상 시 S3Client 생성
 *  3. getBucket 누락 시 throw
 *  4. getCdnBaseUrl trailing slash 정규화
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@aws-sdk/client-s3', () => {
  class FakeS3Client {
    constructor(public readonly config: Record<string, unknown>) {}
  }
  return { S3Client: FakeS3Client };
});

import {
  __resetS3ClientCacheForTest,
  getBucket,
  getCdnBaseUrl,
  getS3Client,
} from '../s3-adapter';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  __resetS3ClientCacheForTest();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.AWS_S3_REGION;
  delete process.env.AWS_S3_ACCESS_KEY_ID;
  delete process.env.AWS_S3_SECRET_ACCESS_KEY;
  delete process.env.AWS_S3_BUCKET;
  delete process.env.NEXT_PUBLIC_CDN_URL;
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('getS3Client', () => {
  it('throws when AWS_S3_REGION is missing', () => {
    process.env.AWS_S3_ACCESS_KEY_ID = 'AKIA';
    process.env.AWS_S3_SECRET_ACCESS_KEY = 'SECRET';
    expect(() => getS3Client()).toThrow(/AWS_S3_REGION/);
  });

  it('throws when access key is missing', () => {
    process.env.AWS_S3_REGION = 'ap-northeast-2';
    process.env.AWS_S3_SECRET_ACCESS_KEY = 'SECRET';
    expect(() => getS3Client()).toThrow(/AWS_S3/);
  });

  it('throws when secret key is missing', () => {
    process.env.AWS_S3_REGION = 'ap-northeast-2';
    process.env.AWS_S3_ACCESS_KEY_ID = 'AKIA';
    expect(() => getS3Client()).toThrow(/AWS_S3/);
  });

  it('returns S3Client with config when all envs present', () => {
    process.env.AWS_S3_REGION = 'ap-northeast-2';
    process.env.AWS_S3_ACCESS_KEY_ID = 'AKIATEST';
    process.env.AWS_S3_SECRET_ACCESS_KEY = 'SECRETTEST';
    const client = getS3Client() as unknown as { config: { region: string } };
    expect(client.config.region).toBe('ap-northeast-2');
  });

  it('caches the client (returns same reference on subsequent calls)', () => {
    process.env.AWS_S3_REGION = 'ap-northeast-2';
    process.env.AWS_S3_ACCESS_KEY_ID = 'AKIA';
    process.env.AWS_S3_SECRET_ACCESS_KEY = 'SECRET';
    const a = getS3Client();
    const b = getS3Client();
    expect(a).toBe(b);
  });
});

describe('getBucket', () => {
  it('throws when AWS_S3_BUCKET missing', () => {
    expect(() => getBucket()).toThrow(/AWS_S3_BUCKET/);
  });

  it('returns bucket name when set', () => {
    process.env.AWS_S3_BUCKET = 'kkaebizigi-staging';
    expect(getBucket()).toBe('kkaebizigi-staging');
  });
});

describe('getCdnBaseUrl', () => {
  it('throws when NEXT_PUBLIC_CDN_URL missing', () => {
    expect(() => getCdnBaseUrl()).toThrow(/NEXT_PUBLIC_CDN_URL/);
  });

  it('strips trailing slash', () => {
    process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.kkaebizigi.com/';
    expect(getCdnBaseUrl()).toBe('https://cdn.kkaebizigi.com');
  });

  it('returns URL unchanged when no trailing slash', () => {
    process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn-staging.kkaebizigi.com';
    expect(getCdnBaseUrl()).toBe('https://cdn-staging.kkaebizigi.com');
  });
});
