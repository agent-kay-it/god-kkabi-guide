/**
 * Sprint V4 P3.C — Home 재구성.
 * source/godkkabi-guide/index.html §Hero + TOC + Overview 이식 + V2~V3 위키 그리드 보존.
 *
 * 구조 (위→아래):
 *   1. Hero (HeroBackdrop + meta + title + lead + HeroAppBlock + HeroStats)
 *   2. TOC — 9개 섹션 인덱스 (auto-fit 그리드)
 *   3. Overview — 게임 개요 (banner + 기본 정보 카드 + 5대 시스템 카드 + Note tip)
 *   4. Wiki Categories — 6 카테고리 (V2 보존)
 *   5. Featured Tips — 3개 프리뷰 (V2 보존)
 *   6. Disclaimer Note
 *
 * Server Component: auth() → 로그인/등록 CTA 분기.
 * Reveal 애니메이션: <Reveal delay="N"> 래핑.
 *
 * 출처: docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.3
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
import {
  HeroAppBlock,
  HeroBackdrop,
  HeroStats,
  HeroMeta,
  HeroMetaBadge,
  Note,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
  StatCell,
  TipCard,
} from '@/components/domain';
import { Reveal } from '@/components/feature/reveal';
import { WIKI_CATEGORIES } from '@/data/wiki/categories';
import { WIKI_TIPS_SEED } from '@/data/wiki/tips';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: '갓깨비 키우기 비공식 팬 가이드 — 위키 · 채팅 · 북마크',
  description:
    '갓깨비 키우기 비공식 팬 가이드. 직업 3종 · 진령 11+ · 시스템 5대 · 던전 4종 · 과금 전략을 한 페이지에. 1인 운영, 매주 검증.',
  robots: { index: false, follow: false },
};

const TOC_ITEMS: ReadonlyArray<{
  readonly num: string;
  readonly href: string;
  readonly label: string;
  readonly description: string;
  readonly delay: 1 | 2 | 3 | 4;
}> = [
  { num: '01', href: '#overview', label: '게임 개요', description: '기본 정보 · 5대 시스템 · 진행 흐름', delay: 1 },
  { num: '02', href: '/class', label: '직업별 전략', description: '전사 · 검객 · 영매 비교', delay: 1 },
  { num: '03', href: '/jinryeong', label: '진령 티어 & 조합', description: '0~2티어 · 상세 비교 · 추천 프리셋', delay: 2 },
  { num: '04', href: '/skill', label: '스킬 · 제련 시스템', description: '자원 우선순위 · 999뽑기 활용', delay: 2 },
  { num: '05', href: '/content', label: '던전 · PvP', description: '결투장 원칙 · 협동 콘텐츠', delay: 3 },
  { num: '06', href: '/payment', label: '과금 전략', description: '무 · 소 · 중과금 패키지 우선순위', delay: 3 },
  { num: '07', href: '/event', label: '이벤트 · 쿠폰', description: '6종 카테고리 · 대응 전략', delay: 4 },
  { num: '08', href: '/tips', label: '실전 팁', description: '8가지 트릭 · 7일 로드맵', delay: 4 },
  { num: '09', href: '/advanced', label: '고급 Tip 참고', description: '메커니즘 디테일 · 스킬 표', delay: 4 },
];

const HERO_STATS: ReadonlyArray<{ label: string; value: string; unit?: string }> = [
  { label: '직업', value: '3', unit: '종' },
  { label: '진령', value: '11', unit: '+ 종' },
  { label: '최근 업데이트', value: '2025.10' },
  { label: '콘텐츠 등급', value: '7+' },
];

const SYSTEM_SUMMARY: ReadonlyArray<{ num: string; name: string; desc: string }> = [
  { num: '01', name: '직업', desc: '전사·검객·영매 3종 선택' },
  { num: '02', name: '진령', desc: '최대 3마리 동료 시스템' },
  { num: '03', name: '스킬', desc: '코어·액티브·패시브 3계열' },
  { num: '04', name: '제련', desc: '장비 뽑기·강화 시스템' },
  { num: '05', name: '던전', desc: '진령·무한·보스·비경 4종' },
];

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const isRegistered = Boolean(session?.user?.registered);

  const featuredTips = WIKI_TIPS_SEED.slice(0, 3);

  return (
    <>
      {/* ============ HERO ============ */}
      <header
        id="top"
        className={cn(
          'relative grid content-center overflow-hidden',
          'min-h-screen min-h-[100svh] pb-20 pt-[110px] sm:pb-20',
        )}
      >
        <HeroBackdrop />

        <div className="relative z-[2] mx-auto w-full max-w-[980px] px-[max(20px,5vw)]">
          <Reveal>
            <HeroMeta className="mb-7">
              <HeroMetaBadge>v2026.05</HeroMetaBadge>
              <span className="font-mono">최신 메타 기준 · Joy Nice Games</span>
            </HeroMeta>
          </Reveal>

          <Reveal delay={1}>
            <h1
              className={cn(
                'mb-6 text-[clamp(2.2rem,7vw,4.6rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-text',
                '[filter:drop-shadow(0_1px_2px_rgba(7,7,11,0.95))_drop-shadow(0_4px_20px_rgba(0,0,0,0.6))]',
              )}
            >
              <span className="title-gradient italic font-bold">갓깨비</span> 키우기,
              <br />
              효율로 풀어쓴 공략.
              <span className="mt-4 block text-[0.5em] font-medium tracking-[0.02em] text-text-mute [text-shadow:none]">
                직업 · 진령 · 과금 · 이벤트, 한 페이지에.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={2}>
            <p
              className={cn(
                'mb-9 max-w-[580px] text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.75] text-text-soft',
                '[text-shadow:0_2px_6px_rgba(7,7,11,0.9),0_2px_14px_rgba(0,0,0,0.6)]',
              )}
            >
              999회 무료 뽑기로 시작하는 동양 오컬트 판타지 방치형 RPG. 흩어진 공략을
              모아 2026년 5월 현재의 최적 루트로 정리했습니다. 과금 단계별 패키지 선택,
              진령 조합, 일일 운영 우선순위까지.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <div className="mb-9">
              <HeroAppBlock />
            </div>
          </Reveal>

          <Reveal delay={4}>
            <HeroStats items={HERO_STATS} className="mb-9" />
          </Reveal>

          <Reveal delay={4}>
            <div className="flex flex-wrap items-center gap-3">
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
          </Reveal>
        </div>
      </header>

      {/* ============ TOC ============ */}
      <section
        id="toc"
        aria-labelledby="toc-title"
        className="mx-auto w-full max-w-screen-xl px-5 py-20 sm:px-[5vw] sm:py-24"
      >
        <Reveal>
          <SectionHead>
            <SectionEyebrow label="Index" />
            <SectionTitle id="toc-title">전체 목차</SectionTitle>
          </SectionHead>
        </Reveal>

        <ul
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          {TOC_ITEMS.map((item) => (
            <Reveal key={item.href} delay={item.delay}>
              <li>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg border border-ink-line bg-ink-card/40 p-4 transition-card hover:-translate-y-0.5 hover:border-bronze/40 hover:bg-ink-card-strong/70"
                >
                  <span className="min-w-[24px] shrink-0 font-mono text-[0.78rem] tracking-wider text-bronze">
                    {item.num}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[0.92rem] font-medium leading-[1.4] text-text group-hover:text-bronze-soft">
                      {item.label}
                    </span>
                    <span className="text-[0.78rem] leading-[1.4] text-text-mute">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ============ OVERVIEW ============ */}
      <section
        id="overview"
        aria-labelledby="overview-title"
        className="mx-auto w-full max-w-screen-xl border-t border-ink-line px-5 py-20 sm:px-[5vw] sm:py-24"
      >
        <Reveal>
          <SectionHead>
            <SectionEyebrow num="01" label="Overview" />
            <SectionTitle id="overview-title">동양 설화를 입은 방치형 RPG</SectionTitle>
            <SectionLead>
              전작 <em>버섯커 키우기</em>의 노하우를 기반으로 도깨비·진령·999회 무료
              뽑기를 더한 Joy Nice Games의 신작. 자동 전투와 오프라인 보상 기반의
              손쉬운 성장 구조 위에 진령 시너지와 제련 빌드라는 깊이 있는 변수가 얹혀있다.
            </SectionLead>
          </SectionHead>
        </Reveal>

        {/* 상단 와이드 이미지 */}
        <Reveal>
          <div className="mb-6 overflow-hidden rounded-[var(--radius-card)] border border-ink-line">
            <Image
              src="/images/wiki/banner-fantasy-explore.webp"
              alt="동양 판타지 탐험 — 갓깨비 키우기 공식 배너"
              width={1280}
              height={420}
              sizes="(max-width: 768px) 100vw, 980px"
              className="h-auto w-full object-cover"
              loading="lazy"
              quality={80}
            />
          </div>
        </Reveal>

        {/* 카드 2열 — 기본 정보 + 5대 시스템 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal>
            <GlassCard interactive className="p-7">
              <SectionEyebrow label="기본 정보" className="mb-5" />
              <div className="grid grid-cols-2 gap-3">
                <StatCell label="개발사" value="Joy Nice Games" />
                <StatCell label="장르" value="방치형 RPG" />
                <StatCell label="플랫폼" value="Android · iOS" />
                <StatCell label="최근 업데이트" value="2025.10.27" />
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={1}>
            <GlassCard interactive className="p-7">
              <SectionEyebrow label="5대 핵심 시스템" className="mb-5" />
              <ul className="grid gap-2">
                {SYSTEM_SUMMARY.map((s) => (
                  <li
                    key={s.num}
                    className="flex gap-3.5 text-[0.95rem] text-text-soft"
                  >
                    <span className="min-w-[24px] shrink-0 font-mono text-[0.78rem] text-bronze">
                      {s.num}
                    </span>
                    <span>
                      <strong className="text-text">{s.name}</strong> — {s.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>
        </div>

        <Reveal>
          <Note variant="info" title="진행 흐름" className="mt-7">
            메인 퀘스트 진행 → 레벨업으로 신규 시스템 해금 → 999뽑기로 초기 장비 확보 →
            진령 수집·육성 → 제련 강화 → 비경/던전 콘텐츠 도전 → PvP 결투장 진입.
            이 순서로 자연스럽게 콘텐츠가 열린다.
          </Note>
        </Reveal>
      </section>

      {/* ============ WIKI CATEGORIES ============ */}
      <section
        aria-labelledby="wiki-categories"
        className="mx-auto w-full max-w-screen-xl border-t border-ink-line px-5 py-20 sm:px-[5vw] sm:py-24"
      >
        <Reveal>
          <SectionHead>
            <SectionEyebrow num="02" label="Wiki Categories" />
            <SectionTitle id="wiki-categories">위키 카테고리</SectionTitle>
            <SectionLead>
              6개 카테고리 · {WIKI_CATEGORIES.filter((c) => c.active).length}개 활성 ·{' '}
              <span className="font-mono">
                {WIKI_CATEGORIES.reduce((acc, c) => acc + c.itemCount, 0)}
              </span>
              개 항목
            </SectionLead>
          </SectionHead>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WIKI_CATEGORIES.map((cat, i) => (
            <Reveal key={cat.id} delay={(((i % 3) + 1) as 1 | 2 | 3)}>
              <CategoryCard cat={cat} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ FEATURED TIPS ============ */}
      <section
        aria-labelledby="featured-tips"
        className="mx-auto w-full max-w-screen-xl border-t border-ink-line px-5 py-20 sm:px-[5vw] sm:py-24"
      >
        <Reveal>
          <SectionHead className="flex items-end justify-between gap-4">
            <div>
              <SectionEyebrow num="08" label="Tips" />
              <SectionTitle id="featured-tips">실전 팁</SectionTitle>
            </div>
            <Button asChild variant="link" className="shrink-0 text-bronze">
              <Link href="/tips">모두 보기 →</Link>
            </Button>
          </SectionHead>
        </Reveal>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {featuredTips.map((t, i) => (
            <Reveal key={t.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <TipCard
                category={t.category}
                title={t.title}
                content={t.content}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ DISCLAIMER ============ */}
      <section className="mx-auto w-full max-w-screen-xl px-5 pb-24 pt-8 sm:px-[5vw]">
        <Note variant="info" title="비공식 팬 가이드 알림">
          본 사이트는 비공식 팬 가이드로, 저작권자(Joy Net Games / JOY MOBILE NETWORK PTE.
          LTD. / 4399 / Kakao Games / 인용된 외부 가이드 저작권자)의 요청 시 24시간 이내에
          해당 콘텐츠를 삭제하거나 수정합니다. 갓깨비 키우기 운영사와 무관합니다.
        </Note>
      </section>
    </>
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
