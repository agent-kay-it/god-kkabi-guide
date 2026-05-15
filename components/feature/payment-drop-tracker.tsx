/**
 * <PaymentDropTracker> — Toss 결제 실패/취소 callback에서 payment_drop 1회 발화.
 * Sprint V2 P5 (GAP-MAJ-1).
 *
 * 멱등성: sessionStorage[`pmt_drop:${code}:${ts}`] — 동일 fail 페이지 새로고침 시 중복 차단.
 */
'use client';

import { useEffect, useRef } from 'react';

import { logEvent } from '@/lib/firebase/analytics';

export interface PaymentDropTrackerProps {
  readonly code: string;
  readonly message?: string;
}

export function PaymentDropTracker({
  code,
  message,
}: PaymentDropTrackerProps): null {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (typeof window !== 'undefined') {
      // fail page는 동일 code로 여러 번 보일 수 있어 session 동안 1회 차단.
      const key = `pmt_drop_session:${code}`;
      try {
        if (window.sessionStorage.getItem(key) === '1') return;
        window.sessionStorage.setItem(key, '1');
      } catch {
        // ignore
      }
    }
    void logEvent('payment_drop', {
      plan: 'premium_monthly',
      reason: 'toss_callback',
      code,
      ...(message ? { message } : {}),
    });
  }, [code, message]);
  return null;
}
