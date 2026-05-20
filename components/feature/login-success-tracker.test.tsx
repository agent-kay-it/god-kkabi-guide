/**
 * components/feature/login-success-tracker.tsx — Sprint 25 F25-B RTL.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

const mockUseSearchParams = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
}));
vi.mock('@/lib/firebase/analytics', () => ({
  logEvent: vi.fn(() => Promise.resolve()),
}));

import { logEvent } from '@/lib/firebase/analytics';
import { LoginSuccessTracker } from './login-success-tracker';

const mockedLogEvent = vi.mocked(logEvent);
const replaceStateSpy = vi.fn();

function makeSearchParams(map: Record<string, string>): URLSearchParams {
  return new URLSearchParams(map);
}

beforeEach(() => {
  mockedLogEvent.mockClear();
  mockUseSearchParams.mockReset();
  replaceStateSpy.mockClear();
  // jsdom 의 replaceState 는 about:blank 가 base 일 때 SecurityError 발생.
  // 본 컴포넌트의 의도는 query 정리 — spy 로 검증.
  vi.spyOn(window.history, 'replaceState').mockImplementation(replaceStateSpy);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('LoginSuccessTracker', () => {
  it('?login=success&method=google → login 이벤트 발화 + replaceState 호출', () => {
    mockUseSearchParams.mockReturnValue(
      makeSearchParams({ login: 'success', method: 'google', keep: '1' }),
    );
    render(<LoginSuccessTracker />);
    expect(mockedLogEvent).toHaveBeenCalledWith('login', { method: 'google' });
    expect(replaceStateSpy).toHaveBeenCalled();
    const url = String(replaceStateSpy.mock.calls[0]?.[2] ?? '');
    expect(url).not.toContain('login=success');
    expect(url).not.toContain('method=google');
  });

  it('login=success 없음 → no fire', () => {
    mockUseSearchParams.mockReturnValue(makeSearchParams({}));
    render(<LoginSuccessTracker />);
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  it('login=success 있지만 method 없음 → no fire', () => {
    mockUseSearchParams.mockReturnValue(makeSearchParams({ login: 'success' }));
    render(<LoginSuccessTracker />);
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  it('invalid method (kakao) → no fire', () => {
    mockUseSearchParams.mockReturnValue(
      makeSearchParams({ login: 'success', method: 'kakao' }),
    );
    render(<LoginSuccessTracker />);
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  it('re-render 해도 1회만 (firedRef 가드)', () => {
    mockUseSearchParams.mockReturnValue(
      makeSearchParams({ login: 'success', method: 'google' }),
    );
    const { rerender } = render(<LoginSuccessTracker />);
    rerender(<LoginSuccessTracker />);
    expect(mockedLogEvent).toHaveBeenCalledOnce();
  });

  it('null 반환', () => {
    mockUseSearchParams.mockReturnValue(makeSearchParams({}));
    const { container } = render(<LoginSuccessTracker />);
    expect(container.firstChild).toBeNull();
  });
});
