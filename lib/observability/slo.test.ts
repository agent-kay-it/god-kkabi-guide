/**
 * lib/observability/slo.ts — Sprint 24 F24-D 단위 테스트.
 */
import { describe, it, expect } from 'vitest';
import {
  calcPercentile,
  calcErrorRate,
  checkLowerIsBetter,
  checkHigherIsBetter,
  evaluateSLO,
  overallStatus,
  SLO_THRESHOLDS,
} from './slo';

describe('calcPercentile', () => {
  it('빈 배열 → 0', () => {
    expect(calcPercentile([], 95)).toBe(0);
  });

  it('단일 값 → 그 값', () => {
    expect(calcPercentile([100], 50)).toBe(100);
    expect(calcPercentile([100], 95)).toBe(100);
  });

  it('정렬된 값들의 백분위수', () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(calcPercentile(values, 50)).toBe(55); // linear interpolation 중간값
    expect(calcPercentile(values, 100)).toBe(100);
    expect(calcPercentile(values, 0)).toBe(10);
  });

  it('p95 (정수 boundary)', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1); // 1-100
    expect(calcPercentile(values, 95)).toBeCloseTo(95.05, 1);
  });

  it('역순 입력도 정렬 후 계산', () => {
    const values = [50, 40, 30, 20, 10];
    expect(calcPercentile(values, 50)).toBe(30);
  });

  it('pct <= 0 → min', () => {
    expect(calcPercentile([10, 20, 30], -10)).toBe(10);
  });
});

describe('calcErrorRate', () => {
  it('0/0 → 0 (division by zero 방어)', () => {
    expect(calcErrorRate(0, 0)).toBe(0);
  });

  it('5/100 → 0.05', () => {
    expect(calcErrorRate(5, 100)).toBe(0.05);
  });

  it('negative errors → 0 clamp', () => {
    expect(calcErrorRate(-1, 100)).toBe(0);
  });

  it('errors > total → 1 clamp', () => {
    expect(calcErrorRate(150, 100)).toBe(1);
  });
});

describe('SLO_THRESHOLDS', () => {
  it('docs/05-policy/slo-policy.md §2 값과 일치', () => {
    expect(SLO_THRESHOLDS.AVAILABILITY_TARGET).toBe(0.995);
    expect(SLO_THRESHOLDS.P95_LATENCY_MS).toBe(1500);
    expect(SLO_THRESHOLDS.P99_LATENCY_MS).toBe(3000);
    expect(SLO_THRESHOLDS.ERROR_RATE_5XX).toBe(0.005);
    expect(SLO_THRESHOLDS.EXCEPTION_RATE).toBe(0.001);
  });
});

describe('checkLowerIsBetter', () => {
  it('value <= threshold → green', () => {
    expect(checkLowerIsBetter('p95', 1000, 1500).status).toBe('green');
    expect(checkLowerIsBetter('p95', 1500, 1500).status).toBe('green');
  });

  it('value <= threshold * 1.5 → yellow', () => {
    expect(checkLowerIsBetter('p95', 2000, 1500).status).toBe('yellow');
    expect(checkLowerIsBetter('p95', 2250, 1500).status).toBe('yellow');
  });

  it('value > threshold * 1.5 → red', () => {
    expect(checkLowerIsBetter('p95', 2500, 1500).status).toBe('red');
  });
});

describe('checkHigherIsBetter', () => {
  it('value >= threshold → green', () => {
    expect(checkHigherIsBetter('availability', 0.999, 0.995).status).toBe('green');
    expect(checkHigherIsBetter('availability', 0.995, 0.995).status).toBe('green');
  });

  it('value >= threshold * 0.95 → yellow', () => {
    expect(checkHigherIsBetter('availability', 0.96, 0.995).status).toBe('yellow');
  });

  it('value < threshold * 0.95 → red', () => {
    expect(checkHigherIsBetter('availability', 0.90, 0.995).status).toBe('red');
  });
});

describe('evaluateSLO', () => {
  it('happy path — 모든 메트릭 green', () => {
    const r = evaluateSLO({
      latencyValues: [200, 300, 500, 800, 1000],
      errorCount: 1,
      totalCount: 1000,
      exceptionCount: 0,
      availabilityPct: 0.999,
    });
    expect(r.length).toBe(5);
    r.forEach((c) => expect(c.status).toBe('green'));
  });

  it('빈 latency → p95/p99 = 0 (green)', () => {
    const r = evaluateSLO({
      latencyValues: [],
      errorCount: 0,
      totalCount: 100,
      exceptionCount: 0,
      availabilityPct: 1.0,
    });
    const p95 = r.find((c) => c.metric === 'p95_latency_ms');
    expect(p95?.value).toBe(0);
    expect(p95?.status).toBe('green');
  });

  it('p95 over threshold → yellow/red', () => {
    const r = evaluateSLO({
      latencyValues: Array.from({ length: 100 }, () => 3000),
      errorCount: 0,
      totalCount: 100,
      exceptionCount: 0,
      availabilityPct: 1.0,
    });
    const p95 = r.find((c) => c.metric === 'p95_latency_ms');
    expect(p95?.status).toBe('red'); // 3000 > 1500 * 1.5
  });
});

describe('overallStatus', () => {
  it('all green → green', () => {
    expect(
      overallStatus([
        { metric: 'a', value: 0, threshold: 1, status: 'green' },
        { metric: 'b', value: 0, threshold: 1, status: 'green' },
      ]),
    ).toBe('green');
  });

  it('1 yellow → yellow', () => {
    expect(
      overallStatus([
        { metric: 'a', value: 0, threshold: 1, status: 'green' },
        { metric: 'b', value: 0, threshold: 1, status: 'yellow' },
      ]),
    ).toBe('yellow');
  });

  it('1 red dominates yellow → red', () => {
    expect(
      overallStatus([
        { metric: 'a', value: 0, threshold: 1, status: 'yellow' },
        { metric: 'b', value: 0, threshold: 1, status: 'red' },
      ]),
    ).toBe('red');
  });

  it('빈 배열 → green', () => {
    expect(overallStatus([])).toBe('green');
  });
});
