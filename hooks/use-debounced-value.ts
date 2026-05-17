/**
 * useDebouncedValue — value 가 일정 시간 동안 변하지 않을 때만 동기화.
 * 출처: docs/sprint/10-sprint-launch/design.md §6 (Posts Enrichment — URL preview debounce)
 *
 * 패턴:
 *  - 입력이 빠르게 변할 때 (key stroke) 중간 값을 무시
 *  - 마지막 값이 delay ms 동안 유지되면 그제서야 반영
 *
 * Server Component 호환: hook은 'use client' 환경에서만 사용.
 */
'use client';

import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}
