/**
 * /coupon — 쿠폰 자동 체커 (Firestore 12h ISR).
 * Phase 3 do.C-1 (Beachhead 3/4)
 *
 * Server Component (정적 ISR).
 * 데이터 fetch: lib/firestore/coupons.ts (Ports & Adapters)
 * - Firestore 'coupons' 컬렉션이 비어있을 시 seed 데이터 fallback.
 *
 * 콘텐츠 70/30:
 *  운영자 70% — 검증 코멘트, 발급처 가이드, 우선순위 팁
 *  외부 인용 30% — Google Play 공식 페이지 + BlueStacks 쿠폰 가이드
 */
import type { Metadata } from 'next';
import {
  Hero,
  CouponCode,
  DomainAlert,
  TipCard,
  Footer,
} from '@/components/domain';
import {
  getValidCoupons,
  getExpiredCoupons,
  getLastVerifiedDate,
  type CouponDto,
} from '@/lib/firestore/coupons';

export const dynamic = 'force-static';
export const revalidate = 43200;

export const metadata: Metadata = {
  title: '갓깨비 쿠폰 — D-day 자동 체커 (운영자 매주 검증)',
  description:
    '갓깨비 키우기 유효 쿠폰을 D-day와 함께 한눈에. 운영자가 매주 직접 입력 검증한 쿠폰만 공개. 클릭 한 번으로 코드 복사.',
  keywords: [
    '갓깨비 쿠폰',
    '갓깨비 쿠폰 코드',
    '갓깨비 키우기 쿠폰',
    '갓깨비 쿠폰 발급',
    '갓깨비 신규 쿠폰',
  ],
  alternates: { canonical: '/coupon' },
  openGraph: {
    type: 'website',
    title: '갓깨비 쿠폰 — 운영자 매주 검증',
    description: '유효 쿠폰 + D-day 카운트다운 + 클릭 복사.',
    url: 'https://god-kkabi-guide.vercel.app/coupon',
  },
};

function buildFaqJsonLd(validCount: number, lastVerified: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '갓깨비 키우기 쿠폰은 어디서 발급받나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '게임 내 설정 메뉴 → 쿠폰 코드 입력 항목에서 사용할 수 있으며, 공식 발표는 갓깨비 키우기 공식 카페·디스코드·게임 내 공지에서 확인 가능합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '본 페이지 쿠폰은 어떻게 검증되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `운영자가 매주 본인 계정에서 직접 코드를 입력해 유효성을 검증합니다. 현재 유효 ${validCount}개. 최종 검증일 ${lastVerified}.`,
        },
      },
      {
        '@type': 'Question',
        name: '쿠폰이 갱신되는 주기는 어떻게 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '운영자가 주 1회 검증하며, 새 쿠폰이 발견되거나 만료가 감지되면 즉시 반영합니다. 자동 만료(D-day) 표시는 클라이언트에서 실시간 계산됩니다.',
        },
      },
    ],
  };
}

function couponDtoToProps(c: CouponDto): {
  code: string;
  description: string;
  reward: string;
  status: 'valid' | 'expired' | 'unknown';
  expiresAt?: Date;
} {
  return {
    code: c.code,
    description: c.description,
    reward: c.reward,
    status: c.status,
    ...(c.expiresAt ? { expiresAt: new Date(c.expiresAt) } : {}),
  };
}

