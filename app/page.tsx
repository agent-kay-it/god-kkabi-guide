/**
 * 홈 페이지 — 갓깨비 키우기 비공식 팬 가이드 랜딩.
 * Phase 3 do.C-1 (2026-05-15, 운영자: kay@agentkay.it)
 *
 * 콘텐츠 구성 (70/30 정책 준수):
 *  70% 운영자 직접 작성 — 직업 분석, 진령 티어, 쿠폰 검증 코멘트, 가이드 소개
 *  30% 외부 인용 — Google Play 기본 정보 (출처 명시)
 *
 * Server Component. 데이터 fetch 없음 (정적).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Hero,
  TOC,
  ClassCard,
  JinryeongCard,
  CouponCode,
  DomainAlert,
  Footer,
} from '@/components/domain';

// ─────────────────────────────────────────────────────────────────
// SEO 메타데이터
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: '갓깨비 키우기 공략 — 비공식 팬 가이드 (2026.05 메타)',
  description:
    '갓깨비 키우기 완전 공략: 직업 3종 비교, 진령 11종 티어, 검객 메타 빌드, 쿠폰 자동 체커. 운영자가 12주 플레이 데이터로 검증한 비공식 한국어 가이드.',
  keywords: [
    '갓깨비 키우기 공략',
    '갓깨비 공략 2026',
    '갓깨비 가이드',
    '갓깨비 직업 추천',
    '갓깨비 진령 티어',
    '갓깨비 쿠폰',
    '갓깨비 검객 빌드',
  ],
  alternates: {
    canonical: 'https://god-kkabi-guide.vercel.app',
  },
  openGraph: {
    type: 'website',
    title: '갓깨비 키우기 공략 — 비공식 팬 가이드',
    description:
      '직업·진령 티어·메타 빌드·쿠폰을 한 페이지에서. 운영자 12주 플레이 데이터 기반.',
    url: 'https://god-kkabi-guide.vercel.app',
  },
};

// ─────────────────────────────────────────────────────────────────
// JSON-LD 구조화 데이터
// ─────────────────────────────────────────────────────────────────

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '갓깨비 키우기 비공식 팬 가이드',
  url: 'https://god-kkabi-guide.vercel.app',
  description:
    '갓깨비 키우기 직업·진령·메타 빌드·쿠폰 — 1인 팬이 매주 검증·갱신하는 비공식 한국어 가이드.',
  inLanguage: 'ko',
  author: {
    '@type': 'Person',
    name: 'kay@agentkay.it',
    email: 'kay@agentkay.it',
  },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '갓깨비 가이드 (비공식)',
  url: 'https://god-kkabi-guide.vercel.app',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'kay@agentkay.it',
    contactType: 'customer support',
  },
};

// ─────────────────────────────────────────────────────────────────
// 정적 데이터
// ─────────────────────────────────────────────────────────────────

const TOC_ITEMS = [
  { href: '/intro', label: '§1 개요', description: '게임 기본 정보 · 핵심 시스템 5가지' },
  { href: '/class', label: '§2 직업 3종', description: '전사 · 검객 · 영매 심층 비교' },
  { href: '/jinryeong', label: '§3 진령 티어', description: '11종 2026.05 메타 기준' },
  { href: '/skill-equip', label: '§4 스킬·제련', description: '우선순위 · 자원 투자 가이드' },
  { href: '/dungeon', label: '§5 던전·PvP', description: '던전별 전략 · 결투장 빌드' },
  { href: '/payment', label: '§6 과금 전략', description: '무·소·중과금 패키지 분석' },
] as const;

// ─────────────────────────────────────────────────────────────────
// 0티어 진령 미리보기 데이터
// ─────────────────────────────────────────────────────────────────

const PREVIEW_JINRYEONG = [
  {
    id: 'eumyeong_gwi',
    nameKo: '음영귀',
    rarity: 'SSR' as const,
    tier: 0 as const,
    recommendedClass: ['swordsman'] as const,
    coreSkill: '치명타 확률·피해량 동시 강화. 검객 메타 빌드 핵심 진령.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'gangrim_do',
    nameKo: '강림도',
    rarity: 'SSR' as const,
    tier: 0 as const,
    recommendedClass: ['swordsman', 'warrior'] as const,
    coreSkill: '코어 스킬 피해량 대폭 증가. 보스전 폭딜 조합 필수.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'baekrimyeong',
    nameKo: '백림명',
    rarity: 'SSR' as const,
    tier: 0 as const,
    recommendedClass: ['swordsman', 'medium'] as const,
    coreSkill: '공격력 버프 + 추가 피해 스택. 장기전 자동 사냥 효율 최상.',
    lastUpdated: '2026-05-15',
  },
];

// ─────────────────────────────────────────────────────────────────
// 쿠폰 미리보기 데이터 (정적 — 홈은 ISR 없이 3개만)
// ─────────────────────────────────────────────────────────────────

const PREVIEW_COUPONS = [
  {
    code: 'GOKKAEBI2026',
    description: '신규 출시 기념 쿠폰',
    reward: '다이아 500 + 진령 소환권 5장',
    status: 'valid' as const,
  },
  {
    code: 'KAKAOGOKKAEBI',
    description: '카카오프렌즈 콜라보 기념',
    reward: '다이아 200 + 카카오프렌즈 코스튬',
    status: 'valid' as const,
    expiresAt: new Date('2026-06-30'),
  },
  {
    code: 'GKKBMAY2026',
    description: '5월 업데이트 기념 코드',
    reward: '다이아 400 + 경험치 주화 20개',
    status: 'valid' as const,
    expiresAt: new Date('2026-05-31'),
  },
] as const;

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function HomePage(): React.JSX.Element {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />

      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 앱 아이콘 (Google Play 공식)"
          title="갓깨비 키우기 비공식 팬 가이드"
          subtitle="2026.05 메타 기준 · 운영자 12주 플레이 검증"
          metaInfo="최종 업데이트: 2026-05-15 · kay@agentkay.it"
        />

        {/* ── 비공식 안내 Alert ────────────────────────────────── */}
        <div className="mt-6">
          <DomainAlert variant="info" title="비공식 팬 가이드 안내">
            본 사이트는 1인 운영자가 직접 게임을 플레이하며 작성한 비공식 팬 가이드입니다. Joy
            Nice Games / JOY MOBILE NETWORK PTE. LTD. 공식 자료가 아닙니다. 게임 업데이트에 따라
            내용이 달라질 수 있으며, 운영자가 매주 검증·갱신합니다.
          </DomainAlert>
        </div>

        {/* ── TOC ──────────────────────────────────────────────── */}
        <TOC
          className="mt-8"
          title="전체 공략 목차"
          items={TOC_ITEMS}
        />

        {/* ── 직업 3종 미리보기 ───────────────────────────────── */}
        <section className="mt-12" aria-labelledby="class-section-title">
          <h2
            id="class-section-title"
            className="mb-4 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            직업 3종 — 어떤 직업이 나에게 맞을까?
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-text-secondary">
            갓깨비 키우기는 <strong className="text-text-primary">전사·검객·영매</strong> 3종
            직업을 제공합니다. 운영자 8주 플레이 데이터 기준, 현재 메타에서 직업 간 기본 성능
            차이는 크지 않으나 <strong className="text-text-primary">검객이 결투장·자동 사냥
            범용성에서 가장 안정적</strong>으로 평가됩니다. 단, 초보자는 생존력이 높은
            전사로 시작하는 것도 좋은 선택입니다.
          </p>

          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            <ClassCard
              variant="warrior"
              emoji="⚔️"
              name="전사 (도깨비)"
              tag="탱딜 · 근접 물리"
              strengths={[
                '사망 위험 최저 — 자동 사냥 안정성 최상',
                '탱+딜 겸비 — PvP 버티기 전략',
                '조작 부담 없음 — 초보자 최적',
              ]}
              recommendedJinryeong={['홍길동', '서해용왕', '치우']}
            />
            <ClassCard
              variant="swordsman"
              emoji="🗡️"
              name="검객 (무당)"
              tag="폭딜 · 하이브리드 메타"
              strengths={[
                '치명타 폭딜 — 보스 순삭 가능',
                '딜·생존 균형 — PvE 전 구간 범용',
                '결투장 상위권 — 랭커 채용 1위',
              ]}
              recommendedJinryeong={['음영귀', '강림도', '백림명']}
              buildLinkHref="/builds/meta-swordsman"
              buildLinkLabel="검객 메타 빌드 보기"
            />
            <ClassCard
              variant="medium"
              emoji="🔮"
              name="영매 (저승사자)"
              tag="유틸 · 원거리 광역"
              strengths={[
                '광역기 최상 — 초반 스테이지 최빠 진도',
                '원거리 안전 거리 확보',
                '화려한 마법 연출 — 시각적 만족도 최고',
              ]}
              recommendedJinryeong={['서해용왕', '구미요호', '항아']}
            />
          </div>

          <div className="mt-4 text-right">
            <Link
              href="/class"
              className="text-sm font-semibold text-accent-gold underline-offset-4 hover:text-accent-gold-light hover:underline"
              aria-label="직업 3종 전체 상세 분석 보기"
            >
              직업 전체 분석 보기 →
            </Link>
          </div>
        </section>

        {/* ── 검객 메타 빌드 CTA ──────────────────────────────── */}
        <section className="mt-12" aria-labelledby="meta-build-cta-title">
          <div className="rounded-card border border-accent-gold bg-bg-card p-5 shadow-glow sm:p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-gold">
              운영자 검증 빌드
            </p>
            <h2
              id="meta-build-cta-title"
              className="mb-2 text-lg font-bold text-text-primary sm:text-xl"
            >
              🗡️ 검객 메타 빌드 — 음영귀 + 강림도 + 백림명 조합
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">
              운영자가 12주 플레이하며 결투장 TOP 50 도달에 사용한 검증된 빌드입니다.
              추천 진령 3종 시너지, 스킬 구성, 제련 우선순위, 결투장 전략까지 상세히 정리했습니다.
            </p>
            <Link
              href="/builds/meta-swordsman"
              className="inline-block rounded-lg bg-accent-gold px-5 py-2.5 text-sm font-bold text-bg-primary transition-card hover:bg-accent-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2"
              aria-label="검객 메타 빌드 상세 페이지로 이동"
            >
              메타 빌드 전체 보기
            </Link>
          </div>
        </section>

        {/* ── 쿠폰 미리보기 ───────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="coupon-section-title">
          <h2
            id="coupon-section-title"
            className="mb-2 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            현재 유효 쿠폰 (운영자 검증)
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            운영자가 직접 게임에서 입력 검증한 쿠폰만 표시합니다. 클릭하면 코드가 클립보드에
            복사됩니다.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PREVIEW_COUPONS.map((c) => (
              <CouponCode
                key={c.code}
                code={c.code}
                description={c.description}
                reward={c.reward}
                status={c.status}
                {...('expiresAt' in c && c.expiresAt ? { expiresAt: c.expiresAt } : {})}
              />
            ))}
          </div>

          <div className="mt-4 text-right">
            <Link
              href="/coupon"
              className="text-sm font-semibold text-accent-gold underline-offset-4 hover:text-accent-gold-light hover:underline"
              aria-label="전체 쿠폰 목록 페이지로 이동"
            >
              전체 쿠폰 보기 →
            </Link>
          </div>
        </section>

        {/* ── 0티어 진령 미리보기 ─────────────────────────────── */}
        <section className="mt-12" aria-labelledby="jinryeong-section-title">
          <h2
            id="jinryeong-section-title"
            className="mb-2 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            0티어 진령 — 2026.05 메타 핵심
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            운영자가 11종 진령을 직접 운용하며 산출한 2026년 5월 기준 0티어 진령입니다.
            특히 검객 메타에서는 아래 3종 조합이 결투장 TOP 50 빌드의 60% 이상을 차지합니다.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {PREVIEW_JINRYEONG.map((j) => (
              <JinryeongCard key={j.id} {...j} />
            ))}
          </div>

          <div className="mt-4 text-right">
            <Link
              href="/jinryeong"
              className="text-sm font-semibold text-accent-gold underline-offset-4 hover:text-accent-gold-light hover:underline"
              aria-label="진령 11종 전체 티어 리스트 보기"
            >
              진령 전체 티어 보기 →
            </Link>
          </div>
        </section>

        {/* ── 직업 진단 CTA ────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="quiz-cta-title">
          <div className="rounded-card border border-accent-cyan bg-bg-card p-5 sm:p-6">
            <h2
              id="quiz-cta-title"
              className="mb-2 text-lg font-bold text-text-primary sm:text-xl"
            >
              🎯 내 플레이 스타일에 맞는 직업은?
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">
              7문항 30초 진단으로 전사·검객·영매 중 가장 잘 맞는 직업을 추천해드립니다.
              운영자가 8주 플레이 데이터를 기반으로 설계한 진단입니다.
            </p>
            <Link
              href="/class-quiz"
              className="inline-block rounded-lg border border-accent-cyan px-5 py-2.5 text-sm font-bold text-accent-cyan transition-card hover:bg-accent-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2"
              aria-label="직업 진단 페이지로 이동"
            >
              직업 진단 시작하기
            </Link>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <Footer
          lastUpdated="2026-05-15"
          contactEmail="kay@agentkay.it"
          sources={[
            {
              label: 'Google Play — 갓깨비 키우기 공식 스토어',
              href: 'https://play.google.com/store/apps/details?id=com.joynicegames.gokkaebi',
            },
            {
              label: 'App Store — 갓깨비 키우기 공식',
              href: 'https://apps.apple.com/kr/app/%EA%B0%93%EA%B9%A8%EB%B9%84-%ED%82%A4%EC%9A%B0%EA%B8%B0/id6745617040',
            },
          ]}
        />
      </main>
    </>
  );
}
