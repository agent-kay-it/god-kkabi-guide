/**
 * @vitest-environment jsdom
 *
 * Sprint 17 / F17-B — components/ui/pill.tsx RTL test.
 *
 * 검증: variant + size + className merge + children pass-through.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Pill } from './pill';

afterEach(() => {
  cleanup();
});

describe('<Pill>', () => {
  it('children 렌더링', () => {
    render(<Pill>v1.0.0</Pill>);
    expect(screen.getByText('v1.0.0')).toBeTruthy();
  });

  it('default variant + default size 적용', () => {
    const { container } = render(<Pill>default</Pill>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('rounded-full');
  });

  it('bronze variant', () => {
    const { container } = render(<Pill variant="bronze">b</Pill>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('bronze');
  });

  it('jade variant', () => {
    const { container } = render(<Pill variant="jade">j</Pill>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('jade');
  });

  it('vermilion variant', () => {
    const { container } = render(<Pill variant="vermilion">v</Pill>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('vermilion');
  });

  it('indigo variant', () => {
    const { container } = render(<Pill variant="indigo">i</Pill>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('indigo');
  });

  it('size sm — text-[0.72rem]', () => {
    const { container } = render(<Pill size="sm">sm</Pill>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('0.72rem');
  });

  it('size lg — text-sm', () => {
    const { container } = render(<Pill size="lg">lg</Pill>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('text-sm');
  });

  it('className prop merge', () => {
    const { container } = render(<Pill className="custom-x">test</Pill>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('custom-x');
  });

  it('div 로 렌더링됨', () => {
    const { container } = render(<Pill>inner</Pill>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });
});
