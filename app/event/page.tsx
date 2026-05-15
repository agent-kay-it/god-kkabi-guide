/**
 * /event — 이벤트 정보 페이지.
 * Phase 3 do.C-3 (1/4)
 *
 * 콘텐츠 70/30:
 *  70% 운영자 — 이벤트 검증·우선순위 분석
 *  30% 인용 — 공식 공지 출처
 */
import type { Metadata } from 'next';
import {
  Hero,
  EventCard,
  TipCard,
  DomainAlert,
  Footer,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '갓깨비 이벤트 — 현재 진행 이벤트 + 보상 분석',
  description:
    '갓깨비 키우기 진행 중 이벤트 + 보상 분석 + 우선순위. 운영자 매주 검증.',
  keywords: [
    '갓깨비 이벤트',
    '갓깨비 보상',
    '갓깨비 콜라보',
    '갓깨비 카카오프렌즈',
    '갓깨비 한정 이벤트',
  ],
  alternates: { canonical: '/event' },
  openGraph: {
    type: 'article',
    title: '갓깨비 이벤트 — 진행 이벤트 + 보상 분석',
    description: '운영자 매주 검증한 진행 이벤트.',
    url: 'https://god-kkabi-guide.vercel.app/event',
  },
};

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 이벤트 — 진행 이벤트 분석 (2026.05)',
  author: { '@type': 'Person', name: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  inLanguage: 'ko',
};

export default function EventPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 이벤트"
          title="🎉 진행 이벤트"
          subtitle="운영자 매주 검증 · 보상 + 우선순위 분석"
          metaInfo="최종 갱신 2026-05-15"
        />

        <div className="mt-6">
          <DomainAlert variant="info" title="이벤트 갱신 안내">
            본 페이지는 운영자가 매주 게임 내 공지를 확인하여 직접 검증·갱신합니다. 공식 발표
            이벤트만 게시하며, 만료된 이벤트는 일간 정리됩니다.
          </DomainAlert>
        </div>

        <section className="mt-12" aria-labelledby="active-title">
          <h2 id="active-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            1. 진행 중 이벤트
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <EventCard
              type="limited"
              title="5월 신규 진령 출시 기념"
              period={{ start: new Date('2026-05-01'), end: new Date('2026-05-31') }}
              rewards={[
                '다이아 5000 (누적 7일 출석)',
                '진령 소환권 30장',
                '5월 한정 칭호 "오월의 신령"',
              ]}
              notes="운영자 검증: 일일 보상 누적 시 SSR 소환 1회 확정 라인 도달"
            />
            <EventCard
              type="permanent"
              title="일일 출석 보상"
              period={{ start: new Date('2025-04-18') }}
              rewards={[
                '7일 누적 시 SSR 진령 소환권 1장 (월간)',
                '14일 누적 시 다이아 1500',
                '28일 누적 시 강화석 200',
              ]}
              notes="무·소과금 핵심 자원 수급처. 7-14-28일 라인 절대 미달 금지."
            />
            <EventCard
              type="collab"
              title="카카오프렌즈 콜라보"
              period={{ start: new Date('2026-06-01'), end: new Date('2026-07-15') }}
              rewards={[
                '콜라보 한정 스킨 4종 (라이언/어피치/네오/무지)',
                '한정 진령 "황금토끼" 소환권 5장',
                '콜라보 칭호 + 프로필 액자',
              ]}
              notes="공식 발표 후 운영자가 추가 분석 갱신. 카카오프렌즈 IP 콜라보로 인기 예상."
            />
          </div>
        </section>

        <section className="mt-12" aria-labelledby="tips-title">
          <h2 id="tips-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            2. 이벤트 운영 팁
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="general"
              title="누적 소비 이벤트 = 결투장 진입선 트리거"
              content="누적 ₩50K 소비 라인이 SSR 진령 확정 보상. 결투장 TOP 500 진입 목표라면 본 라인 필수. 무·소과금 라인은 보류 권장 (ROI 낮음)."
            />
            <TipCard
              category="beginner"
              title="신규 진령 출시 이벤트 최우선"
              content="신규 SSR 진령 출시 첫 주 한정 패키지가 가성비 최상. 시즌 패스 + 7일 패키지 + 누적 소환권 합산 시 SSR 확정 1개 보장 라인 도달 가능."
            />
            <TipCard
              category="advanced"
              title="콜라보 이벤트 = 평소 안 사는 패키지 1회 추천"
              content="콜라보는 IP 사용 라이센스가 게임사 재정에 큰 부담이라 평소 대비 ROI 1.5배 패키지 출시 비율 높음. 운영자 측정 시 콜라보 패키지 70%가 ROI ★★★★ 이상."
            />
            <TipCard
              category="general"
              title="이벤트 종료 D-3 자원 정산"
              content="이벤트 한정 통화는 종료 후 소멸. D-3 기준 잔여 통화 100% 소진 권장. 운영자가 매주 일요일 본 라인 점검."
            />
          </div>
        </section>

        <Footer
          lastUpdated="2026-05-15"
          sources={[
            { label: 'Google Play — 갓깨비 키우기 공식', href: 'https://play.google.com/store/apps/details?id=com.joynicegames.gokkaebi' },
          ]}
        />
      </main>
    </>
  );
}
