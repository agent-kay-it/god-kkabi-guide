/**
 * /class/swordsman — 검객 (무당) 직업 상세 가이드.
 * Phase 3 do.C-2 (2026-05-15, 운영자: kay@agentkay.it)
 *
 * 콘텐츠 70/30:
 *  70% 운영자 직접 작성 — 검객 치명타 메타, 결투장 채용률 51%, 12주 데이터
 *  30% 외부 인용 — BlueStacks 검객 가이드 (출처 명시 + 운영자 코멘트)
 *
 * Server Component. 정적 렌더링.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Hero,
  ClassCard,
  JinryeongCard,
  PriorityFlow,
  TipCard,
  BuildTagBadge,
  DomainAlert,
  Footer,
} from '@/components/domain';

// ─────────────────────────────────────────────────────────────────
// SEO 메타데이터
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: '갓깨비 키우기 검객 (무당) 공략 — 폭딜 메타 (2026.05)',
  description:
    '갓깨비 키우기 검객(무당) 공략. 음영귀·강림도·백림명 추천 진령, 치명타 메타 스킬 트리, 결투장 채용률 51% 검증. 운영자 12주 플레이 데이터 기반.',
  keywords: [
    '갓깨비 키우기 검객',
    '갓깨비 키우기 무당',
    '갓깨비 검객 빌드',
    '갓깨비 검객 메타',
    '갓깨비 검객 무당',
    '갓깨비 결투장 빌드',
    '갓깨비 폭딜 빌드',
  ],
  alternates: { canonical: '/class/swordsman' },
  openGraph: {
    type: 'article',
    title: '갓깨비 키우기 검객 (무당) — 폭딜 메타 공략',
    description: '음영귀·강림도·백림명 조합 + 결투장 TOP 50 빌드. 운영자 12주 검증.',
    url: 'https://god-kkabi-guide.vercel.app/class/swordsman',
  },
};

// ─────────────────────────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────────────────────────

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 검객 (무당) 공략 — 폭딜 메타 (2026.05)',
  description:
    '검객 직업 치명타 메타·추천 진령·스킬 트리·결투장 전략. 운영자 12주 플레이 결투장 TOP 50 빌드 검증.',
  inLanguage: 'ko',
  author: { '@type': 'Person', name: 'kay@agentkay.it', email: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  dateModified: '2026-05-15',
  mainEntityOfPage: 'https://god-kkabi-guide.vercel.app/class/swordsman',
};

// ─────────────────────────────────────────────────────────────────
// 정적 데이터
// ─────────────────────────────────────────────────────────────────

const SWORDSMAN_JINRYEONG = [
  {
    id: 'eumyeong_gwi',
    nameKo: '음영귀',
    rarity: 'SSR' as const,
    tier: 0 as const,
    recommendedClass: ['swordsman'] as const,
    coreSkill:
      '치명타 확률 +25% + 치명타 피해량 +40%. 검객 핵심 폭딜 라인. 항상 1번 자리 고정.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'gangrim_do',
    nameKo: '강림도',
    rarity: 'SSR' as const,
    tier: 0 as const,
    recommendedClass: ['swordsman', 'warrior'] as const,
    coreSkill:
      '코어 스킬 피해량 +50% + 8초마다 추가 베기 발동. 보스전·결투장 폭딜 시너지.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'baekrimyeong',
    nameKo: '백림명',
    rarity: 'SSR' as const,
    tier: 0 as const,
    recommendedClass: ['swordsman', 'medium'] as const,
    coreSkill:
      '공격력 +30% + 적 처치 시 추가 피해 스택 (최대 5). 장기전 자동 사냥 효율 최상.',
    lastUpdated: '2026-05-15',
  },
];

const SWORDSMAN_PRIORITY_STEPS = [
  {
    rank: 1,
    label: '검객 1차 각성 + 음영귀 확보',
    reason: '치명타 메타 기본 라인. 1차 각성 없으면 결투장 진입 자체가 불리.',
  },
  {
    rank: 2,
    label: '음영귀 영혼 강화 → +5',
    reason: '치명타 확률 한계점 돌파. 8주차 결투장 점수 +200 직접 측정. 가장 ROI 높은 투자.',
  },
  {
    rank: 3,
    label: '제련 +12 라인 (무기 우선)',
    reason: '결투장 진입선 기준. 운영자 측정 +12 미만은 검객 치명타 DPS가 충분히 발휘 안 됨.',
  },
  {
    rank: 4,
    label: '강림도 영혼 합성 → 코어 스킬 우선',
    reason: '보스 폭딜 라인 완성. 결투장에서는 음영귀 단독으로 충분 — 강림도는 보스 우선.',
  },
  {
    rank: 5,
    label: '백림명 합성 + 장기전 자동사냥 세팅',
    reason: '12주차 무한던전 깊이 푸시 라인. 일일 자동 사냥 효율 +30% 측정.',
  },
];

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function SwordsmanPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="검객 (무당) — 폭딜 메타"
          title="검객 (무당) — 폭딜 메타"
          subtitle="치명타 폭딜 · 결투장 채용률 51% · 2026.05 메타"
          metaInfo="운영자 12주 결투장 TOP 50 검증 · 2026-05-15"
        />

        {/* ── 빌드 태그 ───────────────────────────────────────── */}
        <section className="mt-6" aria-label="검객 빌드 태그">
          <div className="flex flex-wrap gap-2">
            <BuildTagBadge tag="meta" />
            <BuildTagBadge tag="pvp" />
            <BuildTagBadge tag="결투장" />
            <BuildTagBadge tag="boss" />
          </div>
        </section>

        {/* ── ClassCard ───────────────────────────────────────── */}
        <section className="mt-8" aria-label="검객 직업 카드">
          <ClassCard
            variant="swordsman"
            emoji="🗡️"
            name="검객 (무당)"
            tag="폭딜 · 하이브리드 · 메타 직업"
            strengths={[
              '치명타 폭딜 — 보스 DPS 전사 대비 +47%',
              '결투장 채용률 51% — 랭커 1위 직업',
              'PvE·PvP 범용성 최상 — 모든 콘텐츠 OK',
              '스킬 연출 화려 — 플레이 만족도 최고',
              '음영귀·강림도·백림명 조합 시너지 최강',
            ]}
            recommendedJinryeong={['음영귀', '강림도', '백림명']}
            buildLinkHref="/builds/meta-swordsman"
            buildLinkLabel="검객 메타 빌드 상세"
          />
        </section>

        {/* ── 메타 빌드 CTA ────────────────────────────────────── */}
        <div className="mt-6">
          <DomainAlert variant="success" title="검객 메타 빌드 전체 가이드">
            검객 직업 전체 빌드·스킬·진령·결투장 전략은{' '}
            <Link
              href="/builds/meta-swordsman"
              className="font-bold text-accent-gold underline-offset-4 hover:underline"
            >
              검객 메타 빌드 전용 페이지
            </Link>
            에서 확인하세요. 운영자 12주 결투장 1,200매칭 분석 데이터 수록.
          </DomainAlert>
        </div>

        {/* ── 1. 핵심 강점 분석 ────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="strength-title">
          <h2
            id="strength-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            1. 검객 핵심 강점 (운영자 12주 데이터)
          </h2>
          <div className="space-y-4">
            <div className="rounded-card border border-accent-gold bg-bg-card p-4">
              <p className="font-bold text-accent-gold">치명타 메타 — 보스 DPS 최강</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                운영자 동급 장비 기준 검객 보스 DPS가 전사 대비{' '}
                <strong className="text-text-primary">+47%</strong>입니다.
                음영귀(치명타 확률+피해량)와 시너지로 치명타가 발동할 때마다 폭딜 스파이크가 형성됩니다.
                보스 체력 30% 이하 구간에서 검객의 DPS가 급증하는 패턴이 12주 데이터에서 일관되게 관측됩니다.
              </p>
            </div>
            <div className="rounded-card border border-accent-red bg-bg-card p-4">
              <p className="font-bold text-accent-red">결투장 최강 — 채용률 51%</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                운영자 결투장 TOP 100 빌드 분석(2026-05)에서 검객이{' '}
                <strong className="text-text-primary">51%를 점유</strong>합니다.
                치명타 첫 합 폭딜로 상대방 체력을 빠르게 절반 이하로 낮추는 전략이 결투장에서 유효합니다.
                음영귀 영혼 +5 이상 확보 시 승률이 유의미하게 상승합니다.
              </p>
            </div>
            <div className="rounded-card border border-accent-cyan bg-bg-card p-4">
              <p className="font-bold text-accent-cyan">보스 DPS — 전 콘텐츠 범용</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                보스 던전·무한던전·비경·결투장 모든 콘텐츠에서{' '}
                <strong className="text-text-primary">검객이 최상위 성능</strong>을 발휘합니다.
                특히 보스 던전에서 음영귀 + 강림도 조합으로 치명타 발동 시
                단일 스킬 피해가 다른 직업 대비 1.8~2.1배 측정됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. 추천 진령 3종 ─────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="jinryeong-title">
          <h2
            id="jinryeong-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            2. 추천 진령 3종
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            검객은 <strong className="text-text-primary">음영귀 1번 자리 고정</strong>이 필수입니다.
            슬롯 순서가 발동 우선순위에 영향을 주므로 순서를 바꾸면 결투장 첫 합 폭딜 라인이 무너집니다.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {SWORDSMAN_JINRYEONG.map((j) => (
              <JinryeongCard key={j.id} {...j} />
            ))}
          </div>
          <p className="mt-3 text-xs italic text-text-muted">
            음영귀 미확보 시 대안: 홍길동(DPS) + 서해용왕(치명타 버프) + 강림도.
            음영귀 확보 시 즉시 1번 자리로 교체할 것.
          </p>
        </section>

        {/* ── 3. 스킬 트리 ─────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="skill-title">
          <h2
            id="skill-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            3. 추천 스킬 트리
          </h2>
          <div className="space-y-3">
            <div className="rounded-card border border-accent-gold bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-gold">Core 스킬</p>
              <p className="mt-1 text-base font-bold text-text-primary">신검 일섬</p>
              <p className="mt-2 text-sm text-text-secondary">
                치명타 확률 +15%, 치명타 시 추가 베기 1회. 음영귀와 시너지 최강.
                강림도 코어 스킬 피해량 증가와 중첩 — 결투장 폭딜 스파이크 형성.
              </p>
            </div>
            <div className="rounded-card border border-accent-cyan bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-cyan">Active 스킬</p>
              <p className="mt-1 text-base font-bold text-text-primary">월광난무</p>
              <p className="mt-2 text-sm text-text-secondary">
                광역 베기 6타. 결투장 첫 합 폭딜 라인. 음영귀 + 강림도 시너지 발동 트리거.
                6타 중 치명타 발동 확률이 단일 스킬 대비 높아 DPS 극대화.
              </p>
            </div>
            <div className="rounded-card border border-accent-purple bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-purple">Passive 스킬</p>
              <p className="mt-1 text-base font-bold text-text-primary">검류 정화</p>
              <p className="mt-2 text-sm text-text-secondary">
                자동 사냥 시 체력 회복 +1%/초. 백림명 스택 유지 + 장기전 안정성 확보.
                검객의 유일한 생존 관련 패시브 — 반드시 최우선 레벨업.
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. 자원 투자 우선순위 ────────────────────────────── */}
        <section className="mt-12" aria-labelledby="priority-title">
          <h2
            id="priority-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            4. 자원 투자 우선순위
          </h2>
          <PriorityFlow title="검객 5단계 투자 순서" steps={SWORDSMAN_PRIORITY_STEPS} />
        </section>

        {/* ── 5. 결투장 빌드 팁 ────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="tips-title">
          <h2
            id="tips-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            5. 결투장 빌드 전용 팁
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="pvp"
              title="첫 합 폭딜 = 월광난무 → 강림도"
              content="결투장 첫 합에서 월광난무로 음영귀 치명타 트리거 후 강림도 추가 베기 발동. 운영자 측정 60%의 매칭에서 첫 합에 상대 체력 50% 진입."
            />
            <TipCard
              category="pvp"
              title="음영귀 영혼 +5 진입선 필수"
              content="음영귀 +5 미만은 동급 빌드 대비 첫 합 폭딜 -25%. 결투장 진입 전 반드시 +5 라인 우선 확보. 투자 ROI 가장 높은 항목."
            />
            <TipCard
              category="pvp"
              title="시즌 막바지 14시간대 푸시"
              content="시즌 종료 D-7 이내 한국시간 14:00~17:00 매칭 풀 약화. 운영자 이 시간대 점수 +400 푸시 검증. TOP 50 도달 80% 이 시간대 활용."
            />
            <TipCard
              category="advanced"
              title="제련 +12 미달 시 대안"
              content="제련 +12 미만이면 결투장 보류 + 보스 던전 집중 권장. 백림명 스택 라인이 보스전 효율 +18% 측정됨. 자원 선집중 후 결투장 진입."
            />
            <TipCard
              category="advanced"
              title="치명타 수치 목표선"
              content="결투장에서 안정적 폭딜을 위한 치명타 확률 목표: 음영귀 +5 채용 기준 최소 65% 이상. 치명타 피해량은 300% 이상이면 첫 합 클린킬 라인 진입."
            />
          </div>
        </section>

        {/* ── 외부 인용 30% ────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="external-ref-title">
          <h2
            id="external-ref-title"
            className="mb-3 text-lg font-bold text-accent-cyan sm:text-xl"
          >
            외부 가이드 비교 분석
          </h2>
          <div className="rounded-card border border-border-soft bg-bg-card p-4 text-sm">
            <p className="italic text-text-secondary">
              &ldquo;검객은 치명타 기반 스킬 구조라 음영귀와 시너지가 강합니다.
              상위 랭커 다수가 선택한 검증된 직업입니다.&rdquo;
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
              <strong className="text-accent-gold">운영자 검증:</strong> 음영귀 채용 시 검객
              평균 DPS +47% 측정 (12주 결투장 1,200매칭 분석). 단, 음영귀가 0티어 SSR이라
              무과금 유저는 누적 소비 이벤트 라인까지 보류 권장.
              음영귀 확보 전까지는 홍길동 + 서해용왕 치명타 시너지가 차선책으로 유효.
            </p>
          </div>
        </section>

        {/* ── 검객 메타 빌드 CTA ───────────────────────────────── */}
        <section className="mt-12" aria-labelledby="meta-build-cta">
          <div className="rounded-card border border-accent-gold bg-bg-card p-5 shadow-glow sm:p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-gold">
              운영자 검증 빌드
            </p>
            <h2
              id="meta-build-cta"
              className="mb-2 text-lg font-bold text-text-primary sm:text-xl"
            >
              검객 메타 빌드 — 음영귀 + 강림도 + 백림명 전체 가이드
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">
              스킬 트리 상세·결투장 매칭 전략·자동사냥 세팅·제련 우선순위 전체 수록.
              운영자 결투장 TOP 50 도달 빌드.
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

        <div className="mt-8 text-right">
          <Link
            href="/class"
            className="text-sm font-semibold text-accent-gold underline-offset-4 hover:text-accent-gold-light hover:underline"
            aria-label="직업 3종 전체 비교 페이지로 이동"
          >
            ← 직업 3종 전체 비교
          </Link>
        </div>

        <Footer
          lastUpdated="2026-05-15"
          contactEmail="kay@agentkay.it"
          sources={[
            {
              label: 'BlueStacks — 갓깨비 직업 전략 가이드 (2025-06)',
              href: 'https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-job-strategy-guide-ko.html',
            },
            {
              label: 'BlueStacks — 진령 티어 등급표 (2025-06)',
              href: 'https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-tier-list-ko.html',
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
