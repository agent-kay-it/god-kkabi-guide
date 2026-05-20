/**
 * components/feature/payment-drop-tracker.tsx — Sprint 25 F25-B RTL.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('@/lib/firebase/analytics', () => ({
  logEvent: vi.fn(() => Promise.resolve()),
}));

import { logEvent } from '@/lib/firebase/analytics';
import { PaymentDropTracker } from './payment-drop-tracker';

const mockedLogEvent = vi.mocked(logEvent);

beforeEach(() => {
  mockedLogEvent.mockClear();
  window.sessionStorage.clear();
});

afterEach(() => cleanup());

describe('PaymentDropTracker', () => {
  it('첫 마운트 — payment_drop 발화 + sessionStorage 기록', () => {
    render(<PaymentDropTracker code="USER_CANCEL" />);
    expect(mockedLogEvent).toHaveBeenCalledWith('payment_drop', {
      plan: 'premium_monthly',
      reason: 'toss_callback',
      code: 'USER_CANCEL',
    });
    expect(window.sessionStorage.getItem('pmt_drop_session:USER_CANCEL')).toBe('1');
  });

  it('message 옵션 — 함께 보냄', () => {
    render(<PaymentDropTracker code="LIMIT" message="한도 초과" />);
    expect(mockedLogEvent).toHaveBeenCalledWith('payment_drop', {
      plan: 'premium_monthly',
      reason: 'toss_callback',
      code: 'LIMIT',
      message: '한도 초과',
    });
  });

  it('동일 code 재진입 (sessionStorage hit) — skip', () => {
    window.sessionStorage.setItem('pmt_drop_session:DUP', '1');
    render(<PaymentDropTracker code="DUP" />);
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  it('다른 code 는 별개 키 — 각자 1회 발화', () => {
    const { rerender } = render(<PaymentDropTracker code="A" />);
    rerender(<PaymentDropTracker code="B" />);
    // useRef 는 컴포넌트 1개당 1회 가드 → A 만 발화
    expect(mockedLogEvent).toHaveBeenCalledOnce();
    expect(mockedLogEvent).toHaveBeenCalledWith(
      'payment_drop',
      expect.objectContaining({ code: 'A' }),
    );
  });

  it('null 반환', () => {
    const { container } = render(<PaymentDropTracker code="X" />);
    expect(container.firstChild).toBeNull();
  });
});
