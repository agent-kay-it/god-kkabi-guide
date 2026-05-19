/**
 * components/domain/section-head.tsx — Sprint 19 F19-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import {
  SectionHead,
  SectionEyebrow,
  SectionTitle,
  SectionLead,
} from './section-head';

afterEach(() => cleanup());

describe('SectionHead', () => {
  it('children 렌더', () => {
    render(
      <SectionHead>
        <SectionTitle>제목</SectionTitle>
      </SectionHead>,
    );
    expect(screen.getByText('제목')).toBeTruthy();
  });

  it('기본 mb-12 클래스', () => {
    const { container } = render(<SectionHead>x</SectionHead>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('mb-12');
  });

  it('className merge', () => {
    const { container } = render(<SectionHead className="extra">x</SectionHead>);
    expect((container.firstElementChild as HTMLElement).className).toContain('extra');
  });
});

describe('SectionEyebrow', () => {
  it('label 렌더', () => {
    render(<SectionEyebrow label="Overview" />);
    expect(screen.getByText('Overview')).toBeTruthy();
  });

  it('num 있을 때 separator (·) 함께 렌더', () => {
    render(<SectionEyebrow num="01" label="Intro" />);
    expect(screen.getByText('01')).toBeTruthy();
    expect(screen.getByText('·')).toBeTruthy();
    expect(screen.getByText('Intro')).toBeTruthy();
  });

  it('num 없을 때 separator (·) 렌더 안 함', () => {
    render(<SectionEyebrow label="Solo" />);
    expect(screen.getByText('Solo')).toBeTruthy();
    expect(screen.queryByText('·')).toBeNull();
  });

  it('font-mono + uppercase + text-bronze 토큰', () => {
    const { container } = render(<SectionEyebrow label="t" />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('font-mono');
    expect(div.className).toContain('uppercase');
    expect(div.className).toContain('text-bronze');
  });
});

describe('SectionTitle', () => {
  it('기본 h2', () => {
    render(<SectionTitle>제목</SectionTitle>);
    const t = screen.getByText('제목');
    expect(t.tagName).toBe('H2');
  });

  it('as="h1" 으로 변경', () => {
    render(<SectionTitle as="h1">제목</SectionTitle>);
    const t = screen.getByText('제목');
    expect(t.tagName).toBe('H1');
  });

  it('as="h3" 으로 변경', () => {
    render(<SectionTitle as="h3">제목</SectionTitle>);
    const t = screen.getByText('제목');
    expect(t.tagName).toBe('H3');
  });

  it('id prop 전달 (anchor 링크)', () => {
    render(<SectionTitle id="section-1">제목</SectionTitle>);
    const t = screen.getByText('제목');
    expect(t.id).toBe('section-1');
  });

  it('font-bold + text-text 토큰', () => {
    render(<SectionTitle>x</SectionTitle>);
    const t = screen.getByText('x');
    expect(t.className).toContain('font-bold');
    expect(t.className).toContain('text-text');
  });
});

describe('SectionLead', () => {
  it('p 요소로 렌더', () => {
    render(<SectionLead>리드 텍스트</SectionLead>);
    const p = screen.getByText('리드 텍스트');
    expect(p.tagName).toBe('P');
  });

  it('text-text-soft + max-width 토큰', () => {
    render(<SectionLead>x</SectionLead>);
    const p = screen.getByText('x');
    expect(p.className).toContain('text-text-soft');
    expect(p.className).toContain('max-w-[680px]');
  });

  it('className merge', () => {
    render(<SectionLead className="extra-cls">x</SectionLead>);
    expect(screen.getByText('x').className).toContain('extra-cls');
  });
});
