/**
 * @vitest-environment jsdom
 *
 * Sprint 17 / F17-B — components/domain/penalty-badge.tsx RTL test.
 *
 * 검증: level 별 label / variant / expiry 표시 분기.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PenaltyBadge } from './penalty-badge';

afterEach(() => {
  cleanup();
});

describe('<PenaltyBadge>', () => {
  it('warning level — 경고 라벨 + bronze variant', () => {
    const { container } = render(<PenaltyBadge level="warning" />);
    expect(screen.getByText('경고')).toBeTruthy();
    expect(container.firstElementChild?.className).toContain('bronze');
  });

  it('ban_7d level — 7일 정지 라벨 + vermilion variant', () => {
    const { container } = render(<PenaltyBadge level="ban_7d" />);
    expect(screen.getByText('7일 정지')).toBeTruthy();
    expect(container.firstElementChild?.className).toContain('vermilion');
  });

  it('ban_permanent level — 영구 정지 라벨 + vermilion variant', () => {
    const { container } = render(<PenaltyBadge level="ban_permanent" />);
    expect(screen.getByText('영구 정지')).toBeTruthy();
    expect(container.firstElementChild?.className).toContain('vermilion');
  });

  it('expiresAtMs 가 ban_7d 와 함께면 만료시각 표시', () => {
    const expiresAt = new Date('2026-12-25T10:30:00Z').getTime();
    const { container } = render(
      <PenaltyBadge level="ban_7d" expiresAtMs={expiresAt} />,
    );
    // ~MM월 DD일 HH:mm 형식 (정규식으로 유연 검증)
    const text = container.textContent ?? '';
    expect(text).toMatch(/~/);
    expect(text).toMatch(/\d{1,2}/);
  });

  it('expiresAtMs 가 warning 과 함께라면 expiry 미표시 (level 검사)', () => {
    const expiresAt = new Date('2026-12-25T10:30:00Z').getTime();
    const { container } = render(
      <PenaltyBadge level="warning" expiresAtMs={expiresAt} />,
    );
    expect(container.textContent).not.toContain('~');
  });

  it('expiresAtMs 없으면 expiry 미표시', () => {
    const { container } = render(<PenaltyBadge level="ban_7d" />);
    expect(container.textContent).not.toContain('~');
  });

  it('className prop merge', () => {
    const { container } = render(<PenaltyBadge level="warning" className="custom-x" />);
    expect(container.firstElementChild?.className).toContain('custom-x');
  });

  it('아이콘 aria-hidden 처리', () => {
    const { container } = render(<PenaltyBadge level="warning" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
