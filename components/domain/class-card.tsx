/**
 * <ClassCard> — 직업 카드 (전사/검객/영매 3 variant).
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.3
 * 원본 HTML: `.class-card.warrior` / `.swordsman` / `.mage`
 */
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ClassId } from '@/types';

const classCardVariants = cva(
  'group relative flex flex-col gap-3 rounded-card border-l-4 bg-bg-card p-5 transition-card hover:bg-bg-card-hover sm:p-6',
  {
    variants: {
      variant: {
        warrior: 'border-accent-red',
        swordsman: 'border-accent-gold',
        medium: 'border-accent-purple',
      },
    },
    defaultVariants: { variant: 'warrior' },
  },
);

export interface ClassCardProps extends VariantProps<typeof classCardVariants> {
  variant: ClassId;
  emoji: string;
  name: string;
  tag: string;
  strengths: readonly string[];
  recommendedJinryeong: readonly string[];
  buildLinkHref?: string;
  buildLinkLabel?: string;
  className?: string;
}

export function ClassCard({
  variant,
  emoji,
  name,
  tag,
  strengths,
  recommendedJinryeong,
  buildLinkHref,
  buildLinkLabel = '메타 빌드 보기',
  className,
}: ClassCardProps): React.JSX.Element {
  return (
    <article
      className={cn(classCardVariants({ variant }), className)}
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-secondary))',
      }}
      aria-label={`${name} 직업 카드`}
    >
      <header className="flex items-center gap-3">
        <span className="text-[2.2rem] leading-none" aria-hidden="true">
          {emoji}
        </span>
        <div className="flex flex-col">
          <h3 className="text-[1.3rem] font-bold text-accent-gold">{name}</h3>
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {tag}
          </span>
        </div>
      </header>

      <section aria-label="핵심 강점">
        <h4 className="mb-1.5 text-sm font-semibold text-text-secondary">핵심 강점</h4>
        <ul className="space-y-1 text-sm text-text-primary">
          {strengths.map((s) => (
            <li key={s} className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gold" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="추천 진령 3종">
        <h4 className="mb-1.5 text-sm font-semibold text-text-secondary">추천 진령</h4>
        <ul className="flex flex-wrap gap-1.5">
          {recommendedJinryeong.map((j) => (
            <li
              key={j}
              className="rounded-pill bg-bg-secondary px-2.5 py-0.5 text-xs text-text-primary"
            >
              {j}
            </li>
          ))}
        </ul>
      </section>

      {buildLinkHref ? (
        <Link
          href={buildLinkHref}
          className="mt-2 text-sm font-semibold text-accent-gold underline-offset-4 hover:text-accent-gold-light hover:underline"
        >
          {buildLinkLabel} →
        </Link>
      ) : null}
    </article>
  );
}
