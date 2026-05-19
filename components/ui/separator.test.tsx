/**
 * @vitest-environment jsdom
 *
 * Sprint 17 / F17-B — components/ui/separator.tsx RTL test.
 *
 * 검증 범위:
 *  - default render
 *  - decorative 기본 true → role="none"
 *  - decorative false → role="separator" + aria-orientation
 *  - orientation horizontal/vertical
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Separator } from './separator';

afterEach(() => {
  cleanup();
});

describe('<Separator>', () => {
  it('decorative 기본값 true → role=none', () => {
    const { container } = render(<Separator />);
    const hr = container.querySelector('hr');
    expect(hr).toBeTruthy();
    expect(hr?.getAttribute('role')).toBe('none');
  });

  it('decorative=false → role=separator + aria-orientation', () => {
    render(<Separator decorative={false} orientation="vertical" />);
    const el = screen.getByRole('separator');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('horizontal orientation 기본 — h-px w-full', () => {
    const { container } = render(<Separator orientation="horizontal" />);
    const hr = container.querySelector('hr');
    expect(hr?.className).toContain('h-px');
    expect(hr?.className).toContain('w-full');
  });

  it('vertical orientation — h-full w-px', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const hr = container.querySelector('hr');
    expect(hr?.className).toContain('h-full');
    expect(hr?.className).toContain('w-px');
  });

  it('className prop merge', () => {
    const { container } = render(<Separator className="custom-class" />);
    const hr = container.querySelector('hr');
    expect(hr?.className).toContain('custom-class');
  });

  it('arbitrary HTMLAttribute props 전달 (data-testid)', () => {
    render(<Separator data-testid="my-sep" decorative={false} />);
    const el = screen.getByTestId('my-sep');
    expect(el).toBeTruthy();
  });
});
