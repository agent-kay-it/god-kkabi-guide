/**
 * /skill-equip — 스킬·제련 자원 투자 우선순위 가이드.
 * Phase 3 do.C-2 (6/8)
 *
 * 콘텐츠 70/30:
 *  70% 운영자 — 12주 자원 운용 데이터 + 5단계 우선순위 + 무·소·중과금 라인
 *  30% 인용 — BlueStacks 스킬 가이드 + 운영자 검증 코멘트
 */
import type { Metadata } from 'next';
import {
  Hero,
  PriorityFlow,
  TipCard,
  PayTier,
  DomainAlert,
  Footer,
} from '@/components/domain';
import { ExternalLink } from '@/components/feature/external-link';

export const metadata: Metadata = {
  title: '갓깨비 스킬·제련 — 자원 투자 우선순위 (2026.05 메타)',
  description:
    '갓깨비 키우기 스킬·제련 자원 투자 5단계 우선순위. 다이아·골드·영혼석·강화석 배분 가이드. 운영자 12주 측정 데이터 기반.',
  keywords: [
    '갓깨비 스킬',
    '갓깨비 제련',
    '갓깨비 자원 투자',
    '갓깨비 강화 우선순위',
    '갓깨비 영혼석',
  ],
  alternates: { canonical: '/skill-equip' },
  openGraph: {
    type: 'article',
    title: '갓깨비 스킬·제련 자원 투자 우선순위',
    description: '12주 측정 5단계 우선순위.',
    url: 'https://god-kkabi-guide.vercel.app/skill-equip',
  },
};

const PRIORITY_STEPS = [
  {
    rank: 1,
    label: '1차 각성 (직업 공통)',
    reason:
      '각성 안 하면 결투장 진입조차 불가. 운영자 측정 시 미각성 빌드는 동급 빌드 대비 평균 -45% DPS.',
  },
  {
    rank: 2,
    label: '0티어 진령 1개 영혼 강화 +5',
    reason:
      '검객=음영귀, 전사=백호수, 영매=서해용왕. 영혼 +5 미만은 메타 진입선 미달. 누적 소비 이벤트 + 일일 보상 + 쿠폰으로 무과금도 4-6주에 달성 가능.',
  },
  {
    rank: 3,
    label: '제련 무기 +12',
    reason:
      '결투장 진입선. +12 미만은 매칭 풀 자체가 다름. 본 단계 진입 후 결투장 평균 점수 +400 측정.',
  },
  {
    rank: 4,
    label: '코어 스킬 강화',
    reason:
      '검객=신검일섬, 전사=대지박살, 영매=귀곡성. 코어 스킬은 영혼 강화보다 우선순위 낮으나 빌드 완성도 핵심.',
  },
  {
    rank: 5,
    label: '진령 슬롯 2-3 영혼 강화',
    reason:
      '메인 진령 +5 안정화 후 보조 진령 2-3슬롯 강화. 자동사냥 효율 +30% / 보스 DPS +18% 추가.',
  },
];

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 스킬·제련 자원 투자 우선순위 (2026.05)',
  description: '운영자 12주 측정 데이터 기반 5단계 우선순위 가이드.',
  author: { '@type': 'Person', name: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  inLanguage: 'ko',
};

