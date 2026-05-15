/**
 * <EquipmentCard> — 장비 가이드 카드 (제련 시스템 / 우선순위 / 강화 / 뽑기 / 분해).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0 + source equipment section
 */
import { AlertTriangle, Check } from 'lucide-react';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { BookmarkButton } from '@/components/feature/bookmark-button';
import { EQUIPMENT_TOPIC_LABEL, type WikiEquipmentDoc } from '@/types/wiki';
import { cn } from '@/lib/utils';

type WikiEquipmentData = Omit<WikiEquipmentDoc, 'updatedAt'>;

const TOPIC_VARIANT: Record<
  WikiEquipmentData['topic'],
  'bronze' | 'jade' | 'vermilion' | 'indigo'
> = {
  system: 'bronze',
  priority: 'bronze',
  enchant: 'jade',
  gacha: 'indigo',
  decompose: 'vermilion',
  set: 'indigo',
};

const TOPIC_STRIPE: Record<
  WikiEquipmentData['topic'],
  'swordsman' | 'pve' | 'mage' | 'warrior' | 'pvp'
> = {
  system: 'swordsman',
  priority: 'swordsman',
  enchant: 'pve',
  gacha: 'mage',
  decompose: 'pvp',
  set: 'mage',
};

export interface EquipmentCardProps {
  data: WikiEquipmentData;
  canBookmark?: boolean;
  initialBookmarked?: boolean;
  className?: string;
}

export function EquipmentCard({
  data,
  canBookmark = false,
  initialBookmarked = false,
  className,
}: EquipmentCardProps): React.JSX.Element {
  const variant = TOPIC_VARIANT[data.topic];
  const stripe = TOPIC_STRIPE[data.topic];

  return (
    <GlassCard accent={stripe} className={cn('flex flex-col gap-3 p-5', className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Badge variant={variant} className="mb-2 text-[0.65rem]">
            {EQUIPMENT_TOPIC_LABEL[data.topic]}
          </Badge>
          <h3 className="text-base font-bold text-text">{data.name}</h3>
          <p className="mt-1 text-sm text-text-soft">{data.summary}</p>
        </div>
        <BookmarkButton
          targetType="equipment"
          targetId={data.id}
          title={data.name}
          href={`/equipment#${data.id}`}
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
              <Check aria-hidden className="mt-0.5 h-3 w-3 shrink-0 text-bronze" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {data.warningNote ? (
        <p className="flex items-start gap-2 rounded-md border border-vermilion/30 bg-vermilion/10 p-2.5 text-xs text-vermilion-soft">
          <AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {data.warningNote}
        </p>
      ) : null}
    </GlassCard>
  );
}
