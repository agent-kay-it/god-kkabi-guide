/**
 * /advanced — 고급 Tip 참고 (메커니즘 디테일).
 * Sprint V4 P3.E NEW page — source/godkkabi-guide/index.html §09 Advanced 이식.
 *
 * Server Component. 진령 소환·육성 6 카드 + 직업별 추천 스킬 표.
 *
 * 디자인:
 *  - HeroMeta + SectionHead (eyebrow num="09" label="Advanced · Reference")
 *  - 6 mechanism card grid (SUMMON 01-03, GROWTH 04-06)
 *  - 직업 추천 스킬 표 (전사 / 검객 / 영매)
 *  - 패치 안정성 안내 Note
 *
 * 출처: docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.5
 */
import type { Metadata } from 'next';

import { GlassCard } from '@/components/ui/glass-card';
import {
  HeroMeta,
  HeroMetaBadge,
  Note,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { Reveal } from '@/components/feature/reveal';
import { FAQStructuredData } from '@/components/feature/structured-data';

export const metadata: Metadata = {
  title: '고급 Tip 참고 — 메커니즘 디테일',
  description:
    '갓깨비 키우기 진령 소환풀 레벨업, 10회 천장, 원신 자동 변환, 진령 초기화 환급, 별 등급 vs 스킬 품급, 진령경험단 4대 수급처. 패치를 거쳐도 변하지 않는 핵심 메커니즘.',
  // Sprint 25 / F25-C: OG/Twitter + keywords 강화 (5 페이지 강화 #5)
  alternates: { canonical: '/advanced' },
  keywords: [
    '갓깨비 키우기 고급',
    '소환풀 레벨업',
    '10회 천장',
    '원신 자동 변환',
    '진령 초기화 환급',
    '별 등급 스킬 품급',
    '진령경험단 수급처',
  ],
  openGraph: {
    title: '고급 Tip — 메커니즘 6선',
    description: '소환풀 / 천장 / 환급 / 별·품급 / 경험단 — 패치 안전 메커니즘.',
    url: '/advanced',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '갓깨비 키우기 고급 Tip — 메커니즘 디테일',
    description: '6 메커니즘 + 직업 추천 스킬 표',
  },
};

interface MechanismCard {
  readonly code: string;
  readonly title: string;
  readonly body: React.ReactNode;
}

const MECHANISMS: readonly MechanismCard[] = [
  {
    code: 'SUMMON · 01',
    title: '소환풀 레벨업',
    body: (
      <>
        <strong className="text-text">천음령</strong>(소환 재화)을 소모해 소환풀 레벨을 올릴
        수 있다. 소환풀 레벨이 높을수록{' '}
        <strong className="text-text">희귀 SSR 등장 확률 자체가 상승</strong>하므로, 단순히
        뽑기 횟수만 늘리는 것보다 풀 레벨업이 장기적으로 더 효율적이다.
      </>
    ),
  },
  {
    code: 'SUMMON · 02',
    title: '10회 천장 시스템',
    body: (
      <>
        진령 소환 <strong className="text-text">10회 시 SR 이상 1명 확정</strong>. 이 천장
        덕분에 연속으로 SR 이하만 뽑히는 상황은 발생하지 않는다.{' '}
        <strong className="text-text">9회 + 무료 보상</strong> 같은 식의 절약 전략도 가능.
      </>
    ),
  },
  {
    code: 'SUMMON · 03',
    title: '중복 진령 → 원신 자동 변환',
    body: (
      <>
        이미 보유한 진령을 또 뽑으면{' '}
        <strong className="text-text">원신으로 자동 변환</strong>: SSR은 6원신, 희귀 SSR은
        30원신. 원신은 같은 진령의{' '}
        <strong className="text-text">별 등급 향상</strong>에 사용되므로 결코 낭비가 아니다.
      </>
    ),
  },
  {
    code: 'GROWTH · 04',
    title: '진령 초기화로 재료 환급',
    body: (
      <>
        잘못 키운 진령은{' '}
        <strong className="text-text">초기화로 투입 재료 환급</strong> 가능. 메타가
        바뀌었거나 새 1티어 진령을 얻었을 때 망설이지 말고 환급 → 신규 진령에 재투자.{' '}
        <strong className="text-text">자원 사장(死藏) 방지 핵심 기능</strong>.
      </>
    ),
  },
  {
    code: 'GROWTH · 05',
    title: '별 등급 vs 스킬 품급',
    body: (
      <>
        별 등급은 <strong className="text-text">같은 진령의 원신</strong>으로 향상 → 기본
        스탯 상승. 스킬 품급은 <strong className="text-text">오도과</strong>로 향상 →
        패시브 효과 강화. 용어가 패치로 바뀌어도 두 경로는 분리되어 있다는 원리는 동일하다.
      </>
    ),
  },
  {
    code: 'GROWTH · 06',
    title: '진령경험단 4대 수급처',
    body: (
      <>
        <strong className="text-text">파티 비경</strong>,{' '}
        <strong className="text-text">선옥상점</strong>,{' '}
        <strong className="text-text">자동사냥</strong>,{' '}
        <strong className="text-text">신병 기원</strong>. 이 네 가지가 진령 레벨업 재료의
        주요 수급처. 하나만 의존하지 말고 골고루 챙길 것.
      </>
    ),
  },
];

interface SkillRow {
  readonly job: string;
  readonly core: string;
  readonly active: string;
  readonly passive: string;
}

const SKILL_TABLE: readonly SkillRow[] = [
  {
    job: '전사',
    core: '천탈창경',
    active: '백호진살 · 환마전신 · 경금전기',
    passive: '분신기참 · 잔양창결 · 파마격 · 연옥창망기',
  },
  {
    job: '검객',
    core: '운소검경',
    active:
      '진살검진 · 금라검망 · 검심통신 · 이한무정 · 검겁신 · 육어현공 · 나천조영 · 음양현청',
    passive: '탕생검술 · 현통검의 · 행운류수 · 만균정화 · 오기화일',
  },
  {
    job: '영매',
    core: '어뢰진결',
    active: '천뢰인 · 원자감응 · 뇌주진',
    passive: '어뢰 확장 · 어뢰 폭발 · 뇌원학세 · 만령지체 · 신소',
  },
];

// Sprint 25 / F25-C — FAQ items (실제 페이지 메커니즘 카드와 1:1 매칭, Google 가이드라인 준수)
const FAQ_ITEMS: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: '진령 소환풀 레벨업은 어떻게 작동하나요?',
    answer:
      '천음령(소환 재화)을 소모해 소환풀 레벨을 올리면 희귀 SSR 등장 확률 자체가 상승합니다. 단순히 뽑기 횟수만 늘리는 것보다 풀 레벨업이 장기적으로 더 효율적입니다.',
  },
  {
    question: '10회 천장 시스템은 무엇인가요?',
    answer:
      '진령 소환 10회 시 SR 이상 1명 확정. 이 천장 덕분에 연속으로 SR 이하만 뽑히는 상황은 발생하지 않습니다. 9회 + 무료 보상 같은 절약 전략도 가능합니다.',
  },
  {
    question: '중복 진령은 어떻게 처리되나요?',
    answer:
      '이미 보유한 진령을 또 뽑으면 원신으로 자동 변환됩니다. SSR은 6원신, 희귀 SSR은 30원신. 원신은 같은 진령의 별 등급 향상에 사용되므로 낭비가 아닙니다.',
  },
  {
    question: '진령 초기화로 재료를 환급받을 수 있나요?',
    answer:
      '잘못 키운 진령은 초기화로 투입 재료 환급이 가능합니다. 메타 변화나 새 1티어 진령 획득 시 망설이지 말고 환급 후 신규 진령에 재투자하세요.',
  },
  {
    question: '별 등급과 스킬 품급의 차이는?',
    answer:
      '별 등급은 같은 진령의 원신으로 향상되어 기본 스탯이 상승합니다. 스킬 품급은 오도과로 향상되어 패시브 효과가 강화됩니다. 두 경로는 분리되어 있습니다.',
  },
  {
    question: '진령경험단은 어디서 얻나요?',
    answer:
      '4대 수급처: 파티 비경, 선옥상점, 자동사냥, 신병 기원. 진령 레벨업 재료의 주요 출처로, 하나만 의존하지 말고 골고루 챙기는 것이 좋습니다.',
  },
];

