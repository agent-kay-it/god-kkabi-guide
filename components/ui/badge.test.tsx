/**
 * @vitest-environment jsdom
 *
 * Sprint 17 / F17-B — components/ui/badge.tsx RTL test.
 *
 * 검증 범위:
 *  - default render + children
 *  - variant 별 className 적용
 *  - tier 시스템 (tier-0 ~ tier-3)
 *  - 직업 시스템 (warrior/swordsman/mage)
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Badge } from './badge';

afterEach(() => {
  cleanup();
});

describe('<Badge>', () => {
  it('children 렌더링', () => {
    render(<Badge>테스트</Badge>);
    expect(screen.getByText('테스트')).toBeTruthy();
  });

  it('default variant 적용', () => {
    const { container } = render(<Badge>default</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('bg-bronze/15');
  });

  it('bronze variant', () => {
    const { container } = render(<Badge variant="bronze">bronze</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('bronze');
  });

  it('jade variant', () => {
    const { container } = render(<Badge variant="jade">jade</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('jade');
  });

  it('vermilion variant', () => {
    const { container } = render(<Badge variant="vermilion">vermilion</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('vermilion');
  });

  it('indigo variant', () => {
    const { container } = render(<Badge variant="indigo">indigo</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('indigo');
  });

  it('tier-0 variant — font-mono', () => {
    const { container } = render(<Badge variant="tier-0">SSS</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('font-mono');
  });

  it('warrior class variant', () => {
    const { container } = render(<Badge variant="warrior">전사</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('vermilion');
  });

  it('swordsman class variant — bronze', () => {
    const { container } = render(<Badge variant="swordsman">검객</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('bronze');
  });

  it('className prop merge', () => {
    const { container } = render(<Badge className="custom-x">test</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('custom-x');
  });

  it('focus-ring 공통 styling 포함', () => {
    const { container } = render(<Badge>focus</Badge>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('focus:ring-bronze');
  });
});
