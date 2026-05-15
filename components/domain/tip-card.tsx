/**
 * <TipCard> — 실전 팁 박스.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0 + component-inventory-v2.md §3.2 (v2 재작성 예정 — P3.C에서 Firestore 어댑터화)
 *
 * 본 컴포넌트는 P3.A 단계에서는 v2 토큰만 적용 (정적 props 유지).
 * P3.C에서 Firestore `tips/{id}` DocSnap 어댑터 + 북마크 토글 추가 예정.
 */
import { Lightbulb } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tipVariants = cva(
  'flex gap-3 rounded-[var(--radius-card)] border-l-4 bg-ink-card p-4 transition-card hover:bg-ink-card-strong backdrop-blur-md',
  {
    variants: {
      category: {
        general: 'border-bronze',
        beginner: 'border-jade',
        advanced: 'border-indigo',
        pvp: 'border-vermilion',
      },
    },
    defaultVariants: { category: 'general' },
  },
);

const CATEGORY_LABEL = {
  general: '일반 팁',
  beginner: '초보 팁',
  advanced: '고급 팁',
  pvp: 'PvP 팁',
} as const;

export type TipCategory = keyof typeof CATEGORY_LABEL;

export interface TipCardProps extends VariantProps<typeof tipVariants> {
  category: TipCategory;
  title: string;
  content: string;
  className?: string;
}

export function TipCard({
  category,
  title,
  content,
  className,
}: TipCardProps): React.JSX.Element {
  return (
    <article
      className={cn(tipVariants({ category }), className)}
      aria-label={`${title} 팁`}
    >
      <Lightbulb
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 shrink-0 text-bronze"
      />
      <div className="flex-1">
        <header className="mb-1 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-text">{title}</h3>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-mute">
            {CATEGORY_LABEL[category]}
          </span>
        </header>
        <p className="text-sm leading-relaxed text-text-soft">{content}</p>
      </div>
    </article>
  );
}
