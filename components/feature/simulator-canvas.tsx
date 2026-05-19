/**
 * <SimulatorCanvas> — 빌드 시뮬레이터 클라이언트 컴포넌트.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §1.3
 *
 * 책임:
 *  - 진령 11 카드 그리드 (3 선택 토글)
 *  - 3 선택 시 getSynergy로 시너지 표시
 *  - "내 빌드 저장" → /post/new?prefill=simulator&combo=...
 *  - "결과 기록" → recordSimulatorRun (통계용)
 *  - GA4 simulator_run / simulator_save_build 발화
 *
 * Clean Arch: feature 컴포넌트, 도메인 진령 카드를 wrap.
 */
'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Save, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { recordSimulatorRun } from '@/lib/simulator/actions';
import { getSynergy } from '@/lib/simulator/synergy-matrix';
import {
  SYNERGY_TIER_LABEL,
  SYNERGY_TIER_COLOR,
} from '@/types/simulator';
import type { WikiJinryeongId, WikiJinryeongDoc } from '@/types/wiki';
import { logEvent } from '@/lib/firebase/analytics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

export interface SimulatorCanvasProps {
  readonly jinryeong: ReadonlyArray<Omit<WikiJinryeongDoc, 'updatedAt'>>;
}

export function SimulatorCanvas({
  jinryeong,
}: SimulatorCanvasProps): React.JSX.Element {
  const router = useRouter();
  const [selected, setSelected] = useState<readonly WikiJinryeongId[]>([]);
  const [isPending, startTransition] = useTransition();

  const synergy = useMemo(
    () => (selected.length === 3 ? getSynergy(selected) : null),
    [selected],
  );

  function toggle(id: WikiJinryeongId) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function reset() {
    setSelected([]);
  }

  function saveAsPost() {
    if (!synergy) return;
    const combo = synergy.comboId;
    void logEvent('simulator_save_build', {
      combo_id: combo,
      ...(synergy.recommendedClass ? { class_id: synergy.recommendedClass } : {}),
    });
    router.push(`/post/new?prefill=simulator&combo=${encodeURIComponent(combo)}`);
  }

  function record() {
    if (!synergy) return;
    startTransition(async () => {
      const r = await recordSimulatorRun({
        jinryeongIds: synergy.jinryeongIds,
        synergyScore: synergy.synergyScore,
        tier: synergy.tier,
        ...(synergy.recommendedClass ? { classId: synergy.recommendedClass } : {}),
      });
      if (r.ok) {
        void logEvent('simulator_run', {
          combo_id: synergy.comboId,
          tier: synergy.tier,
          ...(synergy.recommendedClass ? { class_id: synergy.recommendedClass } : {}),
        });
        toast.success('결과가 기록되었습니다');
      } else {
        toast.error('기록 실패 (네트워크 또는 권한)');
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* 선택 슬롯 */}
      <GlassCard className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-text">선택한 진령</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={selected.length === 0}
            className="gap-1 text-text-mute"
            aria-label="선택 초기화"
          >
            <RotateCcw className="h-3 w-3" />
            초기화
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((idx) => {
            const id = selected[idx];
            const item = id ? jinryeong.find((j) => j.id === id) : null;
            return (
              <div
                key={idx}
                className={cn(
                  'aspect-square rounded-md border-2 border-dashed p-3 text-center text-xs',
                  item
                    ? 'border-bronze bg-bronze/10 text-bronze-soft'
                    : 'border-ink-line text-text-mute',
                )}
                aria-label={item ? item.name : `슬롯 ${idx + 1} 비어있음`}
              >
                {item ? (
                  <span className="font-bold">{item.name}</span>
                ) : (
                  <span>슬롯 {idx + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* 시너지 결과 — Sprint 18 F18-E a11y: aria-live polite + aria-atomic. */}
      {synergy ? (
        <GlassCard
          className="space-y-3 p-5"
          role="region"
          aria-label="시너지 결과"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-bronze" aria-hidden />
              <h2 className="text-lg font-bold tracking-tight text-text">
                시너지 결과
              </h2>
            </div>
            <Badge variant={SYNERGY_TIER_COLOR[synergy.tier]}>
              {SYNERGY_TIER_LABEL[synergy.tier]}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-text">{synergy.description}</p>
            {synergy.note ? (
              <p className="text-xs text-text-mute">📝 {synergy.note}</p>
            ) : null}
            <div className="flex items-center gap-3 text-xs text-text-mute">
              <span className="font-mono">
                점수 <span className="font-bold text-text">{synergy.synergyScore}</span>/100
              </span>
              {synergy.recommendedClass ? (
                <span>추천 직업: {classLabel(synergy.recommendedClass)}</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={record}
              disabled={isPending}
              className="gap-1"
            >
              <Check className="h-3 w-3" />
              결과 기록
            </Button>
            <Button
              type="button"
              variant="bronze"
              size="sm"
              onClick={saveAsPost}
              className="gap-1"
            >
              <Save className="h-3 w-3" />
              빌드로 저장
            </Button>
          </div>
        </GlassCard>
      ) : (
        <p
          className="text-center text-sm text-text-mute"
          aria-live="polite"
          aria-atomic="true"
        >
          진령 3개를 선택하면 시너지 결과가 표시됩니다. (현재 {selected.length}/3 선택됨)
        </p>
      )}

      {/* 진령 그리드 — Sprint 18 F18-E a11y: 그룹 컨텍스트 명시. */}
      <div
        role="group"
        aria-label={`진령 11종 — 3개를 선택하세요 (현재 ${selected.length}/3)`}
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {jinryeong.map((j) => {
          const isSelected = selected.includes(j.id);
          const isDisabled = !isSelected && selected.length >= 3;
          return (
            <button
              key={j.id}
              type="button"
              onClick={() => toggle(j.id)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-label={`${j.name} ${isSelected ? '선택됨' : isDisabled ? '선택 불가 (3개 한도)' : '선택 안 됨'}, ${j.role}, T${j.tier}`}
              className={cn(
                'rounded-md border p-3 text-left transition',
                isSelected
                  ? 'border-bronze bg-bronze/15 ring-2 ring-bronze/30'
                  : 'border-ink-line bg-ink-elev hover:border-ink-line-strong',
                isDisabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-text">{j.name}</span>
                {isSelected ? <Check className="h-4 w-4 text-bronze" aria-hidden /> : null}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-text-soft">{j.effectShort}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1 text-[0.6rem] text-text-mute">
                <span className="font-mono">T{j.tier}</span>
                <span>·</span>
                <span>{j.role}</span>
                <span>·</span>
                <span>{j.rarity}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 빌드로 변환 안내 */}
      <p className="text-center text-xs text-text-mute">
        시뮬레이션 결과는 <Link href="/post" className="underline">커뮤니티</Link>에
        본인 빌드로 공유할 수 있습니다.
      </p>
    </div>
  );
}

function classLabel(c: 'warrior' | 'swordsman' | 'medium'): string {
  if (c === 'warrior') return '전사';
  if (c === 'swordsman') return '검객';
  return '영매';
}
