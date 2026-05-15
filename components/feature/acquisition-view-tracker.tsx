/**
 * <AcquisitionViewTracker> — Sprint V3 P5 (GAP-V3-MAJ-1).
 *
 * /tenant/acquisition 진입 시 acquisition_loi_view GA4 1회 발화.
 */
'use client';

import { useEffect, useRef } from 'react';

import { logEvent } from '@/lib/firebase/analytics';

export function AcquisitionViewTracker(): null {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void logEvent('acquisition_loi_view', {
      page: 'tenant_acquisition',
    });
  }, []);
  return null;
}
