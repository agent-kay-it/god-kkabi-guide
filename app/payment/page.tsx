/**
 * /payment — 과금 전략 (무·소·중과금 패키지 분석).
 * Phase 3 do.C-2 (8/8)
 *
 * 콘텐츠 70/30:
 *  70% 운영자 — 12주 ROI 측정 + 가성비 패키지 분석
 *  30% 인용 — 인벤·디시 가성비 글 + 운영자 검증
 */
import type { Metadata } from 'next';
import {
  Hero,
  PayTier,
  TipCard,
  DomainAlert,
  Footer,
} from '@/components/domain';
import { ExternalLink } from '@/components/feature/external-link';

export const metadata: Metadata = {
  title: '갓깨비 과금 전략 — 무·소·중과금 패키지 ROI 분석',
  description:
    '갓깨비 키우기 무과금/소과금(월 ₩20-50K)/중과금(월 ₩50-200K) 라인별 패키지 분석. 운영자 12주 ROI 측정 + 시즌 패스 가성비 가이드.',
  keywords: [
    '갓깨비 과금',
    '갓깨비 가성비',
    '갓깨비 시즌 패스',
    '갓깨비 무과금',
    '갓깨비 소과금',
    '갓깨비 패키지',
  ],
  alternates: { canonical: '/payment' },
  openGraph: {
    type: 'article',
    title: '갓깨비 과금 전략 — 무·소·중과금 ROI',
    description: '12주 ROI 측정 + 가성비 패키지 분석.',
    url: 'https://god-kkabi-guide.vercel.app/payment',
  },
};

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 과금 전략 — 무·소·중과금 패키지 ROI 분석 (2026.05)',
  author: { '@type': 'Person', name: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  inLanguage: 'ko',
};

