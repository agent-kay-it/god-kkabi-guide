/**
 * /class-quiz — 7문항 직업 진단 + 등록 사전 매칭.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md + design.md §직업 진단
 *
 * 결과 화면에서 "이 직업으로 등록하기" 클릭 시 /register?prefilledClass=... 로 이동.
 */
import type { Metadata } from 'next';

import { ClassQuiz } from '@/components/feature/class-quiz';
import { GlassCard } from '@/components/ui/glass-card';
import { HeroMeta, HeroMetaBadge } from '@/components/domain';

export const metadata: Metadata = {
  title: '직업 진단',
  description: '7문항으로 본인에게 맞는 직업 추천. 전사 / 검객 / 영매 중 베스트 매칭.',
  robots: { index: false, follow: false },
};

export default function ClassQuizPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-screen-md px-5 pb-20 pt-8 sm:px-6">
      <header className="mb-8 text-center">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>위키 / 직업</HeroMetaBadge>
          <span className="font-mono">7문항</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          직업 진단
        </h1>
        <p className="mt-3 text-sm text-text-soft sm:text-base">
          7가지 질문으로 본인 플레이 스타일에 맞는 직업을 추천해드려요.
        </p>
      </header>

      <GlassCard className="p-5 sm:p-8" accent="swordsman">
        <ClassQuiz />
      </GlassCard>
    </main>
  );
}
