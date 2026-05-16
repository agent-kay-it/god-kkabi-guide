/**
 * <PaymentViewTracker> — /premium 진입 시 GA4 payment_view 1회 발화.
 * Sprint V2 P5 (GAP-MAJ-1) — V3 B2B BigQuery funnel 데이터.
 */
'use client';

import { useEffect, useRef } from 'react';

import { logEvent } from '@/lib/firebase/analytics';

export function PaymentViewTracker(): null {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void logEvent('payment_view', { plan: 'premium_monthly' });
  }, []);
  return null;
}
