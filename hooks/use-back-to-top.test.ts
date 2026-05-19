/**
 * @vitest-environment jsdom
 *
 * Sprint 18 / F18-A — useBackToTop hook unit test.
 *
 * scroll 기반 visible toggle 검증.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBackToTop } from './use-back-to-top';

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useBackToTop()', () => {
  it('초기 scrollY=0 → false', () => {
    const { result } = renderHook(() => useBackToTop());
    expect(result.current).toBe(false);
  });

  it('scrollY > threshold (default 600) → true', () => {
    Object.defineProperty(window, 'scrollY', { value: 700, writable: true });
    const { result } = renderHook(() => useBackToTop());
    expect(result.current).toBe(true);
  });

  it('scroll event 발생 시 갱신', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    const { result } = renderHook(() => useBackToTop());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 800, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(true);
  });

  it('custom threshold 적용 (200)', () => {
    Object.defineProperty(window, 'scrollY', { value: 300, writable: true });
    const { result } = renderHook(() => useBackToTop(200));
    expect(result.current).toBe(true);
  });

  it('custom threshold 미달 시 false', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    const { result } = renderHook(() => useBackToTop(200));
    expect(result.current).toBe(false);
  });

  it('threshold 정확 일치 시 false (>, not >=)', () => {
    Object.defineProperty(window, 'scrollY', { value: 600, writable: true });
    const { result } = renderHook(() => useBackToTop(600));
    expect(result.current).toBe(false);
  });

  it('threshold 변경 시 즉시 반영', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    const { result, rerender } = renderHook(({ t }: { t: number }) => useBackToTop(t), {
      initialProps: { t: 600 },
    });
    expect(result.current).toBe(false);

    rerender({ t: 300 });
    expect(result.current).toBe(true);
  });

  it('cleanup 시 scroll listener 제거 (이벤트 후 update 안 됨)', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    const { result, unmount } = renderHook(() => useBackToTop());
    expect(result.current).toBe(false);

    unmount();
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 1000, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    // unmounted 이므로 result.current 변화 없음 (마지막 값 유지)
    expect(result.current).toBe(false);
  });
});
