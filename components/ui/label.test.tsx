/**
 * components/ui/label.tsx — Sprint 19 F19-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { Label } from './label';

afterEach(() => cleanup());

describe('Label', () => {
  it('label 요소 렌더', () => {
    render(<Label>이름</Label>);
    const lbl = screen.getByText('이름');
    expect(lbl.tagName).toBe('LABEL');
  });

  it('htmlFor 속성 적용', () => {
    render(<Label htmlFor="my-input">이름</Label>);
    const lbl = screen.getByText('이름');
    expect(lbl.getAttribute('for')).toBe('my-input');
  });

  it('flex + items-center + gap-2 기본 클래스', () => {
    render(<Label>x</Label>);
    const lbl = screen.getByText('x');
    expect(lbl.className).toContain('flex');
    expect(lbl.className).toContain('items-center');
    expect(lbl.className).toContain('gap-2');
  });

  it('text-sm + font-medium 기본 클래스', () => {
    render(<Label>x</Label>);
    const lbl = screen.getByText('x');
    expect(lbl.className).toContain('text-sm');
    expect(lbl.className).toContain('font-medium');
  });

  it('data-slot="label" 속성', () => {
    render(<Label>x</Label>);
    const lbl = screen.getByText('x');
    expect(lbl.getAttribute('data-slot')).toBe('label');
  });

  it('className merge', () => {
    render(<Label className="extra-cls">x</Label>);
    const lbl = screen.getByText('x');
    expect(lbl.className).toContain('extra-cls');
  });

  it('children React 노드 (icon + text)', () => {
    render(
      <Label>
        <span data-testid="icon">★</span>이름
      </Label>,
    );
    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText('이름')).toBeTruthy();
  });
});
