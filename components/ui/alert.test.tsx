/**
 * @vitest-environment jsdom
 *
 * Sprint 18 / F18-G — components/ui/alert.tsx RTL test.
 *
 * AlertRoot + AlertTitle + AlertDescription + 변형 검증.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AlertRoot, AlertTitle, AlertDescription } from './alert';

afterEach(() => {
  cleanup();
});

describe('<AlertRoot>', () => {
  it('default variant 렌더링', () => {
    const { container } = render(<AlertRoot>알림 본문</AlertRoot>);
    expect(container.firstElementChild?.className).toContain('border-ink-line');
  });

  it('tip variant — indigo', () => {
    const { container } = render(<AlertRoot variant="tip">tip</AlertRoot>);
    expect(container.firstElementChild?.className).toContain('indigo');
  });

  it('warn variant — vermilion', () => {
    const { container } = render(<AlertRoot variant="warn">warn</AlertRoot>);
    expect(container.firstElementChild?.className).toContain('vermilion');
  });

  it('success variant — jade', () => {
    const { container } = render(<AlertRoot variant="success">success</AlertRoot>);
    expect(container.firstElementChild?.className).toContain('jade');
  });

  it('bronze variant', () => {
    const { container } = render(<AlertRoot variant="bronze">bronze</AlertRoot>);
    expect(container.firstElementChild?.className).toContain('bronze');
  });

  it('destructive variant', () => {
    const { container } = render(<AlertRoot variant="destructive">err</AlertRoot>);
    expect(container.firstElementChild?.className).toContain('vermilion');
  });

  it('className prop merge', () => {
    const { container } = render(<AlertRoot className="custom-x">x</AlertRoot>);
    expect(container.firstElementChild?.className).toContain('custom-x');
  });

  it('children 렌더링', () => {
    render(<AlertRoot>내용</AlertRoot>);
    expect(screen.getByText('내용')).toBeTruthy();
  });
});

describe('<AlertTitle>', () => {
  it('h5 로 렌더링', () => {
    const { container } = render(<AlertTitle>제목</AlertTitle>);
    expect(container.firstElementChild?.tagName).toBe('H5');
  });

  it('children 텍스트 표시', () => {
    render(<AlertTitle>제목 텍스트</AlertTitle>);
    expect(screen.getByText('제목 텍스트')).toBeTruthy();
  });

  it('font-semibold 적용', () => {
    const { container } = render(<AlertTitle>x</AlertTitle>);
    expect(container.firstElementChild?.className).toContain('font-semibold');
  });

  it('className prop merge', () => {
    const { container } = render(<AlertTitle className="custom-x">x</AlertTitle>);
    expect(container.firstElementChild?.className).toContain('custom-x');
  });
});

describe('<AlertDescription>', () => {
  it('div 로 렌더링', () => {
    const { container } = render(<AlertDescription>설명</AlertDescription>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('text-sm + text-text-soft 적용', () => {
    const { container } = render(<AlertDescription>x</AlertDescription>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('text-sm');
    expect(el?.className).toContain('text-text-soft');
  });

  it('children 텍스트', () => {
    render(<AlertDescription>설명 본문</AlertDescription>);
    expect(screen.getByText('설명 본문')).toBeTruthy();
  });
});
