/**
 * components/feature/bookmark-button.tsx — Sprint 20 F20-F RTL 테스트.
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
vi.mock('@/lib/bookmark/actions', () => ({
  addBookmark: vi.fn(),
  removeBookmark: vi.fn(),
}));
vi.mock('@/lib/firebase/analytics', () => ({
  logEvent: vi.fn(() => Promise.resolve()),
}));

import { toast } from 'sonner';
import { addBookmark, removeBookmark } from '@/lib/bookmark/actions';
import { BookmarkButton } from './bookmark-button';

const mockedAdd = vi.mocked(addBookmark);
const mockedRemove = vi.mocked(removeBookmark);
const mockedToastError = vi.mocked(toast.error);
const mockedToastSuccess = vi.mocked(toast.success);
const mockedToastMessage = vi.mocked(toast.message);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

const baseProps = {
  targetType: 'post' as const,
  targetId: 'p1',
  title: '제목',
  href: '/post/p1',
  canBookmark: true,
};

describe('BookmarkButton — 렌더링', () => {
  it('초기 미북마크 → "북마크 추가" + Bookmark 아이콘', () => {
    render(<BookmarkButton {...baseProps} initialBookmarked={false} />);
    expect(screen.getByLabelText('북마크 추가')).toBeTruthy();
  });

  it('초기 북마크됨 → "북마크 해제"', () => {
    render(<BookmarkButton {...baseProps} initialBookmarked={true} />);
    expect(screen.getByLabelText('북마크 해제')).toBeTruthy();
  });

  it('variant="icon-text" → text 표시', () => {
    render(
      <BookmarkButton {...baseProps} initialBookmarked={false} variant="icon-text" />,
    );
    expect(screen.getByText('북마크')).toBeTruthy();
  });

  it('variant="icon-text" + 북마크됨 → "북마크됨" text', () => {
    render(
      <BookmarkButton {...baseProps} initialBookmarked={true} variant="icon-text" />,
    );
    expect(screen.getByText('북마크됨')).toBeTruthy();
  });
});

describe('BookmarkButton — 인증 가드', () => {
  it('canBookmark=false 클릭 → toast.message + addBookmark 호출 X', () => {
    render(<BookmarkButton {...baseProps} canBookmark={false} />);
    fireEvent.click(screen.getByLabelText('북마크 추가'));
    expect(mockedToastMessage).toHaveBeenCalled();
    expect(mockedAdd).not.toHaveBeenCalled();
  });
});

describe('BookmarkButton — 추가 흐름', () => {
  it('초기 미북마크 + 클릭 → addBookmark + success toast', async () => {
    mockedAdd.mockResolvedValue({ ok: true });
    render(<BookmarkButton {...baseProps} initialBookmarked={false} />);
    fireEvent.click(screen.getByLabelText('북마크 추가'));
    await waitFor(() => {
      expect(mockedAdd).toHaveBeenCalledWith({
        targetType: 'post',
        targetId: 'p1',
        title: '제목',
        href: '/post/p1',
      });
    });
    expect(mockedToastSuccess).toHaveBeenCalledWith(expect.stringContaining('추가'));
  });

  it('emoji 옵션 전달', async () => {
    mockedAdd.mockResolvedValue({ ok: true });
    render(
      <BookmarkButton {...baseProps} initialBookmarked={false} emoji="⭐" />,
    );
    fireEvent.click(screen.getByLabelText('북마크 추가'));
    await waitFor(() => {
      expect(mockedAdd).toHaveBeenCalledWith(expect.objectContaining({ emoji: '⭐' }));
    });
  });

  it('LIMIT_EXCEEDED 실패 → 200개 메시지', async () => {
    mockedAdd.mockResolvedValue({ ok: false, error: 'LIMIT_EXCEEDED' });
    render(<BookmarkButton {...baseProps} initialBookmarked={false} />);
    fireEvent.click(screen.getByLabelText('북마크 추가'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(
        expect.stringContaining('200개'),
      );
    });
  });

  it('NOT_REGISTERED 실패 → 등록 메시지', async () => {
    mockedAdd.mockResolvedValue({ ok: false, error: 'NOT_REGISTERED' });
    render(<BookmarkButton {...baseProps} initialBookmarked={false} />);
    fireEvent.click(screen.getByLabelText('북마크 추가'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('등록'));
    });
  });

  it('ADMIN_NOT_CONFIGURED 실패 → 점검 메시지', async () => {
    mockedAdd.mockResolvedValue({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
    render(<BookmarkButton {...baseProps} initialBookmarked={false} />);
    fireEvent.click(screen.getByLabelText('북마크 추가'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('점검'));
    });
  });
});

describe('BookmarkButton — 제거 흐름', () => {
  it('초기 북마크 + 클릭 → removeBookmark + success toast', async () => {
    mockedRemove.mockResolvedValue({ ok: true });
    render(<BookmarkButton {...baseProps} initialBookmarked={true} />);
    fireEvent.click(screen.getByLabelText('북마크 해제'));
    await waitFor(() => {
      expect(mockedRemove).toHaveBeenCalledWith('post', 'p1');
    });
    expect(mockedToastSuccess).toHaveBeenCalledWith(expect.stringContaining('제거'));
  });

  it('INTERNAL 실패 → message fallback', async () => {
    mockedRemove.mockResolvedValue({
      ok: false,
      error: 'INTERNAL',
      message: 'network-fail',
    });
    render(<BookmarkButton {...baseProps} initialBookmarked={true} />);
    fireEvent.click(screen.getByLabelText('북마크 해제'));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith('network-fail');
    });
  });
});
