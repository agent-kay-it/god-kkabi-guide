/**
 * Sprint 17 / F17-A — lib/post/remark-autolink-bare-urls.ts unit test.
 *
 * remark mdast tree 의 paragraph > text(URL) 패턴 → autolink 변환 검증.
 */
import { describe, it, expect } from 'vitest';
import { remarkAutolinkBareUrlsPlugin } from './remark-autolink-bare-urls';
import type { Root, Paragraph, Text, Link } from 'mdast';

function makeTree(...paragraphs: Paragraph[]): Root {
  return { type: 'root', children: paragraphs };
}

function makeParagraph(...nodes: (Text | Link)[]): Paragraph {
  return { type: 'paragraph', children: nodes };
}

function makeText(value: string): Text {
  return { type: 'text', value };
}

describe('remarkAutolinkBareUrlsPlugin()', () => {
  it('단독 https URL 텍스트 노드 → autolink 변환', () => {
    const tree = makeTree(makeParagraph(makeText('https://example.com')));
    const transform = remarkAutolinkBareUrlsPlugin();
    transform(tree);
    const para = tree.children[0] as Paragraph | undefined;
    const child = para?.children[0];
    expect(child?.type).toBe('link');
    if (child?.type === 'link') {
      expect(child.url).toBe('https://example.com');
      expect(child.children[0]).toEqual({ type: 'text', value: 'https://example.com' });
    }
  });

  it('좌우 공백은 trim 후 변환', () => {
    const tree = makeTree(makeParagraph(makeText('  https://example.com  ')));
    remarkAutolinkBareUrlsPlugin()(tree);
    const para = tree.children[0] as Paragraph | undefined;
    const child = para?.children[0];
    expect(child?.type).toBe('link');
    if (child?.type === 'link') {
      expect(child.url).toBe('https://example.com');
    }
  });

  it('http (non-https) URL 은 변환 X', () => {
    const tree = makeTree(makeParagraph(makeText('http://example.com')));
    remarkAutolinkBareUrlsPlugin()(tree);
    const para = tree.children[0] as Paragraph | undefined;
    const child = para?.children[0];
    expect(child?.type).toBe('text');
  });

  it('공백 포함된 텍스트는 변환 X (단독 URL 아님)', () => {
    const tree = makeTree(makeParagraph(makeText('여기 봐 https://example.com')));
    remarkAutolinkBareUrlsPlugin()(tree);
    const para = tree.children[0] as Paragraph | undefined;
    const child = para?.children[0];
    expect(child?.type).toBe('text');
  });

  it('paragraph children 이 2개 이상이면 변환 X', () => {
    const tree = makeTree(
      makeParagraph(makeText('https://example.com'), makeText(' suffix')),
    );
    remarkAutolinkBareUrlsPlugin()(tree);
    const para = tree.children[0] as Paragraph | undefined;
    expect(para?.children.length).toBe(2);
    expect(para?.children[0]?.type).toBe('text');
  });

  it('빈 문자열은 변환 X', () => {
    const tree = makeTree(makeParagraph(makeText('')));
    remarkAutolinkBareUrlsPlugin()(tree);
    const para = tree.children[0] as Paragraph | undefined;
    const child = para?.children[0];
    expect(child?.type).toBe('text');
  });

  it('잘못된 URL 형식은 변환 X', () => {
    const tree = makeTree(makeParagraph(makeText('not-a-url-at-all')));
    remarkAutolinkBareUrlsPlugin()(tree);
    const para = tree.children[0] as Paragraph | undefined;
    const child = para?.children[0];
    expect(child?.type).toBe('text');
  });

  it('여러 paragraph 가 있으면 각각 독립적으로 처리', () => {
    const tree = makeTree(
      makeParagraph(makeText('https://a.com')),
      makeParagraph(makeText('normal text')),
      makeParagraph(makeText('https://b.com')),
    );
    remarkAutolinkBareUrlsPlugin()(tree);
    const paras = tree.children as Paragraph[];
    expect(paras[0]?.children[0]?.type).toBe('link');
    expect(paras[1]?.children[0]?.type).toBe('text');
    expect(paras[2]?.children[0]?.type).toBe('link');
  });

  it('이미 link 인 child 는 그대로 유지 (text 아님)', () => {
    const link: Link = {
      type: 'link',
      url: 'https://existing.com',
      title: null,
      children: [{ type: 'text', value: 'already a link' }],
    };
    const tree = makeTree(makeParagraph(link));
    remarkAutolinkBareUrlsPlugin()(tree);
    const para = tree.children[0] as Paragraph | undefined;
    const child = para?.children[0];
    expect(child).toBe(link);
  });
});
