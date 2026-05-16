/**
 * <TOC> — 목차 그리드 (auto-fit minmax 220px).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0 — v2 토큰 적용 (bronze + glass)
 */
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface TOCItem {
  href: string;
  label: string;
  description?: string;
}

export interface TOCProps {
  items: readonly TOCItem[];
  title?: string;
  className?: string;
}

export function TOC({ items, title = '목차', className }: TOCProps): React.JSX.Element {
  return (
    <nav
      aria-label={title}
      className={cn(
        'glass rounded-[var(--radius-card-lg)] border-bronze/30 p-6 shadow-glow-bronze sm:p-8',
        className,
      )}
    >
      <h2 className="mb-4 text-lg font-bold text-bronze-soft sm:text-xl">{title}</h2>
      <ul
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex flex-col gap-1 rounded-lg px-3 py-2 text-text transition-card hover:translate-x-1 hover:bg-ink-card-strong hover:text-bronze"
            >
              <span className="text-sm font-semibold sm:text-base">{item.label}</span>
              {item.description ? (
                <span className="text-xs text-text-mute group-hover:text-text-soft">
                  {item.description}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
