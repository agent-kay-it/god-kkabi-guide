/**
 * vitest — Sprint 11 Phase C: PostInputSchema 이미지 URL 정규식 검증.
 * 출처: docs/sprint/11-sprint-images/design.md §9.3 (storage URL validation)
 *
 * STORAGE_URL_RE가 Firebase Storage → AWS CloudFront로 전환된 후
 * 다음 케이스를 보장:
 *  1. cdn.kkaebizigi.com (prod) 허용
 *  2. cdn-staging.kkaebizigi.com (staging) 허용
 *  3. firebasestorage.googleapis.com (구버전) 거부
 *  4. 외부 도메인 거부
 *  5. http (TLS 없음) 거부
 *  6. CDN 도메인 prefix만 일치하고 path 없음 거부 (`https://cdn.kkaebizigi.com` 단독)
 *  7. 최대 3장 제한
 *  8. 정상 본문 + 카테고리 + 태그 + 이미지 0~3장 모두 통과
 */
import { describe, it, expect } from 'vitest';

import { PostInputSchema, STORAGE_URL_RE } from './schema';

const VALID_BODY = 'a'.repeat(60);
const VALID_BASE = {
  title: '테스트 제목입니다',
  body: VALID_BODY,
  category: 'guide' as const,
  tags: [],
};

describe('STORAGE_URL_RE', () => {
  it('accepts prod CDN URL', () => {
    expect(STORAGE_URL_RE.test('https://cdn.kkaebizigi.com/posts/u1/20260518/abc.webp')).toBe(true);
  });

  it('accepts staging CDN URL', () => {
    expect(STORAGE_URL_RE.test('https://cdn-staging.kkaebizigi.com/posts/u1/20260518/abc.webp')).toBe(true);
  });

  it('rejects legacy firebasestorage URL', () => {
    expect(
      STORAGE_URL_RE.test('https://firebasestorage.googleapis.com/v0/b/.../o/...'),
    ).toBe(false);
  });

  it('rejects external host', () => {
    expect(STORAGE_URL_RE.test('https://attacker.com/posts/x.webp')).toBe(false);
  });

  it('rejects http (no TLS)', () => {
    expect(STORAGE_URL_RE.test('http://cdn.kkaebizigi.com/posts/x.webp')).toBe(false);
  });

  it('rejects domain without trailing slash', () => {
    expect(STORAGE_URL_RE.test('https://cdn.kkaebizigi.com')).toBe(false);
  });

  it('rejects subdomain spoofing (cdn-evil.kkaebizigi.com)', () => {
    expect(STORAGE_URL_RE.test('https://cdn-evil.kkaebizigi.com/x.webp')).toBe(false);
  });
});

describe('PostInputSchema imageUrls validation', () => {
  it('accepts post with no images', () => {
    const result = PostInputSchema.safeParse({ ...VALID_BASE, imageUrls: [] });
    expect(result.success).toBe(true);
  });

  it('accepts post with up to 3 CDN images', () => {
    const result = PostInputSchema.safeParse({
      ...VALID_BASE,
      imageUrls: [
        'https://cdn.kkaebizigi.com/posts/u1/20260518/a.webp',
        'https://cdn-staging.kkaebizigi.com/posts/u1/20260518/b.webp',
        'https://cdn.kkaebizigi.com/posts/u1/20260518/c.webp',
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects 4th image (over POST_LIMITS.images.max)', () => {
    const result = PostInputSchema.safeParse({
      ...VALID_BASE,
      imageUrls: [
        'https://cdn.kkaebizigi.com/posts/u1/20260518/a.webp',
        'https://cdn.kkaebizigi.com/posts/u1/20260518/b.webp',
        'https://cdn.kkaebizigi.com/posts/u1/20260518/c.webp',
        'https://cdn.kkaebizigi.com/posts/u1/20260518/d.webp',
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects legacy firebasestorage URL', () => {
    const result = PostInputSchema.safeParse({
      ...VALID_BASE,
      imageUrls: ['https://firebasestorage.googleapis.com/v0/b/x/o/y.jpg'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects external host', () => {
    const result = PostInputSchema.safeParse({
      ...VALID_BASE,
      imageUrls: ['https://attacker.com/posts/x.webp'],
    });
    expect(result.success).toBe(false);
  });
});
