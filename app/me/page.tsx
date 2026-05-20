/**
 * /me — 사용자 허브 페이지 (Sprint 10 Phase F 보강).
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §5 + Phase F-UX 보강
 *
 * Server Component:
 *  - auth() 세션 필수 (proxy.ts authorized 로 미로그인 시 차단됨)
 *  - users/{uid} 읽어 프로필 카드 표시
 *  - listMyBookmarks + listPosts({ authorUid }) + getActiveSubscription 병렬 fetch
 *  - 통계 카드 4종 (북마크 / 게시물 / 구독 / 직업) + 프로필 카드 + 최근 활동 + 계정 관리
 *  - <RecentlyViewedList> client 섹션 하단
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  Bookmark,
  FileText,
  Settings,
  Shield,
  Sparkles,
  Swords,
} from 'lucide-react';

import { auth } from '@/lib/auth/auth';
import { listMyBookmarks } from '@/lib/bookmark/actions';
import { listPosts } from '@/lib/post/actions';
import { getActiveSubscription } from '@/lib/subscription/actions';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Pill } from '@/components/ui/pill';
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
import { NicknameChangeForm } from '@/components/feature/nickname-change-form';
import { calcNicknameCooldownRemainingMs } from '@/lib/auth/cooldown';

export const metadata: Metadata = {
  title: '내 정보',
  description: '북마크 / 게시물 / 구독 / 최근 본 항목 통합 대시보드.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/me' },
};

const CLASS_LABEL: Record<'warrior' | 'swordsman' | 'medium', string> = {
  warrior: '전사 (도깨비)',
  swordsman: '검객 (무당)',
  medium: '영매 (저승사자)',
};

const CLASS_ACCENT: Record<'warrior' | 'swordsman' | 'medium', 'warrior' | 'swordsman' | 'mage'> = {
  warrior: 'warrior',
  swordsman: 'swordsman',
  medium: 'mage', // 영매 → mage accent (indigo)
};

interface UserDocData {
  readonly nickname?: string;
  readonly serverId?: string;
  readonly munpa?: string;
  readonly classId?: 'warrior' | 'swordsman' | 'medium';
  readonly photoURL?: string;
  readonly email?: string;
  /** Sprint 23 F23-A — 닉네임 변경 이력 */
  readonly nicknameChangedAtMs?: number;
}

