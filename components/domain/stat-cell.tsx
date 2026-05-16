/**
 * <StatCell> — 라벨 + 값 + 비율 (rate)이 결합된 데이터 셀.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.4
 *
 * 직업 카드 / 진령 카드의 통계 그리드에 사용.
 * rate는 JetBrains Mono로 강조 (★☆☆ 같은 등급 표기).
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface StatCellProps {
  label: string;
  value: string;
  /** JetBrains Mono로 강조 — 등급/숫자 표기 (예: "★★★", "92%") */
  rate?: string;
  className?: string;
}

export function StatCell({
  label,
  value,
  rate,
  className,
}: StatCellProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-md bg-ink-elev/55 p-3.5 transition-colors hover:bg-ink-card-strong',
        className,
      )}
    >
      <div className="mb-0.5 text-[0.7rem] uppercase tracking-wider text-text-mute">
        {label}
      </div>
      <div className="flex items-center gap-2 text-[0.95rem] font-semibold text-text">
        {rate ? (
          <span className="font-mono text-[0.85rem] text-bronze-soft">{rate}</span>
        ) : null}
        <span>{value}</span>
      </div>
    </div>
  );
}
