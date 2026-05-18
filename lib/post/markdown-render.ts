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
  | { readonly type: 'link-preview'; readonly url: string }
  /**
   * Sprint 11 Phase E — 본문 인라인 이미지 (next/image로 렌더).
   * sanitize + 도메인 화이트리스트 통과 후의 안전한 CDN URL만 들어온다.
   */
  | { readonly type: 'image'; readonly src: string; readonly alt: string };

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
  // youtube-embed / link-preview / img 패턴 통합 매칭.
  // - youtube-embed, link-preview: 빈 element (children=[]) → `<tag attrs></tag>` 또는 `<tag attrs/>`
  // - img: self-closing void element → `<img attrs/>` 또는 `<img attrs>`
  // attribute 값은 SAFE_SCHEMA 통과 후이므로 따옴표 일관성 보장 (rehype-stringify는 "double").
  // attribute capture 그룹은 quoted value 안의 `/` (예: img src URL)도 통과시킨다.
  const attrPattern = String.raw`(?:"[^"]*"|'[^']*'|[^>])*?`;
  const re = new RegExp(
    `<(youtube-embed|link-preview)\\b(${attrPattern})>\\s*</\\1>` +
      `|<(youtube-embed|link-preview|img)\\b(${attrPattern})/?>`,
    'gi',
  );

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
    } else if (tagName === 'img') {
      const src = extractAttr(attrs, 'src');
      const alt = extractAttr(attrs, 'alt') ?? '';
      if (src && isCdnImageUrl(src)) {
        segments.push({ type: 'image', src, alt });
      } else if (src && isSafeHttpsUrl(src)) {
        // 화이트리스트 통과 외부 호스트(firebasestorage 레거시) → native img HTML 유지
        // 원본 매치를 그대로 html segment로 보존 — re는 self-close 패턴을 흡수했으므로
        // 안전을 위해 원본 HTML 문자열을 다시 삽입.
        segments.push({ type: 'html', html: match[0] });
      }
    }
    cursor = re.lastIndex;
  }
  if (cursor < safeHtml.length) {
    segments.push({ type: 'html', html: safeHtml.slice(cursor) });
  }
  return segments;
}

/**
 * Sprint 11 Phase E — CDN URL 검증 (next/image 변환 대상).
 * cdn.kkaebizigi.com / cdn-staging.kkaebizigi.com 경로만 통과.
 * SAFE_SCHEMA + rehypeAllowedImgDomainsPlugin이 이미 1차 필터링하지만 segmenter도 이중 검증.
 */
function isCdnImageUrl(src: string): boolean {
  try {
    const u = new URL(src);
    if (u.protocol !== 'https:') return false;
    return u.host === 'cdn.kkaebizigi.com' || u.host === 'cdn-staging.kkaebizigi.com';
  } catch {
    return false;
  }
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
