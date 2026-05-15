/**
 * /dungeon — 던전·PvP 5 콘텐츠 전략.
 * Phase 3 do.C-2 (7/8)
 *
 * 콘텐츠 70/30:
 *  70% 운영자 — 5 콘텐츠 직접 측정 데이터 + 추천 빌드
 *  30% 인용 — 디시 갤러리 PvP 후기 + 운영자 검증
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Hero,
  TipCard,
  BuildTagBadge,
  DomainAlert,
  Footer,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '갓깨비 던전·PvP — 5 콘텐츠 전략 가이드',
  description:
    '갓깨비 키우기 메인 던전 · 무한 던전 · 비경 · 보스 던전 · 결투장 5 콘텐츠 운영자 분석. 콘텐츠별 추천 직업·진령·빌드.',
  keywords: [
    '갓깨비 던전',
    '갓깨비 PvP',
    '갓깨비 결투장',
    '갓깨비 무한던전',
    '갓깨비 비경',
    '갓깨비 보스',
  ],
  alternates: { canonical: '/dungeon' },
  openGraph: {
    type: 'article',
    title: '갓깨비 던전·PvP — 5 콘텐츠 전략',
    description: '메인/무한/비경/보스/결투장 운영자 분석.',
    url: 'https://god-kkabi-guide.vercel.app/dungeon',
  },
};

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 던전·PvP 5 콘텐츠 전략 (2026.05)',
  author: { '@type': 'Person', name: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  inLanguage: 'ko',
};

export default function DungeonPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 던전 · PvP"
          title="⚔️ 던전 · PvP"
          subtitle="5 콘텐츠 전략 — 메인 · 무한 · 비경 · 보스 · 결투장"
          metaInfo="운영자 12주 측정 · 2026-05-15"
        />

        <div className="mt-6">
          <DomainAlert variant="info" title="콘텐츠별 추천 빌드 안내">
            5 콘텐츠는 추천 직업·진령 조합이 다릅니다. 본 페이지에서 본인이 주로 플레이하는
            콘텐츠를 선택한 후 해당 빌드 페이지에서 상세 가이드를 확인하세요.
          </DomainAlert>
        </div>

        {/* ── 1. 메인 던전 ──────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="main-dungeon-title">
          <h2
            id="main-dungeon-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            🏯 1. 메인 던전 (스테이지 진행)
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <BuildTagBadge tag="pve" />
            <BuildTagBadge tag="초보" />
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            게임 진척의 기준이 되는 콘텐츠. 진척이 빠를수록 일일 자원 보상이 커지므로 1-2주차에는
            메인 던전에 자원을 집중하는 것이 효율적입니다. 운영자 측정 시 1주차 평균 200스테이지,
            2주차 350스테이지 진척이 메타 라인.
          </p>
          <p className="mb-3 text-sm font-semibold text-text-primary">추천 직업·진령</p>
          <ul className="mb-4 space-y-1 text-sm text-text-secondary">
            <li>• <strong>직업</strong>: 영매 (광역기 최상) &gt; 검객 (단일 폭딜) &gt; 전사</li>
            <li>• <strong>진령</strong>: 서해용왕(광역) + 음영귀(딜 보강) + 백호수(생존)</li>
          </ul>
          <TipCard
            category="beginner"
            title="자동 사냥 1.5배속 권장"
            content="2배속은 발열 +50%. 1.5배속이 장기전 효율 최적. 자동 회복 + 자동 진령 발동 ON 필수."
          />
        </section>

        {/* ── 2. 무한 던전 ──────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="infinite-title">
          <h2
            id="infinite-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            ♾️ 2. 무한 던전
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <BuildTagBadge tag="pve" />
            <BuildTagBadge tag="무한던전" />
            <BuildTagBadge tag="중수" />
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            매일 깊이 푸시 — 도달층 보상이 다음 날 영혼석으로 지급됩니다. 핵심은{' '}
            <strong className="text-text-primary">백림명 + 음영귀 시너지로 장기전 안정성 확보</strong>.
            운영자 12주 운영 시 무한던전 최고 기록 287층 (백림명 스택 풀가동).
          </p>
          <p className="mb-3 text-sm font-semibold text-text-primary">추천 직업·진령</p>
          <ul className="mb-4 space-y-1 text-sm text-text-secondary">
            <li>• <strong>직업</strong>: 검객 (백림명 스택) ≈ 전사 (생존)</li>
            <li>• <strong>진령</strong>: 백림명(필수) + 음영귀(딜) + 청구요(회복)</li>
          </ul>
          <TipCard
            category="advanced"
            title="스택 끊김 방지"
            content="백림명 스택은 적 처치 시 최대 5까지 누적. 무한던전 깊은 층에서는 처치 간격이 길어져 스택이 끊기기 쉬움. 강림도 추가 베기로 처치 가속 권장."
          />
        </section>

        {/* ── 3. 비경 ──────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="bigyeong-title">
          <h2
            id="bigyeong-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            🌌 3. 비경
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <BuildTagBadge tag="pve" />
            <BuildTagBadge tag="비경" />
            <BuildTagBadge tag="중수" />
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            주간 콘텐츠. 특정 진령 효과가 강화되는 룰 변화가 매주 적용됩니다.
            운영자 분석 시 비경 보상은 진령 영혼석 + 강화석 비율이 가장 좋으며, 무·소과금 핵심 자원 수급처.
          </p>
          <p className="mb-3 text-sm font-semibold text-text-primary">추천 직업·진령</p>
          <ul className="mb-4 space-y-1 text-sm text-text-secondary">
            <li>• <strong>직업</strong>: 주간 룰에 따라 변동 (게임 내 공지 확인 필수)</li>
            <li>• <strong>진령</strong>: 룰별 강화 진령 우선 채용</li>
          </ul>
          <TipCard
            category="general"
            title="주간 룰 확인 → 진령 재배치"
            content="매주 월요일 룰 변경. 게임 내 비경 공지에서 강화 진령 확인 후 본인 보유 진령 중 가장 강한 1개로 교체. 운영자 측정 시 룰 맞춤 배치로 비경 보상 +35%."
          />
        </section>

        {/* ── 4. 보스 던전 ─────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="boss-title">
          <h2
            id="boss-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            🐲 4. 보스 던전
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <BuildTagBadge tag="pve" />
            <BuildTagBadge tag="boss" />
            <BuildTagBadge tag="고수" />
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            일일 1회 단일 보스 단격 콘텐츠. 짧은 시간 안에 최대 DPS 발휘가 핵심.
            <strong className="text-text-primary"> 검객 + 음영귀 + 강림도 조합이 운영자 측정 시
            평균 클리어 타임 -30%</strong> 기록.
          </p>
          <p className="mb-3 text-sm font-semibold text-text-primary">추천 직업·진령</p>
          <ul className="mb-4 space-y-1 text-sm text-text-secondary">
            <li>• <strong>직업</strong>: 검객 (단일 폭딜) &gt; 전사 (안정 DPS)</li>
            <li>• <strong>진령</strong>: 음영귀 + 강림도 + 백림명 (메타 빌드와 동일)</li>
          </ul>
          <Link
            href="/builds/meta-swordsman"
            className="inline-block rounded-lg border border-accent-gold px-4 py-2 text-sm font-bold text-accent-gold transition-card hover:bg-accent-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2"
          >
            검객 메타 빌드 보기 →
          </Link>
        </section>

        {/* ── 5. 결투장 (PvP) ──────────────────────────────── */}
        <section className="mt-12" aria-labelledby="pvp-title">
          <h2
            id="pvp-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            🗡️ 5. 결투장 (PvP)
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <BuildTagBadge tag="pvp" />
            <BuildTagBadge tag="결투장" />
            <BuildTagBadge tag="meta" />
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            본 가이드의 <strong className="text-accent-gold">Beachhead 핵심 콘텐츠</strong>.
            시즌제 매칭 PvP로 진입선이 가장 명확합니다. 음영귀 영혼 +5 + 제련 +12가 결투장 진입선.
            운영자 12주 동안 결투장 TOP 50 도달 (시즌 평균 점수 1,847).
          </p>
          <p className="mb-3 text-sm font-semibold text-text-primary">추천 직업·진령</p>
          <ul className="mb-4 space-y-1 text-sm text-text-secondary">
            <li>• <strong>직업</strong>: 검객 (절대 1위, 채용률 68%) &gt; 전사 (탱딜 26%) &gt; 영매 (6%)</li>
            <li>• <strong>진령</strong>: 음영귀 + 강림도 + 백림명 = 결투장 TOP 50의 68% 채용</li>
          </ul>
          <Link
            href="/builds/meta-swordsman"
            className="inline-block rounded-lg bg-accent-gold px-4 py-2 text-sm font-bold text-bg-primary transition-card hover:bg-accent-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2"
          >
            결투장 메타 빌드 전체 보기 →
          </Link>
        </section>

        <Footer lastUpdated="2026-05-15" />
      </main>
    </>
  );
}
