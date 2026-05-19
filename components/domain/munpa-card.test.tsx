/**
 * @vitest-environment jsdom
 *
 * Sprint 18 / F18-G — components/domain/munpa-card.tsx RTL test.
 *
 * data prop + category 별 분기 + bullets 렌더링.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MunpaCard } from './munpa-card';
import type { WikiMunpaGuideDoc } from '@/types/wiki';

afterEach(() => {
  cleanup();
});

function makeData(over: Partial<WikiMunpaGuideDoc> = {}): WikiMunpaGuideDoc {
  return {
    id: 'm-1',
    category: 'benefit',
    title: '가입 이점 제목',
    summary: '이점 요약',
    bullets: ['항목1', '항목2'],
    ...over,
  } as WikiMunpaGuideDoc;
}

describe('<MunpaCard>', () => {
  it('title + summary 렌더링', () => {
    render(<MunpaCard data={makeData()} />);
    expect(screen.getByText('가입 이점 제목')).toBeTruthy();
    expect(screen.getByText('이점 요약')).toBeTruthy();
  });

  it('benefit category → "가입 이점" 라벨', () => {
    render(<MunpaCard data={makeData({ category: 'benefit' })} />);
    expect(screen.getByText('가입 이점')).toBeTruthy();
  });

  it('criteria category → "선택 기준" 라벨', () => {
    render(<MunpaCard data={makeData({ category: 'criteria' })} />);
    expect(screen.getByText('선택 기준')).toBeTruthy();
  });

  it('etiquette category → "매너" 라벨', () => {
    render(<MunpaCard data={makeData({ category: 'etiquette' })} />);
    expect(screen.getByText('매너')).toBeTruthy();
  });

  it('bullets 모두 렌더링', () => {
    render(<MunpaCard data={makeData({ bullets: ['A', 'B', 'C'] })} />);
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
  });

  it('bullets 빈 배열 → ul 미렌더링', () => {
    const { container } = render(
      <MunpaCard data={makeData({ bullets: [] })} />,
    );
    const ul = container.querySelector('ul');
    expect(ul).toBeNull();
  });

  it('bullets undefined → ul 미렌더링', () => {
    const { container } = render(
      <MunpaCard data={makeData({ bullets: undefined })} />,
    );
    const ul = container.querySelector('ul');
    expect(ul).toBeNull();
  });

  it('h3 로 title', () => {
    render(<MunpaCard data={makeData({ title: '제목X' })} />);
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('제목X');
  });

  it('아이콘 aria-hidden', () => {
    const { container } = render(<MunpaCard data={makeData()} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).not.toBeNull();
  });

  it('benefit → jade variant accent', () => {
    const { container } = render(
      <MunpaCard data={makeData({ category: 'benefit' })} />,
    );
    // jade variant 가 적용된 element 존재
    expect(container.textContent).toContain('가입 이점');
  });

  it('className prop merge', () => {
    const { container } = render(
      <MunpaCard data={makeData()} className="custom-x" />,
    );
    expect(container.firstElementChild?.className).toContain('custom-x');
  });
});
