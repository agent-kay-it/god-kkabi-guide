import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://god-kkabi-guide.vercel.app';

export default function robots(): MetadataRoute.Robots {
  // v2 준비 기간 동안 색인 차단 — P3.D production 배포 시 다시 허용
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
