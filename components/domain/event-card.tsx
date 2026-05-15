/**
 * <EventCard> — 이벤트 정보 카드.
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.11
 */
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const eventVariants = cva(
  'flex flex-col gap-3 rounded-card border bg-bg-card p-5 transition-card hover:bg-bg-card-hover',
  {
    variants: {
      type: {
        limited: 'border-accent-red',
        permanent: 'border-accent-cyan',
        collab: 'border-accent-purple shadow-glow',
      },
    },
    defaultVariants: { type: 'limited' },
  },
);

export type EventType = 'limited' | 'permanent' | 'collab';

const TYPE_LABEL: Record<EventType, string> = {
  limited: '기간 한정',
  permanent: '상시',
  collab: '콜라보',
};

export interface EventCardProps extends VariantProps<typeof eventVariants> {
  title: string;
  period: { start: Date; end?: Date };
  type: EventType;
  rewards: readonly string[];
  notes?: string;
  className?: string;
}

function formatPeriod(period: EventCardProps['period']): string {
  const start = format(period.start, 'yyyy.MM.dd', { locale: ko });
  if (!period.end) return `${start} ~ 상시`;
  const end = format(period.end, 'yyyy.MM.dd', { locale: ko });
  return `${start} ~ ${end}`;
}

export function EventCard({
  title,
  period,
  type,
  rewards,
  notes,
  className,
}: EventCardProps): React.JSX.Element {
  return (
    <article
      className={cn(eventVariants({ type }), className)}
      aria-label={`${title} 이벤트`}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        <span className="shrink-0 rounded-pill bg-bg-secondary px-2 py-0.5 text-[11px] font-semibold text-text-muted">
          {TYPE_LABEL[type]}
        </span>
      </header>

      <p className="flex items-center gap-1.5 text-xs text-text-secondary">
        <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-accent-gold" />
        {formatPeriod(period)}
      </p>

      <section aria-label="보상">
        <h4 className="mb-1.5 text-xs font-semibold text-text-secondary">보상</h4>
        <ul className="space-y-0.5 text-sm text-text-primary">
          {rewards.map((r) => (
            <li key={r} className="flex items-start gap-1.5">
              <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-accent-gold" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      {notes ? (
        <p className="text-xs italic text-text-muted">{notes}</p>
      ) : null}
    </article>
  );
}
