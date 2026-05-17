/**
 * rehypeLinkPreviewPlugin — 단독 URL 줄 (YouTube 외)을 `<link-preview url>` 로 변환.
 * 출처: docs/sprint/10-sprint-launch/design.md §6.3
 *
 * 변환 패턴:
 *  - `<p><a href="https://example.com">https://example.com</a></p>`
 *
 * 조건:
 *  1. `<p>` 내 단일 자식이 `<a>`여야 한다.
 *  2. `<a>` 내부 텍스트가 href와 동일해야 한다 (사용자가 URL을 그대로 붙여넣은 경우).
 *  3. YouTube URL이 아니어야 한다 (YouTube plugin 다음에 실행되므로 자연 제외).
 *  4. https URL 만 허용 (markdown sanitize 일관성).
 *
 * 실행 순서: `rehypeYoutubeEmbedPlugin` → `rehypeLinkPreviewPlugin`
 *   - YouTube에 먼저 매칭되면 `<youtube-embed>`로 변환되어 본 plugin이 처리하지 않음.
 *
 * SAFE_SCHEMA 통과 보장: tagNames/attributes에 `link-preview`/`url` 추가 필수.
 */
import { visit } from 'unist-util-visit';
import type { Root, Element, Text } from 'hast';

import { extractYoutubeId } from './rehype-youtube-embed';

/**
 * 단독 URL `<p>` 줄을 `<link-preview url>`로 교체하는 rehype plugin.
 * YouTube URL은 제외 (사전에 youtube-embed로 변환됨).
 */
export function rehypeLinkPreviewPlugin() {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'p') return;
      if (node.children.length !== 1) return;
      const child = node.children[0];
      if (!child || child.type !== 'element' || child.tagName !== 'a') return;

      const href = child.properties?.href;
      if (typeof href !== 'string') return;

      // <a> 내부 텍스트 = href 검증
      if (child.children.length !== 1) return;
      const linkText = child.children[0];
      if (!linkText || (linkText as Text).type !== 'text') return;
      const textValue = (linkText as Text).value.trim();
      if (textValue !== href) return;

      // https URL 만 허용
      let parsed: URL;
      try {
        parsed = new URL(href);
      } catch {
        return;
      }
      if (parsed.protocol !== 'https:') return;

      // YouTube는 이미 변환됐어야 하지만 안전망 — YouTube면 건너뜀
      if (extractYoutubeId(href)) return;

      if (parent && typeof index === 'number' && 'children' in parent) {
        parent.children.splice(index, 1, {
          type: 'element',
          tagName: 'link-preview',
          properties: { url: href },
          children: [],
        } as Element);
      }
    });
  };
}
