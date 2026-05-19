/**
 * components/domain/tier-stack.tsx — Sprint 19 F19-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { TierStack } from './tier-stack';

afterEach(() => cleanup());

const items0 = [
  { id: 'a', name: '진령A', trait: '치명타 회심', href: '/wiki/a' },
  { id: 'b', name: '진령B', trait: '광역 폭딜' },
];
const items1 = [{ id: 'c', name: '진령C', trait: '처형' }];

describe('TierStack', () => {
  it('role=list + listitem 으로 렌더', () => {
    render(
      <TierStack
        tiers={[
          { tier: 0, label: 'Tier 0', items: items0 },
          { tier: 1, label: 'Tier 1', items: items1 },
        ]}
      />,
    );
    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBe(2);
  });

  it('각 tier 의 label 렌더', () => {
    render(
      <TierStack
        tiers={[
          { tier: 0, label: 'Tier 0', items: items0 },
          { tier: 1, label: 'Tier 1', items: items1 },
        ]}
      />,
    );
    expect(screen.getByText('Tier 0')).toBeTruthy();
    expect(screen.getByText('Tier 1')).toBeTruthy();
  });

  it('label 미지정 시 T0/T1/T2 기본 label', () => {
    render(
      <TierStack
        tiers={[{ tier: 2, items: [{ id: 'x', name: 'X', trait: '특성' }] }]}
      />,
    );
    expect(screen.getByText('T2')).toBeTruthy();
  });

  it('진령 chip — name + trait 모두 렌더', () => {
    render(<TierStack tiers={[{ tier: 0, items: items0 }]} />);
    expect(screen.getByText('진령A')).toBeTruthy();
    expect(screen.getByText('치명타 회심')).toBeTruthy();
    expect(screen.getByText('진령B')).toBeTruthy();
    expect(screen.getByText('광역 폭딜')).toBeTruthy();
  });

  it('href 있는 chip 은 Link (a 태그)', () => {
    render(<TierStack tiers={[{ tier: 0, items: items0 }]} />);
    const linkChip = screen.getByText('진령A').closest('a');
    expect(linkChip).not.toBeNull();
    expect(linkChip?.getAttribute('href')).toBe('/wiki/a');
  });

  it('href 없는 chip 은 div', () => {
    render(<TierStack tiers={[{ tier: 0, items: items0 }]} />);
    const noLinkChip = screen.getByText('진령B').closest('a');
    expect(noLinkChip).toBeNull();
  });

  it('aria-label 이 stripe 영역에 적용 (Tier 0 → "Tier 0")', () => {
    render(<TierStack tiers={[{ tier: 0, label: 'Tier 0', items: items0 }]} />);
    const stripe = document.querySelector('[aria-label="Tier 0"]');
    expect(stripe).not.toBeNull();
  });

  it('className merge', () => {
    const { container } = render(
      <TierStack className="extra-cls" tiers={[{ tier: 0, items: items0 }]} />,
    );
    expect((container.firstElementChild as HTMLElement).className).toContain('extra-cls');
  });

  it('tier 3개 모두 다른 hover color 클래스', () => {
    const { container } = render(
      <TierStack
        tiers={[
          { tier: 0, items: items1 },
          { tier: 1, items: items1 },
          { tier: 2, items: items1 },
        ]}
      />,
    );
    const html = container.innerHTML;
    expect(html).toContain('hover:border-vermilion');
    expect(html).toContain('hover:border-bronze');
    expect(html).toContain('hover:border-indigo');
  });
});
