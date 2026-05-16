/**
 * <TierStack> — Sprint V4 P3.D.
 * source/godkkabi-guide/index.html `.tier-stack` + `.tier-row` + `.tier-char` 이식.
 *
 * Tier 0/1/2 행을 세로로 쌓고, 각 행은:
 *   [stripe 88px (Tier 0/1/2)] [chip grid (진령 이름 + trait)]
 *
 * 디자인:
 *  - stripe: ::before linear-gradient 22% opacity + ::after 좌측 2px 액센트 바
 *  - tier-color: 0→vermilion, 1→bronze, 2→indigo
 *  - chip: hover 시 tier-color 보더 + translateY(-1px)
 *  - 모바일 (≤480px): stripe 64px 로 축소
 *
 * 출처: source CSS 823-870 + docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.4
 */
import Link from 'next/link';

import { cn } from '@/lib/utils';

export interface TierStackItem {
  readonly id: string;
  readonly name: string;
  /** 짧은 특성 한 줄 (예: "치명타 회심") */
  readonly trait: string;
  /** 클릭 시 이동 — 미제공시 plain div */
  readonly href?: string;
}

export interface TierStackProps {
  readonly tiers: ReadonlyArray<{
    readonly tier: 0 | 1 | 2;
    readonly label?: string;
    readonly items: readonly TierStackItem[];
  }>;
  readonly className?: string;
}

const TIER_TOKEN: Record<0 | 1 | 2, { color: string; bg: string; hover: string }> = {
  0: {
    color: 'var(--color-vermilion)',
    bg: 'bg-vermilion',
    hover: 'hover:border-vermilion',
  },
  1: {
    color: 'var(--color-bronze)',
    bg: 'bg-bronze',
    hover: 'hover:border-bronze',
  },
  2: {
    color: 'var(--color-indigo)',
    bg: 'bg-indigo',
    hover: 'hover:border-indigo',
  },
};

export function TierStack({ tiers, className }: TierStackProps): React.JSX.Element {
  return (
    <div className={cn('mt-3 grid gap-3.5', className)} role="list">
      {tiers.map(({ tier, label, items }) => (
        <TierRow key={tier} tier={tier} label={label} items={items} />
      ))}
    </div>
  );
}

function TierRow({
  tier,
  label,
  items,
}: {
  tier: 0 | 1 | 2;
  label?: string | undefined;
  items: readonly TierStackItem[];
}): React.JSX.Element {
  const token = TIER_TOKEN[tier];
  return (
    <div
      role="listitem"
      className={cn(
        'grid overflow-hidden rounded-[14px] border border-ink-line-strong bg-ink-card backdrop-blur-[12px]',
        'grid-cols-[64px_1fr] sm:grid-cols-[88px_1fr]',
      )}
    >
      {/* Stripe */}
      <div
        className="relative grid place-items-center font-mono text-[0.9rem] font-bold tracking-[-0.02em] text-text sm:text-[1.1rem]"
        aria-label={label ?? `티어 ${tier}`}
      >
        {/* 좌측 액센트 바 (2px) */}
        <span
          aria-hidden
          className={cn(
            'absolute inset-y-[10%] left-0 w-[2px]',
            token.bg,
          )}
        />
        {/* 그라데이션 오버레이 (22% opacity) */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.22]"
          style={{
            background: `linear-gradient(135deg, ${token.color} 0%, transparent 100%)`,
          }}
        />
        <span className="relative">{label ?? `T${tier}`}</span>
      </div>

      {/* 진령 chip 그리드 */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-4">
        {items.map((item) => (
          <TierChip key={item.id} item={item} tier={tier} />
        ))}
      </div>
    </div>
  );
}

function TierChip({
  item,
  tier,
}: {
  item: TierStackItem;
  tier: 0 | 1 | 2;
}): React.JSX.Element {
  const token = TIER_TOKEN[tier];
  const baseCn = cn(
    'inline-flex min-w-0 flex-col rounded-[10px] border border-ink-line-strong bg-[rgba(14,14,21,0.5)] px-3.5 py-2',
    'transition-all duration-150 ease-out',
    token.hover,
  );
  const content = (
    <>
      <span className="block text-[0.92rem] font-semibold text-text">{item.name}</span>
      <span className="mt-0.5 block text-[0.74rem] text-text-mute">{item.trait}</span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={cn(baseCn, 'hover:-translate-y-[1px]')}>
        {content}
      </Link>
    );
  }
  return <div className={baseCn}>{content}</div>;
}
