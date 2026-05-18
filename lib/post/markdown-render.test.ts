/**
 * markdown-render segmenter unit tests — Sprint 10 / Phase D Task #21.
 *
 * 검증 범위:
 *  - HTML only → single segment
 *  - <youtube-embed videoId> 추출 + segment 분할
 *  - <link-preview url> 추출 + segment 분할
 *  - 혼합 (HTML + youtube + link-preview) 순서 보존
 *  - 잘못된 videoId / non-https url → segment drop
 */
import { describe, it, expect } from 'vitest';

import { segmentMarkdownHtml } from './markdown-render';
import { renderMarkdownToSafeHtml } from './markdown';

describe('segmentMarkdownHtml', () => {
  it('returns a single html segment for plain markdown', () => {
    const segs = segmentMarkdownHtml('<p>hello world</p>');
    expect(segs).toEqual([{ type: 'html', html: '<p>hello world</p>' }]);
  });

  it('extracts youtube-embed placeholder', () => {
    const segs = segmentMarkdownHtml(
      '<p>before</p><youtube-embed videoId="dQw4w9WgXcQ"></youtube-embed><p>after</p>',
    );
    expect(segs).toEqual([
      { type: 'html', html: '<p>before</p>' },
      { type: 'youtube', videoId: 'dQw4w9WgXcQ' },
      { type: 'html', html: '<p>after</p>' },
    ]);
  });

  it('extracts link-preview placeholder', () => {
    const segs = segmentMarkdownHtml(
      '<p>before</p><link-preview url="https://example.com/a"></link-preview><p>after</p>',
    );
    expect(segs).toEqual([
      { type: 'html', html: '<p>before</p>' },
      { type: 'link-preview', url: 'https://example.com/a' },
      { type: 'html', html: '<p>after</p>' },
    ]);
  });

  it('handles multiple placeholders in mixed order', () => {
    const segs = segmentMarkdownHtml(
      '<youtube-embed videoId="dQw4w9WgXcQ"></youtube-embed><p>mid</p><link-preview url="https://example.com/x"></link-preview>',
    );
    expect(segs.length).toBe(3);
    expect(segs[0]).toEqual({ type: 'youtube', videoId: 'dQw4w9WgXcQ' });
    expect(segs[1]).toEqual({ type: 'html', html: '<p>mid</p>' });
    expect(segs[2]).toEqual({ type: 'link-preview', url: 'https://example.com/x' });
  });

  it('drops segment with invalid videoId', () => {
    const segs = segmentMarkdownHtml('<youtube-embed videoId="bad!"></youtube-embed>');
    // 부적합한 videoId → segment 없음 → 빈 배열 또는 placeholder만 drop
    expect(segs.some((s) => s.type === 'youtube')).toBe(false);
  });

  it('drops segment with non-https url', () => {
    const segs = segmentMarkdownHtml(
      '<link-preview url="http://insecure.example.com"></link-preview>',
    );
    expect(segs.some((s) => s.type === 'link-preview')).toBe(false);
  });

  it('works with the actual renderMarkdownToSafeHtml pipeline output (integration)', async () => {
    const md = `안녕

https://youtu.be/dQw4w9WgXcQ

링크 보세요: https://example.com 그리고

https://example.com/standalone`;
    const html = await renderMarkdownToSafeHtml(md);
    const segs = segmentMarkdownHtml(html);
    const youtubeSegs = segs.filter((s) => s.type === 'youtube');
    const linkPreviewSegs = segs.filter((s) => s.type === 'link-preview');
    expect(youtubeSegs.length).toBe(1);
    expect(linkPreviewSegs.length).toBe(1);
    expect(youtubeSegs[0]).toEqual({ type: 'youtube', videoId: 'dQw4w9WgXcQ' });
    expect(linkPreviewSegs[0]).toEqual({
      type: 'link-preview',
      url: 'https://example.com/standalone',
    });
  });

  it('handles videoId attribute case-insensitively (videoid lowercase)', () => {
    // rehype-stringify는 대문자를 보존하지만 안전망으로 lowercase도 받음.
    const segs = segmentMarkdownHtml('<youtube-embed videoid="dQw4w9WgXcQ"></youtube-embed>');
    expect(segs).toEqual([{ type: 'youtube', videoId: 'dQw4w9WgXcQ' }]);
  });

  // ========================================================================
  // Sprint 11 Phase E — image segment (next/image 변환 대상)
  // ========================================================================

  it('extracts img from CDN domain as image segment', () => {
    const segs = segmentMarkdownHtml(
      '<p>before</p><img src="https://cdn.kkaebizigi.com/posts/u1/20260518/abc.webp" alt="sample"/><p>after</p>',
    );
    expect(segs).toEqual([
      { type: 'html', html: '<p>before</p>' },
      { type: 'image', src: 'https://cdn.kkaebizigi.com/posts/u1/20260518/abc.webp', alt: 'sample' },
      { type: 'html', html: '<p>after</p>' },
    ]);
  });

  it('extracts img from staging CDN as image segment (empty alt OK)', () => {
    const segs = segmentMarkdownHtml(
      '<img src="https://cdn-staging.kkaebizigi.com/posts/u2/20260518/xyz.webp" alt=""/>',
    );
    expect(segs).toEqual([
      { type: 'image', src: 'https://cdn-staging.kkaebizigi.com/posts/u2/20260518/xyz.webp', alt: '' },
    ]);
  });

  it('keeps firebasestorage legacy img as native html (not next/image target)', () => {
    // 도메인 화이트리스트는 통과했지만 next/image 대상은 CDN만 — html segment로 보존.
    const html = '<img src="https://firebasestorage.googleapis.com/v0/b/x/o/y.jpg" alt="legacy"/>';
    const segs = segmentMarkdownHtml(html);
    expect(segs).toEqual([{ type: 'html', html }]);
  });

  it('multiple images each become separate segment in order', () => {
    const segs = segmentMarkdownHtml(
      '<img src="https://cdn.kkaebizigi.com/posts/u1/a.webp" alt="1"/><img src="https://cdn.kkaebizigi.com/posts/u1/b.webp" alt="2"/>',
    );
    const imgs = segs.filter((s) => s.type === 'image');
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toEqual({ type: 'image', src: 'https://cdn.kkaebizigi.com/posts/u1/a.webp', alt: '1' });
    expect(imgs[1]).toEqual({ type: 'image', src: 'https://cdn.kkaebizigi.com/posts/u1/b.webp', alt: '2' });
  });

  it('drops img without src (defensive — sanitize should have removed)', () => {
    const segs = segmentMarkdownHtml('<p>x</p><img alt="noSrc"/><p>y</p>');
    expect(segs).toEqual([
      { type: 'html', html: '<p>x</p>' },
      { type: 'html', html: '<p>y</p>' },
    ]);
  });
});
