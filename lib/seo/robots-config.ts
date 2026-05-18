/**
 * robots-config — Sprint 12 / F12-D-1.
 *
 * 단일 환경변수 `NEXT_PUBLIC_ROBOTS_INDEX` 로 production indexing 활성화 토글.
 * Sprint 11 archive 시점 진단: SEO 69 점수는 staging robots:noindex artifact.
 * Sprint 14 production cutover 시 본 env 값을 `true` 로 전환하면 자연 회복.
 *
 * 정책:
 *  - 기본값: `false` (안전 기본, 색인 차단)
 *  - 명시적 `'true'` 문자열만 활성 (truthy 우회 차단)
 *  - prod / preview / dev 모두 동일 토글 — 환경 별 분기 X (단순화)
 *
 * 출처: docs/sprint/12-sprint-perf/design.md §2.5 (F12-D-1)
 */
import type { Metadata } from 'next';

/**
 * 환경변수 검사 결과. SSR 이든 client 든 동일 값.
 * `NEXT_PUBLIC_` prefix 라 client 번들에도 inline 된다 (값만 inline, 토글 토큰은 안전).
 */
export const isProductionIndexing: boolean =
  process.env.NEXT_PUBLIC_ROBOTS_INDEX === 'true';

/**
 * `Metadata.robots` 에 그대로 spread 가능한 정규화 객체.
 *
 * @example
 * ```ts
 * import { robotsConfig } from '@/lib/seo/robots-config';
 *
 * export const metadata: Metadata = {
 *   // ...
 *   robots: robotsConfig,
 * };
 * ```
 *
 * 활성: `{ index: true, follow: true, googleBot: { index: true, follow: true, ... } }`
 * 비활성: `{ index: false, follow: false }`
 */
export const robotsConfig: NonNullable<Metadata['robots']> = isProductionIndexing
  ? {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  : {
      index: false,
      follow: false,
    };

/**
 * Per-page 에서 일부만 override 할 때 사용. 예: /post/new 는 sprint 12 이후에도
 * 영구히 noindex 유지 (작성 폼 자체는 색인 가치 없음).
 */
export const robotsAlwaysNoIndex: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
};
