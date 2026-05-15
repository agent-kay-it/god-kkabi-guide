/**
 * Sprint MVP v2 — Coming Soon placeholder + 로그인 CTA.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md + design.md §3.4
 *
 * P3.B 단계에서 본 페이지는 위키 카테고리 6 + Hero CTA + 직업 진단으로 교체된다.
 * 현재는 인증 흐름 확인용 placeholder.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { auth } from '@/lib/auth/auth';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Pill } from '@/components/ui/pill';

export const metadata: Metadata = {
  title: '갓깨비 키우기 가이드 — 준비 중',
  description: '갓깨비 키우기 비공식 팬 가이드 v2 (위키 + 커뮤니티) 준비 중.',
  robots: { index: false, follow: false },
};

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await auth();
  const isRegistered = Boolean(session?.user?.registered);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col items-center justify-center px-5 py-16 sm:px-6">
      <GlassCard className="w-full p-8 text-center sm:p-12">
        <Pill variant="bronze" className="mx-auto mb-6">
          <span className="font-mono text-[0.7rem]">Sprint MVP v2</span>
          <span>2026.05.15</span>
        </Pill>
        <h1 className="title-gradient text-4xl font-extrabold tracking-tight sm:text-5xl">
          갓깨비 키우기 가이드 v2
        </h1>
        <p className="mt-4 text-base text-text-soft sm:text-lg">
          위키 · 실시간 채팅 · 북마크 · 직업/진령 데이터베이스
        </p>
        <p className="mt-2 text-sm text-text-mute">
          1인 팬이 운영하는 비공식 커뮤니티 가이드를 재구축하고 있습니다.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {session ? (
            isRegistered ? (
              <Pill variant="jade">
                <span aria-hidden className="h-2 w-2 rounded-full bg-jade" />
                {session.user.nickname ?? '사용자'}님, 환영합니다
              </Pill>
            ) : (
              <Button asChild variant="bronze" size="lg">
                <Link href="/register">등록 완료하기 →</Link>
              </Button>
            )
          ) : (
            <Button asChild variant="bronze" size="lg">
              <Link href="/login">로그인하기 →</Link>
            </Button>
          )}
          <Pill variant="default">
            <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-bronze" />
            P3.A 스캐폴딩 완료
          </Pill>
        </div>
      </GlassCard>
    </main>
  );
}
