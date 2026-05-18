/**
 * vitest — Sprint 11 Phase C uploadErrorMessage tests.
 * 8 UploadError 코드 모두에 대해 비어있지 않은 한국어 메시지를 반환하는지 검증.
 */
import { describe, it, expect } from 'vitest';

import { uploadErrorMessage } from '../error-messages';
import type { UploadError } from '../types';

const ALL_CODES: readonly UploadError[] = [
  'UNSUPPORTED_TYPE',
  'TOO_LARGE_BEFORE_COMPRESS',
  'COMPRESS_FAILED',
  'PRESIGN_FAILED',
  'RATE_LIMIT_EXCEEDED',
  'UNAUTHENTICATED',
  'NOT_REGISTERED',
  'CHANNEL_FORBIDDEN',
  'S3_PUT_FAILED',
];

describe('uploadErrorMessage', () => {
  it.each(ALL_CODES)('returns non-empty Korean message for %s', (code) => {
    const msg = uploadErrorMessage(code);
    expect(msg.length).toBeGreaterThan(0);
    // Korean character presence (Hangul Syllables block)
    expect(/[가-힣]/.test(msg)).toBe(true);
  });

  it('returns fallback for unknown code (runtime safety)', () => {
    const msg = uploadErrorMessage('UNKNOWN_CODE' as UploadError);
    expect(msg.length).toBeGreaterThan(0);
  });

  it('returns distinct messages per code (no copy-paste bug)', () => {
    const unique = new Set(ALL_CODES.map((c) => uploadErrorMessage(c)));
    expect(unique.size).toBe(ALL_CODES.length);
  });
});
