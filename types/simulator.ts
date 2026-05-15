/**
 * 빌드 시뮬레이터 (F3.1) 타입 — Sprint V2.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §1
 *
 * 진령 3선택 시너지 시각화. 11 진령 × 11 × 11 / 3! = 165 조합.
 * 시드 데이터는 운영자 작성 (게임 메타 기반 + 사용자 통계 누적으로 점진 보강).
 */

import type { WikiJinryeongId } from '@/types/wiki';

export type SynergyTier = 'S' | 'A' | 'B' | 'C';

export type ClassId = 'warrior' | 'swordsman' | 'medium';

export interface JinryeongSynergyDef {
  /** alpha-sorted comboId = `${j1}_${j2}_${j3}` */
  readonly comboId: string;
  readonly jinryeongIds: readonly [WikiJinryeongId, WikiJinryeongId, WikiJinryeongId];
  readonly synergyScore: number; // 0-100
  readonly tier: SynergyTier;
  readonly recommendedClass?: ClassId;
  readonly description: string;
  readonly note?: string;
}

export interface SimulatorState {
  readonly selected: ReadonlyArray<WikiJinryeongId>; // 최대 3
  readonly classId?: ClassId;
}

export interface SimulatorRunDoc {
  readonly id: string;
  readonly uid?: string; // 익명 허용
  readonly comboId: string;
  readonly jinryeongIds: readonly WikiJinryeongId[];
  readonly classId?: ClassId;
  readonly synergyScore: number;
  readonly tier: SynergyTier;
  readonly timestampMs: number;
}

/** comboId 결정적 생성 — alpha sort + underscore join */
export function buildComboId(ids: readonly WikiJinryeongId[]): string {
  return [...ids].sort().join('_');
}

export const SYNERGY_TIER_LABEL: Record<SynergyTier, string> = {
  S: 'S — 최상',
  A: 'A — 추천',
  B: 'B — 무난',
  C: 'C — 비추',
};

export const SYNERGY_TIER_COLOR: Record<SynergyTier, 'vermilion' | 'bronze' | 'jade' | 'muted'> = {
  S: 'vermilion',
  A: 'bronze',
  B: 'jade',
  C: 'muted',
};
