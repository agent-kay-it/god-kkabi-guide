/**
 * Markdown lite 렌더링 — XSS-safe sanitize.
 * 출처: docs/sprint/04-sprint-v1/design.md §4 (Markdown Lite Renderer)
 *
 * 허용 태그: h2/h3 + p + strong/em + code/pre + blockquote + ul/ol/li + a + img + br + hr
 * 허용 속성: a[href,rel,target] + img[src,alt] + code[className]
 * 허용 프로토콜: https only
 *
 * 보안 critical: dangerouslySetInnerHTML 전 단계에서 사전 sanitize 보장.
 */

import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

type SanitizeSchema = typeof defaultSchema;

const SAFE_SCHEMA: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    'h2',
    'h3',
    'p',
    'strong',
    'em',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'br',
    'hr',
  ],
  attributes: {
    a: [
      ['href'],
      ['rel'],
      ['target'],
    ],
    img: [
      ['src'],
      ['alt'],
    ],
    code: [['className']],
  },
  protocols: {
    href: ['https'],
    src: ['https'],
  },
  clobberPrefix: 'user-content-',
};

/**
 * Markdown 문자열 → 정화된 HTML 문자열 변환.
 * Server-side에서만 호출 (Server Component / Server Action).
 */
export async function renderMarkdownToSafeHtml(body: string): Promise<string> {
  const file = await remark()
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize, SAFE_SCHEMA)
    .use(rehypeStringify)
    .process(body);
  return String(file);
}

/**
 * Markdown 본문 → plain text excerpt 변환 (첫 N자).
 * 리스트 페이지 미리보기용. Markdown 마크업 제거.
 */
export function extractExcerpt(body: string, maxLength = 150): string {
  // 1. 코드 블록 제거 (```...```)
  let text = body.replace(/```[\s\S]*?```/g, ' ');
  // 2. 인라인 코드 제거 (`...`)
  text = text.replace(/`[^`]*`/g, ' ');
  // 3. 이미지 alt만 유지 (![alt](url) → alt)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  // 4. 링크는 텍스트만 ([text](url) → text)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // 5. 헤딩 / 강조 마크업 제거
  text = text.replace(/^#{1,6}\s+/gm, '');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  // 6. blockquote 제거
  text = text.replace(/^>\s*/gm, '');
  // 7. 리스트 마커 제거
  text = text.replace(/^[\s-*+]+\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');
  // 8. 연속 공백 정리
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
