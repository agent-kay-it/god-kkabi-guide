import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import bundleAnalyzer from '@next/bundle-analyzer';

/**
 * Sprint 12 / F12-A-4 — @next/bundle-analyzer 통합.
 * 사용: ANALYZE=true pnpm build → .next/analyze/{client,nodejs}.html 생성
 */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'play-lh.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'is1-ssl.mzstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      // OAuth 프로필 이미지 (Sprint V1 — CA-M2, Sprint 10 Google 단일)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      // YouTube 썸네일 (Sprint 10 / Phase D)
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      // Sprint 11 / Phase C — kkaebizigi CloudFront CDN (prod)
      {
        protocol: 'https',
        hostname: 'cdn.kkaebizigi.com',
        pathname: '/**',
      },
      // Sprint 11 / Phase C — kkaebizigi CloudFront CDN (staging + dev)
      {
        protocol: 'https',
        hostname: 'cdn-staging.kkaebizigi.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "img-src 'self' https://play-lh.googleusercontent.com https://lh3.googleusercontent.com https://is1-ssl.mzstatic.com https://firebasestorage.googleapis.com https://cdn.kkaebizigi.com https://cdn-staging.kkaebizigi.com https://i.ytimg.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net data: blob:",
              "connect-src 'self' https://firestore.googleapis.com https://*.firebaseio.com https://*.firebasedatabase.app https://www.google-analytics.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://pagead2.googlesyndication.com https://*.s3.ap-northeast-2.amazonaws.com https://cdn.kkaebizigi.com https://cdn-staging.kkaebizigi.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://vitals.vercel-insights.com",
              "font-src 'self' https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Turbopack은 next dev --turbopack으로 활성화 (dev script에 포함)
  // experimental.turbo 설정은 Next.js 15에서 불필요
};

/**
 * Sentry wrapper — Sprint 10 / Phase F-final Task #32.
 * 출처: docs/sprint/10-sprint-launch/design.md §9.1
 *
 * 정책:
 *  - DSN/auth-token 미설정 시 source map 업로드 silent skip → 빌드 항상 성공
 *  - widenClientFileUpload=false (RSC 번들 부풀음 방지)
 *  - tunnelRoute=/monitoring → 광고 차단기 우회 (선택)
 *  - disableLogger=true (production 콘솔 클린)
 */
const sentryBuildOptions = {
  ...(process.env.SENTRY_ORG ? { org: process.env.SENTRY_ORG } : {}),
  ...(process.env.SENTRY_PROJECT ? { project: process.env.SENTRY_PROJECT } : {}),
  ...(process.env.SENTRY_AUTH_TOKEN ? { authToken: process.env.SENTRY_AUTH_TOKEN } : {}),
  silent: !process.env.CI,
  widenClientFileUpload: false,
  disableLogger: true,
  // 미설정 시 build-time source map 업로드 skip — 런타임 SDK는 init만 안전 호출
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // 광고 차단기로부터 Sentry endpoint 보호 (선택)
  tunnelRoute: '/monitoring',
  // Next.js 16 RSC + Server Action 트레이싱 자동 instrument
  automaticVercelMonitors: false,
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), sentryBuildOptions);
