/**
 * /insights/jinryeong-rate — 진령 채용률 차트 (F3.2).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §2.2
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { listJinryeongRate } from '@/lib/insights/jinryeong-rate';
import { JinryeongRateChart } from '@/components/feature/jinryeong-rate-chart';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import { Button } from '@/components/ui/button';
import type { ClassId } from '@/types/simulator';

export const metadata: Metadata = {
  title: '진령 채용률 — 주간 인사이트',
  description: '실제 빌드 + 시뮬레이션 통계 기반 진령 채용률 주간 추이.',
};

type SearchParams = Promise<{ class?: string }>;

const CLASS_FILTERS: ReadonlyArray<{ value: ClassId | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'warrior', label: '전사' },
  { value: 'swordsman', label: '검객' },
  { value: 'medium', label: '영매' },
];

export default async function JinryeongRatePage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const filter = isClassId(params.class) ? params.class : undefined;
  const rows = await listJinryeongRate(filter, 4);

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>인사이트 / 진령</HeroMetaBadge>
          <span className="font-mono">{rows.length}건</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          진령 채용률
        </h1>
        <p className="mt-3 max-w-2xl text-text-soft">
          실제 사용자 빌드 + 시뮬레이션 통계 기반 주간 채용률. 매주 월요일 00:00 KST 자동 갱신.
        </p>
      </header>

      <nav aria-label="직업 필터" className="mb-6 flex flex-wrap gap-2">
        {CLASS_FILTERS.map((f) => {
          const active = (f.value === 'all' && !filter) || f.value === filter;
          const href = f.value === 'all' ? '/insights/jinryeong-rate' : `/insights/jinryeong-rate?class=${f.value}`;
          return (
            <Button
              key={f.value}
              asChild
              size="sm"
              variant={active ? 'bronze' : 'outline'}
            >
              <Link href={href}>{f.label}</Link>
            </Button>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <Note variant="info" title="집계 데이터 부족">
          아직 충분한 데이터가 누적되지 않았습니다. 시뮬레이션 또는 빌드 게시물을
          작성하면 다음 집계 (월요일)부터 반영됩니다.
        </Note>
      ) : (
        <JinryeongRateChart rows={rows} />
      )}
    </main>
  );
}

function isClassId(v: string | undefined): v is ClassId {
  return v === 'warrior' || v === 'swordsman' || v === 'medium';
}
