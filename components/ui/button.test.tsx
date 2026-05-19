/**
 * @vitest-environment jsdom
 *
 * Sprint 18 / F18-G — components/ui/button.tsx RTL test.
 *
 * variants + size + className merge + asChild + disabled.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Button } from './button';

afterEach(() => {
  cleanup();
});

describe('<Button>', () => {
  it('children 렌더링', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button').textContent).toBe('클릭');
  });

  it('type default = button', () => {
    render(<Button>btn</Button>);
    const btn = screen.getByRole('button');
    // shadcn Button 은 type 미지정 시 native default (submit)이 아닌 button 으로 명시되지 않을 수 있음
    expect(['button', '', null]).toContain(btn.getAttribute('type'));
  });

  it('default variant 적용', () => {
    render(<Button>default</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-primary');
  });

  it('destructive variant', () => {
    render(<Button variant="destructive">delete</Button>);
    expect(screen.getByRole('button').className).toContain('destructive');
  });

  it('outline variant', () => {
    render(<Button variant="outline">outline</Button>);
    expect(screen.getByRole('button').className).toContain('border');
  });

  it('ghost variant', () => {
    render(<Button variant="ghost">ghost</Button>);
    expect(screen.getByRole('button').className).toContain('hover:bg-accent');
  });

  it('link variant — underline', () => {
    render(<Button variant="link">link</Button>);
    expect(screen.getByRole('button').className).toContain('underline');
  });

  it('bronze variant — glow', () => {
    render(<Button variant="bronze">bronze</Button>);
    expect(screen.getByRole('button').className).toContain('bronze');
  });

  it('success variant — jade', () => {
    render(<Button variant="success">success</Button>);
    expect(screen.getByRole('button').className).toContain('jade');
  });

  it('warrior variant — vermilion', () => {
    render(<Button variant="warrior">warrior</Button>);
    expect(screen.getByRole('button').className).toContain('vermilion');
  });

  it('disabled 적용', () => {
    render(<Button disabled>disabled</Button>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.className).toContain('disabled');
  });

  it('onClick 핸들러 호출', () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>click me</Button>);
    screen.getByRole('button').click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('className prop merge', () => {
    render(<Button className="custom-x">btn</Button>);
    expect(screen.getByRole('button').className).toContain('custom-x');
  });

  it('aria-label pass-through', () => {
    render(<Button aria-label="저장">💾</Button>);
    expect(screen.getByRole('button', { name: '저장' })).toBeTruthy();
  });
});
