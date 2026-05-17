/**
 * useAutosave unit tests — Sprint 10 / Phase D Task #22.
 *
 * 검증 범위:
 *  - debounced localStorage 저장 (timer 검증)
 *  - userId 별 key 분리
 *  - hasDraft / loadDraft / clearDraft 동작
 *  - enabled=false 시 저장 안 함
 *  - SSR-safe (typeof window check) — Node 환경에서 noop
 *
 * 환경: jsdom (localStorage + React state). vitest.config.ts에서 hook은 별도 환경.
 */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useAutosave } from './use-autosave';

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('saves to localStorage after delayMs', () => {
    const { rerender } = renderHook(
      ({ v }: { v: { title: string } }) =>
        useAutosave(v, { key: 'test-draft', userId: 'user1', delayMs: 1000 }),
      { initialProps: { v: { title: 'hello' } } },
    );
    // 즉시 저장되지 않음
    expect(window.localStorage.getItem('test-draft-user1')).toBeNull();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(window.localStorage.getItem('test-draft-user1')).toBe(
      JSON.stringify({ title: 'hello' }),
    );

    // 값 변경 시 debounce 재시작
    rerender({ v: { title: 'updated' } });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // 아직 변경 안 됨 (이전 값 유지)
    expect(window.localStorage.getItem('test-draft-user1')).toBe(
      JSON.stringify({ title: 'hello' }),
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(window.localStorage.getItem('test-draft-user1')).toBe(
      JSON.stringify({ title: 'updated' }),
    );
  });

  it('separates drafts by userId', () => {
    const { rerender } = renderHook(
      ({ uid, v }: { uid: string; v: { body: string } }) =>
        useAutosave(v, { key: 'post-draft', userId: uid, delayMs: 500 }),
      { initialProps: { uid: 'alice', v: { body: 'alice content' } } },
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(window.localStorage.getItem('post-draft-alice')).toBe(
      JSON.stringify({ body: 'alice content' }),
    );

    rerender({ uid: 'bob', v: { body: 'bob content' } });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(window.localStorage.getItem('post-draft-bob')).toBe(
      JSON.stringify({ body: 'bob content' }),
    );
    // alice의 draft는 유지 (다른 키)
    expect(window.localStorage.getItem('post-draft-alice')).toBe(
      JSON.stringify({ body: 'alice content' }),
    );
  });

  it('uses "anon" key when userId is null', () => {
    renderHook(() =>
      useAutosave(
        { title: 'anon-draft' },
        { key: 'post-draft', userId: null, delayMs: 100 },
      ),
    );
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(window.localStorage.getItem('post-draft-anon')).toBe(
      JSON.stringify({ title: 'anon-draft' }),
    );
  });

  it('does not save when enabled=false', () => {
    renderHook(() =>
      useAutosave(
        { title: 'disabled' },
        { key: 'no-save', userId: 'u1', delayMs: 100, enabled: false },
      ),
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(window.localStorage.getItem('no-save-u1')).toBeNull();
  });

  it('hasDraft reflects existing localStorage entry on mount', () => {
    window.localStorage.setItem(
      'pre-existing-u1',
      JSON.stringify({ title: 'restore me' }),
    );
    const { result } = renderHook(() =>
      useAutosave({ title: '' }, { key: 'pre-existing', userId: 'u1', delayMs: 1000 }),
    );
    expect(result.current.hasDraft).toBe(true);
  });

  it('loadDraft returns the parsed value', () => {
    window.localStorage.setItem(
      'load-test-u1',
      JSON.stringify({ title: 'restored', body: 'content' }),
    );
    const { result } = renderHook(() =>
      useAutosave({ title: '' }, { key: 'load-test', userId: 'u1', delayMs: 1000 }),
    );
    const draft = result.current.loadDraft<{ title: string; body: string }>();
    expect(draft).toEqual({ title: 'restored', body: 'content' });
  });

  it('loadDraft returns null when no entry exists', () => {
    const { result } = renderHook(() =>
      useAutosave({ title: '' }, { key: 'absent', userId: 'u1', delayMs: 1000 }),
    );
    expect(result.current.loadDraft<{ title: string }>()).toBeNull();
  });

  it('clearDraft removes the localStorage entry', () => {
    window.localStorage.setItem(
      'clear-test-u1',
      JSON.stringify({ title: 'to remove' }),
    );
    const { result } = renderHook(() =>
      useAutosave({ title: '' }, { key: 'clear-test', userId: 'u1', delayMs: 1000 }),
    );
    expect(result.current.hasDraft).toBe(true);
    act(() => {
      result.current.clearDraft();
    });
    expect(window.localStorage.getItem('clear-test-u1')).toBeNull();
    expect(result.current.hasDraft).toBe(false);
  });

  it('updates lastSavedAt after save', () => {
    const before = Date.now();
    const { result } = renderHook(() =>
      useAutosave({ x: 1 }, { key: 'timestamp', userId: 'u1', delayMs: 100 }),
    );
    expect(result.current.lastSavedAt).toBeNull();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.lastSavedAt).not.toBeNull();
    expect(result.current.lastSavedAt!).toBeGreaterThanOrEqual(before);
  });

  it('handles malformed JSON in storage gracefully (loadDraft returns null)', () => {
    window.localStorage.setItem('bad-json-u1', '{not valid json');
    const { result } = renderHook(() =>
      useAutosave({ x: 1 }, { key: 'bad-json', userId: 'u1', delayMs: 100 }),
    );
    expect(result.current.loadDraft<{ x: number }>()).toBeNull();
  });
});
