/**
 * <RecommendationCard> — 진령 추천 UI (마스터 V2 F3.5 1차 통합).
 * 출처: docs/sprint/21-sprint-coverage-master-v2-qa/design.md §4
 *
 * 사용자 보유 진령 + 직업 → top-3 시너지 빌드 추천.
 * Pure presentation 컴포넌트 (recommendBuilds 결과를 props 로 받음).
 */
'use client';

import { ChevronRight, Sparkles } from 'lucide-react';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { SYNERGY_TIER_LABEL, SYNERGY_TIER_COLOR } from '@/types/simulator';
import type { RecommendationResult } from '@/lib/simulator/recommend';
import type { ClassId } from '@/types/simulator';
import { cn } from '@/lib/utils';

export interface RecommendationCardProps {
  readonly result: RecommendationResult;
  readonly userClass?: ClassId;
  readonly className?: string;
}

export function RecommendationCard({
  result,
  userClass,
  className,
}: RecommendationCardProps): React.JSX.Element {
  return (
    <GlassCard className={cn('space-y-4 p-5', className)} aria-label="진령 추천 빌드">
      <header className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-bronze" aria-hidden />
        <h2 className="text-base font-semibold text-text">추천 빌드 top 3</h2>
        {userClass ? (
          <Badge variant="bronze" className="ml-auto">
            {userClass}
          </Badge>
        ) : null}
      </header>

      {!result.hasEnoughJinryeong ? (
        <p className="text-xs text-text-soft">
          보유 진령이 {result.ownedCount}개입니다. 3개 이상이면 보유 조합 기반 추천이 가능해요.
        </p>
      ) : null}

      <ol className="space-y-3" role="list">
        {result.synergies.map((ranked) => {
          const { synergy, rank, missingFromOwned, matchesClass } = ranked;
          return (
            <li
              key={synergy.comboId}
              className="rounded-lg border border-ink-line bg-ink-elev/40 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-mute">
                    <span className="font-mono">#{rank}</span>
                    <Badge variant={SYNERGY_TIER_COLOR[synergy.tier]}>
                      {SYNERGY_TIER_LABEL[synergy.tier]}
                    </Badge>
                    <span className="font-mono">점수 {synergy.synergyScore}</span>
                    {matchesClass ? (
                      <Badge variant="jade" className="text-[0.62rem]">
                        직업 적합
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-sm text-text">{synergy.description}</p>
                  {synergy.note ? (
                    <p className="mt-1 text-xs text-text-soft">{synergy.note}</p>
                  ) : null}
                  {missingFromOwned.length > 0 ? (
                    <p className="mt-2 text-xs text-vermilion-soft">
                      미보유: {missingFromOwned.join(', ')}
                    </p>
                  ) : null}
                </div>
                <ChevronRight className="h-4 w-4 text-text-mute" aria-hidden />
              </div>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}
