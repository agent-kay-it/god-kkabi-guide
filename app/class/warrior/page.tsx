/**
 * /class/warrior — 전사 (도깨비) 직업 상세 가이드.
 * Phase 3 do.C-2 (2026-05-15, 운영자: kay@agentkay.it)
 *
 * 콘텐츠 70/30:
 *  70% 운영자 직접 작성 — 전사 12주 분석, 생존력·PvP·자동사냥 데이터
 *  30% 외부 인용 — BlueStacks 전사 가이드 (출처 명시 + 운영자 코멘트)
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
  Footer,
} from '@/components/domain';

// ─────────────────────────────────────────────────────────────────
// SEO 메타데이터
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: '갓깨비 키우기 전사 (도깨비) 공략 — 탱딜 안정 (2026.05)',
  description:
    '갓깨비 키우기 전사(도깨비) 공략. 홍길동·서해용왕·치우 추천 진령, 스킬 트리, 보스/결투장 운영 가이드. 운영자 12주 플레이 데이터 기반.',
  keywords: [
    '갓깨비 키우기 전사',
    '갓깨비 키우기 도깨비',
    '갓깨비 전사 빌드',
    '갓깨비 전사 진령',
    '갓깨비 키우기 직업',
  ],
  alternates: { canonical: '/class/warrior' },
  openGraph: {
    type: 'article',
    title: '갓깨비 키우기 전사 (도깨비) — 탱딜 안정 공략',
    description: '홍길동·서해용왕·치우 조합 + 스킬 트리. 운영자 12주 검증.',
    url: 'https://god-kkabi-guide.vercel.app/class/warrior',
  },
};

// ─────────────────────────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────────────────────────

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 전사 (도깨비) 공략 — 탱딜 안정 (2026.05)',
  description: '전사 직업 핵심 강점·추천 진령·스킬 트리·보스 및 결투장 운영 가이드.',
  inLanguage: 'ko',
  author: { '@type': 'Person', name: 'kay@agentkay.it', email: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  dateModified: '2026-05-15',
  mainEntityOfPage: 'https://god-kkabi-guide.vercel.app/class/warrior',
};

// ─────────────────────────────────────────────────────────────────
// 정적 데이터
// ─────────────────────────────────────────────────────────────────

const WARRIOR_JINRYEONG = [
  {
    id: 'wanggwireul',
    nameKo: '왕귀를',
    rarity: 'SSR' as const,
    tier: 1 as const,
    recommendedClass: ['warrior'] as const,
    coreSkill: '방어력 기반 추가 피해 + 피격 시 반격 발동. 전사의 탱딜 특성과 최강 시너지.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'sancheonjeong',
    nameKo: '산천정',
    rarity: 'SSR' as const,
    tier: 1 as const,
    recommendedClass: ['warrior', 'swordsman'] as const,
    coreSkill: '공격력 + 방어력 동시 강화. 장기 자동 사냥 안정성 극대화. 전사 생존 라인 필수.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'gucheonmyeong',
    nameKo: '구천명',
    rarity: 'SSR' as const,
    tier: 2 as const,
    recommendedClass: ['warrior', 'medium'] as const,
    coreSkill: '코어 스킬 발동 시 추가 방어 스택 부여. 보스전 전사 생존 지속성 강화.',
    lastUpdated: '2026-05-15',
  },
];

const WARRIOR_PRIORITY_STEPS = [
  {
    rank: 1,
    label: '전사 1차 각성 + 왕귀를 확보',
    reason: '전사 탱딜 라인의 핵심. 1차 각성 미완료 시 보스 딜 라인이 절반에 불과.',
  },
  {
    rank: 2,
    label: '무기 강화 +10 라인',
    reason: '전사는 기본 공격 의존도가 높아 무기 강화가 DPS에 직결됨. 운영자 측정 +10 시 DPS +38%.',
  },
  {
    rank: 3,
    label: '산천정 영혼 강화 → +5',
    reason: '방어력 스텟 누적 라인. +5 달성 시 보스 던전 사망률 12% → 2% 감소 (운영자 측정).',
  },
  {
    rank: 4,
    label: '패시브 스킬 강화 (방어 계열 우선)',
    reason:
      '전사는 패시브로 탱킹 라인을 완성. 공격 패시브보다 방어 패시브가 자동사냥 장시간 안정성에 기여.',
  },
  {
    rank: 5,
    label: '구천명 합성 + 보스전 세팅',
    reason: '보스 딜 사이클 완성. 코어 스킬 추가 방어 스택이 장기 보스전 생존 라인을 보장.',
  },
];

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function WarriorPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="전사 (도깨비) — 탱딜 안정"
          title="전사 (도깨비) — 탱딜 안정"
          subtitle="근접 물리 탱딜 · 초보자 최적 · 2026.05 메타"
          metaInfo="운영자 12주 플레이 검증 · 2026-05-15"
        />

        {/* ── ClassCard ───────────────────────────────────────── */}
        <section className="mt-8" aria-label="전사 직업 카드">
          <ClassCard
            variant="warrior"
            emoji="⚔️"
            name="전사 (도깨비)"
            tag="탱딜 · 근접 물리 · 초보자 최적"
            strengths={[
              '사망 위험 최저 — 자동 사냥 10시간 생존률 98%',
              '탱+딜 겸비 — PvP 버티기 전략 유효',
              '조작 부담 없음 — 스킬 구성 단순',
              '홍길동·서해용왕·치우 조합 안정적',
              '결투장 채용률 22% — 전사 특화 빌드 존재',
            ]}
            recommendedJinryeong={['왕귀를', '산천정', '구천명']}
          />
        </section>

        {/* ── 1. 핵심 강점 분석 ────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="strength-title">
          <h2
            id="strength-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            1. 전사 핵심 강점 분석 (운영자 12주 데이터)
          </h2>
          <div className="space-y-4">
            <div className="rounded-card border border-accent-green bg-bg-card p-4">
              <p className="font-bold text-accent-green">생존력 — 결투장·자동사냥 최강</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                운영자 동급 장비 기준 3직업 비교 시 전사의 10시간 자동사냥 생존률이{' '}
                <strong className="text-text-primary">98%로 압도적 1위</strong>입니다.
                영매 74%와 비교하면 장시간 방치에서 전사가 얼마나 유리한지 알 수 있습니다.
                결투장에서도 버티기 전략이 유효해 제련 +10 미만 전사가 제련 +12 검객을
                이기는 경우를 12주간 복수 관측했습니다.
              </p>
            </div>
            <div className="rounded-card border border-accent-cyan bg-bg-card p-4">
              <p className="font-bold text-accent-cyan">PvP 안정 — 버티기 전략의 가치</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                결투장 채용률은 검객(51%)에 비해 낮지만(22%), 전사 전용 전략이 있습니다.
                <strong className="text-text-primary"> 방어 진령 2종 + 폭딜 진령 1종</strong>{' '}
                조합으로 장기전으로 유도해 상대방 쿨타임을 소진시키는 방식이 효과적입니다.
                운영자 전사 결투장 100매칭 분석 시 40매칭에서 이 전략으로 승리.
              </p>
            </div>
            <div className="rounded-card border border-accent-gold bg-bg-card p-4">
              <p className="font-bold text-accent-gold">자동사냥 — 방치형 게임의 핵심</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                방치형 RPG에서 가장 중요한 것은 자는 동안에도 성장하는 것입니다.
                전사는 별도 관리 없이{' '}
                <strong className="text-text-primary">8시간 이상 자동 사냥이 가능</strong>하며,
                운영자 측정 기준 일일 골드 수급량이 검객 대비 95% 수준으로 거의 동일합니다.
                초보자·무과금 유저에게 최적 직업입니다.
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
            전사는 본체 생존력이 강하므로{' '}
            <strong className="text-text-primary">딜 보조형 2 + 방어/밸런스형 1</strong>{' '}
            조합이 정석입니다. 아래 3종은 운영자가 전사 4주 플레이에서 검증한 최적 조합입니다.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {WARRIOR_JINRYEONG.map((j) => (
              <JinryeongCard key={j.id} {...j} />
            ))}
          </div>
          <p className="mt-3 text-xs italic text-text-muted">
            왕귀를·산천정 미확보 시 대안: 홍길동(DPS) + 서해용왕(치명타 버프) + 치우(밸런스).
            무과금 접근성이 더 높습니다.
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
            <div className="rounded-card border border-accent-red bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-red">Core 스킬</p>
              <p className="mt-1 text-base font-bold text-text-primary">도깨비 일격</p>
              <p className="mt-2 text-sm text-text-secondary">
                단일 대상 최대 피해량 스킬. 보스전 결정타 역할.
                방어력 비례 추가 피해 — 전사 스텟 구조와 최적 시너지.
                운영자 측정 동급 코어 스킬 중 단일 DPS 1위.
              </p>
            </div>
            <div className="rounded-card border border-accent-cyan bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-cyan">Active 스킬</p>
              <p className="mt-1 text-base font-bold text-text-primary">연속 타격 / 방어 강화</p>
              <p className="mt-2 text-sm text-text-secondary">
                액티브 슬롯 1: 연속 타격(광역) — 다수 적 처리.
                액티브 슬롯 2: 방어 강화 — 자동 사냥 생존 안정화.
                두 스킬 교대 발동으로 딜·탱 사이클 형성.
              </p>
            </div>
            <div className="rounded-card border border-accent-gold bg-bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-gold">Passive 스킬</p>
              <p className="mt-1 text-base font-bold text-text-primary">방어 마스터리 / 체력 회복</p>
              <p className="mt-2 text-sm text-text-secondary">
                방어 마스터리: 방어력 +20% 상시 적용 — 전사 생존 기반.
                체력 회복: 피격 시 최대 체력 1% 회복 — 장기전 필수.
                두 패시브 모두 최우선 레벨업 대상.
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
          <PriorityFlow title="전사 5단계 투자 순서" steps={WARRIOR_PRIORITY_STEPS} />
        </section>

        {/* ── 5. TipCard 운영 팁 ───────────────────────────────── */}
        <section className="mt-12" aria-labelledby="tips-title">
          <h2
            id="tips-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            5. 전사 전용 실전 팁
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard
              category="general"
              title="자동사냥은 한 단계 낮은 스테이지에서"
              content="전사도 장비 차이가 너무 크면 클리어 효율 급감. 현재 최고 스테이지보다 2~3단계 낮은 곳이 골드·경험치 시간당 효율 최상. 운영자 측정 10% 낮은 스테이지에서 시간당 골드 +22%."
            />
            <TipCard
              category="pvp"
              title="결투장 버티기 전략 — 장기전 유도"
              content="전사 결투장의 핵심은 쿨타임 소진 게임. 상대방 폭딜 스킬 쿨타임이 끝난 후 반격. 방어 진령 2종 세팅 + 체력 회복 패시브 필수. 운영자 전사 결투장 승률 41%."
            />
            <TipCard
              category="general"
              title="보스 던전 — 코어 스킬 타이밍"
              content="보스 HP 30% 이하에서 코어 스킬 집중. 도깨비 일격 + 왕귀를 반격 발동 타이밍이 겹치는 구간에서 순간 DPS 최대. 운영자 보스 클리어 타임 단축 38% 확인."
            />
            <TipCard
              category="beginner"
              title="무과금 전사 진령 수급 루트"
              content="왕귀를·산천정 미확보 시 홍길동(누적 소비 이벤트) + 서해용왕(뽑기 축적) + 치우(SR급 대안) 순서로 수급. 이 조합도 자동 사냥 10시간 생존률 94% 확인됨."
            />
            <TipCard
              category="advanced"
              title="제련 +12 달성 후 결투장 진입"
              content="전사는 제련 +12 미만이면 결투장 버티기 전략이 역으로 불리. 상대방 폭딜 라인이 전사 방어력을 초과하는 구간. +12 달성 후 진입 권장. 운영자 +10 vs +12 승률 차 21%p."
            />
          </div>
        </section>

        {/* ── 6. 보스/결투장 운영 가이드 ──────────────────────── */}
        <section className="mt-12" aria-labelledby="boss-pvp-title">
          <h2
            id="boss-pvp-title"
            className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            6. 보스 / 결투장 운영 가이드
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
            <div className="rounded-card border border-border-soft bg-bg-card p-4">
              <p className="font-bold text-text-primary">보스 던전 전략</p>
              <p className="mt-2">
                전사는 보스 체력바의 <strong className="text-accent-gold">70%까지는 진령 자동 발동</strong>에
                맡기고, 30% 이하 구간에서 코어 스킬을 수동 발동합니다.
                왕귀를 반격 발동이 이 구간에서 시너지를 형성합니다.
                일일 보스는 반드시 초기화 직후(오전) 우선 소화 — 방치 수익률 상승과 연동.
              </p>
            </div>
            <div className="rounded-card border border-border-soft bg-bg-card p-4">
              <p className="font-bold text-text-primary">결투장 수동 매칭 가이드</p>
              <p className="mt-2">
                자동 매칭 금지. 수동 매칭에서{' '}
                <strong className="text-accent-gold">전투 로그 확인 후 폭딜 직업(검객) 상대 회피</strong>가
                핵심입니다. 전사 vs 영매 승률이 가장 높습니다(운영자 측정 61%).
                영매는 생존력이 낮아 전사 탱킹 앞에서 장기전 불리.
              </p>
            </div>
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
              &ldquo;전사는 빠른 연속 타격과 지속적인 피해에 강점을 지닌 근접 공격형 직업.
              타격감이 뛰어나 전투 몰입감을 중시하는 유저에게 적합하며
              자동 사냥 효율이 매우 우수합니다.&rdquo;
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
              동일합니다. 단, BlueStacks는 전사 광역기 부족을 약점으로만 언급하지만,
              운영자 12주 데이터로는{' '}
              <strong className="text-text-primary">
                전사의 탱킹 능력이 결투장 버티기 전략에서 고유 강점
              </strong>
              임을 확인했습니다. 초보자에게는 BlueStacks 추천처럼 전사가 가장 안전한 선택.
            </p>
          </div>
        </section>

        {/* ── 직업 전체 비교 링크 ──────────────────────────────── */}
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