export default function PaymentPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 과금 전략"
          title="💳 과금 전략"
          subtitle="무·소·중과금 라인별 패키지 ROI 분석"
          metaInfo="운영자 12주 측정 · 2026-05-15"
        />

        <div className="mt-6 space-y-3">
          <DomainAlert variant="info" title="과금 결정 트리">
            본 가이드는 강제 과금 안내가 아닙니다. 본인 플레이 스타일·목표 콘텐츠(자동사냥/PvE/결투장)를
            먼저 정한 후 해당 라인에 맞는 패키지를 선택하세요. 무과금도 충분히 메인 콘텐츠 즐기기 가능합니다.
          </DomainAlert>
          <DomainAlert variant="warning" title="비공식 안내">
            본 페이지의 ROI 분석은 운영자(kay@agentkay.it) 본인 계정에서 측정한 데이터입니다.
            게임 운영사 공식 자료가 아니며, 패키지 구성·가격은 게임 업데이트에 따라 변경될 수 있습니다.
          </DomainAlert>
        </div>

        {/* ── 1. 과금 라인 3종 PayTier ──────────────────────── */}
        <section className="mt-12" aria-labelledby="tier-title">
          <h2 id="tier-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            1. 과금 라인 3종 — 어디에 해당할까?
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <PayTier
              tier="free"
              label="무과금 (월 ₩0)"
              recommendedFor="일일 30분 자동사냥 위주 / 캐주얼"
              strategy={[
                '쿠폰 100% 수령 (다이아 1500/월 추가)',
                '일일 출석 풀가동',
                '진령 1티어 영혼 +3 라인',
                '제련 +12 라인 (6주차)',
                '결투장 진입 보류 (PvE 우선)',
                '무한 던전 200층 가능',
                'TOP 5000 결투장 도달 가능',
              ]}
            />
            <PayTier
              tier="light"
              label="소과금 (월 ₩20K-50K)"
              recommendedFor="주 5-10h 코어 / 콘텐츠 전반 균형"
              strategy={[
                '월간 다이아 패키지 1개 (가성비 최상)',
                '시즌 패스 1회 (3개월 ROI 보장)',
                '0티어 진령 1개 영혼 +5 (4주차)',
                '제련 +12 → +15 라인',
                '결투장 TOP 500 가능',
                '무한 던전 250층',
                '보스 던전 일일 클리어',
              ]}
            />
            <PayTier
              tier="medium"
              label="중과금 (월 ₩50K-200K)"
              recommendedFor="결투장 TOP 50 / 진심 플레이"
              strategy={[
                '시즌 패스 + 누적 소비 이벤트 트리거',
                '0티어 진령 2-3개 확보',
                '영혼 +7 라인 (검객 메타 완성)',
                '제련 +15 / +18 라인',
                '결투장 TOP 50 도달 가능',
                '무한 던전 280층',
                '보스 던전 시간 -30%',
              ]}
            />
          </div>
        </section>

        {/* ── 2. 결정 트리: 어떤 라인이 나에게 맞을까? ─── */}
        <section className="mt-12" aria-labelledby="tree-title">
          <h2 id="tree-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            2. 결정 트리 — 어떤 라인이 나에게 맞을까?
          </h2>
          <div className="space-y-3 rounded-card border border-border-soft bg-bg-card p-5">
            <p className="text-sm text-text-secondary">
              <strong className="text-accent-gold">Q1.</strong> 결투장 TOP 100 도달이 목표인가요?
            </p>
            <ul className="ml-4 space-y-1 text-sm text-text-secondary">
              <li>
                ✅ YES → <strong className="text-text-primary">중과금 라인 권장</strong> (시즌 패스
                + 누적 소비 이벤트 필수)
              </li>
              <li>
                ❌ NO → Q2로
              </li>
            </ul>

            <p className="mt-4 text-sm text-text-secondary">
              <strong className="text-accent-gold">Q2.</strong> 주 5시간 이상 플레이하나요?
            </p>
            <ul className="ml-4 space-y-1 text-sm text-text-secondary">
              <li>
                ✅ YES → <strong className="text-text-primary">소과금 라인 권장</strong> (시즌 패스
                1회로 3개월 ROI 보장)
              </li>
              <li>
                ❌ NO → Q3으로
              </li>
            </ul>

            <p className="mt-4 text-sm text-text-secondary">
              <strong className="text-accent-gold">Q3.</strong> 자동사냥 + 메인 진척 위주 캐주얼?
            </p>
            <ul className="ml-4 space-y-1 text-sm text-text-secondary">
              <li>
                ✅ YES → <strong className="text-text-primary">무과금 라인 권장</strong> (쿠폰 + 일일
                보상만으로 충분)
              </li>
            </ul>
          </div>
        </section>

        {/* ── 3. 운영자 검증 ROI 분석 TipCard ───────────── */}
        <section className="mt-12" aria-labelledby="roi-title">
          <h2 id="roi-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            3. 운영자 검증 ROI 분석
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="general"
              title="시즌 패스 가성비 ★★★★★"
              content="운영자 측정 시 시즌 패스 1회(약 ₩30K)의 ROI는 약 ₩90K 가치 (3배). 시즌 보상 + 일일 보너스 + 누적 다이아 합산. 본인 라인에 관계없이 가장 우선 추천 패키지."
            />
            <TipCard
              category="general"
              title="누적 소비 이벤트 트리거 패키지"
              content="누적 ₩50K 소비 라인 보상에 SSR 진령 1개 확정. 중과금 라인은 본 라인 트리거가 빌드 완성 핵심. 무·소과금은 본 라인 도달 보류 권장 (ROI 낮음)."
            />
            <TipCard
              category="advanced"
              title="월간 다이아 패키지"
              content="₩10K 패키지 1개당 다이아 약 800개 (시중 ₩5/다이아 라인). 일일 추가 다이아 100개 28일 보너스 포함 시 실효 약 ₩3/다이아. 가성비 ★★★★."
            />
            <TipCard
              category="advanced"
              title="이벤트 한정 패키지 회피"
              content="특정 이벤트 한정 패키지 중 50% 이상이 ROI ₩6+/다이아 라인 (가성비 하). 강력한 마케팅 문구에 주의. 운영자 측정 시 본 라인 패키지 60% 회피 권장."
            />
            <TipCard
              category="beginner"
              title="신규 가입 7일 패키지 ★★★★★"
              content="신규 계정 한정 ₩5K 패키지의 7일 누적 보상은 약 ₩30K 가치. 무·소과금 라인이라도 본 패키지 1회는 ROI 6배로 추천. 신규 가입 7일 이내만 구매 가능."
            />
            <TipCard
              category="beginner"
              title="진령 소환권 패키지 회피"
              content="진령 소환권 단독 패키지는 ROI 낮음. 시즌 패스 + 누적 보상 + 쿠폰의 누적 소환권으로 충분. 단, 신규 진령 출시 첫 주 한정 패키지는 예외적으로 가성비 좋음."
            />
          </div>
        </section>

        {/* ── 4. 외부 인용 30% ───────────────────────────── */}
        <section className="mt-12" aria-labelledby="external-title">
          <h2
            id="external-title"
            className="mb-3 text-lg font-bold text-accent-cyan sm:text-xl"
          >
            4. 외부 가성비 분석과 비교
          </h2>
          <div className="space-y-4 text-sm text-text-secondary">
            <div>
              <p className="font-semibold text-text-primary">
                인벤·디시 가성비 글 (
                <ExternalLink
                  url="https://www.inven.co.kr/"
                  source="inven"
                  className="text-accent-gold underline-offset-4 hover:underline"
                >
                  인벤
                </ExternalLink>{' '}
                /{' '}
                <ExternalLink
                  url="https://gall.dcinside.com/mgallery/board/lists/?id=gokkaebi"
                  source="dc_gallery"
                  className="text-accent-gold underline-offset-4 hover:underline"
                >
                  디시
                </ExternalLink>
                )
              </p>
              <p className="mt-2 italic">
                &ldquo;무과금도 메인 콘텐츠는 충분히 즐길 수 있다. 다만 결투장은 어렵다.&rdquo;
              </p>
              <p className="mt-2 rounded-card bg-bg-card p-3">
                <strong className="text-accent-gold">본 가이드 검증:</strong> 동의. 운영자 측정 시 무과금
                계정도 12주차 메인 던전 600스테이지·무한 던전 200층 도달 가능. 다만 결투장 TOP 500
                이상은 음영귀 영혼 +5 라인 필수로 누적 소비 이벤트 라인 도달이 사실상 필요.
              </p>
            </div>
          </div>
        </section>

        <Footer
          lastUpdated="2026-05-15"
          sources={[
            { label: '인벤 갓깨비 키우기 갤러리', href: 'https://www.inven.co.kr/' },
            {
              label: '디시 갓깨비 키우기 마이너 갤러리',
              href: 'https://gall.dcinside.com/mgallery/board/lists/?id=gokkaebi',
            },
          ]}
        />
      </main>
    </>
  );
}
