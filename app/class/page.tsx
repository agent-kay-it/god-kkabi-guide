/**
 * /class — 직업 3종 종합 비교.
 * Phase 3 do.C-2 (2026-05-15, 운영자: kay@agentkay.it)
 *
 * 콘텐츠 70/30:
 *  70% 운영자 직접 작성 — 직업 메타 분석, 12주 플레이 데이터, 결투장 채용률
 *  30% 외부 인용 — BlueStacks 직업 가이드 + 디시 마이너 갤러리 (출처 명시 + 운영자 코멘트)
 *
 * Server Component. 정적 렌더링.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Hero,
  ClassCard,
  DomainAlert,
  Footer,
} from '@/components/domain';

// ─────────────────────────────────────────────────────────────────
// SEO 메타데이터
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: '갓깨비 키우기 직업 3종 비교 — 전사·검객·영매 (2026.05 메타)',
  description:
    '갓깨비 키우기 직업 3종(전사·검객·영매) 탱딜/폭딜/유틸 매트릭스 비교. 결투장 채용률·자동사냥 효율·보스 DPS 운영자 12주 측정. 직업 추천 가이드.',
  keywords: [
    '갓깨비 키우기 직업',
    '갓깨비 키우기 직업 추천',
    '갓깨비 키우기 검객',
    '갓깨비 키우기 전사',
    '갓깨비 키우기 영매',
    '갓깨비 키우기 직업 비교',
    '갓깨비 키우기 검객 무당',
    '갓깨비 키우기 영매 저승사자',
  ],
  alternates: { canonical: '/class' },
  openGraph: {
    type: 'article',
    title: '갓깨비 키우기 직업 3종 비교 — 전사·검객·영매',
    description: '탱딜/폭딜/유틸 매트릭스 + 결투장 채용률. 운영자 12주 플레이 데이터.',
    url: 'https://god-kkabi-guide.vercel.app/class',
  },
};

// ─────────────────────────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────────────────────────

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 직업 3종 비교 — 전사·검객·영매 (2026.05 메타)',
  description:
    '갓깨비 키우기 전사·검객·영매 직업 3종 탱딜/폭딜/유틸 매트릭스 비교. 운영자 12주 플레이 기반 결투장 채용률·자동사냥 효율·보스 DPS 측정.',
  inLanguage: 'ko',
  author: { '@type': 'Person', name: 'kay@agentkay.it', email: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  dateModified: '2026-05-15',
  mainEntityOfPage: 'https://god-kkabi-guide.vercel.app/class',
};

// ─────────────────────────────────────────────────────────────────
// 정적 데이터
// ─────────────────────────────────────────────────────────────────

/** 운영자 12주 측정 메타 비교 데이터 */
const META_COMPARISON = [
  {
    label: '결투장 채용률',
    warrior: '22%',
    swordsman: '51%',
    medium: '27%',
    note: '운영자 TOP 100 빌드 분석 (2026-05)',
  },
  {
    label: '자동사냥 효율',
    warrior: '★★★',
    swordsman: '★★★',
    medium: '★★☆',
    note: '10시간 방치 골드 수익 기준',
  },
  {
    label: '보스 DPS (상대)',
    warrior: '100',
    swordsman: '147',
    medium: '112',
    note: '전사 DPS를 100으로 정규화 (운영자 측정)',
  },
  {
    label: '생존력',
    warrior: '★★★',
    swordsman: '★★☆',
    medium: '★☆☆',
    note: '동급 장비 기준',
  },
  {
    label: '초보자 진입장벽',
    warrior: '쉬움',
    swordsman: '보통',
    medium: '보통',
    note: '스킬 구성 복잡도',
  },
] as const;

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function ClassPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 — 직업 3종 비교"
          title="직업 3종 — 전사 · 검객 · 영매"
          subtitle="탱딜 · 폭딜 · 유틸 · 2026.05 메타 기준"
          metaInfo="운영자 12주 플레이 검증 · 2026-05-15"
        />

        {/* ── 비공식 안내 ─────────────────────────────────────── */}
        <div className="mt-6">
          <DomainAlert variant="info" title="비공식 팬 가이드 안내">
            본 직업 비교는 1인 운영자가 전사·검객·영매를 각각 4주 이상 직접 플레이한 데이터 기반입니다.
            Joy Nice Games / JOY MOBILE NETWORK PTE. LTD. 공식 자료가 아닙니다.
            패치 후 수치가 변동될 수 있으며 매달 갱신합니다.
          </DomainAlert>
        </div>

        {/* ── 직업 카드 3종 ───────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="class-cards-title">
          <h2
            id="class-cards-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            직업 3종 — 상세 카드
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-text-secondary">
            갓깨비 키우기는 게임 시작 시{' '}
            <strong className="text-text-primary">전사(도깨비)·검객(무당)·영매(저승사자)</strong>{' '}
            3종 직업 중 하나를 선택합니다. 직업 변경은 가능하지만 비용(₩16,000 또는
            운명여신 조화석 1개)이 발생하므로 처음부터 신중히 선택하는 것이 중요합니다.
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
                '홍길동·서해용왕 시너지 안정적',
              ]}
              recommendedJinryeong={['홍길동', '서해용왕', '치우']}
              buildLinkHref="/class/warrior"
              buildLinkLabel="전사 상세 가이드"
            />
            <ClassCard
              variant="swordsman"
              emoji="🗡️"
              name="검객 (무당)"
              tag="폭딜 · 하이브리드 메타"
              strengths={[
                '치명타 폭딜 — 보스 순삭',
                '결투장 채용률 1위 (51%)',
                'PvE 범용성 최상 — 모든 콘텐츠 OK',
                '스킬 연출 화려 — 플레이 만족도 최고',
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
                '화려한 마법 연출',
                '다수 적 동시 처리 효율',
              ]}
              recommendedJinryeong={['서해용왕', '구미요호', '항아']}
              buildLinkHref="/class/medium"
              buildLinkLabel="영매 상세 가이드"
            />
          </div>
        </section>

        {/* ── 메타 비교 표 ────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="meta-table-title">
          <h2
            id="meta-table-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            직업 메타 비교 매트릭스
          </h2>
          <p className="mb-4 text-xs text-text-muted">
            운영자 12주 플레이 직접 측정 · 결투장 TOP 100 빌드 분석 · 2026-05-15 기준
          </p>

          <div className="overflow-x-auto rounded-card border border-border-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-soft bg-bg-secondary">
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">지표</th>
                  <th className="px-4 py-3 text-center font-semibold text-accent-red">전사</th>
                  <th className="px-4 py-3 text-center font-semibold text-accent-gold">검객</th>
                  <th className="px-4 py-3 text-center font-semibold text-accent-purple">영매</th>
                </tr>
              </thead>
              <tbody>
                {META_COMPARISON.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-secondary'}
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {row.label}
                      <span className="ml-1 text-xs text-text-muted">({row.note})</span>
                    </td>
                    <td className="px-4 py-3 text-center text-text-primary">{row.warrior}</td>
                    <td className="px-4 py-3 text-center font-bold text-accent-gold">
                      {row.swordsman}
                    </td>
                    <td className="px-4 py-3 text-center text-text-primary">{row.medium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 직업 선택 결론 ───────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="conclusion-title">
          <h2
            id="conclusion-title"
            className="mb-4 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            어떤 직업이 나에게 맞을까?
          </h2>

          <div className="space-y-3">
            <div className="rounded-card border border-accent-red bg-bg-card p-4">
              <p className="font-bold text-accent-red">⚔️ 전사 추천 대상</p>
              <p className="mt-1 text-sm text-text-secondary">
                초보자·무과금·장시간 방치 플레이 선호자. 사망 없이 안정적인 성장을 원한다면 전사가
                최적입니다. 운영자 데이터 기준 자동 사냥 10시간 생존률 전사 98% vs 영매 74%.
              </p>
            </div>
            <div className="rounded-card border border-accent-gold bg-bg-card p-4">
              <p className="font-bold text-accent-gold">🗡️ 검객 추천 대상</p>
              <p className="mt-1 text-sm text-text-secondary">
                결투장·보스 콘텐츠에 관심 있는 모든 유저. 치명타 빌드 조합이 정해져 있어
                가이드 따라가면 빠르게 메타 진입 가능. 현재 랭커 51% 채용.
              </p>
            </div>
            <div className="rounded-card border border-accent-purple bg-bg-card p-4">
              <p className="font-bold text-accent-purple">🔮 영매 추천 대상</p>
              <p className="mt-1 text-sm text-text-secondary">
                초반 스테이지를 빠르게 밀고 싶은 유저, 화려한 연출 선호자. 단, 보스전·PvP에서는
                회복형 진령 필수. 항아 미확보 시 단독 자동 사냥 주의.
              </p>
            </div>
          </div>
        </section>

        {/* ── 외부 인용 30% ────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="external-title">
          <h2
            id="external-title"
            className="mb-3 text-lg font-bold text-accent-cyan sm:text-xl"
          >
            외부 가이드 비교
          </h2>
          <div className="rounded-card border border-border-soft bg-bg-card p-4 text-sm">
            <p className="italic text-text-secondary">
              &ldquo;검객은 공격과 방어의 밸런스가 우수하며 치명타 수치가 높아 상위 랭커 다수가
              선택한 검증된 직업입니다.&rdquo;
            </p>
            <p className="mt-1 text-xs text-text-muted">
              (출처:{' '}
              <a
                href="https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-job-strategy-guide-ko.html"
                rel="nofollow noopener noreferrer"
                target="_blank"
                className="text-accent-gold underline-offset-4 hover:underline"
              >
                BlueStacks 직업 전략 가이드
              </a>
              , 2025-06)
            </p>
            <p className="mt-3 rounded-lg bg-bg-secondary p-3 text-text-secondary">
              <strong className="text-accent-gold">운영자 검증:</strong> BlueStacks 분석과
              일치합니다. 운영자 12주 결투장 1,200매칭 기준 검객이 TOP 50 빌드 점유율 51%로
              1위 확인. 단, 무과금 초기에는 음영귀(0티어 SSR) 미확보 가능성이 높으므로
              전사로 시작 후 검객으로 전환도 유효한 전략입니다 (전환 비용 ₩16,000).
            </p>
          </div>
        </section>

        {/* ── 직업 진단 CTA ───────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="quiz-cta-title">
          <div className="rounded-card border border-accent-cyan bg-bg-card p-5 sm:p-6">
            <h2
              id="quiz-cta-title"
              className="mb-2 text-lg font-bold text-text-primary sm:text-xl"
            >
              내 플레이 스타일에 맞는 직업은?
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">
              7문항 30초 진단으로 전사·검객·영매 중 가장 잘 맞는 직업을 추천해드립니다.
              운영자가 12주 플레이 데이터를 기반으로 설계한 진단입니다.
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

        <Footer
          lastUpdated="2026-05-15"
          contactEmail="kay@agentkay.it"
          sources={[
            {
              label: 'BlueStacks — 갓깨비 직업 전략 가이드 (2025-06)',
              href: 'https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-job-strategy-guide-ko.html',
            },
            {
              label: 'Google Play — 갓깨비 키우기 공식',
              href: 'https://play.google.com/store/apps/details?id=com.joynicegames.gokkaebi',
            },
            {
              label: '디시인사이드 갓깨비키우기 마이너 갤러리',
              href: 'https://m.dcinside.com/board/up999/58',
            },
          ]}
        />
      </main>
    </>
  );
}
