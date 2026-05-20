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
  FAQStructuredData,
  VideoGameStructuredData,
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

describe('FAQStructuredData (Sprint 25 F25-C)', () => {
  it('FAQPage schema 렌더 + Question/Answer 매핑', () => {
    const { container } = render(
      <FAQStructuredData
        items={[
          { question: '진령은 어떻게 뽑나요?', answer: '천음령으로 소환합니다.' },
          { question: '천장은 몇 회?', answer: '10회 단위 보장.' },
        ]}
      />,
    );
    const json = JSON.parse(container.querySelector('script#ld-faq')!.innerHTML);
    expect(json['@type']).toBe('FAQPage');
    expect(json.mainEntity.length).toBe(2);
    expect(json.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: '진령은 어떻게 뽑나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '천음령으로 소환합니다.',
      },
    });
  });

  it('빈 items → mainEntity 빈 배열', () => {
    const { container } = render(<FAQStructuredData items={[]} />);
    const json = JSON.parse(container.querySelector('script#ld-faq')!.innerHTML);
    expect(json.mainEntity).toEqual([]);
  });
});

describe('VideoGameStructuredData (Sprint 25 F25-C)', () => {
  it('VideoGame schema 렌더 — 최소 필드 (name 만)', () => {
    const { container } = render(
      <VideoGameStructuredData game={{ name: '갓깨비 키우기' }} />,
    );
    const json = JSON.parse(container.querySelector('script#ld-videogame')!.innerHTML);
    expect(json['@type']).toBe('VideoGame');
    expect(json.name).toBe('갓깨비 키우기');
    expect(json.url).toBeTruthy();
    // optional 필드 — 미설정 시 누락
    expect(json.applicationCategory).toBeUndefined();
    expect(json.operatingSystem).toBeUndefined();
    expect(json.genre).toBeUndefined();
    expect(json.publisher).toBeUndefined();
    expect(json.inLanguage).toBeUndefined();
    expect(json.downloadUrl).toBeUndefined();
  });

  it('모든 optional 필드 적용', () => {
    const { container } = render(
      <VideoGameStructuredData
        url="https://x.local"
        game={{
          name: '갓깨비 키우기',
          applicationCategory: 'GameApplication',
          operatingSystem: 'Android, iOS, Web',
          genre: ['RPG', 'Idle'],
          publisher: '조이시티',
          inLanguage: 'ko-KR',
          downloadUrl: [
            'https://play.google.com/x',
            'https://apps.apple.com/x',
          ],
        }}
      />,
    );
    const json = JSON.parse(container.querySelector('script#ld-videogame')!.innerHTML);
    expect(json.url).toBe('https://x.local');
    expect(json.applicationCategory).toBe('GameApplication');
    expect(json.operatingSystem).toBe('Android, iOS, Web');
    expect(json.genre).toEqual(['RPG', 'Idle']);
    expect(json.publisher).toMatchObject({
      '@type': 'Organization',
      name: '조이시티',
    });
    expect(json.inLanguage).toBe('ko-KR');
    expect(json.downloadUrl).toEqual([
      'https://play.google.com/x',
      'https://apps.apple.com/x',
    ]);
  });

  it('빈 genre / downloadUrl 배열 → 필드 누락', () => {
    const { container } = render(
      <VideoGameStructuredData
        game={{ name: 'g', genre: [], downloadUrl: [] }}
      />,
    );
    const json = JSON.parse(container.querySelector('script#ld-videogame')!.innerHTML);
    expect(json.genre).toBeUndefined();
    expect(json.downloadUrl).toBeUndefined();
  });
});
