/**
 * components/feature/owned-jinryeong-picker.tsx — Sprint 26 F26-B RTL.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';

const routerRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: routerRefresh, push: vi.fn() }),
}));
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock('@/lib/auth/update-owned-jinryeong', () => ({
  updateOwnedJinryeong: vi.fn(),
}));

import { toast } from 'sonner';
import { updateOwnedJinryeong } from '@/lib/auth/update-owned-jinryeong';
import { OwnedJinryeongPicker } from './owned-jinryeong-picker';

const mockedUpdate = vi.mocked(updateOwnedJinryeong);
const mockedToastSuccess = vi.mocked(toast.success);
const mockedToastError = vi.mocked(toast.error);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('OwnedJinryeongPicker', () => {
  it('11종 진령 카드 렌더', () => {
    render(<OwnedJinryeongPicker initialOwned={[]} />);
    expect(screen.getByText('홍길동')).toBeTruthy();
    expect(screen.getByText('서해용왕')).toBeTruthy();
    expect(screen.getByText('산신')).toBeTruthy();
    expect(screen.getAllByRole('checkbox').length).toBe(11);
  });

  it('initialOwned 가 체크된 상태로 렌더', () => {
    render(
      <OwnedJinryeongPicker
        initialOwned={['hong_gildong', 'seohaeyongwang']}
      />,
    );
    const hong = screen.getByLabelText('홍길동 보유 토글');
    expect(hong.getAttribute('aria-checked')).toBe('true');
    const sansin = screen.getByLabelText('산신 보유 토글');
    expect(sansin.getAttribute('aria-checked')).toBe('false');
  });

  it('카드 클릭 시 toggle (off → on → off)', () => {
    render(<OwnedJinryeongPicker initialOwned={[]} />);
    const hong = screen.getByLabelText('홍길동 보유 토글');
    expect(hong.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(hong);
    expect(hong.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(hong);
    expect(hong.getAttribute('aria-checked')).toBe('false');
  });

  it('변경 없음 → 저장 버튼 disabled', () => {
    render(<OwnedJinryeongPicker initialOwned={['hong_gildong']} />);
    const btn = screen.getByRole('button', { name: /보유 진령 저장/ }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('변경 발생 → 저장 버튼 enabled + "변경사항 있음" 노출', () => {
    render(<OwnedJinryeongPicker initialOwned={[]} />);
    fireEvent.click(screen.getByLabelText('홍길동 보유 토글'));
    const btn = screen.getByRole('button', {
      name: /보유 진령 저장/,
    }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
    expect(screen.getByText(/변경사항 있음/)).toBeTruthy();
  });

  it('happy: 저장 성공 → success 토스트 + router.refresh', async () => {
    mockedUpdate.mockResolvedValue({
      ok: true,
      saved: ['hong_gildong'],
    } as never);
    render(<OwnedJinryeongPicker initialOwned={[]} />);
    fireEvent.click(screen.getByLabelText('홍길동 보유 토글'));
    fireEvent.click(screen.getByRole('button', { name: /보유 진령 저장/ }));
    await waitFor(() => {
      expect(mockedUpdate).toHaveBeenCalledWith({ uids: ['hong_gildong'] });
      expect(mockedToastSuccess).toHaveBeenCalledWith(
        expect.stringContaining('1'),
      );
      expect(routerRefresh).toHaveBeenCalled();
    });
  });

  it('실패 (INVALID_INPUT) → error 토스트 한국어 매핑', async () => {
    mockedUpdate.mockResolvedValue({
      ok: false,
      error: 'INVALID_INPUT',
    });
    render(<OwnedJinryeongPicker initialOwned={[]} />);
    fireEvent.click(screen.getByLabelText('홍길동 보유 토글'));
    fireEvent.click(screen.getByRole('button', { name: /보유 진령 저장/ }));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(
        '유효하지 않은 진령 id 입니다.',
      );
    });
  });

  it('실패 (BANNED) → 정지 메시지', async () => {
    mockedUpdate.mockResolvedValue({ ok: false, error: 'BANNED' });
    render(<OwnedJinryeongPicker initialOwned={[]} />);
    fireEvent.click(screen.getByLabelText('홍길동 보유 토글'));
    fireEvent.click(screen.getByRole('button', { name: /보유 진령 저장/ }));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith('정지된 계정입니다.');
    });
  });

  it('실패 (알 수 없는 오류) → fallback 메시지', async () => {
    mockedUpdate.mockResolvedValue({
      ok: false,
      error: 'UNKNOWN_X',
    });
    render(<OwnedJinryeongPicker initialOwned={[]} />);
    fireEvent.click(screen.getByLabelText('홍길동 보유 토글'));
    fireEvent.click(screen.getByRole('button', { name: /보유 진령 저장/ }));
    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(
        expect.stringContaining('UNKNOWN_X'),
      );
    });
  });

  it('선택 개수 표시 — 0/11 → 3/11', () => {
    render(<OwnedJinryeongPicker initialOwned={[]} />);
    expect(screen.getByText(/0\/11/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('홍길동 보유 토글'));
    fireEvent.click(screen.getByLabelText('서해용왕 보유 토글'));
    fireEvent.click(screen.getByLabelText('산신 보유 토글'));
    expect(screen.getByText(/3\/11/)).toBeTruthy();
  });
});
