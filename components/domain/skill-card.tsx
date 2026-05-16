/**
 * <SkillCard> — 스킬 1종 카드.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0 + source skills table
 *
 * core (vermilion) / active (bronze) / passive (indigo) accent.
 */
import { Sparkle, Sword, Zap, Shield } from 'lucide-react';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import {
  CLASS_ACCENT,
  SKILL_KIND_LABEL,
  SKILL_KIND_ACCENT,
  type WikiSkillDoc,
  type SkillKind,
} from '@/types/wiki';
import { cn } from '@/lib/utils';

type WikiSkillData = Omit<WikiSkillDoc, 'updatedAt'>;

const KIND_ICON: Record<SkillKind, React.ElementType> = {
  core: Sword,
  active: Zap,
  passive: Shield,
};

const KIND_VARIANT_TO_STRIPE: Record<
  'vermilion' | 'bronze' | 'indigo',
  'warrior' | 'swordsman' | 'mage'
> = {
  vermilion: 'warrior',
  bronze: 'swordsman',
  indigo: 'mage',
};

const CLASS_LABEL: Record<WikiSkillData['classId'], string> = {
  warrior: '전사',
  swordsman: '검객',
  medium: '영매',
};

export interface SkillCardProps {
  data: WikiSkillData;
  className?: string;
}

export function SkillCard({ data, className }: SkillCardProps): React.JSX.Element {
  const kindVariant = SKILL_KIND_ACCENT[data.kind];
  const stripeAccent = KIND_VARIANT_TO_STRIPE[kindVariant];
  const Icon = KIND_ICON[data.kind];
  const classAccent = CLASS_ACCENT[data.classId];

  return (
    <GlassCard
      accent={stripeAccent}
      className={cn('flex flex-col gap-3 p-4', className)}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon
              aria-hidden
              className={cn(
                'h-4 w-4',
                kindVariant === 'vermilion' && 'text-vermilion',
                kindVariant === 'bronze' && 'text-bronze',
                kindVariant === 'indigo' && 'text-indigo',
              )}
            />
            <h3 className="text-base font-bold text-text">{data.name}</h3>
          </div>
          <p className="mt-0.5 text-xs text-text-soft">{data.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={kindVariant} className="text-[0.7rem]">
            {SKILL_KIND_LABEL[data.kind]}
          </Badge>
          <Badge variant={classAccent === 'mage' ? 'indigo' : classAccent === 'warrior' ? 'vermilion' : 'bronze'} className="text-[0.65rem]">
            {CLASS_LABEL[data.classId]}
          </Badge>
        </div>
      </header>

      {data.metaNote ? (
        <p className="rounded-md bg-bronze/10 px-2.5 py-1.5 text-[0.72rem] text-bronze-soft">
          <Sparkle aria-hidden className="mr-1 inline-block h-3 w-3" />
          {data.metaNote}
        </p>
      ) : null}
    </GlassCard>
  );
}
