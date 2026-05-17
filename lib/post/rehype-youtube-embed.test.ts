/**
 * rehype-youtube-embed unit tests — Sprint 10 / Phase D Task #19.
 *
 * 검증 범위:
 *  1. extractYoutubeId — 5가지 URL 패턴 + invalid 케이스
 *  2. rehypeYoutubeEmbedPlugin — 단독 줄 변환 + 인라인 링크 보존
 */
import { describe, it, expect } from 'vitest';

import { extractYoutubeId } from './rehype-youtube-embed';
import { renderMarkdownToSafeHtml } from './markdown';

describe('extractYoutubeId', () => {
  it('matches youtu.be short URL', () => {
    expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('matches youtube.com/watch?v=ID', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('matches youtube.com/watch with extra query params', () => {
    expect(
      extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('matches youtube.com/shorts/ID', () => {
    expect(
      extractYoutubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('matches m.youtube.com (mobile)', () => {
    expect(
      extractYoutubeId('https://m.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('matches youtube.com/embed/ID', () => {
    expect(extractYoutubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('rejects non-YouTube URL', () => {
    expect(extractYoutubeId('https://vimeo.com/12345')).toBeNull();
  });

  it('rejects http (non-https) URL', () => {
    expect(extractYoutubeId('http://youtu.be/dQw4w9WgXcQ')).toBeNull();
  });

  it('rejects invalid URL string', () => {
    expect(extractYoutubeId('not-a-url')).toBeNull();
  });

  it('rejects youtube.com/playlist (no videoId)', () => {
    expect(
      extractYoutubeId('https://www.youtube.com/playlist?list=PL12345'),
    ).toBeNull();
  });

  it('rejects malformed videoId (wrong length)', () => {
    expect(extractYoutubeId('https://youtu.be/abc')).toBeNull();
    expect(
      extractYoutubeId('https://www.youtube.com/watch?v=tooLongVideoId1'),
    ).toBeNull();
  });

  it('rejects videoId with disallowed characters', () => {
    expect(extractYoutubeId('https://youtu.be/abcdefghij!')).toBeNull();
  });
});

describe('rehypeYoutubeEmbedPlugin — integration via renderMarkdownToSafeHtml', () => {
  it('converts standalone YouTube URL on its own line to <youtube-embed>', async () => {
    const md = 'https://youtu.be/dQw4w9WgXcQ';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).toContain('<youtube-embed');
    expect(html).toContain('videoId="dQw4w9WgXcQ"');
    expect(html).not.toMatch(/<p>\s*<a/);
  });

  it('converts youtube.com/watch URL on its own line', async () => {
    const md = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).toContain('<youtube-embed');
    expect(html).toContain('videoId="dQw4w9WgXcQ"');
  });

  it('converts youtube.com/shorts URL on its own line', async () => {
    const md = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).toContain('<youtube-embed');
    expect(html).toContain('videoId="dQw4w9WgXcQ"');
  });

  it('does NOT convert inline link with surrounding text', async () => {
    const md = '봐봐 https://youtu.be/dQw4w9WgXcQ 이거 진짜 좋아';
    const html = await renderMarkdownToSafeHtml(md);
    // 인라인 텍스트와 함께 있는 URL은 plain text로 남고 <youtube-embed>가 생기지 않아야 한다.
    expect(html).not.toContain('<youtube-embed');
  });

  it('does NOT convert markdown link with custom text', async () => {
    const md = '[내가 좋아하는 영상](https://youtu.be/dQw4w9WgXcQ)';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).not.toContain('<youtube-embed');
    expect(html).toContain('<a href="https://youtu.be/dQw4w9WgXcQ"');
  });

  it('does NOT convert non-YouTube URL via this plugin (link-preview takes over)', async () => {
    const md = 'https://example.com/post/1';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).not.toContain('<youtube-embed');
  });

  it('handles multiple standalone YouTube URLs', async () => {
    const md = `https://youtu.be/dQw4w9WgXcQ

https://www.youtube.com/watch?v=oHg5SJYRHA0`;
    const html = await renderMarkdownToSafeHtml(md);
    const matches = html.match(/<youtube-embed/g) ?? [];
    expect(matches.length).toBe(2);
    expect(html).toContain('videoId="dQw4w9WgXcQ"');
    expect(html).toContain('videoId="oHg5SJYRHA0"');
  });
});
