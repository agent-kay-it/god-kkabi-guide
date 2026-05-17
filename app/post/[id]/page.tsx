/**
 * /post/[id] — 게시물 상세 페이지.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.1 + §3.2
 *
 * Server Component:
 *  - getPost (incrementView) + listComments
 *  - getMyReactionsForPosts로 본인 좋아요 상태
 *  - MarkdownView로 sanitize HTML 렌더
 *  - CommentThread + CommentItem 슬롯
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { getPost } from '@/lib/post/actions';
import { listComments } from '@/lib/comment/actions';
import {
  getMyReactionsForPosts,
  getMyReactionsForComments,
} from '@/lib/reaction/actions';
import { renderMarkdownToSafeHtml } from '@/lib/post/markdown';
import { MarkdownView } from '@/components/domain/markdown-view';
import { PostMeta, CommentThread, Note } from '@/components/domain';
import { CommentItem } from '@/components/feature/comment-item';
import { CommentForm } from '@/components/feature/comment-form';
import { LikeButton } from '@/components/feature/like-button';
import { GlassCard } from '@/components/ui/glass-card';

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) {
    return { title: '게시물 없음', robots: { index: false, follow: false } };
  }
  return {
    title: post.title,
    description: post.bodyExcerpt,
    robots: { index: false, follow: false },
  };
}

export default async function PostDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const session = await auth();
  const viewerUid = session?.user?.id ?? null;
  const viewerIsAdmin = session?.user?.role === 'admin';
  const canInteract = Boolean(
    session?.user?.registered && session.user.role !== 'banned',
  );

  const post = await getPost(id, { incrementView: true });
  if (!post) notFound();
  if (post.status === 'hidden_auto' && !viewerIsAdmin) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-[5vw]">
        <Note variant="warn" title="자동 숨김된 게시물">
          신고 누적으로 자동 숨김 처리되었습니다. 운영자 검토 후 복원될 수 있습니다.
        </Note>
      </main>
    );
  }

  const safeHtml = await renderMarkdownToSafeHtml(post.body);
  const comments = await listComments(id, viewerIsAdmin);

  // 본인 좋아요 상태 — post + comments 병렬 조회 (Sprint V1 GAP-M1)
  const [reactionMap, commentReactionMap] = await Promise.all([
    canInteract ? getMyReactionsForPosts([post.id]) : Promise.resolve(new Map<string, boolean>()),
    canInteract
      ? getMyReactionsForComments(
          id,
          comments.slice(0, 30).map((c) => c.id),
        )
      : Promise.resolve(new Map<string, boolean>()),
  ]);
  const isLiked = reactionMap.get(post.id) ?? false;

  return (
    <main className="mx-auto max-w-3xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <article className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-text sm:text-3xl">
            {post.title}
          </h1>
          <PostMeta
            category={post.category}
            authorNickname={post.authorNickname}
            {...(post.authorClassId ? { authorClassId: post.authorClassId } : {})}
            createdAtMs={post.createdAtMs}
            viewCount={post.viewCount}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
          />
        </header>

        <GlassCard className="p-5 sm:p-8">
          <MarkdownView safeHtml={safeHtml} />
        </GlassCard>

        <div className="flex justify-end">
          <LikeButton
            targetType="post"
            targetId={post.id}
            postCategory={post.category}
            initialLiked={isLiked}
            initialCount={post.likeCount}
            canLike={canInteract && post.authorUid !== viewerUid}
          />
        </div>
      </article>

      <section className="mt-10" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="mb-4 text-lg font-bold text-text">
          댓글 <span className="font-mono text-text-mute">({post.commentCount})</span>
        </h2>

        <div className="mb-6">
          <CommentForm postId={post.id} canComment={canInteract} />
        </div>

        <CommentThread
          comments={comments}
          renderItem={(comment, { isReply }) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              viewerUid={viewerUid}
              viewerIsAdmin={viewerIsAdmin}
              canInteract={canInteract}
              isReply={isReply}
              liked={commentReactionMap.get(comment.id) ?? false}
            />
          )}
        />
      </section>
    </main>
  );
}
