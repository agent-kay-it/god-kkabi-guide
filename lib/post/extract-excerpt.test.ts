/**
 * Sprint 18 / F18-A — lib/post/markdown.ts 의 extractExcerpt() unit test.
 *
 * Markdown 본문 → plain text excerpt 변환 검증.
 * 본 파일은 markdown.ts 의 extractExcerpt 만 격리 테스트 (remark/rehype 미사용).
 */
import { describe, it, expect } from 'vitest';
import { extractExcerpt } from './markdown';

describe('extractExcerpt()', () => {
  it('일반 텍스트 그대로 (length 미달)', () => {
    expect(extractExcerpt('Hello World')).toBe('Hello World');
  });

  it('maxLength 초과 시 truncate + ellipsis', () => {
    const text = 'a'.repeat(200);
    const result = extractExcerpt(text, 150);
    expect(result.length).toBeLessThanOrEqual(151); // 150 + ellipsis
    expect(result.endsWith('…')).toBe(true);
  });

  it('default maxLength 150', () => {
    const text = 'a'.repeat(200);
    const result = extractExcerpt(text);
    expect(result.length).toBeLessThanOrEqual(151);
  });

  it('빈 문자열 → 빈 문자열', () => {
    expect(extractExcerpt('')).toBe('');
  });

  it('코드 블록 제거', () => {
    const body = '본문\n```js\nconst x = 1;\n```\n끝';
    const result = extractExcerpt(body);
    expect(result).not.toContain('const x');
    expect(result).toContain('본문');
    expect(result).toContain('끝');
  });

  it('인라인 코드 제거', () => {
    expect(extractExcerpt('Hello `code` World').includes('code')).toBe(false);
  });

  it('이미지 → alt 만 유지', () => {
    const result = extractExcerpt('Before ![대체텍스트](https://example.com/img.png) After');
    expect(result).toContain('대체텍스트');
    expect(result).not.toContain('http');
    expect(result).not.toContain('![');
  });

  it('링크 → 텍스트만 유지', () => {
    const result = extractExcerpt('Before [링크텍스트](https://example.com) After');
    expect(result).toContain('링크텍스트');
    expect(result).not.toContain('http');
    expect(result).not.toContain('[');
  });

  it('헤딩 마크업 제거 (# ## ###)', () => {
    expect(extractExcerpt('# 제목')).toBe('제목');
    expect(extractExcerpt('## 부제목')).toBe('부제목');
    expect(extractExcerpt('### Section')).toBe('Section');
  });

  it('strong 마크업 제거 (** **)', () => {
    expect(extractExcerpt('Hello **world**')).toBe('Hello world');
  });

  it('em 마크업 제거 (* *)', () => {
    expect(extractExcerpt('Hello *world*')).toBe('Hello world');
  });

  it('underscore strong 제거 (__ __)', () => {
    expect(extractExcerpt('Hello __world__')).toBe('Hello world');
  });

  it('underscore em 제거 (_ _)', () => {
    expect(extractExcerpt('Hello _world_')).toBe('Hello world');
  });

  it('blockquote (>) 제거', () => {
    expect(extractExcerpt('> 인용문')).toBe('인용문');
  });

  it('list marker 제거 (- *)', () => {
    const result = extractExcerpt('- item1\n* item2\n+ item3');
    expect(result).toContain('item1');
    expect(result).toContain('item2');
    expect(result).toContain('item3');
    expect(result).not.toMatch(/^\s*[-*+]\s/m);
  });

  it('ordered list marker 제거 (1. 2.)', () => {
    const result = extractExcerpt('1. 첫째\n2. 둘째');
    expect(result).toContain('첫째');
    expect(result).toContain('둘째');
    expect(result).not.toContain('1.');
  });

  it('연속 공백 압축', () => {
    expect(extractExcerpt('a    b    c')).toBe('a b c');
  });

  it('좌우 trim', () => {
    expect(extractExcerpt('   text   ')).toBe('text');
  });

  it('한글 maxLength 처리', () => {
    const text = '안녕하세요'.repeat(50);
    const result = extractExcerpt(text, 20);
    expect(result.length).toBeLessThanOrEqual(21);
  });

  it('복합 markdown 통합 — 모든 마크업 제거', () => {
    const body = `# 제목

**굵게** 와 *기울임*

> 인용

- 리스트 1
- 리스트 2

[링크](https://x.com) 와 \`code\`
\`\`\`
codeblock
\`\`\``;
    const result = extractExcerpt(body, 200);
    expect(result).toContain('제목');
    expect(result).toContain('굵게');
    expect(result).toContain('기울임');
    expect(result).toContain('인용');
    expect(result).toContain('리스트');
    expect(result).toContain('링크');
    expect(result).not.toContain('#');
    expect(result).not.toContain('**');
    expect(result).not.toContain('codeblock');
    expect(result).not.toContain('https://');
  });
});
