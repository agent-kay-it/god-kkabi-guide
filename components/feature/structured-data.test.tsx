/**
 * components/feature/structured-data.tsx — Sprint 23 F23-D RTL.
 */
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

import {
  WebsiteStructuredData,
  BreadcrumbStructuredData,
  ArticleStructuredData,
} from './structured-data';

afterEach(() => cleanup());

describe('WebsiteStructuredData', () => {
  it('JSON-LD script 렌더 + WebSite schema', () => {
    const { container } = render(<WebsiteStructuredData />);
    const script = container.querySelector('script#ld-website');
    expect(script).not.toBeNull();
    expect(script?.getAttribute('type')).toBe('application/ld+json');
    const json = JSON.parse(script!.innerHTML);
    expect(json['@type']).toBe('WebSite');
    expect(json.name).toContain('갓깨비');
    expect(json.potentialAction['@type']).toBe('SearchAction');
  });

  it('url prop 적용', () => {
    const { container } = render(<WebsiteStructuredData url="https://custom.example" />);
    const json = JSON.parse(container.querySelector('script')!.innerHTML);
    expect(json.url).toBe('https://custom.example');
    expect(json.potentialAction.target.urlTemplate).toContain('custom.example');
  });
});

describe('BreadcrumbStructuredData', () => {
  it('items 변환 — itemListElement', () => {
    const { container } = render(
      <BreadcrumbStructuredData
        items={[
          { position: 1, name: 'Home', url: 'https://x/' },
          { position: 2, name: 'Post', url: 'https://x/post' },
        ]}
      />,
    );
    const json = JSON.parse(container.querySelector('script#ld-breadcrumb')!.innerHTML);
    expect(json['@type']).toBe('BreadcrumbList');
    expect(json.itemListElement.length).toBe(2);
    expect(json.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://x/',
    });
  });

  it('빈 items → 빈 itemListElement', () => {
    const { container } = render(<BreadcrumbStructuredData items={[]} />);
    const json = JSON.parse(container.querySelector('script#ld-breadcrumb')!.innerHTML);
    expect(json.itemListElement).toEqual([]);
  });
});

describe('ArticleStructuredData', () => {
  const samplePost = {
    id: 'p1',
    title: '내 빌드 공유',
    bodyExcerpt: '내용 발췌',
    authorNickname: 'kay',
    imageUrls: ['https://cdn/img1.png'],
    createdAtMs: 1700000000000,
    updatedAtMs: 1700000010000,
  };

  it('Article schema 렌더', () => {
    const { container } = render(
      <ArticleStructuredData post={samplePost} url="https://x/post/p1" />,
    );
    const json = JSON.parse(container.querySelector('script#ld-article')!.innerHTML);
    expect(json['@type']).toBe('Article');
    expect(json.headline).toBe('내 빌드 공유');
    expect(json.author.name).toBe('kay');
    expect(json.image).toEqual(['https://cdn/img1.png']);
    expect(json.datePublished).toBeTruthy();
  });

  it('title 110자 초과 시 truncate', () => {
    const longTitle = 'a'.repeat(150);
    const { container } = render(
      <ArticleStructuredData
        post={{ ...samplePost, title: longTitle }}
        url="https://x/post/p1"
      />,
    );
    const json = JSON.parse(container.querySelector('script')!.innerHTML);
    expect(json.headline.length).toBe(110);
  });

  it('imageUrls 없을 때 image 필드 누락', () => {
    const { container } = render(
      <ArticleStructuredData
        post={{ ...samplePost, imageUrls: [] }}
        url="https://x"
      />,
    );
    const json = JSON.parse(container.querySelector('script')!.innerHTML);
    expect(json.image).toBeUndefined();
  });

  it('createdAtMs / updatedAtMs ISO 변환', () => {
    const { container } = render(
      <ArticleStructuredData post={samplePost} url="https://x" />,
    );
    const json = JSON.parse(container.querySelector('script')!.innerHTML);
    expect(json.datePublished).toBe(new Date(samplePost.createdAtMs).toISOString());
    expect(json.dateModified).toBe(new Date(samplePost.updatedAtMs).toISOString());
  });

  it('mainEntityOfPage / publisher 메타', () => {
    const { container } = render(
      <ArticleStructuredData post={samplePost} url="https://x/post/p1" />,
    );
    const json = JSON.parse(container.querySelector('script')!.innerHTML);
    expect(json.mainEntityOfPage['@id']).toBe('https://x/post/p1');
    expect(json.publisher['@type']).toBe('Organization');
  });
});
