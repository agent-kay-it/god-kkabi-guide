/**
 * SLO 계산 helpers — Sprint 24 F24-D.
 * 출처: docs/05-policy/slo-policy.md
 *
 * Pure functions — Sentry 통합 후에도 그대로 재사용 가능.
 * 실 Sentry 통합 + secrets 등록은 Sprint 25 carry.
 */

/** Latency 백분위수 (p50 / p95 / p99) 계산 */
export function calcPercentile(values: readonly number[], pct: number): number {
  if (values.length === 0) return 0;
  if (pct <= 0) return Math.min(...values);
  if (pct >= 100) return Math.max(...values);
  const sorted = [...values].sort((a, b) => a - b);
  // Linear interpolation 방식
  const rank = (pct / 100) * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return sorted[lower]!;
  const lowerVal = sorted[lower]!;
  const upperVal = sorted[upper]!;
  const fraction = rank - lower;
  return lowerVal + (upperVal - lowerVal) * fraction;
}

/** Error rate (0-1) 계산 — Errors / Total */
export function calcErrorRate(errorCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.max(0, Math.min(1, errorCount / totalCount));
}

/**
 * SLO 임계값 (docs/05-policy/slo-policy.md §2 참조).
 * 변경 시 정책 문서 동기화 필요.
 */
export const SLO_THRESHOLDS = {
  AVAILABILITY_TARGET: 0.995, // 99.5%
  P95_LATENCY_MS: 1500,
  P99_LATENCY_MS: 3000,
  ERROR_RATE_5XX: 0.005, // 0.5%
  EXCEPTION_RATE: 0.001, // 0.1%
  SATURATION_PCT: 0.8, // 80%
} as const;

export type SLOStatus = 'green' | 'yellow' | 'red';

export interface SLOCheck {
  readonly metric: string;
  readonly value: number;
  readonly threshold: number;
  readonly status: SLOStatus;
}

/** 단일 메트릭의 SLO 상태 판정 (lower-is-better 메트릭) */
export function checkLowerIsBetter(
  metric: string,
  value: number,
  threshold: number,
): SLOCheck {
  let status: SLOStatus;
  if (value <= threshold) status = 'green';
  else if (value <= threshold * 1.5) status = 'yellow';
  else status = 'red';
  return { metric, value, threshold, status };
}

/** 단일 메트릭의 SLO 상태 판정 (higher-is-better 메트릭, 예: availability) */
export function checkHigherIsBetter(
  metric: string,
  value: number,
  threshold: number,
): SLOCheck {
  let status: SLOStatus;
  if (value >= threshold) status = 'green';
  else if (value >= threshold * 0.95) status = 'yellow';
  else status = 'red';
  return { metric, value, threshold, status };
}

export interface SLOSnapshot {
  readonly latencyValues: readonly number[];
  readonly errorCount: number;
  readonly totalCount: number;
  readonly exceptionCount: number;
  readonly availabilityPct: number; // 0-1
}

/**
 * SLO 종합 평가 — Sentry 또는 자체 메트릭 수집 결과를 본 input 으로 변환 후 호출.
 */
export function evaluateSLO(snapshot: SLOSnapshot): readonly SLOCheck[] {
  const p95 = calcPercentile(snapshot.latencyValues, 95);
  const p99 = calcPercentile(snapshot.latencyValues, 99);
  const errorRate = calcErrorRate(snapshot.errorCount, snapshot.totalCount);
  const exceptionRate = calcErrorRate(
    snapshot.exceptionCount,
    snapshot.totalCount,
  );

  return [
    checkLowerIsBetter('p95_latency_ms', p95, SLO_THRESHOLDS.P95_LATENCY_MS),
    checkLowerIsBetter('p99_latency_ms', p99, SLO_THRESHOLDS.P99_LATENCY_MS),
    checkLowerIsBetter('error_rate_5xx', errorRate, SLO_THRESHOLDS.ERROR_RATE_5XX),
    checkLowerIsBetter('exception_rate', exceptionRate, SLO_THRESHOLDS.EXCEPTION_RATE),
    checkHigherIsBetter(
      'availability',
      snapshot.availabilityPct,
      SLO_THRESHOLDS.AVAILABILITY_TARGET,
    ),
  ];
}

/** 전체 SLO 상태 — 가장 나쁜 individual status 반환 */
export function overallStatus(checks: readonly SLOCheck[]): SLOStatus {
  if (checks.some((c) => c.status === 'red')) return 'red';
  if (checks.some((c) => c.status === 'yellow')) return 'yellow';
  return 'green';
}
