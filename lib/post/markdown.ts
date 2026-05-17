/**
 * Markdown lite 렌더링 — XSS-safe sanitize.
 * 출처: docs/sprint/04-sprint-v1/design.md §4 (Markdown Lite Renderer)
 *      + docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §0 (CA-m4 외부 이미지 정책)
 *      + docs/sprint/10-sprint-launch/design.md §6 (YouTube Embed + Link Preview)
 *
 * 허용 태그: h2/h3 + p + strong/em + code/pre + blockquote + ul/ol/li + a + img + br + hr
 *           + youtube-embed (Sprint 10) + link-preview (Sprint 10)
 * 허용 속성: a[href,rel,target] + img[src,alt] + code[className]
 *           + youtube-embed[videoId] + link-preview[url]
 * 허용 프로토콜: https only
 *
 * Sprint V2 P3.A — CA-m4: img src 도메인 화이트리스트 적용
 *  - Firebase Storage (firebasestorage.googleapis.com) 만 허용
 *  - 외부 imgur/discord/imgbb 등은 본문 inline 금지 (PostForm에서 업로드 권장)
 *  - 외부 이미지 차단은 lib/post/markdown.ts의 customDomainCheck rehype plugin으로 구현
 *
 * Sprint 10 / Phase D — Posts Enrichment:
 *  - 단독 YouTube URL 줄 → <youtube-embed videoId="..."> 변환 (rehype-youtube-embed.ts)
 *  - 단독 일반 URL 줄 → <link-preview url="..."> 변환 (rehype-link-preview.ts)
 *  - 두 플러그인은 rehype-sanitize 뒤에 실행 (SAFE_SCHEMA에 등록되어 통과 보장)
 *
 * 보안 critical: dangerouslySetInnerHTML 전 단계에서 사전 sanitize 보장.
 */

import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

import { rehypeYoutubeEmbedPlugin } from './rehype-youtube-embed';
import { rehypeLinkPreviewPlugin } from './rehype-link-preview';
import { remarkAutolinkBareUrlsPlugin } from './remark-autolink-bare-urls';

type SanitizeSchema = typeof defaultSchema;

/** Sprint V2 P3.A — CA-m4: 허용된 img src 도메인 화이트리스트 */
const ALLOWED_IMG_HOSTS: ReadonlySet<string> = new Set([
  'firebasestorage.googleapis.com',
]);

/**
 * rehype plugin — img 요소 중 src host가 화이트리스트에 없으면 제거.
 * 본 plugin은 rehype-sanitize 다음에 적용 (sanitize는 protocol/tag 검증만, host는 별도).
 */
function rehypeAllowedImgDomainsPlugin() {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent) => {
      if (node.tagName !== 'img') return;
      const src = node.properties?.src;
      if (typeof src !== 'string') return;
      try {
        const url = new URL(src);
        if (!ALLOWED_IMG_HOSTS.has(url.host)) {
          // 외부 도메인 — alt만 남기고 제거 (paragraph fallback)
          const alt =
            typeof node.properties?.alt === 'string' ? node.properties.alt : '';
          if (parent && typeof index === 'number' && 'children' in parent) {
            parent.children.splice(index, 1, {
              type: 'element',
              tagName: 'span',
              properties: { className: ['blocked-external-image'] },
              children: alt ? [{ type: 'text', value: `[차단된 외부 이미지: ${alt}]` }] : [],
            } as Element);
          }
        }
      } catch {
        // 잘못된 URL — sanitize가 이미 거부했을 것
      }
    });
  };
}

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
    // Sprint 10 / Phase D — custom elements (placeholder tags before React hydration).
    // 본 태그는 rehype-sanitize를 통과시키되, 이후 youtube-embed / link-preview rehype plugin이
    // <p><a>{URL}</a></p> 패턴을 본 태그로 교체한다. 따라서 사용자 입력으로는 직접 작성될 수 없다
    // (Markdown 문법에 본 태그 표기가 없음). 보안적으로 안전.
    'youtube-embed',
    'link-preview',
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
    // Sprint 10 / Phase D — videoId / url 속성만 허용. extractYoutubeId가 정규식 검증을 거친다.
    'youtube-embed': [['videoId']],
    'link-preview': [['url']],
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
    // Sprint 10 / Phase D — bare URL 텍스트 → autolink 변환 (mdast).
    // remark는 기본적으로 `<https://...>` 형태만 autolink 처리 → bare URL은 텍스트로 남음.
    // 본 plugin은 "단독 URL 줄"만 안전하게 link 노드로 변환한다 (인라인 URL은 보존).
    .use(remarkAutolinkBareUrlsPlugin)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize, SAFE_SCHEMA)
    .use(rehypeAllowedImgDomainsPlugin) // Sprint V2 P3.A — CA-m4 외부 이미지 차단
    // Sprint 10 / Phase D — 단독 URL 줄 → 임베드 placeholder 변환.
    // 순서 critical: youtube 먼저 → link-preview (YouTube가 아닌 URL만 변환).
    .use(rehypeYoutubeEmbedPlugin)
    .use(rehypeLinkPreviewPlugin)
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
