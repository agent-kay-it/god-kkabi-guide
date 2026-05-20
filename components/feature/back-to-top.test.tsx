/**
 * components/feature/back-to-top.tsx — Sprint 20 F20-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/hooks/use-back-to-top', () => ({
  useBackToTop: vi.fn(),
}));

import { useBackToTop } from '@/hooks/use-back-to-top';
import { BackToTop } from './back-to-top';

const mockedUseBackToTop = vi.mocked(useBackToTop);

afterEach(() => cleanup());

describe('BackToTop', () => {
  it('visible=false → aria-hidden=true + tabIndex=-1', () => {
    mockedUseBackToTop.mockReturnValue(false);
    const { container } = render(<BackToTop />);
    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('aria-hidden')).toBe('true');
    expect(link?.getAttribute('tabindex')).toBe('-1');
  });

  it('visible=true → aria-hidden=false + tabIndex=0', () => {
    mockedUseBackToTop.mockReturnValue(true);
    const { container } = render(<BackToTop />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('aria-hidden')).toBe('false');
    expect(link?.getAttribute('tabindex')).toBe('0');
  });

  it('aria-label="맨 위로"', () => {
    mockedUseBackToTop.mockReturnValue(true);
    render(<BackToTop />);
    expect(screen.getByLabelText('맨 위로')).toBeTruthy();
  });

  it('click → window.scrollTo({ top: 0, behavior: smooth })', () => {
    mockedUseBackToTop.mockReturnValue(true);
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<BackToTop />);
    const link = screen.getByLabelText('맨 위로');
    fireEvent.click(link);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    scrollToSpy.mockRestore();
  });

  it('click 이벤트 default 차단 (preventDefault)', () => {
    mockedUseBackToTop.mockReturnValue(true);
    render(<BackToTop />);
    const link = screen.getByLabelText('맨 위로');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('href="#top" anchor 폴백', () => {
    mockedUseBackToTop.mockReturnValue(false);
    render(<BackToTop />);
    const link = screen.getByLabelText('맨 위로');
    expect(link.getAttribute('href')).toBe('#top');
  });
});
