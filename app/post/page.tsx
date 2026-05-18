/**
 * /post — 사용자 게시물 리스트 (카테고리 탭 + 정렬).
 * 출처: docs/sprint/04-sprint-v1/design.md + plan.md §P3.C.1
 *
 * Server Component. Firestore `posts` (status='published') 조회.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';

import { Fragment } from 'react';

import { listPosts } from '@/lib/post/actions';
import { auth } from '@/lib/auth/auth';
import { shouldShowAds } from '@/lib/subscription/guards';
import { getMyReactionsForPosts } from '@/lib/reaction/actions';
import {
  PostCard,
  Note,
  HeroMeta,
  HeroMetaBadge,
} from '@/components/domain';
import { LikeButton } from '@/components/feature/like-button';
import { AdSlotInfeed } from '@/components/feature/ad-slot-infeed';
import { Button } from '@/components/ui/button';
import {
  POST_CATEGORY_LABEL,
  POST_CATEGORY_DESCRIPTION,
  POST_SORT_LABEL,
  type PostCategory,
  type PostSort,
} from '@/types/post';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: '커뮤니티 — 빌드 · 공략 · 후기',
  description:
    '갓깨비 키우기 사용자 게시판. 빌드 / 공략 / 후기 카테고리. 본인 빌드 공유 + 댓글 + 좋아요.',
  // Sprint 12 / F12-D-2 — robots 는 app/layout.tsx 에서 robotsConfig 로 cascade.
};

const SORTS: readonly PostSort[] = ['latest', 'popular', 'hot'];

export default async function PostListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const category = isValidCategory(params.category) ? params.category : undefined;
  const sort: PostSort = isValidSort(params.sort) ? params.sort : 'latest';

  const session = await auth();
  const canPost = Boolean(session?.user?.registered && session.user.role !== 'banned');
  const canLike = canPost;
  const viewerUid = session?.user?.id ?? null;

  // AdSense 인피드 5-조건 가드 (Sprint V2 P6 GAP-P6-MAJ-1):
  //  production + publisher env + slot env + shouldShowAds (anonymous/banned/admin/premium/no_consent 분기)
  const adsensePublisher = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER;
  const adsenseSlotInfeed = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED;
  const adsDecision = shouldShowAds(session);
  const showInfeedAd =
    process.env.NODE_ENV === 'production' &&
    Boolean(adsensePublisher) &&
    Boolean(adsenseSlotInfeed) &&
    adsDecision.show;

  const { items } = await listPosts({ sort, ...(category ? { category } : {}) });
  const reactionMap = canLike
    ? await getMyReactionsForPosts(items.map((p) => p.id))
    : new Map<string, boolean>();

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <HeroMeta className="mb-4">
            <HeroMetaBadge>커뮤니티</HeroMetaBadge>
            <span className="font-mono">{items.length}건</span>
          </HeroMeta>
          <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
            커뮤니티
          </h1>
          <p className="mt-3 max-w-2xl text-text-soft">
            사용자가 직접 작성한 빌드 · 공략 · 후기. 검색해도 안 나오는 메타 인사이트.
          </p>
        </div>
        {canPost ? (
          <Button asChild variant="bronze" size="lg" className="gap-2">
            <Link href="/post/new">
              <PenSquare className="h-4 w-4" />
              새 게시물
            </Link>
          </Button>
        ) : null}
      </header>

      {/* 카테고리 탭 */}
      <nav aria-label="카테고리" className="mb-4 flex flex-wrap gap-2">
        <CategoryChip
          href={buildQuery(undefined, sort)}
          label="전체"
          active={!category}
        />
        {(['build', 'guide', 'review'] as const).map((c) => (
          <CategoryChip
            key={c}
            href={buildQuery(c, sort)}
            label={POST_CATEGORY_LABEL[c]}
            active={category === c}
            tooltip={POST_CATEGORY_DESCRIPTION[c]}
          />
        ))}
      </nav>

      {/* 정렬 */}
      <nav aria-label="정렬" className="mb-6 flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <Link
            key={s}
            href={buildQuery(category, s)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition',
              sort === s
                ? 'border-bronze bg-bronze/15 text-bronze-soft'
                : 'border-ink-line text-text-mute hover:border-ink-line-strong',
            )}
          >
            {POST_SORT_LABEL[s]}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <Note variant="info" title="아직 게시물이 없습니다">
          {canPost
            ? '첫 번째 게시물을 작성해보세요. 빌드 / 공략 / 후기 모두 환영합니다.'
            : '등록 완료 후 게시물을 작성할 수 있습니다.'}
        </Note>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((post, idx) => (
            <Fragment key={post.id}>
              <PostCard
                data={post}
                actionsSlot={
                  <LikeButton
                    targetType="post"
                    targetId={post.id}
                    postCategory={post.category}
                    initialLiked={reactionMap.get(post.id) ?? false}
                    initialCount={post.likeCount}
                    canLike={canLike && post.authorUid !== viewerUid}
                  />
                }
              />
              {/* Sprint V1 GAP-C2: 5번째 카드 다음에 AdSense 인피드 슬롯 (production + consent) */}
              {showInfeedAd && idx === 4 && adsensePublisher && adsenseSlotInfeed ? (
                <div className="lg:col-span-2">
                  <AdSlotInfeed publisher={adsensePublisher} slot={adsenseSlotInfeed} />
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      )}
    </main>
  );
}

function isValidCategory(v: string | undefined): v is PostCategory {
  return v === 'build' || v === 'guide' || v === 'review';
}

function isValidSort(v: string | undefined): v is PostSort {
  return v === 'latest' || v === 'popular' || v === 'hot';
}

function buildQuery(category: PostCategory | undefined, sort: PostSort): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (sort !== 'latest') params.set('sort', sort);
  const qs = params.toString();
  return qs ? `/post?${qs}` : '/post';
}

function CategoryChip({
  href,
  label,
  active,
  tooltip,
}: {
  href: string;
  label: string;
  active: boolean;
  tooltip?: string;
}): React.JSX.Element {
  return (
    <Link
      href={href}
      title={tooltip}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm font-medium transition',
        active
          ? 'border-bronze bg-bronze/15 text-bronze-soft'
          : 'border-ink-line bg-ink-elev text-text-soft hover:bg-ink-card-strong',
      )}
    >
      {label}
    </Link>
  );
}