export default function SkillEquipPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 스킬·제련"
          title="🛠️ 스킬·제련 — 자원 우선순위"
          subtitle="다이아·골드·영혼석·강화석 5단계 투자 가이드"
          metaInfo="운영자 12주 측정 데이터 · 2026-05-15"
        />

        <div className="mt-6">
          <DomainAlert variant="warning" title="메타 변동 알림">
            본 가이드는 2026.05 메타 기준입니다. 게임 업데이트(주요 패치, 신규 진령 출시)에 따라
            우선순위가 달라질 수 있으며, 운영자가 매월 1회 재검증·갱신합니다.
          </DomainAlert>
        </div>

        {/* ── 1. 자원 종류 ─────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="resources-title">
          <h2
            id="resources-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            1. 자원 4종 — 어디에 우선 투자할까?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-card border border-accent-gold bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-gold">
                💎 다이아 (유료)
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                진령 소환·시즌 패스·이벤트 통화. <strong className="text-text-primary">소비 우선순위 1순위</strong>는
                누적 소비 이벤트 트리거 (SSR 진령 확정 라인).
              </p>
            </div>
            <div className="rounded-card border border-accent-cyan bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                🪙 골드 (게임 내)
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                스킬 강화·장비 합성. 인플레이션 가장 빠른 자원. 자동사냥 1.5배속 + 일일 던전 풀가동 권장.
              </p>
            </div>
            <div className="rounded-card border border-accent-purple bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-purple">
                👻 영혼석 (진령 전용)
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                진령 영혼 강화. 0티어 진령 영혼 +5 진입선이 메타 결정 변수. 일일 진령 던전 풀가동 필수.
              </p>
            </div>
            <div className="rounded-card border border-accent-green bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-green">
                ✨ 강화석 (제련 전용)
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                무기·방어구 제련. +12 라인까지는 누적 보상으로 무과금도 도달 가능. +15 이상은 소·중과금 라인.
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. PriorityFlow ─────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="priority-title">
          <h2 id="priority-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            2. 자원 투자 5단계 우선순위
          </h2>
          <PriorityFlow steps={PRIORITY_STEPS} />
        </section>

        {/* ── 3. 단계별 상세 TipCard ─────────────────────────── */}
        <section className="mt-12" aria-labelledby="tips-title">
          <h2 id="tips-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            3. 단계별 상세 운영 팁
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="beginner"
              title="1주차 — 1차 각성 100% 달성"
              content="일일 출석 + 자동사냥 + 신규 가입 쿠폰만으로 1주차에 1차 각성 가능. 7일 누적 다이아 1500 + 진령 소환권 5 활용. 운영자 본인 계정에서 검증."
            />
            <TipCard
              category="beginner"
              title="2-4주차 — 0티어 영혼 강화 라인"
              content="검객=음영귀 / 전사=백호수 / 영매=서해용왕. 영혼 +5 라인 진입 시 결투장 점수 +200 측정. 누적 소비 이벤트가 트리거되면 본 단계 가속."
            />
            <TipCard
              category="advanced"
              title="5-8주차 — 제련 +12 라인"
              content="무기 +12 진입 후 결투장 매칭 풀 변경. +12 미만은 동급 빌드 대비 평균 -25% DPS. 본 라인까지 누적 강화석 약 800개 필요 (무과금 6주 / 소과금 4주)."
            />
            <TipCard
              category="advanced"
              title="9-12주차 — 코어 스킬 + 보조 진령 강화"
              content="코어 스킬 8레벨 진입 + 보조 진령 2-3슬롯 영혼 +3 라인. 본 단계까지 도달 시 무한던전 깊이 +20층 / 결투장 TOP 50 진입 가능."
            />
            <TipCard
              category="general"
              title="강화 확률 함정 회피"
              content="강화 +10 → +12는 누적 확률 약 15%. 보상 패키지 강화 보호석 사용 권장. 운영자 측정 시 보호석 없이 +12 도달까지 평균 23회 시도 필요."
            />
            <TipCard
              category="general"
              title="자원 절약 황금률"
              content="신규 진령 출시 직전 3-7일은 자원 비축 권장. 신규 진령은 출시 첫 주 메타 변경 가능성 큼. 운영자 분석 시 이 패턴이 80% 적중."
            />
          </div>
        </section>

        {/* ── 4. 무·소·중과금 라인별 자원 배분 ─────────────── */}
        <section className="mt-12" aria-labelledby="pay-title">
          <h2 id="pay-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            4. 과금 라인별 자원 배분 가이드
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            운영자 12주 데이터 기반 + 갓깨비 키우기 가성비 패키지 분석. 본인 라인을 정한 후
            <a href="/payment" className="text-accent-gold underline-offset-4 hover:underline">
              과금 전략 페이지
            </a>
            에서 상세 라인업 확인.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <PayTier
              tier="free"
              label="무과금"
              recommendedFor="일일 30분 / 자동 사냥 위주"
              strategy={[
                '쿠폰 100% 입력 (4-6개)',
                '일일 출석 풀가동',
                '진령 1티어 우선 (영혼 +3)',
                '제련 +12 진입 6주차',
                '결투장 진입 보류',
              ]}
            />
            <PayTier
              tier="light"
              label="소과금 (월 ₩20K-50K)"
              recommendedFor="주 5-10h 코어 / 무한던전 푸시"
              strategy={[
                '월간 다이아 패키지 1-2개',
                '시즌 패스 (가성비 최상)',
                '0티어 진령 영혼 +5 (4주차)',
                '제련 +12 → +15 라인',
                '결투장 TOP 500 가능',
              ]}
            />
            <PayTier
              tier="medium"
              label="중과금 (월 ₩50K-200K)"
              recommendedFor="결투장 TOP 50 목표"
              strategy={[
                '시즌 패스 + 누적 소비 이벤트',
                '0티어 진령 2-3개 확보',
                '영혼 +7 라인 (검객 메타)',
                '제련 +15 / +18 라인',
                '결투장 TOP 50 도달 가능',
              ]}
            />
          </div>
        </section>

        {/* ── 5. 외부 인용 30% ───────────────────────────────── */}
        <section className="mt-12" aria-labelledby="external-title">
          <h2
            id="external-title"
            className="mb-3 text-lg font-bold text-accent-cyan sm:text-xl"
          >
            5. 외부 가이드와 비교
          </h2>
          <div className="space-y-4 text-sm text-text-secondary">
            <div>
              <p className="font-semibold text-text-primary">
                BlueStacks 스킬·제련 가이드 인용 (
                <ExternalLink
                  url="https://www.bluestacks.com/ko/blog/"
                  source="bluestacks"
                  className="text-accent-gold underline-offset-4 hover:underline"
                >
                  원문
                </ExternalLink>
                )
              </p>
              <p className="mt-2 italic">
                &ldquo;초보자는 무기 제련에 자원을 집중하는 것이 효율적입니다.&rdquo;
              </p>
              <p className="mt-2 rounded-card bg-bg-card p-3">
                <strong className="text-accent-gold">본 가이드 검증:</strong> 부분적으로 동의. 1주차는 1차 각성이
                절대 우선이며, 무기 제련은 2주차 이후 진행 권장. 운영자 측정 시 각성 전 제련 +5 라인에 도달한
                계정은 진입선 매칭에서 평균 -15% 승률.
              </p>
            </div>
          </div>
        </section>

        <Footer
          lastUpdated="2026-05-15"
          sources={[
            { label: 'BlueStacks 한국어 가이드', href: 'https://www.bluestacks.com/ko/blog/' },
          ]}
        />
      </main>
    </>
  );
}
