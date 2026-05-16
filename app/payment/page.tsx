/**
 * /payment — 과금 전략 가이드 (무 · 소 · 중과금 3티어).
 * Sprint V4 P3.E NEW page — source/godkkabi-guide/index.html §06 Spending 이식.
 *
 * Server Component. SEO meta + structured 3-tier pay-stack + 결제 체크리스트 Note.
 *
 * 디자인:
 *  - HeroMeta + SectionHead (eyebrow num="06" label="Spending")
 *  - 3 카드 grid (free → light → medium, 모바일 stack)
 *  - 각 카드: title + budget pill + sub + ordered list
 *  - Note "결제 전 체크리스트"
 *
 * 출처: docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.5
 */
import type { Metadata } from 'next';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
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

export const metadata: Metadata = {
  title: '과금 전략 — 어디에 쓰느냐가 전부 | 갓깨비 키우기 가이드',
  description:
    '갓깨비 키우기 무 · 소 · 중과금 3단계 과금 전략. 가성비 패키지, 결제 타이밍, 누적 소비 이벤트 활용 가이드. 코스튬·탈것 패키지 함정 회피.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/payment' },
};

interface PayTierData {
  readonly id: 'f2p' | 'low' | 'mid';
  readonly title: string;
  readonly budget: string;
  readonly sub: string;
  readonly steps: ReadonlyArray<{ title: string; desc?: string; warn?: boolean }>;
  readonly tone: 'free' | 'light' | 'medium';
}

const PAY_TIERS: readonly PayTierData[] = [
  {
    id: 'f2p',
    title: '무과금 · 라이트',
    budget: '₩0 / month',
    sub: '출석 보상과 일일 미션을 100% 챙기는 것만으로 한 달이면 핵심 SSR 진령 2~3종 확보 가능.',
    steps: [
      { title: '출석 · 일일 미션 100%', desc: '가장 큰 무료 재화 원천' },
      { title: '우편함 · 이벤트 보상 누락 금지', desc: 'SSR 진령이 종종 지급' },
      { title: '광고 보상 적극 활용', desc: '무료 재화 / 뽑기권' },
      { title: '이벤트 상점 매일 확인', desc: '무료 재화, 광고 갱신 활용' },
      { title: '문파 즉시 가입', desc: '출석 · 기부로 무료 자원 추가' },
      { title: '쿠폰 코드 모두 입력', desc: '하단 /event 참고' },
    ],
    tone: 'free',
  },
  {
    id: 'low',
    title: '소과금 · 최고 가성비',
    budget: '₩5,500 ~ ₩30,000',
    sub: '결제는 반드시 이벤트 누적 달성 라인에 맞춰 진행. 분산 결제는 비효율.',
    steps: [
      {
        title: '월간 패스 (성장 패스)',
        desc: '매일 출석 시 다이아 · 뽑기권 지속 지급. 가성비 1위.',
      },
      {
        title: '누적 소비 이벤트 달성',
        desc: '홍길동 확정 라인까지 결제, 분산 금지',
      },
      {
        title: '첫 결제 패키지',
        desc: '액수 대비 보상이 비정상적으로 좋음',
      },
      {
        title: '주간 패스 / 다이아 충전 보너스',
        desc: '첫 충전 100% 보너스',
      },
    ],
    tone: 'light',
  },
  {
    id: 'mid',
    title: '중과금 · 효율 극대화',
    budget: '₩50,000 ~ ₩300,000',
    sub: '월정액 + 주간 패스 동시 운용으로 일일 재화 흐름을 안정화하는 것이 핵심.',
    steps: [
      { title: '월정액 + 주간 패스', desc: '모든 콘텐츠 부담 없이 소화' },
      {
        title: '희귀 SSR 진령 픽업 집중 결제',
        desc: '음영귀 · 명왕 등 1티어 픽업 시점',
      },
      {
        title: '제련 레벨 부스트 패키지',
        desc: '제련 레벨 단축 = 장비 등급 점프',
      },
      {
        title: '코스튬 · 탈 것 패키지는 후순위',
        desc: '절대 먼저 사지 말 것',
        warn: true,
      },
      {
        title: 'VIP 등급 보상 라인 확인',
        desc: '다음 등급 효율 점검 후 결제',
      },
    ],
    tone: 'medium',
  },
];

const TONE_BORDER: Record<PayTierData['tone'], string> = {
  free: 'border-jade/30',
  light: 'border-bronze/40',
  medium: 'border-bronze shadow-glow-bronze',
};

export default function PaymentPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-24 pt-8 sm:px-[5vw]">
      <Reveal>
        <header className="mb-12">
          <HeroMeta className="mb-5">
            <HeroMetaBadge>가이드 / 과금</HeroMetaBadge>
            <span className="font-mono">3-tier 전략 · 2026.05</span>
          </HeroMeta>
          <SectionHead>
            <SectionEyebrow num="06" label="Spending" />
            <SectionTitle as="h1">과금 전략 — 어디에 쓰느냐가 전부</SectionTitle>
            <SectionLead>
              무과금 친화적인 게임이지만, 소액 결제 효율이 매우 높아 가성비 패키지 1~2개만 잘
              활용해도 큰 차이가 난다. 가장 흔한 함정은 코스튬·탈것 패키지부터 사는 것.
            </SectionLead>
          </SectionHead>
        </header>
      </Reveal>

      <section
        aria-labelledby="pay-stack"
        className="grid gap-4 lg:grid-cols-3"
      >
        <h2 id="pay-stack" className="sr-only">
          과금 티어 3단계
        </h2>
        {PAY_TIERS.map((tier, i) => (
          <Reveal key={tier.id} delay={((i + 1) as 1 | 2 | 3)}>
            <GlassCard
              interactive
              className={`flex h-full flex-col gap-4 p-7 ${TONE_BORDER[tier.tone]}`}
            >
              <header className="flex items-baseline justify-between gap-3">
                <h3 className="text-[1.1rem] font-bold text-text">{tier.title}</h3>
                <Badge variant="bronze" className="font-mono text-[0.72rem]">
                  {tier.budget}
                </Badge>
              </header>
              <p className="text-sm leading-relaxed text-text-soft">{tier.sub}</p>
              <ol className="space-y-3 text-sm">
                {tier.steps.map((s, idx) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="min-w-[20px] shrink-0 font-mono text-[0.78rem] text-bronze">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <strong className="text-text">{s.title}</strong>
                      {s.desc ? (
                        <>
                          {' '}
                          —{' '}
                          <span
                            className={
                              s.warn ? 'text-vermilion-soft' : 'text-text-soft'
                            }
                          >
                            {s.desc}
                          </span>
                        </>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <Reveal>
        <Note variant="info" title="결제 전 체크리스트" className="mt-10">
          <ul className="space-y-1.5">
            <li>이 패키지가 이벤트 누적 달성 라인에 카운트되는가?</li>
            <li>한정/기간제인가, 상시인가? (한정이면 우선)</li>
            <li>VIP 경험치가 함께 올라가는가?</li>
            <li>광고로 대체 가능한 보상인가? (대체 가능하면 미결제)</li>
          </ul>
        </Note>
      </Reveal>
    </main>
  );
}
