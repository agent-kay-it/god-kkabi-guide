/**
 * @vitest-environment jsdom
 *
 * Sprint 18 / F18-G — components/ui/glass-card.tsx RTL test.
 *
 * accent variants + interactive + children + className.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { GlassCard } from './glass-card';

afterEach(() => {
  cleanup();
});

describe('<GlassCard>', () => {
  it('children 렌더링', () => {
    render(<GlassCard>본문</GlassCard>);
    expect(screen.getByText('본문')).toBeTruthy();
  });

  it('div 로 렌더링', () => {
    const { container } = render(<GlassCard>x</GlassCard>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('default accent (none) — stripe 없음', () => {
    const { container } = render(<GlassCard>x</GlassCard>);
    const el = container.firstElementChild;
    // accent none 은 before: 선언 없음
    expect(el?.className).toContain('glass');
  });

  it('warrior accent — vermilion stripe', () => {
    const { container } = render(<GlassCard accent="warrior">x</GlassCard>);
    expect(container.firstElementChild?.className).toContain('vermilion');
  });

  it('swordsman accent — bronze stripe', () => {
    const { container } = render(<GlassCard accent="swordsman">x</GlassCard>);
    expect(container.firstElementChild?.className).toContain('bronze');
  });

  it('mage accent — indigo stripe', () => {
    const { container } = render(<GlassCard accent="mage">x</GlassCard>);
    expect(container.firstElementChild?.className).toContain('indigo');
  });

  it('pve accent — jade stripe', () => {
    const { container } = render(<GlassCard accent="pve">x</GlassCard>);
    expect(container.firstElementChild?.className).toContain('jade');
  });

  it('pvp accent — vermilion stripe', () => {
    const { container } = render(<GlassCard accent="pvp">x</GlassCard>);
    expect(container.firstElementChild?.className).toContain('vermilion');
  });

  it('interactive=true → cursor-pointer + hover', () => {
    const { container } = render(<GlassCard interactive>x</GlassCard>);
    expect(container.firstElementChild?.className).toContain('cursor-pointer');
  });

  it('interactive=false (default) — cursor-pointer 없음', () => {
    const { container } = render(<GlassCard>x</GlassCard>);
    expect(container.firstElementChild?.className).not.toContain('cursor-pointer');
  });

  it('className prop merge', () => {
    const { container } = render(<GlassCard className="custom-x">x</GlassCard>);
    expect(container.firstElementChild?.className).toContain('custom-x');
  });

  it('role prop pass-through (HTMLAttributes spread)', () => {
    const { container } = render(<GlassCard role="region">x</GlassCard>);
    expect(container.firstElementChild?.getAttribute('role')).toBe('region');
  });

  it('aria-label pass-through', () => {
    render(<GlassCard aria-label="카드 라벨">x</GlassCard>);
    expect(screen.getByLabelText('카드 라벨')).toBeTruthy();
  });
});
