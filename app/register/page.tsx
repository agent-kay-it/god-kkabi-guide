/**
 * /register — 사용자 등록 폼 페이지.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §7
 *
 * 보호 정책 (proxy.ts authorized):
 *  - 미인증: /login으로 리다이렉트 (NextAuth signIn 페이지)
 *  - 이미 등록 완료: '/' 으로 리다이렉트
 *  - 인증 + 미등록: 본 페이지 표시
 */
import type { Metadata } from 'next';

import { auth } from '@/lib/auth/auth';
import { RegisterForm } from '@/components/feature/register-form';
import { Pill } from '@/components/ui/pill';

export const metadata: Metadata = {
  title: '등록',
  description: '갓깨비 키우기 가이드 사용자 등록 — 5필드 + 약관 동의',
  robots: { index: false, follow: false },
};

export default async function RegisterPage(): Promise<React.JSX.Element> {
  const session = await auth();

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <Pill variant="bronze" className="mb-4">
          <span className="font-mono text-[0.7rem]">STEP 2 / 2</span>
          <span>게임 정보 입력</span>
        </Pill>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          환영합니다{session?.user?.name ? `, ${session.user.name}님` : ''}
        </h1>
        <p className="mt-3 text-sm text-text-soft sm:text-base">
          마지막 단계입니다. 게임 정보를 알려주시면 채팅과 북마크가 활성화돼요.
        </p>
      </div>

      <RegisterForm />
    </main>
  );
}
