/**
 * Pure rate-limit decision policy — `enforceChatRateLimit` 트랜잭션 내부 + vitest 검증용.
 * 출처: docs/sprint/10-sprint-launch/design.md §7 + Task #27
 *
 * 본 모듈은 server-only / 'use server' 어디에도 묶이지 않음 — 순수 함수만 export.
 * Firestore tx의 read → decide → write 흐름에서 decide 단계를 격리한다.
 */

const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const RATE_LIMIT_PER_MINUTE_DEFAULT = 10;
export const RATE_LIMIT_PER_HOUR_DEFAULT = 60;

export type RateLimitDecision =
  | {
      ok: true;
      nextMinuteCount: number;
      nextHourCount: number;
      resetMinuteWindow: boolean;
      resetHourWindow: boolean;
    }
  | {
      ok: false;
      scope: 'minute' | 'hour';
      retryAfterMs: number;
    };

export interface RateLimitInput {
  readonly nowMs: number;
  readonly minuteWindowStartMs: number;
  readonly minuteCount: number;
  readonly hourWindowStartMs: number;
  readonly hourCount: number;
  readonly perMinute?: number;
  readonly perHour?: number;
}

export function decideRateLimit(input: RateLimitInput): RateLimitDecision {
  const perMinute = input.perMinute ?? RATE_LIMIT_PER_MINUTE_DEFAULT;
  const perHour = input.perHour ?? RATE_LIMIT_PER_HOUR_DEFAULT;
  const minuteWindowActive = input.nowMs - input.minuteWindowStartMs < ONE_MINUTE_MS;
  const hourWindowActive = input.nowMs - input.hourWindowStartMs < ONE_HOUR_MS;
  const nextMinuteCount = minuteWindowActive ? input.minuteCount + 1 : 1;
  const nextHourCount = hourWindowActive ? input.hourCount + 1 : 1;

  if (nextMinuteCount > perMinute) {
    return {
      ok: false,
      scope: 'minute',
      retryAfterMs: Math.max(ONE_MINUTE_MS - (input.nowMs - input.minuteWindowStartMs), 0),
    };
  }
  if (nextHourCount > perHour) {
    return {
      ok: false,
      scope: 'hour',
      retryAfterMs: Math.max(ONE_HOUR_MS - (input.nowMs - input.hourWindowStartMs), 0),
    };
  }
  return {
    ok: true,
    nextMinuteCount,
    nextHourCount,
    resetMinuteWindow: !minuteWindowActive,
    resetHourWindow: !hourWindowActive,
  };
}
