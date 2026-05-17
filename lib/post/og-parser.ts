/**
 * OG Parser — HTML <head>에서 OpenGraph / Twitter / 기본 meta 추출.
 * 출처: docs/sprint/10-sprint-launch/design.md §6.6
 *
 * 정책:
 *  - 의존성 0 (외부 HTML 파서 라이브러리 없이 정규식 기반).
 *  - <head> 영역만 스캔 (DOS 방어 — head 종료 후 본문은 무시).
 *  - 입력 HTML 크기는 호출자(og-preview.ts)가 2MB로 제한.
 *  - decoded entity는 일반적 5종만 처리 (&amp; &lt; &gt; &quot; &#39;) — 그 이상은 그대로 노출.
 *
 * 추출 우선순위:
 *  - title: og:title → twitter:title → <title>
 *  - description: og:description → twitter:description → <meta name="description">
 *  - image: og:image → twitter:image → 첫 번째 <img src> (생략 — 보안상 위험)
 *  - domain: hostname (호출자가 전달)
 *
 * 본 모듈은 server-only.
 */
import 'server-only';

export interface OgParsedResult {
  title: string;
  description?: string;
  image?: string;
  domain: string;
}

/** HTML 의 <head> 영역만 추출 — body 이전까지. <head> 태그가 없으면 처음 64KB 만 사용. */
function extractHeadSection(html: string): string {
  const headEnd = html.search(/<\/head\s*>/i);
  if (headEnd >= 0) return html.slice(0, headEnd);
  const bodyStart = html.search(/<body[\s>]/i);
  if (bodyStart >= 0) return html.slice(0, bodyStart);
  // 안전망 — 첫 64KB만 (대부분의 사이트는 첫 64KB 안에 meta 존재)
  return html.slice(0, 64 * 1024);
}

/** HTML entity 디코딩 (자주 쓰이는 5종만). */
function decodeBasicEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/** <meta property="og:xxx" content="..."> 또는 <meta name="..." content="..."> 매칭. */
function matchMetaContent(head: string, key: string, attr: 'property' | 'name'): string | null {
  // attr="key" content="value" 또는 attr='key' content='value' — 순서 무관
  const escaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  // 두 가지 순서 모두 시도
  const re1 = new RegExp(
    `<meta\\s+[^>]*${attr}\\s*=\\s*(?:"${escaped}"|'${escaped}')[^>]*\\scontent\\s*=\\s*(?:"([^"]*)"|'([^']*)')[^>]*>`,
    'i',
  );
  const re2 = new RegExp(
    `<meta\\s+[^>]*content\\s*=\\s*(?:"([^"]*)"|'([^']*)')[^>]*\\s${attr}\\s*=\\s*(?:"${escaped}"|'${escaped}')[^>]*>`,
    'i',
  );
  const m1 = head.match(re1);
  if (m1) {
    const val = m1[1] ?? m1[2];
    if (val) return decodeBasicEntities(val.trim());
  }
  const m2 = head.match(re2);
  if (m2) {
    const val = m2[1] ?? m2[2];
    if (val) return decodeBasicEntities(val.trim());
  }
  return null;
}

/** <title>...</title> 추출. */
function matchTitleTag(head: string): string | null {
  const m = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m || !m[1]) return null;
  const text = m[1].trim().replace(/\s+/g, ' ');
  if (!text) return null;
  return decodeBasicEntities(text);
}

/**
 * HTML 문자열에서 OG/Twitter/title meta 정보 추출.
 * 반환된 image URL이 상대 경로면 호출자가 base URL 기반으로 절대화해야 한다 (보안: 절대화 후 다시 SSRF 검증 권장 — 단 본 함수는 fetch하지 않으므로 image URL은 단순 노출용).
 *
 * @param html  대상 페이지 HTML (head 영역만 사용)
 * @param domain 호출자가 전달한 hostname (결과의 domain 필드)
 * @returns 파싱 결과. title이 없으면 null.
 */
export function parseOgFromHtml(html: string, domain: string): OgParsedResult | null {
  const head = extractHeadSection(html);

  const ogTitle = matchMetaContent(head, 'og:title', 'property');
  const twitterTitle = matchMetaContent(head, 'twitter:title', 'name');
  const titleTag = matchTitleTag(head);
  const title = ogTitle ?? twitterTitle ?? titleTag;
  if (!title) return null;

  const ogDesc = matchMetaContent(head, 'og:description', 'property');
  const twitterDesc = matchMetaContent(head, 'twitter:description', 'name');
  const metaDesc = matchMetaContent(head, 'description', 'name');
  const description = ogDesc ?? twitterDesc ?? metaDesc ?? undefined;

  const ogImage = matchMetaContent(head, 'og:image', 'property');
  const twitterImage = matchMetaContent(head, 'twitter:image', 'name');
  let image = ogImage ?? twitterImage ?? undefined;

  // image가 https 절대 URL이 아니면 drop (mixed content / SSRF 위험은 최소)
  if (image) {
    try {
      const imageUrl = new URL(image);
      if (imageUrl.protocol !== 'https:') image = undefined;
    } catch {
      image = undefined;
    }
  }

  return {
    title: title.slice(0, 200),
    ...(description ? { description: description.slice(0, 500) } : {}),
    ...(image ? { image } : {}),
    domain,
  };
}
