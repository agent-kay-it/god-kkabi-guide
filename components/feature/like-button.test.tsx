/**
 * components/feature/like-button.tsx — Sprint 20 F20-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('sonner', () => ({
  toast: {
    message: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('@/lib/reaction/actions', () => ({
  toggleReaction: vi.fn(),
}));
vi.mock('@/lib/firebase/analytics', () => ({
  logEvent: vi.fn(() => Promise.resolve()),
}));

import { toast } from 'sonner';
import { toggleReaction } from '@/lib/reaction/actions';
import { LikeButton } from './like-button';

const mockedToggle = vi.mocked(toggleReaction);
const mockedToastError = vi.mocked(toast.error);
const mockedToastMessage = vi.mocked(toast.message);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('LikeButton — 렌더링', () => {
  it('초기 liked=false → "좋아요 (count)" aria-label + Heart 아이콘', () => {
    render(
      <LikeButton
        targetType="post"
        targetId="p1"
        initialLiked={false}
        initialCount={5}
        canLike={true}
      />,
    );
    const btn = screen.getByLabelText('좋아요 (5)');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('초기 liked=true → "좋아요 취소 (count)" aria-label', () => {
    render(
      <LikeButton
        targetType="post"
        targetId="p1"
        initialLiked={true}
        initialCount={10}
        canLike={true}
      />,
    );
    expect(screen.getByLabelText('좋아요 취소 (10)')).toBeTruthy();
  });

  it('canLike=false 클릭 → toast.message + Server Action 호출 X', () => {
    render(
      <LikeButton
        targetType="post"
        targetId="p1"
        initialLiked={false}
        initialCount={0}
        canLike={false}
      />,
    );
    fireEvent.click(screen.getByLabelText(/좋아요/));
    expect(mockedToastMessage).toHaveBeenCalled();
    expect(mockedToggle).not.toHaveBeenCalled();
  });
});

describe('LikeButton — 인터랙션', () => {
  it('클릭 → toggleReaction 호출 + optimistic update', async () => {
    mockedToggle.mockResolvedValue({ ok: true, isLiked: true, likeCount: 6 });
    render(
      <LikeButton
        targetType="post"
        targetId="p1"
        postCategory="build"
        initialLiked={false}
        initialCount={5}
        canLike={true}
      />,
    );
    fireEvent.click(screen.getByLabelText('좋아요 (5)'));
    await waitFor(() => {
      expect(mockedToggle).toHaveBeenCalledWith({
        targetType: 'post',
        targetId: 'p1',
      });
    });
  });

  it('comment 좋아요 → postId 전달', async () => {
    mockedToggle.mockResolvedValue({ ok: true, isLiked: true, likeCount: 1 });
    render(
      <LikeButton
        targetType="comment"
        targetId="c1"
        postId="p99"
        initialLiked={false}
        initialCount={0}
        canLike={true}
      />,
    );
    fireEvent.click(screen.getByLabelText('좋아요 (0)'));
    await waitFor(() => {
      expect(mockedToggle).toHaveBeenCalledWith({
        targetType: 'comment',
        targetId: 'c1',
        postId: 'p99',
      });
    });
  });

  it('SELF_REACTION 실패 → 본인 메시지 토스트', async () => {
    mockedToggle.mockResolvedValue({ ok: false, error: 'SELF_REACTION' });
    render(
      <LikeButton
        targetType="post"
        targetId="p1"
        initialLiked={false}
        initialCount={0}
        canLike={true}
      />,
    );
    fireEvent.click(screen.getByLabelText('좋아요 (0)'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('본인'));
    });
  });

  it('NOT_REGISTERED 실패 → 등록 메시지', async () => {
    mockedToggle.mockResolvedValue({ ok: false, error: 'NOT_REGISTERED' });
    render(
      <LikeButton
        targetType="post"
        targetId="p1"
        initialLiked={false}
        initialCount={0}
        canLike={true}
      />,
    );
    fireEvent.click(screen.getByLabelText('좋아요 (0)'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('등록'));
    });
  });

  it('UNAUTHENTICATED 실패 → 로그인 메시지', async () => {
    mockedToggle.mockResolvedValue({ ok: false, error: 'UNAUTHENTICATED' });
    render(
      <LikeButton
        targetType="post"
        targetId="p1"
        initialLiked={false}
        initialCount={0}
        canLike={true}
      />,
    );
    fireEvent.click(screen.getByLabelText('좋아요 (0)'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('로그인'));
    });
  });

  it('INTERNAL 실패 → fallback 메시지', async () => {
    mockedToggle.mockResolvedValue({
      ok: false,
      error: 'INTERNAL',
      message: 'boom',
    });
    render(
      <LikeButton
        targetType="post"
        targetId="p1"
        initialLiked={false}
        initialCount={0}
        canLike={true}
      />,
    );
    fireEvent.click(screen.getByLabelText('좋아요 (0)'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('처리에 실패'));
    });
  });
});
