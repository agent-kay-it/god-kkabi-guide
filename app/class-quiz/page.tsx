/**
 * /class-quiz — 7문항 직업 진단 + 등록 사전 매칭.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md + design.md §직업 진단
 *
 * 결과 화면에서 "이 직업으로 등록하기" 클릭 시 /register?prefilledClass=... 로 이동.
 *
 * V7 P5: 컨테이너 폭 max-w-screen-md → max-w-3xl (768px) 유지 + 카드 내부 패딩 확대
 * + 모바일/태블릿 헤더 가시성 개선 (V4 SectionHead).
 */
import type { Metadata } from 'next';

import { ClassQuiz } from '@/components/feature/class-quiz';
import { GlassCard } from '@/components/ui/glass-card';
import {
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '직업 진단',
  description: '7문항으로 본인에게 맞는 직업 추천. 전사 / 검객 / 영매 중 베스트 매칭.',
  // Sprint 12 / F12-D-2 — robots 는 app/layout.tsx 에서 robotsConfig 로 cascade.
};

export default function ClassQuizPage(): React.JSX.Element {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-8 sm:px-6 md:max-w-4xl">
      <header className="mb-8">
        <HeroMeta className="mb-5">
          <HeroMetaBadge>위키 / 직업</HeroMetaBadge>
          <span className="font-mono">7문항</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Class Quiz" />
          <SectionTitle as="h1">직업 진단</SectionTitle>
          <SectionLead>
            7가지 질문으로 본인 플레이 스타일에 맞는 직업을 추천해드려요.
          </SectionLead>
        </SectionHead>
      </header>

      <GlassCard className="p-6 sm:p-8 md:p-10" accent="swordsman">
        <ClassQuiz />
      </GlassCard>
    </main>
  );
}
