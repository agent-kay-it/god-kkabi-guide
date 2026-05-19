/**
 * @vitest-environment jsdom
 *
 * Sprint 18 / F18-G — components/domain/tip-card.tsx RTL test.
 *
 * category + title + content + a11y 검증.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TipCard } from './tip-card';

afterEach(() => {
  cleanup();
});

describe('<TipCard>', () => {
  it('title 렌더링', () => {
    render(<TipCard category="general" title="제목" content="내용" />);
    expect(screen.getByText('제목')).toBeTruthy();
  });

  it('content 렌더링', () => {
    render(<TipCard category="general" title="제목" content="본문 내용입니다" />);
    expect(screen.getByText('본문 내용입니다')).toBeTruthy();
  });

  it('general category — "일반 팁" 라벨', () => {
    render(<TipCard category="general" title="t" content="c" />);
    expect(screen.getByText('일반 팁')).toBeTruthy();
  });

  it('beginner category — "초보 팁"', () => {
    render(<TipCard category="beginner" title="t" content="c" />);
    expect(screen.getByText('초보 팁')).toBeTruthy();
  });

  it('advanced category — "고급 팁"', () => {
    render(<TipCard category="advanced" title="t" content="c" />);
    expect(screen.getByText('고급 팁')).toBeTruthy();
  });

  it('pvp category — "PvP 팁"', () => {
    render(<TipCard category="pvp" title="t" content="c" />);
    expect(screen.getByText('PvP 팁')).toBeTruthy();
  });

  it('article element 사용 (semantic)', () => {
    const { container } = render(<TipCard category="general" title="t" content="c" />);
    expect(container.firstElementChild?.tagName).toBe('ARTICLE');
  });

  it('aria-label = title + " 팁"', () => {
    render(<TipCard category="general" title="자동사냥" content="c" />);
    const article = screen.getByRole('article');
    expect(article.getAttribute('aria-label')).toBe('자동사냥 팁');
  });

  it('Lightbulb icon aria-hidden', () => {
    const { container } = render(<TipCard category="general" title="t" content="c" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('h3 로 title 렌더링', () => {
    render(<TipCard category="general" title="제목입니다" content="c" />);
    const h3 = screen.getByRole('heading', { level: 3 });
    expect(h3.textContent).toBe('제목입니다');
  });

  it('category 별 border 색상 (general → bronze)', () => {
    const { container } = render(<TipCard category="general" title="t" content="c" />);
    expect(container.firstElementChild?.className).toContain('border-bronze');
  });

  it('beginner → jade border', () => {
    const { container } = render(<TipCard category="beginner" title="t" content="c" />);
    expect(container.firstElementChild?.className).toContain('border-jade');
  });

  it('pvp → vermilion border', () => {
    const { container } = render(<TipCard category="pvp" title="t" content="c" />);
    expect(container.firstElementChild?.className).toContain('border-vermilion');
  });

  it('className prop merge', () => {
    const { container } = render(<TipCard category="general" title="t" content="c" className="custom-x" />);
    expect(container.firstElementChild?.className).toContain('custom-x');
  });
});
