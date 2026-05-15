/**
 * sitemap.xml 자동 생성.
 * 출처: docs/sprint/02-sprint-mvp/design.md §2.4
 *       docs/sprint/02-sprint-mvp/phase-1-plan/seo-keyword-50.md
 *
 * Phase 3 do.C-1 + do.C-2 완료 시점: 13 페이지 등록.
 * do.C-3에서 supplementary 4 페이지 추가 예정.
 */
import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://god-kkabi-guide.vercel.app';

interface SitemapEntry {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}

const ENTRIES: readonly SitemapEntry[] = [
  // Beachhead + 홈
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/coupon', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/builds/meta-swordsman', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/class-quiz', priority: 0.85, changeFrequency: 'monthly' },

  // Content (P3.C-2)
  { path: '/class', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/class/warrior', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/class/swordsman', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/class/medium', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/jinryeong', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/skill-equip', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/dungeon', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/payment', priority: 0.7, changeFrequency: 'monthly' },

  // Supplementary (P3.C-3)
  { path: '/event', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/tips', priority: 0.75, changeFrequency: 'monthly' },
  { path: '/sources', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/intro', priority: 0.6, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ENTRIES.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
