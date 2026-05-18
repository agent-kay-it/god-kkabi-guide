/**
 * sitemap.xml — Sprint V6 P3.E + Sprint 12 / F12-D-5.
 *
 * 정적 라우트 + 최근 100개 게시물 동적 포함.
 * Sprint 14 prod cutover 시 NEXT_PUBLIC_ROBOTS_INDEX=true 와 동시에
 * Google Search Console 에 본 sitemap.xml 제출.
 *
 * Wiki entity 는 anchor `#id` 단위라 별도 등록 안 함 — 검색 엔진이 본문 anchor 자동 탐지.
 */
import type { MetadataRoute } from 'next';

import { listPosts } from '@/lib/post/actions';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kkaebizigi.com';

/** 변경 빈도 + 우선순위는 운영자 큐레이션 페이지일수록 높게 설정 */
const STATIC_ROUTES: ReadonlyArray<{
  path: string;
  changeFrequency: 'daily' | 'weekly' | 'monthly';
  priority: number;
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 }, // 홈
  // V2~V3 위키
  { path: '/class', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/jinryeong', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/skill', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/equipment', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/content', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/munpa', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/tips', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/coupon', changeFrequency: 'daily', priority: 0.7 },
  // V4 신규
  { path: '/payment', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/event', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/advanced', changeFrequency: 'monthly', priority: 0.7 },
  // V6 신규
  { path: '/search', changeFrequency: 'monthly', priority: 0.6 },
  // 도구
  { path: '/simulator', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/class-quiz', changeFrequency: 'monthly', priority: 0.5 },
  // 커뮤니티 (정적 진입점)
  { path: '/post', changeFrequency: 'daily', priority: 0.8 },
];

/** Sprint 12 / F12-D-5 — 최근 게시물 sitemap entry (페이지네이션 1페이지 = 20개) */
async function fetchRecentPostEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    // 5페이지 (100개) 까지 cursor pagination 으로 수집.
    const entries: MetadataRoute.Sitemap = [];
    let cursor: number | undefined = undefined;
    for (let i = 0; i < 5; i++) {
      const result = await listPosts({ sort: 'latest' }, cursor);
      for (const post of result.items) {
        entries.push({
          url: `${SITE_URL}/post/${post.id}`,
          lastModified: new Date(post.updatedAtMs ?? post.createdAtMs),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
      if (!result.nextCursor) break;
      cursor = result.nextCursor;
    }
    return entries;
  } catch {
    // Firestore 미설정 / 권한 누락 — sitemap 생성 차단 금지, 정적 라우트만 반환
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
  const postEntries = await fetchRecentPostEntries();
  return [...staticEntries, ...postEntries];
}
