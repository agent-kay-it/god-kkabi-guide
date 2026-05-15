/**
 * <MetaBuildDwellTracker> — 검객 메타 빌드 페이지 60초 dwell 트래커.
 * 출처: docs/sprint/02-sprint-mvp/design.md §6 GA4 이벤트 meta_build_view
 *
 * Client Component (side-effect only).
 * 60초 체류 시 logEvent('meta_build_view', { class, build_id, dwell_seconds })
 * + Firestore 'events' 컬렉션 백업 (analytics.ts CORE_BACKUP_EVENTS 분기).
 */
'use client';

import { useEffect } from 'react';
import { logEvent } from '@/lib/firebase/analytics';
import type { ClassId } from '@/types';

interface MetaBuildDwellTrackerProps {
  buildId: string;
  classId: ClassId;
  thresholdSeconds?: number;
}

export function MetaBuildDwellTracker({
  buildId,
  classId,
  thresholdSeconds = 60,
}: MetaBuildDwellTrackerProps): null {
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void logEvent('meta_build_view', {
        class: classId,
        build_id: buildId,
        dwell_seconds: thresholdSeconds,
      });
    }, thresholdSeconds * 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [buildId, classId, thresholdSeconds]);

  return null;
}
