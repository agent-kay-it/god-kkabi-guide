/**
 * /me — 사용자 허브 페이지.
 * Sprint V7 P3.D — 북마크 / 게시물 / 구독 통합 대시보드.
 *
 * Server Component:
 *  - auth() 세션 필수 (proxy.ts authorized로 미로그인 시 차단됨)
 *  - listMyBookmarks + listPosts({ authorUid }) + getActiveSubscription 병렬 fetch
 *  - 카드 grid: 북마크 / 게시물 / 구독 / 빠른 링크
 *  - <RecentlyViewedList> client 섹션 하단
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §5
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Bookmark, FileText, Sparkles } from 'lucide-react';

import { auth } from '@/lib/auth/auth';
import { listMyBookmarks } from '@/lib/bookmark/actions';
import { listPosts } from '@/lib/post/actions';
import { getActiveSubscription } from '@/lib/subscription/actions';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import {
  HeroMeta,
  HeroMetaBadge,
  Note,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { RecentlyViewedList } from '@/components/feature/recently-viewed-list';

export const metadata: Metadata = {
  title: '내 정보',
  description: '북마크 / 게시물 / 구독 / 최근 본 항목 통합 대시보드.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/me' },
};

export default async function MePage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/me');
  const uid = session.user.id;

  const [bookmarks, posts, subscription] = await Promise.all([
    listMyBookmarks(),
    listPosts({ authorUid: uid, sort: 'latest' }),
    getActiveSubscription(),
  ]);

  const isPremium = Boolean(subscription);
  const nickname = session.user.nickname ?? session.user.name ?? '사용자';

  return (
    <main className="mx-auto max-w-screen-lg px-5 pb-20 pt-8 sm:px-6">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>내 정보</HeroMetaBadge>
          <span className="font-mono">{nickname}</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="My Hub" />
          <SectionTitle as="h1">{nickname}님 환영합니다</SectionTitle>
          <SectionLead>
            북마크 · 게시물 · 구독 · 최근 본 항목을 한곳에서 확인하세요.
          </SectionLead>
        </SectionHead>
      </header>

      {/* 통계 카드 3종 */}
      <section
        aria-labelledby="my-stats"
        className="mb-10 grid gap-4 sm:grid-cols-3"
      >
        <h2 id="my-stats" className="sr-only">
          내 활동 통계
        </h2>
        <StatLinkCard
          icon={<Bookmark aria-hidden className="h-5 w-5 text-bronze-soft" />}
          label="북마크"
          value={bookmarks.length}
          unit="개"
          href="/me/bookmarks"
          accent="bronze"
        />
        <StatLinkCard
          icon={<FileText aria-hidden className="h-5 w-5 text-jade-soft" />}
          label="내 게시물"
          value={posts.items.length}
          unit="건"
          href="/me/posts"
          accent="jade"
        />
        <StatLinkCard
          icon={<Sparkles aria-hidden className="h-5 w-5 text-indigo" />}
          label="구독"
          value={isPremium ? 'Premium' : 'Free'}
          href="/me/subscription"
          accent="indigo"
        />
      </section>

      {/* 빠른 링크 — 운영자만 보이는 admin 진입 */}
      {session.user.role === 'admin' ? (
        <Note variant="info" title="운영자 콘솔" className="mb-8">
          모더레이션 큐, 쿠폰 검토, B2B clients 등 운영자 전용 도구로 빠르게 이동.
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="bronze" size="sm">
              <Link href="/admin">모더레이션 →</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/coupons">쿠폰 검토 →</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/insights/pain">Pain 인사이트 →</Link>
            </Button>
          </div>
        </Note>
      ) : null}

      {/* 최근 본 항목 (client) */}
      <section className="mt-8 border-t border-ink-line pt-8">
        <RecentlyViewedList />
      </section>
    </main>
  );
}

interface StatLinkCardProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string | number;
  readonly unit?: string;
  readonly href: string;
  readonly accent: 'bronze' | 'jade' | 'indigo';
}

const ACCENT_BORDER: Record<StatLinkCardProps['accent'], string> = {
  bronze: 'hover:border-bronze',
  jade: 'hover:border-jade',
  indigo: 'hover:border-indigo',
};

function StatLinkCard({
  icon,
  label,
  value,
  unit,
  href,
  accent,
}: StatLinkCardProps): React.JSX.Element {
  return (
    <Link href={href} className="group block focus-visible:outline-none">
      <GlassCard
        interactive
        className={`flex h-full items-start gap-4 p-5 transition-card ${ACCENT_BORDER[accent]}`}
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink-elev/70">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[0.7rem] uppercase tracking-wider text-text-mute">
            {label}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text">{value}</span>
            {unit ? (
              <span className="text-sm text-text-mute">{unit}</span>
            ) : null}
          </div>
        </div>
        <ArrowRight
          aria-hidden
          className="mt-1 h-4 w-4 shrink-0 text-text-mute transition-transform group-hover:translate-x-0.5 group-hover:text-bronze"
        />
      </GlassCard>
    </Link>
  );
}
