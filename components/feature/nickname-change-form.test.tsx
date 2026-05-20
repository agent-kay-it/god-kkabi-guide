/**
 * components/feature/nickname-change-form.tsx — Sprint 22 F22-D RTL.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), message: vi.fn() },
}));
vi.mock('@/lib/auth/change-nickname', () => ({
  changeNickname: vi.fn(),
  NICKNAME_COOLDOWN_MS: 30 * 24 * 60 * 60 * 1000,
}));

import { toast } from 'sonner';
import { changeNickname } from '@/lib/auth/change-nickname';
import { NicknameChangeForm } from './nickname-change-form';

const mockedChange = vi.mocked(changeNickname);
const mockedToastError = vi.mocked(toast.error);
const mockedToastSuccess = vi.mocked(toast.success);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('NicknameChangeForm — 렌더링', () => {
  it('canChangeNow=true (cooldown 0) → "변경" 버튼 표시', () => {
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    expect(screen.getByRole('button', { name: /^변경$/ })).toBeTruthy();
  });

  it('canChangeNow=false → "변경 가능" 안내 표시', () => {
    const futureMs = 5 * 24 * 60 * 60 * 1000; // 5일
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={futureMs} />);
    expect(screen.getByText(/변경 가능/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: '변경' })).toBeNull();
  });

  it('현재 닉네임 표시', () => {
    render(<NicknameChangeForm currentNickname="깨비지기" cooldownRemainingMs={0} />);
    expect(screen.getByText('깨비지기')).toBeTruthy();
  });

  it('정책 안내 문구 표시', () => {
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    expect(screen.getByText(/30일에 1회 변경/)).toBeTruthy();
  });
});

describe('NicknameChangeForm — 편집 모드', () => {
  it('"변경" 클릭 → 입력 폼 표시', () => {
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: '변경' }));
    expect(screen.getByLabelText(/새 닉네임/)).toBeTruthy();
  });

  it('취소 → 편집 모드 종료', () => {
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: '변경' }));
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByLabelText(/새 닉네임/)).toBeNull();
  });

  it('빈 input submit → 에러 토스트', () => {
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: '변경' }));
    const form = screen.getByLabelText(/새 닉네임/).closest('form')!;
    fireEvent.submit(form);
    expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('입력'));
    expect(mockedChange).not.toHaveBeenCalled();
  });
});

describe('NicknameChangeForm — Server Action', () => {
  it('happy: 성공 → success 토스트', async () => {
    mockedChange.mockResolvedValue({ ok: true });
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: '변경' }));
    const input = screen.getByLabelText(/새 닉네임/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '새닉네임' } });
    const form = input.closest('form')!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(mockedChange).toHaveBeenCalledWith({ newNickname: '새닉네임' });
      expect(mockedToastSuccess).toHaveBeenCalled();
    });
  });

  it('COOLDOWN 실패 → cooldown 메시지', async () => {
    mockedChange.mockResolvedValue({
      ok: false,
      error: 'COOLDOWN',
      cooldownRemainingMs: 5 * 24 * 60 * 60 * 1000,
    });
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: '변경' }));
    const input = screen.getByLabelText(/새 닉네임/);
    fireEvent.change(input, { target: { value: '시도' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('30일'));
    });
  });

  it('DUPLICATE 실패 → 중복 메시지', async () => {
    mockedChange.mockResolvedValue({ ok: false, error: 'DUPLICATE' });
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: '변경' }));
    const input = screen.getByLabelText(/새 닉네임/);
    fireEvent.change(input, { target: { value: 'taken' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('이미 사용'));
    });
  });

  it('VALIDATION_FAILED 실패 → message fallback', async () => {
    mockedChange.mockResolvedValue({
      ok: false,
      error: 'VALIDATION_FAILED',
      message: '특수문자 불가',
    });
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: '변경' }));
    const input = screen.getByLabelText(/새 닉네임/);
    fireEvent.change(input, { target: { value: 'a!b!' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith('특수문자 불가');
    });
  });

  it('UNAUTHENTICATED 실패 → 로그인 메시지', async () => {
    mockedChange.mockResolvedValue({ ok: false, error: 'UNAUTHENTICATED' });
    render(<NicknameChangeForm currentNickname="kay" cooldownRemainingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: '변경' }));
    const input = screen.getByLabelText(/새 닉네임/);
    fireEvent.change(input, { target: { value: 'try' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(expect.stringContaining('로그인'));
    });
  });
});
