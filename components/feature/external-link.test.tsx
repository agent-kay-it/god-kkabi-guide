/**
 * components/feature/external-link.tsx — Sprint 20 F20-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/lib/firebase/analytics', () => ({
  logEvent: vi.fn(() => Promise.resolve()),
}));

import { logEvent } from '@/lib/firebase/analytics';
import { ExternalLink } from './external-link';

const mockedLogEvent = vi.mocked(logEvent);

afterEach(() => {
  cleanup();
  mockedLogEvent.mockClear();
});

describe('ExternalLink', () => {
  it('a 태그 + href 적용', () => {
    render(
      <ExternalLink url="https://example.com" source="footer">
        링크
      </ExternalLink>,
    );
    const a = screen.getByText('링크') as HTMLAnchorElement;
    expect(a.tagName).toBe('A');
    expect(a.href).toBe('https://example.com/');
  });

  it('target="_blank" + rel="nofollow noopener noreferrer"', () => {
    render(
      <ExternalLink url="https://example.com" source="footer">
        x
      </ExternalLink>,
    );
    const a = screen.getByText('x');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('nofollow noopener noreferrer');
  });

  it('className prop 적용', () => {
    render(
      <ExternalLink url="https://example.com" source="x" className="my-link">
        x
      </ExternalLink>,
    );
    expect(screen.getByText('x').className).toContain('my-link');
  });

  it('click 시 logEvent("external_link_click") 호출', () => {
    render(
      <ExternalLink url="https://example.com" source="header">
        x
      </ExternalLink>,
    );
    fireEvent.click(screen.getByText('x'));
    expect(mockedLogEvent).toHaveBeenCalledWith('external_link_click', {
      url: 'https://example.com',
      source: 'header',
    });
  });

  it('children React 노드 (icon + text)', () => {
    render(
      <ExternalLink url="https://example.com" source="x">
        <span data-testid="icon">→</span>외부
      </ExternalLink>,
    );
    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText('외부')).toBeTruthy();
  });
});
