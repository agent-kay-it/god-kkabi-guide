/**
 * <JinryeongCard> — 진령 1종 카드 (이름 + 등급 + 진영 + 효과 + 추천).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0.1 + source line 1612-1623
 *
 * 데이터 어댑터: WikiJinryeongData (Firestore DocSnap)을 props로 수신.
 */
import { Sparkles } from 'lucide-react';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { BookmarkButton } from '@/components/feature/bookmark-button';
import {
  FACTION_LABEL,
  ROLE_LABEL,
  RARITY_LABEL,
  type WikiJinryeongDoc,
} from '@/types/wiki';
import { cn } from '@/lib/utils';

type WikiJinryeongData = Omit<WikiJinryeongDoc, 'updatedAt'>;

const FACTION_VARIANT: Record<WikiJinryeongData['faction'], 'indigo' | 'jade' | 'bronze'> = {
  sin: 'indigo',
  yo: 'jade',
  in: 'bronze',
};

const TIER_ACCENT: Record<0 | 1 | 2, 'warrior' | 'swordsman' | 'mage'> = {
  0: 'warrior',
  1: 'swordsman',
  2: 'mage',
};

export interface JinryeongCardProps {
  data: WikiJinryeongData;
  /** 컴팩트 모드 — 표 행 대체용 (효과 짧게 / strengths 숨김) */
  compact?: boolean;
  canBookmark?: boolean;
  initialBookmarked?: boolean;
  className?: string;
}

export function JinryeongCard({
  data,
  compact = false,
  canBookmark = false,
  initialBookmarked = false,
  className,
}: JinryeongCardProps): React.JSX.Element {
  const accent = TIER_ACCENT[data.tier];
  const factionVariant = FACTION_VARIANT[data.faction];

  return (
    <GlassCard
      accent={accent}
      className={cn(
        'flex flex-col gap-3 p-4',
        data.featured && 'shadow-glow-bronze ring-1 ring-bronze/40',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-base font-bold text-text">{data.name}</h3>
            {data.featured ? (
              <Sparkles aria-hidden className="h-3.5 w-3.5 text-bronze-soft" />
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-text-soft">{data.effectShort}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant={`tier-${data.tier}` as 'tier-0' | 'tier-1' | 'tier-2'}>
            T{data.tier}
          </Badge>
          <BookmarkButton
            targetType="jinryeong"
            targetId={data.id}
            title={data.name}
            href={`/jinryeong#${data.id}`}
            canBookmark={canBookmark}
            initialBookmarked={initialBookmarked}
          />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant={data.rarity === 'rare_ssr' ? 'vermilion' : 'bronze'}
          className="text-[0.7rem]"
        >
          {RARITY_LABEL[data.rarity]}
        </Badge>
        <Badge variant={factionVariant} className="text-[0.7rem]">
          {FACTION_LABEL[data.faction]}
        </Badge>
        <Badge variant="outline" className="text-[0.7rem]">
          {ROLE_LABEL[data.role]}
        </Badge>
      </div>

      {!compact ? (
        <p className="text-sm leading-relaxed text-text-soft">{data.effectLong}</p>
      ) : null}

      {!compact && data.recommendedFor.length > 0 ? (
        <section
          aria-label={`${data.name} 추천 상황`}
          className="rounded-md bg-ink-elev/55 p-2.5"
        >
          <h4 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-text-mute">
            추천 상황
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {data.recommendedFor.map((r) => (
              <li
                key={r}
                className="rounded-full bg-ink-card-strong px-2 py-0.5 text-[0.7rem] text-text-soft"
              >
                {r}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </GlassCard>
  );
}
