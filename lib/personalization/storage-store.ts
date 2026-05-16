/**
 * Storage Store — Sprint V7 P4.
 *
 * useSyncExternalStore와 호환되는 localStorage 어댑터 팩토리.
 * 같은 탭에서 localStorage 변경 시 다른 탭과 달리 'storage' 이벤트가 발화되지 않으므로,
 * 본 모듈이 custom event를 broadcast하여 동일 탭 내 구독자도 동기화한다.
 *
 * 사용:
 *   const recentlyViewedStore = createStorageStore<RecentlyViewedEntry[]>({
 *     key: 'god-kkabi:recently-viewed:v1',
 *     parse: safeParse,
 *     fallback: [],
 *   });
 *   recentlyViewedStore.set(newList); // localStorage write + 동일 탭 broadcast
 *   recentlyViewedStore.subscribe(callback); // useSyncExternalStore용
 *   recentlyViewedStore.getSnapshot(); // 현재 값 (referentially stable when unchanged)
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §2 / V7 P4 lint refactor
 */

const SAME_TAB_EVENT = 'god-kkabi:storage';

interface SameTabDetail {
  readonly key: string;
}

interface CreateStorageStoreOptions<T> {
  readonly key: string;
  /** localStorage raw string → T 안전 파싱. 실패 시 fallback. */
  readonly parse: (raw: string | null) => T;
  /** SSR / 미지원 환경에서 반환할 기본값 (referentially stable) */
  readonly fallback: T;
}

export interface StorageStore<T> {
  /** 현재 snapshot (캐시). useSyncExternalStore와 호환. */
  readonly getSnapshot: () => T;
  /** SSR snapshot — fallback 동일. */
  readonly getServerSnapshot: () => T;
  /** subscribe(callback) — change 시 callback 호출, unsubscribe 함수 반환. */
  readonly subscribe: (callback: () => void) => () => void;
  /** 새 값 저장 + 동일 탭 broadcast. SSR 환경에서는 no-op. */
  readonly set: (next: T) => void;
}

export function createStorageStore<T>(
  opts: CreateStorageStoreOptions<T>,
): StorageStore<T> {
  let cached: T = opts.fallback;
  let initialized = false;

  function read(): T {
    if (typeof window === 'undefined') return opts.fallback;
    try {
      return opts.parse(window.localStorage.getItem(opts.key));
    } catch {
      return opts.fallback;
    }
  }

  function getSnapshot(): T {
    if (!initialized) {
      cached = read();
      initialized = true;
    }
    return cached;
  }

  function getServerSnapshot(): T {
    return opts.fallback;
  }

  function subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => undefined;

    function refresh() {
      const next = read();
      // 참조 갱신 (useSyncExternalStore는 Object.is로 변경 감지)
      cached = next;
      initialized = true;
      callback();
    }

    // 다른 탭 변경
    function onStorage(e: StorageEvent) {
      if (e.key !== opts.key && e.key !== null) return;
      refresh();
    }
    // 동일 탭 변경 (custom event)
    function onSameTab(e: Event) {
      const detail = (e as CustomEvent<SameTabDetail>).detail;
      if (!detail || detail.key !== opts.key) return;
      refresh();
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener(SAME_TAB_EVENT, onSameTab);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SAME_TAB_EVENT, onSameTab);
    };
  }

  function set(next: T): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(opts.key, JSON.stringify(next));
      cached = next;
      initialized = true;
      window.dispatchEvent(
        new CustomEvent<SameTabDetail>(SAME_TAB_EVENT, {
          detail: { key: opts.key },
        }),
      );
    } catch {
      // ignore (private mode, quota, etc.)
    }
  }

  return { getSnapshot, getServerSnapshot, subscribe, set };
}
