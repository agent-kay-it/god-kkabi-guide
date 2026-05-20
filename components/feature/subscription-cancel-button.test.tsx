/**
 * components/feature/subscription-cancel-button.tsx — Sprint 24 F24-C RTL.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

const routerRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: routerRefresh, push: vi.fn() }),
}));
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock('@/lib/subscription/actions', () => ({
  cancelSubscription: vi.fn(),
}));
vi.mock('@/lib/firebase/analytics', () => ({
  logEvent: vi.fn(() => Promise.resolve()),
}));

import { toast } from 'sonner';
import { cancelSubscription } from '@/lib/subscription/actions';
import { SubscriptionCancelButton } from './subscription-cancel-button';

const mockedCancel = vi.mocked(cancelSubscription);
const mockedToastError = vi.mocked(toast.error);
const mockedToastSuccess = vi.mocked(toast.success);

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
});

afterEach(() => cleanup());

describe('SubscriptionCancelButton', () => {
  it('"구독 취소" 버튼 + XCircle 아이콘 렌더', () => {
    render(<SubscriptionCancelButton />);
    expect(screen.getByText('구독 취소')).toBeTruthy();
  });

  it('confirm 거부 시 cancelSubscription 호출 안 함', () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => false);
    render(<SubscriptionCancelButton />);
    fireEvent.click(screen.getByText('구독 취소'));
    expect(mockedCancel).not.toHaveBeenCalled();
  });

  it('happy: confirm 승낙 + cancelSubscription 성공 → success 토스트 + refresh', async () => {
    mockedCancel.mockResolvedValue({ ok: true, subscriptionId: 'sub-1' });
    render(<SubscriptionCancelButton />);
    fireEvent.click(screen.getByText('구독 취소'));
    await waitFor(() => {
      expect(mockedCancel).toHaveBeenCalled();
      expect(mockedToastSuccess).toHaveBeenCalledWith('구독이 취소되었습니다');
      expect(routerRefresh).toHaveBeenCalled();
    });
  });

  it('cancelSubscription 실패 → error 토스트', async () => {
    mockedCancel.mockResolvedValue({ ok: false, error: 'NOT_FOUND' });
    render(<SubscriptionCancelButton />);
    fireEvent.click(screen.getByText('구독 취소'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(
        expect.stringContaining('NOT_FOUND'),
      );
    });
  });

  it('disabled while pending — useTransition', async () => {
    let resolveCancel: (v: { ok: false; error: 'INTERNAL' }) => void;
    mockedCancel.mockReturnValue(
      new Promise((resolve) => {
        resolveCancel = resolve as never;
      }) as never,
    );
    render(<SubscriptionCancelButton />);
    const btn = screen.getByText('구독 취소') as HTMLButtonElement;
    fireEvent.click(btn);
    // Transition 시작 후 즉시 disabled
    await waitFor(() => expect(btn.disabled).toBe(true));
    resolveCancel!({ ok: false, error: 'INTERNAL' });
  });
});