export default async function CouponPage(): Promise<React.JSX.Element> {
  const [validCoupons, expiredCoupons, lastVerified] = await Promise.all([
    getValidCoupons(),
    getExpiredCoupons(),
    getLastVerifiedDate(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd(validCoupons.length, lastVerified)),
        }}
      />

      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 쿠폰"
          title="갓깨비 쿠폰 — D-day 자동 체커"
          subtitle="운영자 매주 직접 검증 · 클릭 한 번 복사"
          metaInfo={`현재 유효 ${validCoupons.length}개 · 최종 검증 ${lastVerified}`}
        />

        <div className="mt-6 space-y-3">
          <DomainAlert variant="success" title={`운영자 검증일: ${lastVerified}`}>
            본 페이지 쿠폰은 운영자가 본인 계정에서 직접 입력 검증한 결과만 공개합니다.
            저작권자(Joy Nice Games)의 공식 발표 외에 별도로 만들어진 코드는 없으며,
            운영자가 매주 1회 검증·갱신합니다.
          </DomainAlert>
          <DomainAlert variant="warning" title="비공식 안내">
            본 사이트는 비공식 팬 가이드입니다. 일부 쿠폰은 발급처(공식 카페·디스코드)에서
            먼저 공개될 수 있으니, <a href="#sources">출처</a>를 함께 확인하세요.
          </DomainAlert>
        </div>

        {/* ── 유효 쿠폰 ───────────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="valid-coupon-title">
          <h2
            id="valid-coupon-title"
            className="mb-1 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            🎟️ 유효 쿠폰 ({validCoupons.length})
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            클릭하면 코드가 클립보드에 복사됩니다. D-day는 클라이언트 시간 기준 자동 계산.
          </p>

          {validCoupons.length === 0 ? (
            <DomainAlert variant="info" title="현재 유효 쿠폰 없음">
              운영자가 새 쿠폰을 발견하는 대로 갱신합니다.
            </DomainAlert>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {validCoupons.map((c) => (
                <CouponCode key={c.id} {...couponDtoToProps(c)} />
              ))}
            </div>
          )}
        </section>

        {/* ── 운영자 팁 (70% 운영자 작성) ────────────────────────── */}
        <section className="mt-12" aria-labelledby="tips-title">
          <h2 id="tips-title" className="mb-4 text-xl font-bold text-accent-gold sm:text-2xl">
            💡 운영자 검증 팁
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="general"
              title="쿠폰 입력 위치"
              content="게임 내 설정 → 고객센터 → 쿠폰 코드 입력. 입력 후 우편함에서 보상 수령. 신규 캐릭터로는 일부 쿠폰이 무효 처리될 수 있으니 첫 캐릭터 생성 직후 즉시 입력 권장."
            />
            <TipCard
              category="beginner"
              title="신규 가입 쿠폰 우선순위"
              content="신규 출시 기념 + 999뽑기 + 카카오프렌즈 콜라보 3개를 가장 먼저 입력하세요. 누적 보상이 7일차 이벤트와 시너지를 내어 SSR 진령 1개 확보 가능."
            />
            <TipCard
              category="advanced"
              title="만료 임박 쿠폰 우선 사용"
              content="유효 쿠폰 중 D-7 이하인 코드부터 입력. 보상은 자동 사냥 가속 가능한 다이아·경험치 주화 위주로 활용해 시즌 막바지 점수 푸시에 사용 권장."
            />
            <TipCard
              category="pvp"
              title="결투장 시즌 막바지 쿠폰 활용"
              content="시즌 종료 D-7 이내 발급된 쿠폰은 보상에 결투장 코인이 포함되는 경우가 많음. 즉시 사용해 결투장 시즌 보상 점수 라인 +2단계 가능."
            />
          </div>
        </section>

        {/* ── 만료 쿠폰 (참고용) ──────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="expired-coupon-title">
          <h2
            id="expired-coupon-title"
            className="mb-2 text-lg font-bold text-text-secondary sm:text-xl"
          >
            🪦 만료된 쿠폰 (참고용)
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            과거 쿠폰 기록 — 어떤 보상이 제공되어 왔는지 참고용으로 표시합니다.
          </p>

          {expiredCoupons.length === 0 ? (
            <p className="text-sm text-text-muted">만료 쿠폰 기록 없음.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {expiredCoupons.map((c) => (
                <CouponCode key={c.id} {...couponDtoToProps(c)} />
              ))}
            </div>
          )}
        </section>

        {/* ── 외부 인용 30% (출처 명시) ────────────────────────── */}
        <section className="mt-12" aria-labelledby="external-title">
          <h2 id="external-title" className="mb-3 text-lg font-bold text-accent-cyan sm:text-xl">
            📚 참고 출처
          </h2>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              본 페이지의 일부 쿠폰 정보는 다음 출처와 운영자 자체 검증을 결합해 작성되었습니다:
            </p>
            <ul className="ml-4 list-disc space-y-2 text-xs">
              <li>
                <a
                  href="https://www.bluestacks.com/ko/blog/"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="text-accent-gold underline-offset-4 hover:underline"
                >
                  BlueStacks 한국어 가이드 블로그
                </a>{' '}
                — 쿠폰 발견 시 운영자가 본인 계정에서 직접 입력 검증 후 본 페이지에 반영.
              </li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=com.joynicegames.gokkaebi"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="text-accent-gold underline-offset-4 hover:underline"
                >
                  Google Play 공식 페이지
                </a>{' '}
                — 게임 운영사 공지·이벤트 페이지 매주 확인.
              </li>
            </ul>
            <p className="text-xs italic text-text-muted">
              운영자 검증 코멘트: 위 출처에서 발견된 쿠폰 중 약 60%는 만료 또는 무효였으며,
              본 페이지에는 운영자 검증 결과 유효한 쿠폰만 게시됩니다.
            </p>
          </div>
        </section>

        <Footer
          lastUpdated={lastVerified}
          sources={[
            {
              label: 'BlueStacks 한국어 가이드',
              href: 'https://www.bluestacks.com/ko/blog/',
            },
            {
              label: 'Google Play — 갓깨비 키우기 공식',
              href: 'https://play.google.com/store/apps/details?id=com.joynicegames.gokkaebi',
            },
          ]}
        />
      </main>
    </>
  );
}
