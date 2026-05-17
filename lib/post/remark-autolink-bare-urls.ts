/**
 * remarkAutolinkBareUrlsPlugin — 단독 URL 줄(텍스트 노드)을 autolink로 변환.
 * 출처: docs/sprint/10-sprint-launch/design.md §6.2-6.3 (단독 URL 줄 → embed/preview)
 *
 * 동기:
 *  - remark 기본은 `<https://...>` autolink syntax만 인식 → bare URL은 텍스트로 남는다.
 *  - 우리는 사용자가 한 줄에 URL만 붙여넣는 케이스를 embed/preview로 변환해야 한다.
 *  - rehypeYoutubeEmbedPlugin / rehypeLinkPreviewPlugin은 `<p><a href=URL>URL</a></p>` 패턴을 기대.
 *  - remark-gfm 전체를 끌어들이면 tables/strikethrough 등 부수 기능 활성화 → 본 SAFE_SCHEMA와 충돌.
 *  - 따라서 최소 범위로 "텍스트 노드 = 정확히 URL 한 줄" 인 경우만 autolink 변환.
 *
 * 변환 패턴:
 *  - paragraph > [ text("https://...") ]   (텍스트 단독, 좌우 공백은 trim)
 *  → paragraph > [ link(href=URL, [text(URL)]) ]
 *
 * 후속 처리:
 *  - remark → mdast → remark-rehype → hast 변환 후 rehype plugin들이 `<a>` 패턴을 인식.
 */
import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text, Link } from 'mdast';

/** trim된 텍스트가 유효한 https URL 문자열인지 확인. */
function isStandaloneHttpsUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // 공백 포함된 텍스트는 단독 URL이 아님 (예: "여기 봐 https://...")
  if (/\s/.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return null;
    return trimmed;
  } catch {
    return null;
  }
}

export function remarkAutolinkBareUrlsPlugin() {
  return (tree: Root): void => {
    visit(tree, 'paragraph', (paragraph: Paragraph) => {
      if (paragraph.children.length !== 1) return;
      const only = paragraph.children[0];
      if (!only || only.type !== 'text') return;
      const url = isStandaloneHttpsUrl((only as Text).value);
      if (!url) return;
      const link: Link = {
        type: 'link',
        url,
        title: null,
        children: [{ type: 'text', value: url }],
      };
      paragraph.children = [link];
    });
  };
}
