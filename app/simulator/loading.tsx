/**
 * /simulator — Streaming Suspense loading.tsx (Sprint 12 / F12-C-5).
 *
 * Server Component 가 Firestore listWikiJinryeong 을 fetch 하는 동안 본 컴포넌트가
 * 즉시 렌더되어 LCP perceived performance 개선. 메인 데이터 도착 후 자동 hydrate.
 *
 * 출처: docs/sprint/12-sprint-perf/design.md §2.4 (F12-C-5)
 */
import { GlassCard } from '@/components/ui/glass-card';
import { HeroMeta, HeroMetaBadge, SectionEyebrow, SectionHead, SectionLead, SectionTitle } from '@/components/domain';

export default function SimulatorLoading(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>시뮬레이터</HeroMetaBadge>
          <span className="font-mono">진령 11종</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Tools" />
          <SectionTitle>빌드 시뮬레이터</SectionTitle>
          <SectionLead>진령 3개 선택 → 시너지 점수 + 추천 직업.</SectionLead>
        </SectionHead>
      </header>

      <section aria-busy="true" aria-label="시뮬레이터 로딩 중" className="mt-8">
        <GlassCard className="space-y-6 p-6 sm:p-8">
          <div className="h-6 w-40 animate-pulse rounded-md bg-ink-elev/60" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-md border border-ink-line bg-ink-elev/40"
              />
            ))}
          </div>
          <div className="h-12 w-full animate-pulse rounded-md bg-ink-elev/40" />
          <div className="h-24 w-full animate-pulse rounded-md bg-ink-elev/40" />
        </GlassCard>
      </section>
    </main>
  );
}
