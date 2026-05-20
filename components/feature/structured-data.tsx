/**
 * <WebsiteStructuredData>, <ArticleStructuredData>, <BreadcrumbStructuredData>
 * — Sprint 12 / F12-D-3, F12-D-4.
 *
 * JSON-LD schema.org 구조화 데이터 주입. Google Rich Results 인식 + SEO 90+ 목표.
 *
 * 보안: payload 는 server-side 에서 명시적으로 구성. XSS 위험 차단을 위해 JSON.stringify
 * 결과를 `<script type="application/ld+json">` 본문에 그대로 넣고 dangerouslySetInnerHTML
 * 사용. JSON.stringify 는 `<`, `>`, `&` 를 이스케이프하지 않으므로 추가 escapeJsonLd
 * 헬퍼로 `</script>` 우회 방어.
 *
 * 출처: docs/sprint/12-sprint-perf/design.md §2.6 (F12-D-3, F12-D-4)
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kkaebizigi.com';
const SITE_NAME = '갓깨비 키우기 비공식 팬 가이드';

// Sprint 16 / F16-C: escapeJsonLd 가 lib/seo/json-ld.ts 로 분리 (Sprint 15 F15-I).
// 중복 코드 제거 + lib/ 의 14 unit test 가 회귀 보호.
import { escapeJsonLd } from '@/lib/seo/json-ld';

interface JsonLdScriptProps {
  readonly id: string;
  readonly payload: unknown;
}

function JsonLdScript({ id, payload }: JsonLdScriptProps): React.JSX.Element {
  return (
    <script
      id={id}
      type="application/ld+json"
      // 안전: payload 는 서버 구성, escape 처리 완료.
      dangerouslySetInnerHTML={{ __html: escapeJsonLd(payload) }}
    />
  );
}

/** 홈 페이지 WebSite + SearchAction (sitelinks search box). */
export function WebsiteStructuredData({
  url = SITE_URL,
}: {
  readonly url?: string;
}): React.JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: '갓깨비 키우기 가이드',
    url,
    inLanguage: 'ko-KR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return <JsonLdScript id="ld-website" payload={data} />;
}

export interface BreadcrumbItem {
  readonly position: number;
  readonly name: string;
  readonly url: string;
}

/** Breadcrumb (네비게이션 경로) — Google Rich Results 검색 결과 개선. */
export function BreadcrumbStructuredData({
  items,
}: {
  readonly items: readonly BreadcrumbItem[];
}): React.JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLdScript id="ld-breadcrumb" payload={data} />;
}

export interface ArticlePost {
  readonly id: string;
  readonly title: string;
  readonly bodyExcerpt: string;
  readonly authorNickname: string;
  readonly imageUrls?: readonly string[];
  /** ISO datetime string 또는 unix ms */
  readonly createdAtMs?: number;
  readonly updatedAtMs?: number;
}

export interface FAQItem {
  readonly question: string;
  readonly answer: string;
}

/**
 * FAQPage schema — Sprint 25 / F25-C.
 * Google Rich Results "Frequently asked questions" 자격.
 * 주의: 페이지에 실제로 질문/답이 보여야 함 (Google 가이드라인).
 */
export function FAQStructuredData({
  items,
}: {
  readonly items: readonly FAQItem[];
}): React.JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
  return <JsonLdScript id="ld-faq" payload={data} />;
}

export interface VideoGameInfo {
  readonly name: string;
  readonly applicationCategory?: string;
  readonly operatingSystem?: string;
  readonly genre?: readonly string[];
  readonly publisher?: string;
  readonly inLanguage?: string;
  readonly downloadUrl?: readonly string[];
}

/**
 * VideoGame schema — Sprint 25 / F25-C.
 * 갓깨비 키우기 게임 자체에 대한 메타데이터 — 홈/메인에 1회 주입.
 */
export function VideoGameStructuredData({
  game,
  url = SITE_URL,
}: {
  readonly game: VideoGameInfo;
  readonly url?: string;
}): React.JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    url,
    ...(game.applicationCategory
      ? { applicationCategory: game.applicationCategory }
      : {}),
    ...(game.operatingSystem ? { operatingSystem: game.operatingSystem } : {}),
    ...(game.genre && game.genre.length > 0 ? { genre: [...game.genre] } : {}),
    ...(game.publisher
      ? { publisher: { '@type': 'Organization', name: game.publisher } }
      : {}),
    ...(game.inLanguage ? { inLanguage: game.inLanguage } : {}),
    ...(game.downloadUrl && game.downloadUrl.length > 0
      ? { downloadUrl: [...game.downloadUrl] }
      : {}),
  };
  return <JsonLdScript id="ld-videogame" payload={data} />;
}

/** 게시물 상세 — Article schema (Sprint 12 / F12-D-4). */
export function ArticleStructuredData({
  post,
  url,
}: {
  readonly post: ArticlePost;
  readonly url: string;
}): React.JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title.slice(0, 110),
    description: post.bodyExcerpt,
    ...(post.imageUrls && post.imageUrls.length > 0
      ? { image: [...post.imageUrls] }
      : {}),
    datePublished: post.createdAtMs ? new Date(post.createdAtMs).toISOString() : undefined,
    dateModified: post.updatedAtMs ? new Date(post.updatedAtMs).toISOString() : undefined,
    author: {
      '@type': 'Person',
      name: post.authorNickname,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
  return <JsonLdScript id="ld-article" payload={data} />;
}

