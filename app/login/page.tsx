/**
 * /login — Google + Kakao 로그인 페이지.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §3
 */
import type { Metadata } from 'next';

import { AuthButtons } from '@/components/feature/auth-buttons';
import { GlassCard } from '@/components/ui/glass-card';
import { Pill } from '@/components/ui/pill';

export const metadata: Metadata = {
  title: '로그인',
  description: 'Google 또는 카카오 계정으로 로그인하세요.',
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const { callbackUrl } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-5 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <Pill variant="bronze" className="mb-4">
          <span className="font-mono text-[0.7rem]">STEP 1 / 2</span>
          <span>계정 연결</span>
        </Pill>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          갓깨비 키우기 가이드
        </h1>
        <p className="mt-3 text-sm text-text-soft">
          위키 · 채팅 · 북마크를 사용하려면 로그인하세요.
        </p>
      </div>

      <GlassCard className="w-full p-6 sm:p-8" accent="swordsman">
        <AuthButtons callbackUrl={callbackUrl ?? '/'} />
      </GlassCard>

      <p className="mt-6 text-center text-xs text-text-mute">
        본 사이트는 비공식 팬 가이드입니다.{' '}
        <br />
        갓깨비 키우기 운영사와 무관합니다.
      </p>
    </main>
  );
}
