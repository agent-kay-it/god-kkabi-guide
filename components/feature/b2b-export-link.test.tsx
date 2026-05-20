/**
 * components/feature/b2b-export-link.tsx — Sprint 25 F25-B RTL.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

vi.mock('@/lib/firebase/analytics', () => ({
  logEvent: vi.fn(() => Promise.resolve()),
}));

import { logEvent } from '@/lib/firebase/analytics';
import { B2bExportLink } from './b2b-export-link';

const mockedLogEvent = vi.mocked(logEvent);

beforeEach(() => mockedLogEvent.mockClear());
afterEach(() => cleanup());

describe('B2bExportLink', () => {
  it('기본 label "샘플 JSON" 렌더', () => {
    render(<B2bExportLink href="/api/v1/report/r1.json" reportId="r1" />);
    expect(screen.getByText('샘플 JSON')).toBeTruthy();
  });

  it('커스텀 label 사용', () => {
    render(
      <B2bExportLink href="/api/v1/report/r1.json" reportId="r1" label="다운로드" />,
    );
    expect(screen.getByText('다운로드')).toBeTruthy();
  });

  it('target=_blank + rel=noopener (외부 링크 보안)', () => {
    render(<B2bExportLink href="/api/v1/report/r1.json" reportId="r1" />);
    const a = screen.getByRole('link');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toContain('noopener');
    expect(a.getAttribute('rel')).toContain('noreferrer');
  });

  it('href 정상 설정', () => {
    render(<B2bExportLink href="/api/v1/report/abc.json" reportId="abc" />);
    const a = screen.getByRole('link');
    expect(a.getAttribute('href')).toBe('/api/v1/report/abc.json');
  });

  it('클릭 시 b2b_export GA4 발화', () => {
    render(<B2bExportLink href="/api/v1/report/abc.json" reportId="abc" />);
    fireEvent.click(screen.getByRole('link'));
    expect(mockedLogEvent).toHaveBeenCalledWith('b2b_export', {
      report_id: 'abc',
      href: '/api/v1/report/abc.json',
      format: 'json',
    });
  });
});
