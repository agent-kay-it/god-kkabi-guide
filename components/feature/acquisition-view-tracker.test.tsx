/**
 * components/feature/acquisition-view-tracker.tsx — Sprint 25 F25-B RTL.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('@/lib/firebase/analytics', () => ({
  logEvent: vi.fn(() => Promise.resolve()),
}));

import { logEvent } from '@/lib/firebase/analytics';
import { AcquisitionViewTracker } from './acquisition-view-tracker';

const mockedLogEvent = vi.mocked(logEvent);

beforeEach(() => mockedLogEvent.mockClear());
afterEach(() => cleanup());

describe('AcquisitionViewTracker', () => {
  it('마운트 시 acquisition_loi_view 1회 발화', () => {
    render(<AcquisitionViewTracker />);
    expect(mockedLogEvent).toHaveBeenCalledWith('acquisition_loi_view', {
      page: 'tenant_acquisition',
    });
  });

  it('re-render 해도 1회만 (useRef 가드)', () => {
    const { rerender } = render(<AcquisitionViewTracker />);
    rerender(<AcquisitionViewTracker />);
    expect(mockedLogEvent).toHaveBeenCalledOnce();
  });

  it('null 반환', () => {
    const { container } = render(<AcquisitionViewTracker />);
    expect(container.firstChild).toBeNull();
  });
});
