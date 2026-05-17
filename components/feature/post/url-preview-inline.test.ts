/**
 * url-preview-inline URL extractor unit tests — Sprint 10 / Phase D Task #22.
 *
 * 검증 범위:
 *  - 단독 URL 줄 추출 (https only)
 *  - 인라인 URL 무시
 *  - markdown 링크 무시
 *  - 중복 제거
 *  - 최대 3개 제한
 *  - http / 비-URL 텍스트 무시
 */
import { describe, it, expect } from 'vitest';

import { __internal } from './url-preview-inline';

const { extractStandaloneUrls } = __internal;

describe('extractStandaloneUrls', () => {
  it('extracts a single standalone URL', () => {
    expect(extractStandaloneUrls('https://example.com/a')).toEqual(['https://example.com/a']);
  });

  it('extracts multiple standalone URLs', () => {
    const body = `안녕

https://example.com/a

본문 텍스트

https://youtu.be/dQw4w9WgXcQ`;
    expect(extractStandaloneUrls(body)).toEqual([
      'https://example.com/a',
      'https://youtu.be/dQw4w9WgXcQ',
    ]);
  });

  it('ignores inline URLs (with surrounding text)', () => {
    const body = '이거 봐 https://example.com 재미있어';
    expect(extractStandaloneUrls(body)).toEqual([]);
  });

  it('ignores markdown links', () => {
    const body = '[링크](https://example.com)';
    expect(extractStandaloneUrls(body)).toEqual([]);
  });

  it('rejects non-https URLs', () => {
    const body = `http://insecure.com

ftp://nope.com`;
    expect(extractStandaloneUrls(body)).toEqual([]);
  });

  it('rejects invalid URL syntax', () => {
    const body = 'https://[invalid';
    expect(extractStandaloneUrls(body)).toEqual([]);
  });

  it('removes duplicates', () => {
    const body = `https://example.com/a

middle

https://example.com/a`;
    expect(extractStandaloneUrls(body)).toEqual(['https://example.com/a']);
  });

  it('caps result at MAX_PREVIEWS (3)', () => {
    const body = `https://example.com/1

https://example.com/2

https://example.com/3

https://example.com/4

https://example.com/5`;
    const result = extractStandaloneUrls(body);
    expect(result.length).toBe(3);
    expect(result).toEqual([
      'https://example.com/1',
      'https://example.com/2',
      'https://example.com/3',
    ]);
  });

  it('tolerates leading/trailing whitespace on URL lines', () => {
    const body = `  https://example.com/a   `;
    expect(extractStandaloneUrls(body)).toEqual(['https://example.com/a']);
  });
});
