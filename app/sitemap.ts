/**
 * sitemap.xml — Sprint v2 임시 홈만 등록.
 * P3.D에서 wiki 80+ entity 동적 등록 예정.
 */
import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://god-kkabi-guide.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];
}
