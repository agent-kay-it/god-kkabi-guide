/**
 * sitemap.xml — Sprint V6 P3.E.
 *
 * 사용자 도달 가능 정적 라우트 일괄 등록.
 * robots: index:false (1인 운영 정책) 이지만 sitemap은 내부 navigation graph로 유지.
 *
 * Wiki entity (직업/진령/스킬 등 ~100항목)는 anchor `#id` 단위라 별도 등록 안 함 —
 * 검색 엔진은 페이지 자체 인덱스 (현재 disabled) 후 본문 anchor를 자동 탐지.
 */
import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://god-kkabi-guide.vercel.app';

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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
