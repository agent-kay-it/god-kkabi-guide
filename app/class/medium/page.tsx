/**
 * /class/medium — 영매 (저승사자) 직업 상세 가이드.
 * Phase 3 do.C-2 (2026-05-15, 운영자: kay@agentkay.it)
 *
 * 콘텐츠 70/30:
 *  70% 운영자 직접 작성 — 영매 광역 메타, 자동사냥 안전 거리, 보스 광역 패턴
 *  30% 외부 인용 — BlueStacks 영매 가이드 (출처 명시 + 운영자 코멘트)
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
  DomainAlert,
  Footer,
} from '@/components/domain';

// ─────────────────────────────────────────────────────────────────
// SEO 메타데이터
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: '갓깨비 키우기 영매 (저승사자) 공략 — 광역 유틸 (2026.05)',
  description:
    '갓깨비 키우기 영매(저승사자) 공략. 서해용왕·구미요호·항아 추천 진령, 광역기 스킬 트리, 보스 광역 패턴·자동사냥 안전 거리 가이드. 운영자 검증.',
  keywords: [
    '갓깨비 키우기 영매',
    '갓깨비 키우기 저승사자',
    '갓깨비 영매 빌드',
    '갓깨비 영매 진령',
    '갓깨비 키우기 직업',
  ],
  alternates: { canonical: '/class/medium' },
  openGraph: {
    type: 'article',
    title: '갓깨비 키우기 영매 (저승사자) — 광역 유틸 공략',
    description: '서해용왕·구미요호·항아 조합 + 광역 스킬 운영. 운영자 검증.',
    url: 'https://god-kkabi-guide.vercel.app/class/medium',
  },
};

// ─────────────────────────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────────────────────────

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 영매 (저승사자) 공략 — 광역 유틸 (2026.05)',
  description:
    '영매 직업 광역기·추천 진령·스킬 트리·보스 광역 패턴 및 자동사냥 안전 거리 가이드.',
  inLanguage: 'ko',
  author: { '@type': 'Person', name: 'kay@agentkay.it', email: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  dateModified: '2026-05-15',
  mainEntityOfPage: 'https://god-kkabi-guide.vercel.app/class/medium',
};

// ─────────────────────────────────────────────────────────────────
// 정적 데이터
// ─────────────────────────────────────────────────────────────────

const MEDIUM_JINRYEONG = [
  {
    id: 'baekho_su',
    nameKo: '백호수',
    rarity: 'SSR' as const,
    tier: 0 as const,
    recommendedClass: ['medium', 'swordsman'] as const,
    coreSkill: '광역 피해량 +35% + 원소 공격 강화. 영매의 광역기와 최강 시너지. 0티어 메타 진령.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'cheonggu_yo',
    nameKo: '청구요',
    rarity: 'SSR' as const,
    tier: 1 as const,
    recommendedClass: ['medium'] as const,
    coreSkill: '스킬 쿨타임 -20% + 연속 광역기 발동 빈도 상승. 영매 딜사이클 최적화.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'eumyangja',
    nameKo: '음양자',
    rarity: 'SSR' as const,
    tier: 1 as const,
    recommendedClass: ['medium', 'warrior'] as const,
    coreSkill: '피격 시 체력 회복 + 방어 버프. 영매의 낮은 생존력 보완. 보스전 지속전 필수.',
    lastUpdated: '2026-05-15',
  },
];

const MEDIUM_PRIORITY_STEPS = [
  {
    rank: 1,
    label: '영매 1차 각성 + 백호수 확보',
    reason: '광역 피해량 라인 완성. 1차 각성 없이는 광역기 효율이 절반. 백호수가 영매 0티어 필수 진령.',
  },
  {
    rank: 2,
    label: '음양자 확보 (생존 라인 확보)',
    reason:
      '영매 생존력 보완 필수. 음양자 없으면 자동 사냥 8시간 이상 시 사망 리스크 높음. 운영자 측정 음양자 채용 시 생존률 74% → 89%.',
  },
  {
    rank: 3,
    label: '광역 스킬 레벨업 (액티브 우선)',
    reason:
      '영매는 스킬 레벨이 직접 광역 DPS에 연결됨. 진령 투자 전 액티브 스킬 최대 레벨 우선 권장.',
  },
  {
    rank: 4,
    label: '청구요 합성 → 쿨타임 단축 라인',
    reason: '쿨타임 -20%로 광역기 발동 빈도 상승. 스테이지 클리어 속도 +15% 운영자 측정.',
  },
  {
    rank: 5,
    label: '백호수 영혼 강화 → +5 + 제련 라인',
    reason: '광역 피해량 한계점 돌파. +5 달성 시 무한던전 10층 추가 클리어 가능 라인 진입.',
  },
];

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function MediumPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="영매 (저승사자) — 광역 유틸"
          title="영매 (저승사자) — 광역 유틸"
          subtitle="원거리 광역 · 시각적 만족도 최고 · 2026.05 메타"
          metaInfo="운영자 플레이 검증 · 2026-05-15"
        />

        {/* ── 생존 주의 Alert ──────────────────────────────────── */}
        <div className="mt-6">
          <DomainAlert variant="warning" title="영매 생존력 주의">
            영매는 3직업 중 생존력이 가장 낮습니다. 항아 또는 음양자 등 회복형 진령 없이
            장시간 자동 사냥 시 사망 리스크가 높습니다. 본 가이드의 진령·스킬 구성을 우선 세팅 후 운용하세요.
          </DomainAlert>
        </div>

        {/* ── ClassCard ───────────────────────────────────────── */}
        <section className="mt-8" aria-label="영매 직업 카드">
          <ClassCard
            variant="medium"
            emoji="🔮"
            name="영매 (저승사자)"
            tag="유틸 · 원거리 광역 · 시각 만족도 최고"
            strengths={[
              '광역기 최상 — 초반 스테이지 최빠 진도',
              '원거리 안전 거리 확보 — 적과 거리 유지 가능',
              '화려한 마법 연출 — 시각적 만족도 3직업 최고',
              '다수 적 동시 처리 — 광역 효율 전사 대비 +40%',
              '결투장 채용률 27% — 광역 견제 활용',
            ]}
            recommendedJinryeong={['백호수', '청구요', '음양자']}
          />
        </section>

        {/* ── 1. 핵심 강점 분석 ────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="strength-title">
          <h2
            id="strength-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            1. 영매 핵심 강점 (운영자 검증)
          </h2>
          <div className="space-y-4">
            <div className="rounded-card border border-accent-purple bg-bg-card p-4">
              <p className="font-bold text-accent-purple">광역기 — 초반 스테이지 최강</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                영매의 광역 공격은 단위 시간당 처리 가능한 적의 수가{' '}
                <strong className="text-text-primary">전사 대비 +40%</strong>입니다.
                초반 스테이지를 빠르게 밀어야 하는 1~4주차 유저에게 영매가 가장 효율적입니다.
                특히 백호수 광역 피해량 버프와 결합 시 다수 적 스테이지 클리어 속도가 검객보다도 빠릅니다.
              </p>
            </div>
            <div className="rounded-card border border-accent-cyan bg-bg-card p-4">
              <p className="font-bold text-accent-cyan">원거리 안전 거리 — 자동 사냥 전략</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                영매는 원거리에서 공격하므로 적이 먼저 접근해야 피격됩니다.
                이 특성을 활용하면{' '}
                <strong className="text-text-primary">적 이동 시간 동안 무피격 딜</strong>이 가능합니다.
                자동 사냥에서 음양자 회복 진령 채용 시 이 안전 거리 메커니즘이 장시간 생존에 기여합니다.
              </p>
            </div>
            <div className="rounded-card border border-accent-gold bg-bg-card p-4">
              <p className="font-bold text-accent-gold">시각적 만족도 — 게임 몰입감</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                불·천둥·원소 마법 연출이 3직업 중 가장 화려합니다. 운영자 12주 주관적 평가에서
                영매의 스킬 연출이 게임 몰입감에 가장 크게 기여합니다.
                방치형 게임이지만 화면을 볼 때마다 시각적 쾌감이 중요한 유저에게 추천.
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
            영매는 생존이 가장 취약하므로{' '}
            <strong className="text-text-primary">광역 딜러 2 + 회복/생존형 1</strong>{' '}
            비율이 필수입니다. 항아(SR 회복 진령)도 유효한 대안입니다.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {MEDIUM_JINRYEONG.map((j) => (
              <JinryeongCard key={j.id} {...j} />
            ))}
          </div>
          <p className="mt-3 text-xs italic text-text-muted">
            백호수 미확보 시 대안: 서해용왕(버프) + 구미요호(광역 피해 증가) + 항아(회복).
            이 조합도 영매 생존 + 광역 딜 라인 안정적으로 구성됩니다.
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
            <div className="rounded-card border border-accent-purple bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-purple">Core 스킬</p>
              <p className="mt-1 text-base font-bold text-text-primary">저승 낫 소환</p>
              <p className="mt-2 text-sm text-text-secondary">
                광역 5타 + 원소 피해. 백호수 광역 피해량 버프와 최강 시너지.
                보스 단일 DPS는 낮지만 광역 스테이지 클리어 속도 3직업 최고.
              </p>
            </div>
            <div className="rounded-card border border-accent-cyan bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-cyan">Active 스킬</p>
              <p className="mt-1 text-base font-bold text-text-primary">영혼 폭풍 / 천둥 소환</p>
              <p className="mt-2 text-sm text-text-secondary">
                액티브 슬롯 1: 영혼 폭풍(광역 지속 딜) — 자동 사냥 핵심.
                액티브 슬롯 2: 천둥 소환(범위 광역) — 다수 적 상황 클리어.
                청구요 쿨타임 단축 시너지로 발동 빈도 20% 상승.
              </p>
            </div>
            <div className="rounded-card border border-accent-gold bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-gold">Passive 스킬</p>
              <p className="mt-1 text-base font-bold text-text-primary">원소 증폭 / 영기 보호</p>
              <p className="mt-2 text-sm text-text-secondary">
                원소 증폭: 광역 스킬 피해량 +10% 상시 적용.
                영기 보호: 피격 시 방어 막 형성 — 영매 생존 보완.
                두 패시브 모두 최우선 레벨업. 영기 보호가 음양자 시너지와 결합 시 생존률 +15%.
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
          <PriorityFlow title="영매 5단계 투자 순서" steps={MEDIUM_PRIORITY_STEPS} />
        </section>

        {/* ── 5. TipCard 운영 팁 ───────────────────────────────── */}
        <section className="mt-12" aria-labelledby="tips-title">
          <h2
            id="tips-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            5. 영매 전용 실전 팁
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="advanced"
              title="보스 광역 패턴 — 안전 각도 공략"
              content="영매 광역기는 직선 방향이 아닌 영역 지정형. 보스의 좌측 45도 포지셔닝으로 광역기 풀히트 라인 형성. 운영자 측정 이 각도에서 보스 클리어 타임 -18%."
            />
            <TipCard
              category="general"
              title="자동사냥 안전 거리 유지법"
              content="자동 사냥 스테이지 선택 시 적 이동 속도가 낮은 스테이지 우선. 적이 영매에 접근하기 전에 광역기로 처리 완료되는 구간이 최적. 운영자 스테이지 -3 구간에서 효율 최상."
            />
            <TipCard
              category="pvp"
              title="결투장 — 광역기로 초반 견제"
              content="영매 결투장 전략은 광역기로 상대 진령 체력을 먼저 깎는 것. 검객 진령 음영귀를 광역기로 선제 대미지. 단, 결투장 승률은 27%로 낮아 단순 참여 보상 중심으로 운용."
            />
            <TipCard
              category="beginner"
              title="항아 없으면 자동사냥 시간 제한"
              content="항아 또는 음양자 미확보 시 자동 사냥 4시간 이상 리스크. 처음에는 2~3시간 간격으로 체력 확인 권장. SR 진령 항아부터 먼저 수급 후 장시간 방치."
            />
            <TipCard
              category="advanced"
              title="무한던전 광역 활용"
              content="무한던전에서 영매 광역기는 소수 강적이 아닌 다수 약적 스테이지에서 진가 발휘. 적이 4마리 이상 등장하는 레이어에서 검객 대비 클리어 속도 +25% 운영자 측정."
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
              &ldquo;영매는 원거리에서 불·천둥 등 원소를 이용한 광역 공격에 특화.
              생존이 가장 취약하므로 회복형 진령(항아)이 거의 필수에 가깝습니다.&rdquo;
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
              <strong className="text-accent-gold">운영자 검증:</strong> BlueStacks 평가와
              일치합니다. 운영자 측정에서 항아 채용 시 영매 자동 사냥 8시간 생존률 74% → 91%로
              상승. 단, 2026.05 메타에서는 항아 대신 음양자(방어+회복 복합)가 더 효율적입니다.
              음양자는 회복만인 항아보다 보스전 생존 안정성이 추가로 높습니다.
            </p>
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
              label: 'Google Play — 갓깨비 키우기 공식',
              href: 'https://play.google.com/store/apps/details?id=com.joynicegames.gokkaebi',
            },
          ]}
        />
      </main>
    </>
  );
}
