/**
 * /tips — 실전 팁 12종 + 카테고리 필터.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §Tips + source TIP 01-08
 *
 * P3.B: 5개 → P3.C: 12개로 확장.
 * P3.D: Firestore 어댑터 + 운영자 작성 폼 + 사용자 제보.
 */
import type { Metadata } from 'next';

import {
  TipCard,
  HeroMeta,
  HeroMetaBadge,
  Note,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { WIKI_TIPS_SEED } from '@/data/wiki/tips';
import type { TipCategory } from '@/types/wiki';

export const metadata: Metadata = {
  title: '실전 팁 — 12개 운영 노하우',
  description:
    '999회 무료 뽑기 활용 / 진령 강화 우선순위 / 검객 치명타 빌드 / PvP 카운터 진령 + 12개 운영 팁.',
  // Sprint 12 / F12-D-2 — robots 는 app/layout.tsx 에서 robotsConfig 로 cascade.
};

const CATEGORY_LABEL: Record<TipCategory, string> = {
  general: '일반',
  beginner: '초보',
  advanced: '고급',
  pvp: 'PvP',
};

export default function TipsPage(): React.JSX.Element {
  const byCategory = {
    general: WIKI_TIPS_SEED.filter((t) => t.category === 'general'),
    beginner: WIKI_TIPS_SEED.filter((t) => t.category === 'beginner'),
    advanced: WIKI_TIPS_SEED.filter((t) => t.category === 'advanced'),
    pvp: WIKI_TIPS_SEED.filter((t) => t.category === 'pvp'),
  };

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>실전 팁</HeroMetaBadge>
          <span className="font-mono">{WIKI_TIPS_SEED.length}개 · admin 큐레이션</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow num="08" label="Tactics" />
          <SectionTitle as="h1">실전 운영 노하우</SectionTitle>
          <SectionLead>
            매주 검증되는 운영자 큐레이션 팁 12개. 초보부터 PvP까지 카테고리별로 정리했습니다.
          </SectionLead>
        </SectionHead>
      </header>

      <div className="space-y-10">
        {(['beginner', 'general', 'advanced', 'pvp'] as const).map((category) => (
          <section key={category} aria-label={`${CATEGORY_LABEL[category]} 팁`} className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold tracking-tight text-text">
                {CATEGORY_LABEL[category]} 팁
              </h2>
              <span className="font-mono text-xs text-text-mute">
                {byCategory[category].length}개
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {byCategory[category].map((t) => (
                <TipCard key={t.id} category={t.category} title={t.title} content={t.content} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Note variant="tip" title="팁 제보하기" className="mt-10">
        커뮤니티 작성 기능은 P3.D 채팅 출시와 함께 활성화 예정. 그 전까지는 운영자 큐레이션만 노출됩니다.
      </Note>
    </main>
  );
}
