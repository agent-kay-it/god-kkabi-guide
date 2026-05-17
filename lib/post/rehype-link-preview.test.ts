/**
 * rehype-link-preview unit tests — Sprint 10 / Phase D Task #19.
 *
 * 검증 범위:
 *  - YouTube가 아닌 URL을 <link-preview>로 변환
 *  - YouTube URL은 link-preview로 변환하지 않음 (youtube-embed가 우선)
 *  - 인라인 링크 / markdown 링크는 보존 (URL=텍스트 케이스만 변환)
 *  - https만 허용
 */
import { describe, it, expect } from 'vitest';

import { renderMarkdownToSafeHtml } from './markdown';

describe('rehypeLinkPreviewPlugin — integration via renderMarkdownToSafeHtml', () => {
  it('converts standalone HTTPS URL on its own line to <link-preview>', async () => {
    const md = 'https://example.com/article';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).toContain('<link-preview');
    expect(html).toContain('url="https://example.com/article"');
  });

  it('preserves YouTube URL as <youtube-embed>, not <link-preview>', async () => {
    const md = 'https://youtu.be/dQw4w9WgXcQ';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).toContain('<youtube-embed');
    expect(html).not.toContain('<link-preview');
  });

  it('does NOT convert inline link with surrounding text', async () => {
    const md = '여기 봐 https://example.com/article 재밌어';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).not.toContain('<link-preview');
  });

  it('does NOT convert markdown link with custom text', async () => {
    const md = '[기사 링크](https://example.com/article)';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).not.toContain('<link-preview');
    expect(html).toContain('<a href="https://example.com/article"');
  });

  it('converts multiple standalone URLs (mixed YouTube + other)', async () => {
    const md = `https://example.com/a

https://youtu.be/dQw4w9WgXcQ

https://example.org/b`;
    const html = await renderMarkdownToSafeHtml(md);
    const linkPreviews = html.match(/<link-preview/g) ?? [];
    const youtubeEmbeds = html.match(/<youtube-embed/g) ?? [];
    expect(linkPreviews.length).toBe(2);
    expect(youtubeEmbeds.length).toBe(1);
    expect(html).toContain('url="https://example.com/a"');
    expect(html).toContain('url="https://example.org/b"');
    expect(html).toContain('videoId="dQw4w9WgXcQ"');
  });

  it('does NOT convert http (non-https) URL', async () => {
    // remark-rehype + sanitize 단계에서 http는 protocol whitelist에 의해 a 태그가 거부될 수도 있지만,
    // 만에 하나 통과하더라도 link-preview plugin이 https만 허용한다.
    const md = 'http://example.com/insecure';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).not.toContain('<link-preview');
  });

  it('does NOT convert javascript: pseudo-protocol', async () => {
    // rehype-sanitize가 이미 차단하지만, plugin도 추가 방어선.
    const md = '[click](javascript:alert(1))';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).not.toContain('<link-preview');
    expect(html).not.toContain('javascript:');
  });
});
