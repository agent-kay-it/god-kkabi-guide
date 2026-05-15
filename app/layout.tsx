/**
 * Root Layout — Next.js 16 App Router Server Component (Sprint v2).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.3 + phase-2-design/design-tokens-v2.json
 *
 * v2 변경:
 *  - Noto Sans KR → Pretendard Variable (local woff2) + JetBrains Mono (next/font/google)
 *  - themeColor 갱신 (#0a0612 → #07070b)
 *  - description / keywords v2 컨텐츠 (위키 + 채팅 + 북마크) 반영 예정 (현재 placeholder 단계)
 */
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import { AnalyticsBootstrap } from '@/components/analytics-bootstrap';
import { PageEngagementTracker } from '@/components/feature/page-engagement-tracker';
import { TopBar } from '@/components/feature/top-bar';
import { ChatWidgetLoader } from '@/components/feature/chat-widget-loader';
import { auth, signOut } from '@/lib/auth/auth';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
  weight: '45 920',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-mono',
  preload: false,
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
    '갓깨비 키우기 위키 · 실시간 채팅 · 북마크 · 직업/진령/장비/스킬 데이터베이스. 1인 팬이 운영하는 비공식 커뮤니티 가이드.',
  applicationName: '갓깨비 키우기 가이드',
  authors: [{ name: 'kay@agentkay.it' }],
  creator: 'kay@agentkay.it',
  publisher: 'kay@agentkay.it',
  keywords: [
    '갓깨비 키우기',
    '갓깨비 위키',
    '갓깨비 채팅',
    '갓깨비 공략',
    '갓깨비 진령',
    '갓깨비 직업',
    '갓깨비 장비',
    '갓깨비 문파',
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
    description: '위키 + 실시간 채팅 + 북마크 — 1인 팬 커뮤니티 가이드',
  },
  twitter: {
    card: 'summary_large_image',
    title: '갓깨비 키우기 비공식 팬 가이드',
    description: '위키 · 채팅 · 북마크 — 1인 팬 커뮤니티 가이드',
  },
  robots: {
    index: false,
    follow: false,
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
  themeColor: '#07070b',
  colorScheme: 'dark',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const session = await auth();
  const userMenuSession = session?.user
    ? {
        user: {
          id: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
          ...(session.user.role !== undefined ? { role: session.user.role } : {}),
          ...(session.user.registered !== undefined
            ? { registered: session.user.registered }
            : {}),
          ...(session.user.nickname !== undefined
            ? { nickname: session.user.nickname }
            : {}),
          ...(session.user.serverId !== undefined
            ? { serverId: session.user.serverId }
            : {}),
        },
      }
    : null;
  const chatSession =
    session?.user?.id && session.user.nickname && session.user.registered
      ? {
          uid: session.user.id,
          nickname: session.user.nickname,
          ...(session.user.classId
            ? { classId: session.user.classId as 'warrior' | 'swordsman' | 'medium' }
            : {}),
          ...(session.user.role && session.user.role !== 'banned'
            ? { role: session.user.role as 'admin' | 'user' }
            : {}),
          ...(session.user.serverId ? { serverId: session.user.serverId } : {}),
          ...(session.user.munpa ? { munpa: session.user.munpa } : {}),
        }
      : null;
  async function signOutAction(): Promise<void> {
    'use server';
    await signOut({ redirectTo: '/' });
  }
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://play-lh.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebase.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="antialiased">
        <TooltipProvider delayDuration={200}>
          <AnalyticsBootstrap />
          <PageEngagementTracker />
          <TopBar session={userMenuSession} signOutAction={signOutAction} />
          <div className="pt-14">{children}</div>
          {chatSession ? <ChatWidgetLoader session={chatSession} /> : null}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
