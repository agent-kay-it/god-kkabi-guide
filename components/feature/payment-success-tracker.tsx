/**
 * <PaymentSuccessTracker> — 결제 확정 성공 시 GA4 payment_success + premium_subscribe 1회 발화.
 * Sprint V2 P5 (CA2-I1 + CA2-I9 + GAP-MAJ-1).
 *
 * 멱등성:
 *  - useRef로 컴포넌트 마운트 동안 중복 차단.
 *  - sessionStorage[`pmt_succ:${orderId}`]로 새로고침 후 재발화 차단 (1회만 카운트).
 */
'use client';

import { useEffect, useRef } from 'react';

import { logEvent } from '@/lib/firebase/analytics';

export interface PaymentSuccessTrackerProps {
  readonly orderId: string;
  readonly amount: number;
}

export function PaymentSuccessTracker({
  orderId,
  amount,
}: PaymentSuccessTrackerProps): null {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (typeof window !== 'undefined') {
      const key = `pmt_succ:${orderId}`;
      try {
        if (window.sessionStorage.getItem(key) === '1') return;
        window.sessionStorage.setItem(key, '1');
      } catch {
        // sessionStorage 사용 불가(프라이빗 모드 등) 시 useRef만 의존 — 동일 마운트 중복은 방어됨.
      }
    }
    void logEvent('payment_success', {
      plan: 'premium_monthly',
      orderId,
      amount,
    });
    void logEvent('premium_subscribe', {
      plan: 'premium_monthly',
      method: 'toss_payments',
    });
  }, [orderId, amount]);
  return null;
}
