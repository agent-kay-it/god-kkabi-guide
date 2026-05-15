/**
 * sitemap.xml 자동 생성.
 * 출처: docs/sprint/02-sprint-mvp/design.md §2.4 (15개 페이지 우선순위 표)
 *
 * MVP 진입 시점에는 Phase 3 do.C에서 페이지가 추가되는 대로 본 목록을 확장.
 * Phase 3 do.A 스캐폴딩 단계에서는 home 1개만 등록.
 */
import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://god-kkabi-guide.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
