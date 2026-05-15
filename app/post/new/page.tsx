/**
 * /post/new — 게시물 작성 페이지.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.1
 *
 * Server Component → 권한 검증 후 PostForm (client) 마운트.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { PostForm } from '@/components/feature/post-form';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';

export const metadata: Metadata = {
  title: '새 게시물 — 빌드 · 공략 · 후기',
  robots: { index: false, follow: false },
};

export default async function NewPostPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/post/new');
  }
  if (!session.user.registered) {
    redirect('/register?callbackUrl=/post/new');
  }
  if (session.user.role === 'banned') {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-[5vw]">
        <Note variant="warn" title="정지된 사용자">
          정지된 사용자는 게시물을 작성할 수 없습니다. 운영자에게 문의해주세요.
        </Note>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>커뮤니티 / 작성</HeroMetaBadge>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          새 게시물
        </h1>
        <p className="mt-3 text-text-soft">
          본인 빌드 / 공략 / 후기를 공유해주세요. 작성 24시간 이내 자유 수정 가능.
        </p>
      </header>
      <PostForm authorUid={session.user.id} mode="create" />
    </main>
  );
}