export default function AdvancedPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-24 pt-8 sm:px-[5vw]">
      {/* Sprint 25 / F25-C — FAQ schema (Google Rich Results "FAQ" 자격, 페이지 메커니즘 카드와 1:1) */}
      <FAQStructuredData items={FAQ_ITEMS} />
      <Reveal>
        <header className="mb-12">
          <HeroMeta className="mb-5">
            <HeroMetaBadge>가이드 / 고급</HeroMetaBadge>
            <span className="font-mono">메커니즘 디테일 · 2026.05</span>
          </HeroMeta>
          <SectionHead>
            <SectionEyebrow num="09" label="Advanced · Reference" />
            <SectionTitle as="h1">고급 Tip 참고 — 메커니즘 디테일</SectionTitle>
            <SectionLead>
              패치를 거쳐도 잘 변하지 않는 핵심 시스템 메커니즘과 운영 원리. 초기 버전부터
              누적된 공략 자료에서 발췌·종합한 심층 정보로, 일반 팁보다 한 단계 깊이 들어간
              내용입니다. 용어가 일부 바뀌어도 작동 원리는 그대로 유효합니다.
            </SectionLead>
          </SectionHead>
        </header>
      </Reveal>

      {/* 진령 소환·육성 메커니즘 6장 */}
      <section className="mb-16" aria-labelledby="summon-growth">
        <Reveal>
          <h2
            id="summon-growth"
            className="mb-4 text-[1.05rem] font-semibold tracking-[0.04em] text-bronze-soft"
          >
            진령 소환·육성 심층 메커니즘
          </h2>
        </Reveal>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {MECHANISMS.map((m, i) => (
            <Reveal key={m.code} delay={(((i % 3) + 1) as 1 | 2 | 3)}>
              <GlassCard interactive className="h-full p-6">
                <div className="mb-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-bronze">
                  {m.code}
                </div>
                <h3 className="mb-2.5 text-[1.02rem] font-bold text-text">{m.title}</h3>
                <p className="text-[0.9rem] leading-[1.7] text-text-soft">{m.body}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 직업별 추천 스킬 표 */}
      <section aria-labelledby="skill-table" className="mb-12">
        <Reveal>
          <h2
            id="skill-table"
            className="mb-3 text-[1.05rem] font-semibold tracking-[0.04em] text-bronze-soft"
          >
            직업별 추천 스킬 (출시 초기 가이드 기준)
          </h2>
          <p className="mb-4 text-[0.86rem] text-text-mute">
            스킬명은 업데이트로 추가/변경될 수 있으나,{' '}
            <strong className="text-text">코어 1 + 액티브 3~4 + 패시브 4~5</strong> 구성
            원리는 동일하게 통용됩니다.
          </p>
        </Reveal>

        <Reveal>
          <GlassCard className="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink-line text-left text-[0.72rem] uppercase tracking-wider text-text-mute">
                  <th className="px-5 py-3.5 font-medium" style={{ width: 80 }}>
                    직업
                  </th>
                  <th className="px-5 py-3.5 font-medium">주요 코어</th>
                  <th className="px-5 py-3.5 font-medium">주요 액티브</th>
                  <th className="px-5 py-3.5 font-medium">주요 패시브</th>
                </tr>
              </thead>
              <tbody>
                {SKILL_TABLE.map((row) => (
                  <tr
                    key={row.job}
                    className="border-b border-ink-line last:border-b-0 transition-colors hover:bg-ink-card-strong"
                  >
                    <td className="px-5 py-3.5 font-semibold text-text">{row.job}</td>
                    <td className="px-5 py-3.5 text-text-soft">{row.core}</td>
                    <td className="px-5 py-3.5 text-text-soft">{row.active}</td>
                    <td className="px-5 py-3.5 text-text-soft">{row.passive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </Reveal>
      </section>

      <Reveal>
        <Note variant="info" title="패치 안정성">
          본 페이지의 메커니즘은 초기 버전부터 누적된 공략에서 종합된 것으로, 용어가 패치로
          일부 변경되더라도 작동 원리는 그대로 유지됩니다. 다만 구체적 수치 (확률, 보상량
          등)는 운영사의 라이브 밸런싱에 따라 변동될 수 있으므로 게임 내 안내를 우선
          참고하세요.
        </Note>
      </Reveal>
    </main>
  );
}
