/**
 * rehypeYoutubeEmbedPlugin — 단독 YouTube URL 줄을 `<youtube-embed videoId>` 로 변환.
 * 출처: docs/sprint/10-sprint-launch/design.md §6.2
 *
 * 변환 패턴:
 *  - `<p><a href="https://youtu.be/{id}">https://youtu.be/{id}</a></p>`
 *  - `<p><a href="https://www.youtube.com/watch?v={id}">...</a></p>`
 *  - `<p><a href="https://www.youtube.com/shorts/{id}">...</a></p>`
 *
 * 조건:
 *  1. `<p>` 내 단일 자식이 `<a>`여야 한다 (인라인 링크는 변환하지 않음).
 *  2. `<a>` 내부 텍스트가 href와 동일해야 한다 (사용자가 URL을 그대로 붙여넣은 경우).
 *
 * SAFE_SCHEMA 통과 보장: rehype-sanitize 이후 실행 → tagNames/attributes에 `youtube-embed`/`videoId` 추가 필수.
 *
 * 보안: videoId 추출 시 URL 객체로 파싱 → 잘못된 URL이면 변환 보류.
 */
import { visit } from 'unist-util-visit';
import type { Root, Element, Text } from 'hast';

/**
 * 다양한 YouTube URL 형태에서 videoId 추출.
 * 지원: youtu.be/{id}, youtube.com/watch?v={id}, youtube.com/shorts/{id}, www.youtube.com/embed/{id}
 * 미지원: live/{id}, playlist?list, 채널 등 → null 반환.
 */
export function extractYoutubeId(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  // https only — markdown sanitize와 일관성
  if (url.protocol !== 'https:') return null;

  const host = url.hostname.toLowerCase();
  // youtu.be/{id}
  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const id = url.pathname.replace(/^\//, '').split('/')[0] ?? '';
    return isValidVideoId(id) ? id : null;
  }
  // youtube.com / www.youtube.com / m.youtube.com / music.youtube.com
  if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    // /watch?v={id}
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      return id && isValidVideoId(id) ? id : null;
    }
    // /shorts/{id}
    if (url.pathname.startsWith('/shorts/')) {
      const id = url.pathname.slice('/shorts/'.length).split('/')[0] ?? '';
      return isValidVideoId(id) ? id : null;
    }
    // /embed/{id}
    if (url.pathname.startsWith('/embed/')) {
      const id = url.pathname.slice('/embed/'.length).split('/')[0] ?? '';
      return isValidVideoId(id) ? id : null;
    }
  }
  return null;
}

/** YouTube videoId 형식 검증 — 11자 영숫자/하이픈/언더스코어. */
function isValidVideoId(id: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

/**
 * `<p><a href=URL>URL</a></p>` 패턴을 `<youtube-embed videoId>`로 교체하는 rehype plugin.
 * rehype-sanitize 뒤에 .use()해야 한다 (custom 태그 출력 후 다시 sanitize되면 안 됨).
 */
export function rehypeYoutubeEmbedPlugin() {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'p') return;
      if (node.children.length !== 1) return;
      const child = node.children[0];
      if (!child || child.type !== 'element' || child.tagName !== 'a') return;

      const href = child.properties?.href;
      if (typeof href !== 'string') return;

      // <a> 내부 텍스트가 href와 동일해야 단독 URL 줄로 인정
      if (child.children.length !== 1) return;
      const linkText = child.children[0];
      if (!linkText || (linkText as Text).type !== 'text') return;
      const textValue = (linkText as Text).value.trim();
      if (textValue !== href) return;

      const videoId = extractYoutubeId(href);
      if (!videoId) return;

      if (parent && typeof index === 'number' && 'children' in parent) {
        // `videoId` 속성은 SAFE_SCHEMA의 attributes['youtube-embed']에 등록되어 있어야 통과.
        parent.children.splice(index, 1, {
          type: 'element',
          tagName: 'youtube-embed',
          properties: { videoId },
          children: [],
        } as Element);
      }
    });
  };
}
