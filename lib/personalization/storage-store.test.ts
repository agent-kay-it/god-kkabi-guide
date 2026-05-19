/**
 * @vitest-environment jsdom
 *
 * Sprint 16 / F16-B — lib/personalization/storage-store unit test.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStorageStore } from './storage-store';

beforeEach(() => {
  window.localStorage.clear();
});

describe('createStorageStore()', () => {
  it('getSnapshot 초기값 — empty localStorage 시 fallback', () => {
    const store = createStorageStore<number[]>({
      key: 'test:1',
      parse: (raw) => (raw ? JSON.parse(raw) : [1, 2, 3]),
      fallback: [1, 2, 3],
    });
    expect(store.getSnapshot()).toEqual([1, 2, 3]);
  });

  it('set 후 getSnapshot 반영 + localStorage 저장', () => {
    const store = createStorageStore<string[]>({
      key: 'test:2',
      parse: (raw) => (raw ? JSON.parse(raw) : []),
      fallback: [],
    });
    store.set(['a', 'b']);
    expect(store.getSnapshot()).toEqual(['a', 'b']);
    expect(JSON.parse(window.localStorage.getItem('test:2')!)).toEqual(['a', 'b']);
  });

  it('subscribe 후 set 시 callback 호출', () => {
    const store = createStorageStore<number>({
      key: 'test:3',
      parse: (raw) => (raw ? JSON.parse(raw) : 0),
      fallback: 0,
    });
    const cb = vi.fn();
    store.subscribe(cb);
    store.set(42);
    expect(cb).toHaveBeenCalled();
  });

  it('unsubscribe 후 callback 호출 안 됨', () => {
    const store = createStorageStore<number>({
      key: 'test:4',
      parse: (raw) => (raw ? JSON.parse(raw) : 0),
      fallback: 0,
    });
    const cb = vi.fn();
    const unsubscribe = store.subscribe(cb);
    unsubscribe();
    store.set(42);
    expect(cb).not.toHaveBeenCalled();
  });

  it('getServerSnapshot 은 항상 fallback 반환', () => {
    const store = createStorageStore<string>({
      key: 'test:5',
      parse: (raw) => raw ?? 'default',
      fallback: 'default',
    });
    store.set('new value');
    expect(store.getServerSnapshot()).toBe('default');
  });

  it('parse 실패 시 fallback', () => {
    window.localStorage.setItem('test:6', 'invalid json {{{');
    const store = createStorageStore<{ x: number }>({
      key: 'test:6',
      parse: (raw) => JSON.parse(raw ?? '{}'), // throws
      fallback: { x: 0 },
    });
    expect(store.getSnapshot()).toEqual({ x: 0 });
  });

  it('SAME_TAB 이벤트 — 두 store 인스턴스가 동일 key 공유', () => {
    const a = createStorageStore<number>({
      key: 'test:7',
      parse: (raw) => (raw ? JSON.parse(raw) : 0),
      fallback: 0,
    });
    const b = createStorageStore<number>({
      key: 'test:7',
      parse: (raw) => (raw ? JSON.parse(raw) : 0),
      fallback: 0,
    });
    const cb = vi.fn();
    b.subscribe(cb);
    a.set(99);
    expect(cb).toHaveBeenCalled();
  });
});
