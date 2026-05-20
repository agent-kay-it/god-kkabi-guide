/**
 * components/feature/coupon-list.tsx — Sprint 20 F20-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), message: vi.fn() },
}));
vi.mock('@/lib/coupon/actions', () => ({
  voteCoupon: vi.fn(),
}));

import { toast } from 'sonner';
import { voteCoupon } from '@/lib/coupon/actions';
import { CouponList } from './coupon-list';
import type { CouponDoc } from '@/types/coupon';

const mockedVote = vi.mocked(voteCoupon);
const mockedToastError = vi.mocked(toast.error);

beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

const validCoupon: CouponDoc = {
  id: 'c1',
  code: 'GIFT2026',
  title: '신년 선물',
  rewards: '다이아 100개',
  expiresAtMs: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7일 후
  status: 'verified',
  submittedBy: 'u-submitter',
  submittedByNickname: '커뮤니티',
  upvotes: 5,
  downvotes: 1,
  reportedAt: null,
};

describe('CouponList — 렌더링', () => {
  it('빈 목록 → "쿠폰이 아직 없습니다" 표시', () => {
    render(<CouponList coupons={[]} canVote={true} />);
    expect(screen.getByText(/쿠폰이 아직 없습니다/)).toBeTruthy();
  });

  it('쿠폰 목록 → ul role=list', () => {
    render(<CouponList coupons={[validCoupon]} canVote={true} />);
    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.getByText('GIFT2026')).toBeTruthy();
    expect(screen.getByText('신년 선물')).toBeTruthy();
    expect(screen.getByText('다이아 100개')).toBeTruthy();
  });

  it('upvotes/downvotes 표시', () => {
    render(<CouponList coupons={[validCoupon]} canVote={true} />);
    expect(screen.getByLabelText('작동 확인')).toBeTruthy();
    expect(screen.getByLabelText('작동 안 함')).toBeTruthy();
  });

  it('만료된 쿠폰 → "만료" Badge', () => {
    const expired: CouponDoc = {
      ...validCoupon,
      expiresAtMs: Date.now() - 1000, // 과거
    };
    render(<CouponList coupons={[expired]} canVote={true} />);
    expect(screen.getByText('만료')).toBeTruthy();
  });

  it('submittedByNickname 표시', () => {
    render(<CouponList coupons={[validCoupon]} canVote={true} />);
    expect(screen.getByText(/제보 커뮤니티/)).toBeTruthy();
  });
});

describe('CouponList — 투표 인터랙션', () => {
  it('canVote=false 클릭 → toast.error + voteCoupon 호출 X', () => {
    render(<CouponList coupons={[validCoupon]} canVote={false} />);
    fireEvent.click(screen.getByLabelText('작동 확인'));
    expect(mockedToastError).toHaveBeenCalledWith(
      expect.stringContaining('등록 사용자'),
    );
    expect(mockedVote).not.toHaveBeenCalled();
  });

  it('canVote=true + up 클릭 → voteCoupon("c1", "up")', async () => {
    mockedVote.mockResolvedValue({ ok: true, couponId: 'c1' });
    render(<CouponList coupons={[validCoupon]} canVote={true} />);
    fireEvent.click(screen.getByLabelText('작동 확인'));
    await waitFor(() => {
      expect(mockedVote).toHaveBeenCalledWith('c1', 'up');
    });
  });

  it('down 클릭 → voteCoupon("c1", "down")', async () => {
    mockedVote.mockResolvedValue({ ok: true, couponId: 'c1' });
    render(<CouponList coupons={[validCoupon]} canVote={true} />);
    fireEvent.click(screen.getByLabelText('작동 안 함'));
    await waitFor(() => {
      expect(mockedVote).toHaveBeenCalledWith('c1', 'down');
    });
  });

  it('voteCoupon 실패 → toast.error("투표 실패")', async () => {
    mockedVote.mockResolvedValue({ ok: false, error: 'INTERNAL' });
    render(<CouponList coupons={[validCoupon]} canVote={true} />);
    fireEvent.click(screen.getByLabelText('작동 확인'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith('투표 실패');
    });
  });

  it('만료된 쿠폰 → 투표 버튼 disabled', () => {
    const expired: CouponDoc = {
      ...validCoupon,
      expiresAtMs: Date.now() - 1000,
    };
    render(<CouponList coupons={[expired]} canVote={true} />);
    const upBtn = screen.getByLabelText('작동 확인') as HTMLButtonElement;
    expect(upBtn.disabled).toBe(true);
  });
});
