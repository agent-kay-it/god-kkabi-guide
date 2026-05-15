/**
 * <ContentCard> — 던전/PvP/이벤트/메커니즘 1종 카드.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0 + source dungeon/event sections
 */
import { CheckCircle2 } from 'lucide-react';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { BookmarkButton } from '@/components/feature/bookmark-button';
import {
  CONTENT_KIND_LABEL,
  SCHEDULE_LABEL,
  SCHEDULE_ACCENT,
  type WikiContentDoc,
} from '@/types/wiki';
import { cn } from '@/lib/utils';

type WikiContentData = Omit<WikiContentDoc, 'updatedAt'>;

const KIND_STRIPE: Record<
  WikiContentData['kind'],
  'warrior' | 'swordsman' | 'mage' | 'pve' | 'pvp'
> = {
  dungeon: 'pve',
  pvp: 'pvp',
  event: 'swordsman',
  mechanic: 'mage',
  meta: 'swordsman',
};

export interface ContentCardProps {
  data: WikiContentData;
  canBookmark?: boolean;
  initialBookmarked?: boolean;
  className?: string;
}

export function ContentCard({
  data,
  canBookmark = false,
  initialBookmarked = false,
  className,
}: ContentCardProps): React.JSX.Element {
  const accent = KIND_STRIPE[data.kind];
  const scheduleVariant = SCHEDULE_ACCENT[data.schedule];

  return (
    <GlassCard accent={accent} className={cn('flex flex-col gap-3 p-5', className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {data.badge ? (
              <span className="font-mono text-[0.7rem] tracking-[0.08em] text-bronze">
                {data.badge}
              </span>
            ) : null}
            <Badge variant={scheduleVariant} className="text-[0.65rem]">
              {SCHEDULE_LABEL[data.schedule]}
            </Badge>
            <Badge variant="muted" className="text-[0.65rem]">
              {CONTENT_KIND_LABEL[data.kind]}
            </Badge>
          </div>
          <h3 className="mt-1.5 text-base font-bold text-text">{data.name}</h3>
          <p className="mt-1 text-sm text-text-soft">{data.summary}</p>
        </div>
        <BookmarkButton
          targetType="content"
          targetId={data.id}
          title={data.name}
          href={`/content#${data.id}`}
          canBookmark={canBookmark}
          initialBookmarked={initialBookmarked}
        />
      </header>

      {data.description ? (
        <p className="text-sm leading-relaxed text-text-soft">{data.description}</p>
      ) : null}

      {data.keyPoints && data.keyPoints.length > 0 ? (
        <ul className="space-y-1 rounded-md bg-ink-elev/55 p-3">
          {data.keyPoints.map((p) => (
            <li key={p} className="flex items-start gap-2 text-xs text-text">
              <CheckCircle2 aria-hidden className="mt-0.5 h-3 w-3 shrink-0 text-jade" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {data.rewardNote ? (
        <p className="text-[0.72rem] text-bronze-soft">
          <span className="mr-1 font-mono uppercase tracking-wider">REWARD</span>
          {data.rewardNote}
        </p>
      ) : null}
    </GlassCard>
  );
}
