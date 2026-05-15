/**
 * <JinryeongRateChart> — F3.2 채용률 시각화 (recharts).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §2.2
 *
 * Pattern: recharts ResponsiveContainer + BarChart (top N) + LineChart (rank delta).
 * 데이터 형식: aggregated rows from `lib/insights/jinryeong-rate.ts`.
 */
'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

import type { JinryeongRateRow } from '@/types/insights';
import { GlassCard } from '@/components/ui/glass-card';

export interface JinryeongRateChartProps {
  readonly rows: readonly JinryeongRateRow[];
  /** 카드/Bar 색상 (디자인 토큰 v2 — bronze 계열) */
  readonly accent?: string;
}

/** 최근 주의 top 10 채용 진령 (count desc) */
export function JinryeongRateChart({
  rows,
  accent = 'var(--color-bronze, #c47a3c)',
}: JinryeongRateChartProps): React.JSX.Element {
  const data = useMemo(() => {
    if (rows.length === 0) return [];
    // 최근 weekISO 추출
    const latest = rows.reduce((acc, r) => (r.weekISO > acc ? r.weekISO : acc), '');
    return rows
      .filter((r) => r.weekISO === latest)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((r) => ({
        name: r.jinryeongId,
        count: r.count,
        rank: r.rank,
        delta: r.delta ?? 0,
      }));
  }, [rows]);

  if (data.length === 0) {
    return (
      <GlassCard className="p-8 text-center text-text-mute">
        집계된 통계가 아직 없습니다. 매주 월요일 00:00 KST에 자동 집계됩니다.
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={[...data]}
          layout="vertical"
          margin={{ top: 8, right: 20, bottom: 8, left: 80 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: 'var(--color-text-mute, #999)' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--color-text, #ddd)' }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-ink-elev, #1a1f2e)',
              border: '1px solid var(--color-ink-line, #2a3145)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${Number(value)}회`, '채용 수']}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="count" name="채용 수" fill={accent} radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.delta > 0 ? 'var(--color-jade, #5ca374)' : accent}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-text-mute">
        <span className="text-jade">초록색 막대</span>는 지난 주 대비 순위 상승.
      </p>
    </GlassCard>
  );
}
