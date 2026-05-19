/**
 * components/ui/card.tsx — Sprint 19 F19-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

afterEach(() => cleanup());

describe('Card', () => {
  it('children 을 div 안에 렌더링', () => {
    render(<Card>본문</Card>);
    const text = screen.getByText('본문');
    expect(text.tagName).toBe('DIV');
  });

  it('기본 클래스 적용 (rounded + border + bg-ink-elev)', () => {
    const { container } = render(<Card>x</Card>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('rounded-[var(--radius-card)]');
    expect(div.className).toContain('border-ink-line');
    expect(div.className).toContain('bg-ink-elev');
  });

  it('className prop merge', () => {
    const { container } = render(<Card className="extra-cls">x</Card>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('extra-cls');
  });

  it('HTMLAttributes spread (data-testid)', () => {
    render(<Card data-testid="my-card">x</Card>);
    expect(screen.getByTestId('my-card')).toBeTruthy();
  });
});

describe('CardHeader / Title / Description / Content / Footer', () => {
  it('CardTitle 은 h3 요소', () => {
    render(<CardTitle>제목</CardTitle>);
    const title = screen.getByText('제목');
    expect(title.tagName).toBe('H3');
  });

  it('CardDescription 은 p 요소 + text-text-soft', () => {
    render(<CardDescription>설명</CardDescription>);
    const desc = screen.getByText('설명');
    expect(desc.tagName).toBe('P');
    expect(desc.className).toContain('text-text-soft');
  });

  it('CardHeader 는 flex-col 적용', () => {
    const { container } = render(<CardHeader>x</CardHeader>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('flex-col');
  });

  it('CardContent + CardFooter padding 클래스', () => {
    const { container: c1 } = render(<CardContent>x</CardContent>);
    const { container: c2 } = render(<CardFooter>y</CardFooter>);
    expect((c1.firstElementChild as HTMLElement).className).toContain('p-6');
    expect((c2.firstElementChild as HTMLElement).className).toContain('items-center');
  });

  it('합성 사용: Card > Header > Title + Description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>제목</CardTitle>
          <CardDescription>설명</CardDescription>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText('제목')).toBeTruthy();
    expect(screen.getByText('설명')).toBeTruthy();
  });
});
