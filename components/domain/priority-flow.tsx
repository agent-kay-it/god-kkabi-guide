/**
 * <PriorityFlow> — 자원 투자 우선순위 (단계별 flow).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0 — v2 bronze + glass + 모노 번호.
 */
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PriorityStep {
  rank: number;
  label: string;
  reason: string;
}

export interface PriorityFlowProps {
  steps: readonly PriorityStep[];
  title?: string;
  className?: string;
}

export function PriorityFlow({
  steps,
  title,
  className,
}: PriorityFlowProps): React.JSX.Element {
  return (
    <section
      aria-label={title ?? '자원 투자 우선순위'}
      className={cn(
        'glass rounded-[var(--radius-card-lg)] p-5 sm:p-6',
        className,
      )}
    >
      {title ? (
        <h3 className="mb-4 text-base font-bold text-bronze-soft sm:text-lg">{title}</h3>
      ) : null}
      <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
        {steps.map((step, i) => (
          <li key={step.rank} className="flex flex-1 items-stretch gap-2">
            <article className="flex flex-1 gap-3 rounded-lg bg-ink-elev p-3 transition-card hover:bg-ink-card-strong sm:p-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bronze font-mono font-black text-ink-base"
              >
                {step.rank}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">{step.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-text-soft">
                  {step.reason}
                </p>
              </div>
            </article>
            {i < steps.length - 1 ? (
              <ChevronRight
                aria-hidden="true"
                className="hidden h-6 w-6 self-center text-bronze lg:block"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
