/**
 * robots.txt — Sprint 24 F24-A 강화 (V3 GA 진입).
 *
 * 정책:
 *  - Production (kkaebizigi.com): 모든 검색 엔진 허용
 *  - Staging (staging.kkaebizigi.com): 전체 disallow (검색 인덱싱 차단)
 *
 * Sprint 14 이전: 모든 환경 disallow (V2 준비 기간).
 * Sprint 24 (V3 GA 진입 후): production allow.
 *
 * 환경 판정: NEXT_PUBLIC_SITE_URL 에 staging 포함 여부.
 */
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kkaebizigi.com';

function isProductionEnv(siteUrl: string): boolean {
  // staging / preview / localhost 가 아니면 production 으로 간주
  if (!siteUrl) return false;
  if (siteUrl.includes('staging')) return false;
  if (siteUrl.includes('preview')) return false;
  if (siteUrl.includes('localhost')) return false;
  if (siteUrl.startsWith('http://')) return false;
  return true;
}

export default function robots(): MetadataRoute.Robots {
  const allow = isProductionEnv(SITE_URL);
  return {
    rules: allow
      ? [
          {
            userAgent: '*',
            allow: '/',
            // 사용자 개인정보 / 운영자 페이지 / 인증 콜백 차단
            disallow: ['/me', '/me/*', '/admin', '/admin/*', '/api/*', '/auth/*'],
          },
        ]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
