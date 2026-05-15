/**
 * /tips — 실전 팁 리스트.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §Tips
 *
 * P3.B: 정적 시드. P3.C: Firestore + 운영자 작성 폼.
 */
import type { Metadata } from 'next';

import { TipCard, HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import { WIKI_TIPS_SEED } from '@/data/wiki/tips';

export const metadata: Metadata = {
  title: '실전 팁 — 갓깨비 키우기 운영 노하우',
  description:
    '999회 무료 뽑기 활용 / 진령 강화 우선순위 / 검객 치명타 빌드 / PvP 카운터 진령 등 갓깨비 키우기 실전 팁.',
  robots: { index: false, follow: false },
};

export default function TipsPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-screen-lg px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-10">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>실전 팁</HeroMetaBadge>
          <span className="font-mono">{WIKI_TIPS_SEED.length}개 · admin 작성</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          실전 운영 노하우
        </h1>
        <p className="mt-3 max-w-2xl text-text-soft">
          매주 검증되는 운영자 큐레이션 팁. P3.C부터 커뮤니티 작성 팁이 추가됩니다.
        </p>
      </header>

      <div className="mb-10 grid gap-3 md:grid-cols-2">
        {WIKI_TIPS_SEED.map((t) => (
          <TipCard key={t.id} category={t.category} title={t.title} content={t.content} />
        ))}
      </div>

      <Note variant="tip" title="팁 제보하기">
        커뮤니티 작성 기능은 P3.C 단계에서 활성화 예정. 그 전까지는 운영자 큐레이션만 노출됩니다.
      </Note>
    </main>
  );
}
