/**
 * @vitest-environment jsdom
 *
 * Sprint 17 / F17-B — components/domain/note.tsx RTL test.
 *
 * 검증: variant + title + children + role=note.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Note } from './note';

afterEach(() => {
  cleanup();
});

describe('<Note>', () => {
  it('children 렌더링', () => {
    render(<Note>본문 텍스트</Note>);
    expect(screen.getByText('본문 텍스트')).toBeTruthy();
  });

  it('role=note 부여', () => {
    render(<Note>본문</Note>);
    expect(screen.getByRole('note')).toBeTruthy();
  });

  it('title 전달 시 표시', () => {
    render(<Note title="알림">설명</Note>);
    expect(screen.getByText('알림')).toBeTruthy();
    expect(screen.getByText('설명')).toBeTruthy();
  });

  it('title 없으면 미표시', () => {
    const { container } = render(<Note>only body</Note>);
    // title 영역은 p tag 로 렌더되므로 p 갯수 검증
    const paras = container.querySelectorAll('p');
    expect(paras.length).toBe(0);
  });

  it('tip variant 기본', () => {
    const { container } = render(<Note>tip</Note>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('indigo');
  });

  it('warn variant', () => {
    const { container } = render(<Note variant="warn">warn</Note>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('vermilion');
  });

  it('success variant', () => {
    const { container } = render(<Note variant="success">success</Note>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('jade');
  });

  it('info variant — bronze', () => {
    const { container } = render(<Note variant="info">info</Note>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('bronze');
  });

  it('warn variant title — text-vermilion', () => {
    const { container } = render(<Note variant="warn" title="경고">상세</Note>);
    const titleEl = container.querySelector('p');
    expect(titleEl?.className).toContain('text-vermilion');
  });

  it('className prop merge', () => {
    const { container } = render(<Note className="custom-x">x</Note>);
    const el = container.firstElementChild;
    expect(el?.className).toContain('custom-x');
  });
});
