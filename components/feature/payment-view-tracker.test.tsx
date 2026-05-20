/**
 * components/feature/payment-view-tracker.tsx — Sprint 25 F25-B RTL.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('@/lib/firebase/analytics', () => ({
  logEvent: vi.fn(() => Promise.resolve()),
}));

import { logEvent } from '@/lib/firebase/analytics';
import { PaymentViewTracker } from './payment-view-tracker';

const mockedLogEvent = vi.mocked(logEvent);

beforeEach(() => {
  mockedLogEvent.mockClear();
});

afterEach(() => cleanup());

describe('PaymentViewTracker', () => {
  it('마운트 시 payment_view 1회 발화', () => {
    render(<PaymentViewTracker />);
    expect(mockedLogEvent).toHaveBeenCalledOnce();
    expect(mockedLogEvent).toHaveBeenCalledWith('payment_view', {
      plan: 'premium_monthly',
    });
  });

  it('re-render 해도 1회만 발화 (useRef 가드)', () => {
    const { rerender } = render(<PaymentViewTracker />);
    rerender(<PaymentViewTracker />);
    rerender(<PaymentViewTracker />);
    expect(mockedLogEvent).toHaveBeenCalledOnce();
  });

  it('null 반환 — DOM 미생성', () => {
    const { container } = render(<PaymentViewTracker />);
    expect(container.firstChild).toBeNull();
  });
});