export default async function MePage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/me');
  const uid = session.user.id;

  // Firestore users/{uid} (Admin SDK 있는 경우만)
  let userDoc: UserDocData = {};
  if (hasAdminCredentials()) {
    const snap = await getAdminFirestore().collection('users').doc(uid).get();
    userDoc = (snap.data() ?? {}) as UserDocData;
  }

  const [bookmarks, posts, subscription] = await Promise.all([
    listMyBookmarks(),
    listPosts({ authorUid: uid, sort: 'latest' }),
    getActiveSubscription(),
  ]);

  const isPremium = Boolean(subscription);
  const nickname = userDoc.nickname ?? session.user.nickname ?? session.user.name ?? '사용자';
  const serverId = userDoc.serverId ?? session.user.serverId ?? '';
  const munpa = userDoc.munpa ?? session.user.munpa ?? '';
  const classId = (userDoc.classId ?? session.user.classId ?? 'warrior') as
    | 'warrior'
    | 'swordsman'
    | 'medium';
  const photoURL = userDoc.photoURL ?? session.user.image ?? null;
  const recentPosts = posts.items.slice(0, 3);

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
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

      {/* ─── 프로필 카드 ─────────────────────────────────────────── */}
      <section aria-labelledby="my-profile" className="mt-8">
        <h2 id="my-profile" className="sr-only">
          내 프로필
        </h2>
        <GlassCard
          accent={CLASS_ACCENT[classId]}
          className="grid gap-5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6"
        >
          <Avatar className="h-16 w-16 ring-2 ring-bronze/30 sm:h-20 sm:w-20">
            {photoURL ? <AvatarImage src={photoURL} alt={nickname} /> : null}
            <AvatarFallback className="bg-bronze/15 text-xl font-bold text-bronze-soft">
              {nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold text-text">{nickname}</span>
              {serverId ? (
                <Pill variant="bronze">
                  <span className="font-mono text-[0.7rem]">{serverId}</span>
                </Pill>
              ) : null}
              {session.user.role === 'admin' ? (
                <Pill variant="jade">
                  <Shield className="h-3 w-3" /> 운영자
                </Pill>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-soft">
              {munpa ? (
                <span>
                  <span className="text-text-mute">문파 </span>
                  <span className="text-text">{munpa}</span>
                </span>
              ) : null}
              <span>
                <span className="text-text-mute">직업 </span>
                <span className="text-text">{CLASS_LABEL[classId]}</span>
              </span>
              {isPremium ? (
                <Pill variant="indigo">
                  <Sparkles className="h-3 w-3" /> Premium
                </Pill>
              ) : null}
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="justify-self-start sm:justify-self-end">
            <Link href="/me/profile">
              <Settings className="h-4 w-4" /> 프로필 수정
            </Link>
          </Button>
        </GlassCard>
      </section>

      {/* ─── 통계 카드 4종 ──────────────────────────────────────── */}
      <section
        aria-labelledby="my-stats"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
        <StatLinkCard
          icon={<Swords aria-hidden className="h-5 w-5 text-vermilion-soft" />}
          label="직업"
          value={CLASS_LABEL[classId]}
          href="/me/profile"
          accent="warrior"
        />
      </section>

      {/* ─── 최근 작성 게시물 미리보기 ───────────────────────────── */}
      {recentPosts.length > 0 ? (
        <section aria-labelledby="recent-posts" className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2
              id="recent-posts"
              className="text-base font-bold tracking-tight text-text sm:text-lg"
            >
              최근 작성 게시물
            </h2>
            <Link
              href="/me/posts"
              className="inline-flex items-center gap-1 text-xs text-text-soft hover:text-bronze"
            >
              전체 보기 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/post/${p.id}`}
                  className="group block focus-visible:outline-none"
                >
                  <GlassCard
                    interactive
                    className="flex h-full flex-col gap-2 p-4 transition-card hover:border-bronze"
                  >
                    <span className="line-clamp-2 text-sm font-semibold text-text group-hover:text-bronze-soft">
                      {p.title}
                    </span>
                    <span className="mt-auto flex items-center gap-3 text-xs text-text-mute">
                      <span>조회 {p.viewCount ?? 0}</span>
                      <span>댓글 {p.commentCount ?? 0}</span>
                    </span>
                  </GlassCard>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ─── 빠른 링크 — 운영자만 보이는 admin 진입 ─────────────── */}
      {session.user.role === 'admin' ? (
        <Note variant="info" title="운영자 콘솔" className="mt-10">
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

      {/* ─── 닉네임 변경 (Sprint 23 F23-A) ───────────────────────── */}
      <section aria-labelledby="my-nickname" className="mt-8">
        <h2 id="my-nickname" className="sr-only">
          닉네임 변경
        </h2>
        <NicknameChangeForm
          currentNickname={nickname}
          cooldownRemainingMs={calcNicknameCooldownRemainingMs(
            userDoc.nicknameChangedAtMs,
          )}
        />
      </section>

      {/* ─── 최근 본 항목 (client) ──────────────────────────────── */}
      <section className="mt-10 border-t border-ink-line pt-8">
        <RecentlyViewedList />
      </section>

      {/* ─── 계정 관리 ──────────────────────────────────────────── */}
      <section className="mt-12 border-t border-ink-line pt-8">
        <h2 className="mb-4 text-base font-bold tracking-tight text-text">계정 관리</h2>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <Link href="/me/profile" className="text-bronze-soft underline-offset-4 hover:underline">
            프로필 수정
          </Link>
          <Link href="/me/subscription" className="text-bronze-soft underline-offset-4 hover:underline">
            구독 관리
          </Link>
          <Link href="/terms" className="text-text-soft underline-offset-4 hover:underline">
            이용약관
          </Link>
          <Link href="/privacy" className="text-text-soft underline-offset-4 hover:underline">
            개인정보처리방침
          </Link>
          <Link
            href="/me/delete-account"
            className="ml-auto text-vermilion-soft underline-offset-4 hover:underline"
          >
            회원 탈퇴 →
          </Link>
        </div>
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
  readonly accent: 'bronze' | 'jade' | 'indigo' | 'warrior';
}

const ACCENT_BORDER: Record<StatLinkCardProps['accent'], string> = {
  bronze: 'hover:border-bronze',
  jade: 'hover:border-jade',
  indigo: 'hover:border-indigo',
  warrior: 'hover:border-vermilion',
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
            <span className="text-2xl font-bold text-text truncate">{value}</span>
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
