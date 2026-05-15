/**
 * /event — 이벤트 · 쿠폰 종합 가이드.
 * Sprint V4 P3.E NEW page — source/godkkabi-guide/index.html §07 Events 이식.
 *
 * Server Component. 6 종류 이벤트 카테고리 grid + 쿠폰 코드 입력 가이드.
 *
 * 디자인:
 *  - HeroMeta + SectionHead (eyebrow num="07" label="Events")
 *  - 6 event card grid (상시/정기/한정/콜라보/시즌/일일)
 *  - 각 카드: 태그(badge) + 제목 + 본문
 *  - 쿠폰 입력 경로 Note
 *
 * 출처: docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.5
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export const metadata: Metadata = {
  title: '이벤트 · 쿠폰 — 갓깨비 키우기 가이드',
  description:
    '갓깨비 키우기 이벤트 6종 (상시·정기·한정·콜라보·시즌·일일) 대응 전략. 누적 소비 이벤트, 홍길동 확정 라인, 쿠폰 코드 입력 경로 가이드.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/event' },
};

interface EventItem {
  readonly tag: '상시' | '정기' | '한정' | '콜라보' | '시즌' | '일일';
  readonly name: string;
  readonly desc: string;
  readonly emphasis?: string;
  readonly variant: 'bronze' | 'jade' | 'indigo' | 'vermilion' | 'muted';
}

const EVENTS: readonly EventItem[] = [
  {
    tag: '상시',
    name: '출석 이벤트',
    desc: '매일 접속만 해도 다이아 · 뽑기권 · 재화 누적. 7일 · 14일 · 30일 누적 시 대형 보상(SSR 포함). 절대 빠뜨리지 말 것.',
    variant: 'jade',
  },
  {
    tag: '정기',
    name: '누적 소비 이벤트',
    desc: '다이아 누적 사용량에 따른 보상. 홍길동 확정 라인이 여기 포함되므로 결제 · 재화 사용은 이 기간에 맞출 것.',
    emphasis: '홍길동 확정 라인',
    variant: 'bronze',
  },
  {
    tag: '한정',
    name: '확률업 뽑기',
    desc: '특정 SSR 진령/장비 확률 일시 상승. 999뽑기 무료권은 이 이벤트에 몰아서 사용.',
    variant: 'vermilion',
  },
  {
    tag: '콜라보',
    name: '카카오프렌즈 콜라보',
    desc: '어피치 · 라이언 등 카카오 콜라보 진령 등장 (대체 활용). 쿠폰 KAKAOFRIENDS로 관련 보상 획득.',
    emphasis: 'KAKAOFRIENDS',
    variant: 'indigo',
  },
  {
    tag: '시즌',
    name: '시즌 한정',
    desc: '신년 · 발렌타인 · 어버이날 · 추석 · 할로윈 · 크리스마스 등. 한정 진령 · 코스튬은 재발매 안 됨.',
    variant: 'muted',
  },
  {
    tag: '일일',
    name: '일일 보스 / 진령 던전',
    desc: '매일 초기화. 오전 시간대 우선 클리어 시 누적 보상 + 방치 수익률 상승 동시 효과.',
    variant: 'bronze',
  },
];

export default function EventPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-24 pt-8 sm:px-[5vw]">
      <Reveal>
        <header className="mb-12">
          <HeroMeta className="mb-5">
            <HeroMetaBadge>가이드 / 이벤트</HeroMetaBadge>
            <span className="font-mono">6종 카테고리 · 2026.05</span>
          </HeroMeta>
          <SectionHead>
            <SectionEyebrow num="07" label="Events" />
            <SectionTitle as="h1">이벤트 · 쿠폰</SectionTitle>
            <SectionLead>
              이벤트마다 보상 라인과 대응 전략이 다르다. 999뽑기·결제 타이밍을 이벤트 일정에
              맞추는 것만으로 효율이 배가 된다.
            </SectionLead>
          </SectionHead>
        </header>
      </Reveal>

      <section
        aria-labelledby="event-list"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <h2 id="event-list" className="sr-only">
          이벤트 카테고리 6종
        </h2>
        {EVENTS.map((ev, i) => (
          <Reveal key={ev.name} delay={(((i % 3) + 1) as 1 | 2 | 3)}>
            <GlassCard interactive className="flex h-full flex-col gap-3 p-6">
              <div>
                <Badge variant={ev.variant} className="text-[0.7rem]">
                  {ev.tag}
                </Badge>
              </div>
              <h3 className="text-[1.05rem] font-bold text-text">{ev.name}</h3>
              <p className="flex-1 text-sm leading-[1.65] text-text-soft">
                {ev.desc}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <Reveal>
        <Note variant="info" title="쿠폰 코드는 별도 채널에서" className="mt-10">
          <p>
            최신 쿠폰 코드는 만료·교체 주기가 짧아 본 문서에서 제외합니다.
            공식 카카오톡 채널, 네이버 공식 카페, 디시 갓깨비키우기 갤러리에서 확인 후{' '}
            <strong className="text-text">
              좌측 상단 캐릭터 초상화 → 설정 → 교환 코드
            </strong>
            에서 입력하세요.
          </p>
          <div className="mt-3">
            <Button asChild variant="bronze" size="sm">
              <Link href="/coupon">사용자가 검증한 쿠폰 보기 →</Link>
            </Button>
          </div>
        </Note>
      </Reveal>
    </main>
  );
}
