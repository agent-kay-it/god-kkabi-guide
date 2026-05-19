/**
 * components/domain/stat-cell.tsx — Sprint 19 F19-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { StatCell } from './stat-cell';

afterEach(() => cleanup());

describe('StatCell', () => {
  it('label + value 렌더', () => {
    render(<StatCell label="HP" value="9999" />);
    expect(screen.getByText('HP')).toBeTruthy();
    expect(screen.getByText('9999')).toBeTruthy();
  });

  it('label 은 uppercase + text-text-mute 토큰', () => {
    render(<StatCell label="atk" value="1" />);
    const label = screen.getByText('atk');
    expect(label.className).toContain('uppercase');
    expect(label.className).toContain('text-text-mute');
  });

  it('value 는 font-semibold', () => {
    render(<StatCell label="L" value="V" />);
    const value = screen.getByText('V');
    expect(value.parentElement?.className).toContain('font-semibold');
  });

  it('rate 있을 때 font-mono + text-bronze-soft 렌더', () => {
    render(<StatCell label="grade" value="S" rate="★★★" />);
    const rate = screen.getByText('★★★');
    expect(rate.tagName).toBe('SPAN');
    expect(rate.className).toContain('font-mono');
    expect(rate.className).toContain('text-bronze-soft');
  });

  it('rate 없을 때 rate span 렌더 안 함', () => {
    const { container } = render(<StatCell label="x" value="y" />);
    const monoSpan = container.querySelector('.font-mono');
    expect(monoSpan).toBeNull();
  });

  it('className merge', () => {
    const { container } = render(<StatCell label="x" value="y" className="extra" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('extra');
  });

  it('rounded-md + bg-ink-elev/55 + transition 토큰', () => {
    const { container } = render(<StatCell label="x" value="y" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('rounded-md');
    expect(root.className).toContain('bg-ink-elev/55');
    expect(root.className).toContain('transition-colors');
  });

  it('rate 와 value 가 같은 부모 안에서 렌더', () => {
    render(<StatCell label="L" value="92%" rate="A" />);
    const rate = screen.getByText('A');
    const value = screen.getByText('92%');
    expect(rate.parentElement).toBe(value.parentElement);
  });
});
