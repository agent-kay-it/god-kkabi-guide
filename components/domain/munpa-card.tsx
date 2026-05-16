/**
 * <MunpaCard> — 문파 가이드 카드 (가입 이점 / 선택 기준 / 매너).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0 + source munpa section
 */
import { Users, Filter, Heart } from 'lucide-react';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import type { WikiMunpaGuideDoc } from '@/types/wiki';
import { cn } from '@/lib/utils';

const CATEGORY_LABEL: Record<WikiMunpaGuideDoc['category'], string> = {
  benefit: '가입 이점',
  criteria: '선택 기준',
  etiquette: '매너',
};

const CATEGORY_VARIANT: Record<
  WikiMunpaGuideDoc['category'],
  'jade' | 'bronze' | 'indigo'
> = {
  benefit: 'jade',
  criteria: 'bronze',
  etiquette: 'indigo',
};

const CATEGORY_STRIPE: Record<
  WikiMunpaGuideDoc['category'],
  'pve' | 'swordsman' | 'mage'
> = {
  benefit: 'pve',
  criteria: 'swordsman',
  etiquette: 'mage',
};

const CATEGORY_ICON: Record<WikiMunpaGuideDoc['category'], React.ElementType> = {
  benefit: Users,
  criteria: Filter,
  etiquette: Heart,
};

export interface MunpaCardProps {
  data: WikiMunpaGuideDoc;
  className?: string;
}

export function MunpaCard({ data, className }: MunpaCardProps): React.JSX.Element {
  const Icon = CATEGORY_ICON[data.category];
  const variant = CATEGORY_VARIANT[data.category];
  const stripe = CATEGORY_STRIPE[data.category];

  return (
    <GlassCard accent={stripe} className={cn('flex flex-col gap-3 p-5', className)}>
      <header className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            variant === 'jade' && 'bg-jade/15 text-jade',
            variant === 'bronze' && 'bg-bronze/15 text-bronze',
            variant === 'indigo' && 'bg-indigo/15 text-indigo',
          )}
        >
          <Icon aria-hidden className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <Badge variant={variant} className="mb-1.5 text-[0.65rem]">
            {CATEGORY_LABEL[data.category]}
          </Badge>
          <h3 className="text-base font-bold text-text">{data.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-text-soft">{data.summary}</p>
        </div>
      </header>

      {data.bullets && data.bullets.length > 0 ? (
        <ul className="ml-12 space-y-1 text-xs text-text-soft">
          {data.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 h-1 w-1 shrink-0 rounded-full bg-bronze" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </GlassCard>
  );
}
