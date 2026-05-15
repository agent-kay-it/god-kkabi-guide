/**
 * Sprint MVP v2 — 신규 홈 (Hero + 6 카테고리 위키 그리드 + Tips preview + CTA).
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md + design.md §3.4
 *
 * Server Component:
 *  - auth() 세션 확인 → 로그인/등록 CTA 분기
 *  - 시드 데이터 (직업 3, 진령 11, Tips 5) 직접 import (Firestore fallback)
 *  - 6 카테고리 그리드 (2 active + 4 coming soon)
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Lock } from 'lucide-react';

import { auth } from '@/lib/auth/auth';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Pill } from '@/components/ui/pill';
import { Badge } from '@/components/ui/badge';
import { Note, HeroMeta, HeroMetaBadge, TipCard } from '@/components/domain';
import { WIKI_CATEGORIES } from '@/data/wiki/categories';
import { WIKI_TIPS_SEED } from '@/data/wiki/tips';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: '갓깨비 키우기 비공식 팬 가이드 — 위키 · 채팅 · 북마크',
  description:
    '갓깨비 키우기 위키와 1인 팬 커뮤니티. 직업/진령 데이터베이스 + 실시간 채팅 + 북마크. 1인 운영, 매주 검증.',
  robots: { index: false, follow: false },
};

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const isRegistered = Boolean(session?.user?.registered);

  const featuredTips = WIKI_TIPS_SEED.slice(0, 3);

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-24 pt-8 sm:px-[5vw]">
      {/* Hero */}
      <section className="relative mb-16 overflow-hidden rounded-[var(--radius-card-lg)] border border-ink-line">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/wiki/banner-korean-carry.webp"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            loading="lazy"
            quality={70}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-base/30 via-ink-base/60 to-ink-base" />
        </div>
        <div className="relative px-6 py-14 sm:px-12 sm:py-20">
          <HeroMeta className="mb-6">
            <HeroMetaBadge>Sprint MVP v2</HeroMetaBadge>
            <span className="font-mono">2026.05.15 · v2.0.0</span>
          </HeroMeta>
          <h1 className="title-gradient max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            갓깨비 키우기
            <br />
            비공식 팬 가이드
          </h1>
          <p className="mt-5 max-w-2xl text-base text-text-soft sm:text-lg">
            위키 · 실시간 채팅 · 북마크. 직업/진령 데이터베이스를 한 페이지에서.
            1인 팬이 매주 검증·갱신합니다.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {isLoggedIn && isRegistered ? (
              <Pill variant="jade">
                <span aria-hidden className="h-2 w-2 rounded-full bg-jade" />
                {session?.user?.nickname ?? '사용자'}님 환영합니다
              </Pill>
            ) : isLoggedIn ? (
              <Button asChild variant="bronze" size="lg">
                <Link href="/register" className="gap-2">
                  등록 완료하기 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="bronze" size="lg">
                <Link href="/login" className="gap-2">
                  로그인하고 시작 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg">
              <Link href="/class">직업 가이드 →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 6 카테고리 위키 그리드 */}
      <section className="mb-16" aria-labelledby="wiki-categories">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2
              id="wiki-categories"
              className="text-2xl font-bold tracking-tight text-text sm:text-3xl"
            >
              위키 카테고리
            </h2>
            <p className="mt-1 text-sm text-text-soft">
              6개 카테고리 · {WIKI_CATEGORIES.filter((c) => c.active).length}개 활성 ·{' '}
              <span className="font-mono">
                {WIKI_CATEGORIES.reduce((acc, c) => acc + c.itemCount, 0)}
              </span>
              개 항목
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WIKI_CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      </section>

      {/* Tips 프리뷰 */}
      <section className="mb-16" aria-labelledby="featured-tips">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2
            id="featured-tips"
            className="text-2xl font-bold tracking-tight text-text sm:text-3xl"
          >
            실전 팁
          </h2>
          <Button asChild variant="link" className="text-bronze">
            <Link href="/tips">모두 보기 →</Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {featuredTips.map((t) => (
            <TipCard
              key={t.id}
              category={t.category}
              title={t.title}
              content={t.content}
            />
          ))}
        </div>
      </section>

      {/* 디스클레이머 Note */}
      <Note variant="info" title="비공식 팬 가이드 알림">
        본 사이트는 비공식 팬 가이드로, 저작권자(Joy Net Games / JOY MOBILE NETWORK PTE. LTD. /
        4399 / Kakao Games / 인용된 외부 가이드 저작권자)의 요청 시 24시간 이내에 해당 콘텐츠를
        삭제하거나 수정합니다. 갓깨비 키우기 운영사와 무관합니다.
      </Note>
    </main>
  );
}

function CategoryCard({
  cat,
}: {
  cat: (typeof WIKI_CATEGORIES)[number];
}): React.JSX.Element {
  const accentClass = {
    bronze: 'border-bronze/30 hover:border-bronze',
    jade: 'border-jade/30 hover:border-jade',
    vermilion: 'border-vermilion/30 hover:border-vermilion',
    indigo: 'border-indigo/30 hover:border-indigo',
  }[cat.accent];

  const inner = (
    <GlassCard
      interactive={cat.active}
      className={cn('h-full p-5 transition-card', accentClass)}
    >
      <div className="mb-3 flex items-center justify-between">
        <span aria-hidden className="text-3xl">
          {cat.emoji}
        </span>
        {cat.active ? (
          <Badge variant={cat.accent} className="text-[0.7rem]">
            <span className="font-mono">{cat.itemCount}</span>개 항목
          </Badge>
        ) : (
          <Badge variant="muted" className="gap-1 text-[0.7rem]">
            <Lock aria-hidden className="h-3 w-3" />
            준비 중
          </Badge>
        )}
      </div>
      <h3 className="text-lg font-bold text-text">{cat.label}</h3>
      <p className="mt-1 text-sm text-text-soft">{cat.description}</p>
      {cat.active ? (
        <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze-soft transition-colors group-hover:text-bronze">
          살펴보기 <ArrowRight className="h-3.5 w-3.5" />
        </div>
      ) : null}
    </GlassCard>
  );

  return cat.active ? (
    <Link href={cat.href} className="group block focus-visible:outline-none">
      {inner}
    </Link>
  ) : (
    <div aria-disabled="true">{inner}</div>
  );
}
