/**
 * <HeroStats> — Sprint V4 P3.C.
 * source/godkkabi-guide/index.html `.hero-stats` 이식.
 *
 * 4-cell auto-fit minmax(140px, 1fr) 그리드, 1px gap으로 border 효과.
 * 모바일 (max-width:600px): grid-template-columns: 1fr 1fr (2x2).
 *
 * 디자인:
 *  - 컨테이너 border 1px + radius 14px + overflow-hidden
 *  - 각 셀 rgba(14,14,21,0.7) + backdrop-blur(8px) + hover bg shift
 *  - label: 0.72rem uppercase + tracking 0.05em
 *  - value: 1.1rem bold + small inline (단위: "종", "+ 종")
 *
 * 출처: docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.3 + source CSS 364-386
 */
import { cn } from '@/lib/utils';

export interface HeroStatItem {
  readonly label: string;
  readonly value: string;
  /** 인라인 작은 단위 (예: "종", "+ 종") */
  readonly unit?: string;
}

export interface HeroStatsProps {
  readonly items: readonly HeroStatItem[];
  readonly className?: string;
}

export function HeroStats({ items, className }: HeroStatsProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'grid max-w-[720px] overflow-hidden rounded-[14px] border border-ink-line bg-ink-line',
        'grid-cols-2 gap-px sm:[grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]',
        className,
      )}
      role="list"
    >
      {items.map((item) => (
        <HeroStatCell key={item.label} item={item} />
      ))}
    </div>
  );
}

function HeroStatCell({ item }: { item: HeroStatItem }): React.JSX.Element {
  return (
    <div
      role="listitem"
      className={cn(
        'bg-[rgba(14,14,21,0.7)] px-5 py-[18px] backdrop-blur-[8px]',
        'transition-colors duration-200 ease-out',
        'hover:bg-[rgba(28,28,40,0.8)]',
      )}
    >
      <div className="mb-1 text-[0.72rem] uppercase tracking-[0.05em] text-text-mute">
        {item.label}
      </div>
      <div className="text-[1.1rem] font-bold tracking-[-0.01em] text-text">
        {item.value}
        {item.unit ? (
          <span className="ml-1 text-[0.7rem] font-medium text-text-mute">
            {item.unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}
