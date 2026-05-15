/**
 * Root Layout — Next.js 16 App Router Server Component.
 * 출처: docs/sprint/02-sprint-mvp/design.md §10.2.4
 *
 * 책임:
 *  - Noto Sans KR 폰트 sub-setting (latin + korean, ~200KB)
 *  - 메타데이터 기본값 + canonical URL
 *  - Firebase Analytics 부트스트랩 (Client Component로 격리)
 *  - 글로벌 스타일 (globals.css)
 */
import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import { AnalyticsBootstrap } from '@/components/analytics-bootstrap';
import { PageEngagementTracker } from '@/components/feature/page-engagement-tracker';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
  preload: true,
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://god-kkabi-guide.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '갓깨비 키우기 비공식 팬 가이드',
    template: '%s | 갓깨비 키우기 가이드',
  },
  description:
    '갓깨비 키우기 직업·진령·메타 빌드·쿠폰을 한 페이지에서. 1인 팬이 매주 검증·갱신하는 비공식 한국어 가이드.',
  applicationName: '갓깨비 키우기 가이드',
  authors: [{ name: 'kay@agentkay.it' }],
  creator: 'kay@agentkay.it',
  publisher: 'kay@agentkay.it',
  keywords: [
    '갓깨비 키우기',
    '갓깨비 공략',
    '갓깨비 진령',
    '갓깨비 쿠폰',
    '갓깨비 검객',
    '갓깨비 영매',
    '갓깨비 전사',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: '갓깨비 키우기 비공식 팬 가이드',
    title: '갓깨비 키우기 비공식 팬 가이드',
    description: '직업·진령·메타 빌드·쿠폰을 한 페이지에서. 1인 팬이 매주 검증·갱신.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '갓깨비 키우기 비공식 팬 가이드',
    description: '직업·진령·메타 빌드·쿠폰 — 1인 팬 큐레이션',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'gaming',
  other: {
    'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? '',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0612',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable} suppressHydrationWarning>
      <body className="antialiased">
        <AnalyticsBootstrap />
        <PageEngagementTracker />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
