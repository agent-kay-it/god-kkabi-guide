/**
 * Markdown HTML segmenter — `<youtube-embed>` / `<link-preview>` placeholder 태그를
 * React 컴포넌트로 교체하기 위한 분할 유틸.
 *
 * 출처: docs/sprint/10-sprint-launch/design.md §6 (Posts Enrichment)
 *
 * 입력: renderMarkdownToSafeHtml() 결과 (rehype-sanitize 통과 + youtube-embed/link-preview placeholder 포함).
 * 출력: 순차 segment 배열 — HTML 조각 또는 embed/preview 토큰.
 *
 * 보안:
 *  - 입력 HTML은 이미 sanitize되어 있으므로 segment HTML도 안전.
 *  - placeholder 태그는 SAFE_SCHEMA에서 videoId(11 char A-Za-z0-9_-) / url(https) 만 통과.
 *  - 본 segmenter는 정규식 기반 — youtube-embed/link-preview는 children 없는 self-closable로 처리.
 */

export type RenderedSegment =
  | { readonly type: 'html'; readonly html: string }
  | { readonly type: 'youtube'; readonly videoId: string }
  | { readonly type: 'link-preview'; readonly url: string };

/**
 * sanitize된 HTML 문자열에서 placeholder 태그를 추출 + segment 분할.
 *
 * 정규식 설명:
 *  - `<youtube-embed [attrs]></youtube-embed>` 또는 `<youtube-embed [attrs]/>` 형태 모두 처리
 *  - rehype-stringify는 빈 children인 사용자 정의 태그를 `<youtube-embed videoId="X"></youtube-embed>` 로 직렬화
 *  - 안전망: 속성 순서 / 따옴표 종류 모두 허용
 */
export function segmentMarkdownHtml(safeHtml: string): RenderedSegment[] {
  const segments: RenderedSegment[] = [];
  // youtube-embed 또는 link-preview 시작 태그 — 빈 element (children=[])이므로 stringifier가
  // `<tag attrs></tag>` 형태로 출력. 우리는 시작-종료 페어를 한 번에 매칭.
  // attribute 값은 SAFE_SCHEMA 통과 후이므로 따옴표 일관성 보장 (rehype-stringify는 "double").
  const re =
    /<(youtube-embed|link-preview)\b([^>]*?)>\s*<\/\1>|<(youtube-embed|link-preview)\b([^/>]*?)\/>/gi;

  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(safeHtml)) !== null) {
    const start = match.index;
    if (start > cursor) {
      segments.push({ type: 'html', html: safeHtml.slice(cursor, start) });
    }
    const tagName = (match[1] ?? match[3] ?? '').toLowerCase();
    const attrs = match[2] ?? match[4] ?? '';
    if (tagName === 'youtube-embed') {
      const videoId = extractAttr(attrs, 'videoId') ?? extractAttr(attrs, 'videoid');
      if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
        segments.push({ type: 'youtube', videoId });
      }
      // 잘못된 videoId면 segment를 추가하지 않음 (조용히 drop — sanitize가 우선 차단했어야 함)
    } else if (tagName === 'link-preview') {
      const url = extractAttr(attrs, 'url');
      if (url && isSafeHttpsUrl(url)) {
        segments.push({ type: 'link-preview', url });
      }
    }
    cursor = re.lastIndex;
  }
  if (cursor < safeHtml.length) {
    segments.push({ type: 'html', html: safeHtml.slice(cursor) });
  }
  return segments;
}

/** attribute 값 추출 — `key="value"` 또는 `key='value'`. SAFE_SCHEMA 통과 후라 escape 처리는 불필요. */
function extractAttr(attrs: string, key: string): string | null {
  const escaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const re = new RegExp(`\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');
  const m = attrs.match(re);
  if (!m) return null;
  return m[1] ?? m[2] ?? null;
}

/** url 속성 추가 검증 — https only (이중 방어). */
function isSafeHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}
