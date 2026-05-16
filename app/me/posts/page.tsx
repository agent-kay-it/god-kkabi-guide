/**
 * /me/posts — 본인 작성 게시물 목록.
 * 출처: docs/sprint/04-sprint-v1/design.md
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';

import { auth } from '@/lib/auth/auth';
import { listPosts } from '@/lib/post/actions';
import { PostCard, HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '내 게시물',
  robots: { index: false, follow: false },
};

export default async function MyPostsPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/me/posts');
  if (!session.user.registered) redirect('/register?callbackUrl=/me/posts');

  const { items } = await listPosts({ authorUid: session.user.id, sort: 'latest' });

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <HeroMeta className="mb-4">
            <HeroMetaBadge>내 게시물</HeroMetaBadge>
            <span className="font-mono">{items.length}건</span>
          </HeroMeta>
          <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
            내가 작성한 게시물
          </h1>
        </div>
        <Button asChild variant="bronze" size="lg" className="gap-2">
          <Link href="/post/new">
            <PenSquare className="h-4 w-4" />
            새 게시물
          </Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <Note variant="info" title="아직 작성한 게시물이 없습니다">
          첫 번째 게시물을 작성해보세요.
        </Note>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((post) => (
            <div key={post.id} className="relative">
              {/* Sprint V1 GAP-M2: 24h 이후 수정 → pending_edit 상태 배지 */}
              {post.status === 'pending_edit' ? (
                <Badge
                  variant="bronze"
                  className="absolute -top-2 right-3 z-10 shadow-md"
                  aria-label="운영자 승인 대기 중"
                >
                  심사 중
                </Badge>
              ) : null}
              <PostCard data={post} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
