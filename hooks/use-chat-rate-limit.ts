/**
 * useChatRateLimit — 클라이언트 측 메시지 전송 rate limit (UI 가드).
 * 출처: docs/sprint/10-sprint-launch/design.md §7 + Task #27 server-side rate-limit과 상호보완
 *
 * 클라이언트 측 정책:
 *  - 1초당 1 메시지 (slow typing 기준)
 *  - 1분당 10 메시지 (server-side와 동일 limit, UI 사전 차단)
 *  - 1시간당 60 메시지 (server-side와 동일)
 *
 * 본 hook은 단일 디바이스/세션 가드. 진정한 보안 limit은 lib/chat/rate-limit.ts
 * (Firestore counter, Task #27)가 책임진다. 본 hook이 우회되더라도 server에서 차단.
 *
 * 반환:
 *  - canSend: 전송 가능 여부
 *  - hint: 사용자에게 노출할 다음 가능 시각 hint (UI에서 toast 등)
 *  - markSent: 전송 성공 시 호출 (timestamp 기록)
 */
'use client';

import { useCallback, useRef, useState } from 'react';

interface UseChatRateLimitOptions {
  /** 최소 송신 간격 ms (기본 600ms) */
  readonly minIntervalMs?: number;
  /** 1분당 최대 메시지 (기본 10) */
  readonly perMinute?: number;
  /** 1시간당 최대 메시지 (기본 60) */
  readonly perHour?: number;
}

export type ChatRateLimitCheck = { ok: true } | { ok: false; reason: string };

export interface ChatRateLimitState {
  /**
   * 직전 markSent / 초기화 시점의 평가 결과. UI hint 표시용. 실제 송신 직전엔
   * checkNow()로 신선한 평가를 받아야 timer drift를 피한다.
   */
  readonly lastEvaluation: ChatRateLimitCheck;
  readonly canSend: boolean;
  readonly hint: string | null;
  readonly markSent: () => void;
  /** 최근 전송 시점 기준 즉시 재검사 — submit 직전에 호출. */
  readonly checkNow: () => ChatRateLimitCheck;
}

const ONE_MINUTE_MS = 60_000;
const ONE_HOUR_MS = 60 * 60_000;

function evaluateInternal(
  history: readonly number[],
  minIntervalMs: number,
  perMinute: number,
  perHour: number,
): ChatRateLimitCheck {
  const now = Date.now();
  const last = history[history.length - 1];
  if (last && now - last < minIntervalMs) {
    const wait = Math.ceil((minIntervalMs - (now - last)) / 100) / 10;
    return { ok: false, reason: `너무 빠릅니다 (${wait}초 후 가능)` };
  }
  const within1m = history.filter((t) => now - t < ONE_MINUTE_MS).length;
  if (within1m >= perMinute) {
    return { ok: false, reason: `분당 ${perMinute}회 한도 초과 — 잠시 후 다시 시도하세요.` };
  }
  const within1h = history.filter((t) => now - t < ONE_HOUR_MS).length;
  if (within1h >= perHour) {
    return { ok: false, reason: `시간당 ${perHour}회 한도 초과 — 잠시 후 다시 시도하세요.` };
  }
  return { ok: true };
}

const INITIAL_OK: ChatRateLimitCheck = { ok: true };

export function useChatRateLimit(
  options: UseChatRateLimitOptions = {},
): ChatRateLimitState {
  const { minIntervalMs = 600, perMinute = 10, perHour = 60 } = options;

  // 전송 시각 ring buffer (최근 60건만 보관 — 시간당 충분)
  const sentAtRef = useRef<number[]>([]);
  // markSent 직후 evaluation 결과를 state로 보관 (render-time ref read 회피)
  const [lastEvaluation, setLastEvaluation] = useState<ChatRateLimitCheck>(INITIAL_OK);

  const checkNow = useCallback((): ChatRateLimitCheck => {
    return evaluateInternal(sentAtRef.current, minIntervalMs, perMinute, perHour);
  }, [minIntervalMs, perMinute, perHour]);

  const markSent = useCallback(() => {
    const now = Date.now();
    sentAtRef.current = [...sentAtRef.current.filter((t) => now - t < ONE_HOUR_MS), now];
    setLastEvaluation(
      evaluateInternal(sentAtRef.current, minIntervalMs, perMinute, perHour),
    );
  }, [minIntervalMs, perMinute, perHour]);

  return {
    lastEvaluation,
    canSend: lastEvaluation.ok,
    hint: lastEvaluation.ok ? null : lastEvaluation.reason,
    markSent,
    checkNow,
  };
}
