// @vitest-environment jsdom
/**
 * vitest — useChatRateLimit hook tests.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useChatRateLimit } from './use-chat-rate-limit';

describe('useChatRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows first send', () => {
    const { result } = renderHook(() => useChatRateLimit());
    expect(result.current.canSend).toBe(true);
    expect(result.current.hint).toBeNull();
  });

  it('blocks if interval is too short', () => {
    const { result } = renderHook(() => useChatRateLimit({ minIntervalMs: 600 }));
    act(() => result.current.markSent());
    // 300ms 후 — 너무 빠름
    vi.advanceTimersByTime(300);
    expect(result.current.checkNow().ok).toBe(false);
    // 700ms 후 — 통과
    vi.advanceTimersByTime(400);
    expect(result.current.checkNow().ok).toBe(true);
  });

  it('blocks after perMinute limit', () => {
    const { result } = renderHook(() =>
      useChatRateLimit({ minIntervalMs: 0, perMinute: 3, perHour: 1000 }),
    );
    act(() => result.current.markSent());
    act(() => result.current.markSent());
    act(() => result.current.markSent());
    const guard = result.current.checkNow();
    expect(guard.ok).toBe(false);
    if (!guard.ok) {
      expect(guard.reason).toContain('분당');
    }
  });

  it('blocks after perHour limit', () => {
    const { result } = renderHook(() =>
      useChatRateLimit({ minIntervalMs: 0, perMinute: 1000, perHour: 2 }),
    );
    act(() => result.current.markSent());
    act(() => result.current.markSent());
    const guard = result.current.checkNow();
    expect(guard.ok).toBe(false);
    if (!guard.ok) {
      expect(guard.reason).toContain('시간당');
    }
  });

  it('recovers after minute window passes', () => {
    const { result } = renderHook(() =>
      useChatRateLimit({ minIntervalMs: 0, perMinute: 2, perHour: 1000 }),
    );
    act(() => result.current.markSent());
    act(() => result.current.markSent());
    expect(result.current.checkNow().ok).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(result.current.checkNow().ok).toBe(true);
  });
});
