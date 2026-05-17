/**
 * useAutosave — debounced localStorage autosave hook.
 * 출처: docs/sprint/10-sprint-launch/design.md §6 (Posts Enrichment — Form UX)
 *
 * 패턴:
 *  - value가 변경되면 delayMs (기본 2000ms) 후 localStorage에 저장
 *  - 동일 컴포넌트 마운트 시 hasDraft + loadDraft + clearDraft 제공
 *  - userId 별 분리 (key = `prefix-{userId}` — 다중 계정 분리)
 *
 * 보안/품질:
 *  - localStorage SSR-safe (typeof window check)
 *  - JSON.stringify 실패 시 silent (저장 안 함)
 *  - storage quota 초과 시 silent (try-catch)
 *  - hook 제거 시 pending timeout cleanup
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface AutosaveControls {
  /** 마지막 저장 시각 (ms) — null이면 아직 저장한 적 없음 */
  readonly lastSavedAt: number | null;
  /** localStorage에 저장된 draft 존재 여부 (마운트 시 1회 검사) */
  readonly hasDraft: boolean;
  /** localStorage에서 draft 로드 — 호출자가 form.reset() 등으로 적용 */
  readonly loadDraft: <T>() => T | null;
  /** localStorage에서 draft 삭제 (게시 성공 시 호출) */
  readonly clearDraft: () => void;
}

export interface UseAutosaveOptions {
  /** localStorage key prefix (예: 'post-draft') */
  readonly key: string;
  /** 사용자 식별자 — userId 별 draft 분리 */
  readonly userId: string | null;
  /** debounce delay (ms). 기본 2000 */
  readonly delayMs?: number;
  /** 활성화 여부. false면 저장하지 않음 (예: edit mode) */
  readonly enabled?: boolean;
}

/** localStorage key 조립 — userId 가 null이면 'anon' 으로 분리. */
function buildKey(prefix: string, userId: string | null): string {
  return `${prefix}-${userId ?? 'anon'}`;
}

/** SSR-safe localStorage getter. */
function readStorage(fullKey: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(fullKey);
  } catch {
    return null;
  }
}

/** SSR-safe localStorage setter (silent on failure). */
function writeStorage(fullKey: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(fullKey, value);
    return true;
  } catch {
    return false;
  }
}

/** SSR-safe localStorage remover. */
function removeStorage(fullKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(fullKey);
  } catch {
    // silent
  }
}

/**
 * value 가 변경될 때마다 delayMs 후 localStorage에 저장.
 * 반환된 controls로 draft 존재 검사 / 로드 / 삭제 가능.
 */
export function useAutosave<T>(value: T, options: UseAutosaveOptions): AutosaveControls {
  const { key, userId, delayMs = 2000, enabled = true } = options;
  const fullKey = buildKey(key, userId);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  // 초기 값을 lazy init으로 동기 계산 — render-time read이지만 useState initializer는 1회만 실행되므로 안전.
  const [hasDraft, setHasDraft] = useState<boolean>(() => readStorage(fullKey) !== null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 최신 fullKey를 callback에서 안전하게 참조하기 위한 ref — useEffect로 동기화.
  const fullKeyRef = useRef<string>(fullKey);

  // fullKey 변경 시 ref 업데이트 + draft 존재 재검사 (localStorage는 외부 상태 — effect로 subscribe).
  useEffect(() => {
    fullKeyRef.current = fullKey;
    // localStorage는 외부 시스템 — 본 setState는 외부 상태와의 동기화이지 cascading render가 아님.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- subscribing to localStorage (external state).
    setHasDraft(readStorage(fullKey) !== null);
  }, [fullKey]);

  // value 변경 시 debounced 저장
  useEffect(() => {
    if (!enabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        const serialized = JSON.stringify(value);
        const saved = writeStorage(fullKey, serialized);
        if (saved) {
          // 외부 시스템(localStorage) write 완료 후 React state 동기화.
          setLastSavedAt(Date.now());
          setHasDraft(true);
        }
      } catch {
        // JSON.stringify 실패 — silent
      }
    }, delayMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, fullKey, delayMs, enabled]);

  const loadDraft = useCallback(<U,>(): U | null => {
    const raw = readStorage(fullKeyRef.current);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as U;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback((): void => {
    removeStorage(fullKeyRef.current);
    setHasDraft(false);
    setLastSavedAt(null);
  }, []);

  return { lastSavedAt, hasDraft, loadDraft, clearDraft };
}
