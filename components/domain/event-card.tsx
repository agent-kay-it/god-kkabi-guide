/**
 * <EventCard> — 이벤트 정보 카드.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0 + component-inventory-v2.md §3.2 (v2 재작성 — P3.C에서 Firestore 어댑터화)
 *
 * v2 색 매핑: limited=vermilion / permanent=jade / collab=indigo (cyan/purple/red 폐기).
 * P3.A 단계는 토큰 swap만, Firestore 어댑터는 P3.C 작업.
 */
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const eventVariants = cva(
  'flex flex-col gap-3 rounded-[var(--radius-card)] border bg-ink-card p-5 transition-card hover:bg-ink-card-strong backdrop-blur-md',
  {
    variants: {
      type: {
        limited: 'border-vermilion/40',
        permanent: 'border-jade/40',
        collab: 'border-indigo/40 shadow-glow-bronze',
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

const TYPE_BADGE_COLOR: Record<EventType, string> = {
  limited: 'bg-vermilion/15 text-vermilion-soft',
  permanent: 'bg-jade/15 text-jade-soft',
  collab: 'bg-indigo/15 text-indigo',
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
        <h3 className="text-base font-bold text-text">{title}</h3>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            TYPE_BADGE_COLOR[type],
          )}
        >
          {TYPE_LABEL[type]}
        </span>
      </header>

      <p className="flex items-center gap-1.5 text-xs text-text-soft">
        <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-bronze" />
        <span className="font-mono">{formatPeriod(period)}</span>
      </p>

      <section aria-label="보상">
        <h4 className="mb-1.5 text-xs font-semibold text-text-soft">보상</h4>
        <ul className="space-y-0.5 text-sm text-text">
          {rewards.map((r) => (
            <li key={r} className="flex items-start gap-1.5">
              <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-bronze" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      {notes ? <p className="text-xs italic text-text-mute">{notes}</p> : null}
    </article>
  );
}
