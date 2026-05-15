/**
 * /admin/posts/pending — 24h 이후 본인 수정 게시물 운영자 승인 큐.
 * 출처: Sprint V2 P3.A (GAP-M3) + V1 prd.md §3.1.3
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { listPendingPosts } from '@/lib/post/admin-pending';
import { AdminPendingTable } from '@/components/feature/admin-pending-table';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';

export const metadata: Metadata = {
  title: 'Admin — 운영자 승인 큐',
  robots: { index: false, follow: false },
};

export default async function AdminPostsPendingPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin/posts/pending');
  if (session.user.role !== 'admin') redirect('/');

  const items = await listPendingPosts();

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>Admin / 게시물</HeroMetaBadge>
          <span className="font-mono">{items.length}건 대기</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          운영자 승인 큐
        </h1>
        <p className="mt-3 max-w-2xl text-text-soft">
          24시간 이후 본인 수정한 게시물 — 본문 변경 사항을 검토하고 승인 또는 거절합니다.
        </p>
      </header>

      {items.length === 0 ? (
        <Note variant="info" title="대기 중인 수정 요청이 없습니다">
          24h 이후 게시물 수정이 발생하면 여기에 표시됩니다.
        </Note>
      ) : (
        <AdminPendingTable initial={items} />
      )}
    </main>
  );
}
