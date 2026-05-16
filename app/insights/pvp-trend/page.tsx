/**
 * /insights/pvp-trend — F3.3 결투장 빌드 트렌드.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { listPvpTrend } from '@/lib/insights/pvp-trend';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import type { ClassId } from '@/types/simulator';

export const metadata: Metadata = {
  title: '결투장 빌드 트렌드 — 주간 인사이트',
};

type SearchParams = Promise<{ class?: string }>;

const CLASS_FILTERS: ReadonlyArray<{ value: ClassId | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'warrior', label: '전사' },
  { value: 'swordsman', label: '검객' },
  { value: 'medium', label: '영매' },
];

export default async function PvpTrendPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const filter = isClassId(params.class) ? params.class : undefined;
  const rows = await listPvpTrend(filter, 4);

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>인사이트 / PvP</HeroMetaBadge>
          <span className="font-mono">{rows.length}건</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          결투장 빌드 트렌드
        </h1>
        <p className="mt-3 max-w-2xl text-text-soft">
          PvP 태그 게시물 기반 진령 조합 주간 순위. 매주 월요일 00:00 KST 자동 집계.
        </p>
      </header>

      <nav aria-label="직업 필터" className="mb-6 flex flex-wrap gap-2">
        {CLASS_FILTERS.map((f) => {
          const active = (f.value === 'all' && !filter) || f.value === filter;
          const href = f.value === 'all' ? '/insights/pvp-trend' : `/insights/pvp-trend?class=${f.value}`;
          return (
            <Button key={f.value} asChild size="sm" variant={active ? 'bronze' : 'outline'}>
              <Link href={href}>{f.label}</Link>
            </Button>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <Note variant="info" title="집계 데이터 부족">
          PvP 태그 게시물이 누적되면 주간 집계 후 표시됩니다.
        </Note>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2" role="list">
          {rows.slice(0, 20).map((row) => (
            <li key={`${row.weekISO}_${row.comboId}`}>
              <GlassCard className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="bronze">#{row.rank}</Badge>
                  <span className="font-mono text-xs text-text-mute">{row.weekISO}</span>
                </div>
                <p className="font-mono text-sm text-text">{row.jinryeongIds.join(' + ')}</p>
                {row.className ? (
                  <p className="text-xs text-text-mute">직업: {row.className}</p>
                ) : null}
                <p className="text-xs text-text-soft">채택 {row.count}회</p>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function isClassId(v: string | undefined): v is ClassId {
  return v === 'warrior' || v === 'swordsman' || v === 'medium';
}
