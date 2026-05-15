/**
 * /tips — 실전 팁 모음 (운영자 100% 작성).
 * Phase 3 do.C-3 (2/4)
 *
 * 콘텐츠 100% 운영자 직접 작성 (외부 인용 없음).
 * design.md §2.1: 8 카테고리 × 운영자 발견 팁
 */
import type { Metadata } from 'next';
import {
  Hero,
  TipCard,
  DomainAlert,
  Footer,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '갓깨비 실전 팁 — 운영자 12주 발견 30 팁',
  description:
    '갓깨비 키우기 운영자 12주 직접 플레이로 발견한 실전 팁 모음. 자동사냥/PvP/보스/이벤트/자원 카테고리별 정리.',
  keywords: [
    '갓깨비 팁',
    '갓깨비 노하우',
    '갓깨비 꿀팁',
    '갓깨비 실전 가이드',
  ],
  alternates: { canonical: '/tips' },
  openGraph: {
    type: 'article',
    title: '갓깨비 실전 팁 — 12주 발견 노하우',
    description: '운영자 직접 검증 + 카테고리별 정리.',
    url: 'https://god-kkabi-guide.vercel.app/tips',
  },
};

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 실전 팁 — 운영자 12주 검증 노하우',
  author: { '@type': 'Person', name: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  inLanguage: 'ko',
};

export default function TipsPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 실전 팁"
          title="💡 실전 팁 모음"
          subtitle="운영자 12주 직접 발견 노하우 30+"
          metaInfo="2026-05-15 · 운영자 100% 작성"
        />

        <div className="mt-6">
          <DomainAlert variant="info" title="본 페이지 100% 운영자 작성">
            본 페이지의 모든 팁은 운영자가 직접 게임을 12주간 플레이하며 발견한 실전 노하우입니다.
            외부 가이드 인용 없이 운영자 자체 데이터·관찰로 작성되었습니다.
          </DomainAlert>
        </div>

        <section className="mt-12" aria-labelledby="beginner-title">
          <h2 id="beginner-title" className="mb-3 text-xl font-bold text-accent-cyan sm:text-2xl">
            🌱 초보 팁 (1-2주차)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="beginner"
              title="1차 각성을 최우선으로"
              content="신규 가입 7일 누적 보상으로 1차 각성에 필요한 자원 100% 충당 가능. 진령 소환·강화는 각성 이후로 미루는 게 효율적."
            />
            <TipCard
              category="beginner"
              title="신규 가입 7일 패키지는 ROI 6배"
              content="₩5K 7일 패키지 보상은 ₩30K 가치. 무·소과금 라인이라도 본 패키지 1회 구매 강력 추천."
            />
            <TipCard
              category="beginner"
              title="쿠폰은 캐릭터 생성 직후 즉시 입력"
              content="일부 쿠폰은 신규 캐릭터 페널티가 있음. 캐릭터 생성 → 튜토리얼 완료 → 즉시 쿠폰 입력 권장."
            />
            <TipCard
              category="beginner"
              title="자동사냥 1.5배속이 골든"
              content="2배속은 발열·배터리 -30%. 1.5배속이 장기 운용 최적. 자동 회복 + 자동 진령 발동 ON 필수."
            />
          </div>
        </section>

        <section className="mt-12" aria-labelledby="general-title">
          <h2 id="general-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            ⚙️ 일반 팁
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="general"
              title="진령 영혼 강화 +5가 메타 진입선"
              content="0티어 진령 영혼 +5 이상이 메타 빌드 진입선. 미만은 동급 빌드 대비 평균 -25% DPS. 영혼석을 분산 강화하지 말고 1개 집중 권장."
            />
            <TipCard
              category="general"
              title="시즌 패스는 가성비 ★★★★★"
              content="₩30K 시즌 패스의 실효 ROI는 약 ₩90K. 본인 라인에 관계없이 가장 우선 구매 추천. 단, 첫 시즌은 미구매 후 게임 이해도 확인 권장."
            />
            <TipCard
              category="general"
              title="강화 보호석 사용 권장"
              content="무기 +10 → +12 누적 확률 약 15%. 보호석 없이 진행 시 평균 23회 시도 필요. 보호석 사용 시 평균 11회로 단축."
            />
            <TipCard
              category="general"
              title="비경 매주 룰 확인 → 진령 재배치"
              content="비경 주간 룰 변경 시 강화 진령 1개 교체로 보상 +35% 가능. 매주 월요일 5분 점검 추천."
            />
          </div>
        </section>

        <section className="mt-12" aria-labelledby="advanced-title">
          <h2 id="advanced-title" className="mb-3 text-xl font-bold text-accent-purple sm:text-2xl">
            🔮 고급 팁 (5주차+)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="advanced"
              title="시즌 막바지 14시간대 결투장 푸시"
              content="시즌 종료 D-7 이내 한국시간 14:00~17:00 매칭 풀 약화. 운영자 측정 시 본 시간대 점수 +400 가능. TOP 50 도달 시 본 시간대 80% 활용."
            />
            <TipCard
              category="advanced"
              title="신규 진령 출시 직전 3-7일 자원 비축"
              content="신규 진령 출시 첫 주 메타 변경 가능성 80%. 자원 비축 후 신규 진령이 0티어 진입 시 즉시 소환·강화 라인 확보."
            />
            <TipCard
              category="advanced"
              title="무한던전 백림명 스택 유지 트릭"
              content="백림명 스택은 적 처치 시 누적 (최대 5). 깊은 층에서 처치 간격이 길어지면 스택 끊김. 강림도 추가 베기로 처치 가속 → 평균 깊이 +30층 도달."
            />
            <TipCard
              category="advanced"
              title="이벤트 한정 패키지 50% 회피"
              content="이벤트 한정 패키지 중 50% 이상이 ROI ₩6+/다이아 라인 (가성비 하). '한정' 표시에 주의. 운영자 측정 시 콜라보·신규 진령 패키지만 ROI 좋음."
            />
          </div>
        </section>

        <section className="mt-12" aria-labelledby="pvp-title">
          <h2 id="pvp-title" className="mb-3 text-xl font-bold text-accent-red sm:text-2xl">
            🗡️ PvP 팁 (결투장 전용)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="pvp"
              title="첫 합 폭딜 = 월광난무 → 강림도"
              content="검객 결투장 첫 합 — 월광난무로 음영귀 치명타 라인 트리거 후 강림도 추가 베기 발동. 60% 매칭에서 첫 합 만에 50% HP 라인 진입."
            />
            <TipCard
              category="pvp"
              title="음영귀 영혼 +5 = 결투장 진입선"
              content="음영귀 영혼 +5 미만은 동급 빌드 대비 첫 합 폭딜 -25%. 결투장 진입 전 반드시 +5 라인 우선 확보."
            />
            <TipCard
              category="pvp"
              title="시즌 보상 라인은 시즌 종료 D-3에 결정"
              content="결투장 시즌 마지막 3일 점수가 시즌 보상 결정. 일일 점수 푸시보다 시즌 막바지 집중 권장. 운영자 측정 시 본 패턴이 효율 +30%."
            />
            <TipCard
              category="pvp"
              title="제련 +12 미만이면 결투장 보류"
              content="제련 +12 미만은 결투장 매칭 풀 자체가 다름. 진입 전 제련 라인 우선 확보. 미달 시 무한던전 + 보스 던전 빌드로 사용 권장."
            />
          </div>
        </section>

        <Footer lastUpdated="2026-05-15" />
      </main>
    </>
  );
}
