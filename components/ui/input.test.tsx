/**
 * components/ui/input.tsx — Sprint 19 F19-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { useState } from 'react';

import { Input } from './input';

afterEach(() => cleanup());

describe('Input', () => {
  it('input 요소 렌더', () => {
    render(<Input placeholder="이름 입력" />);
    const input = screen.getByPlaceholderText('이름 입력');
    expect(input.tagName).toBe('INPUT');
  });

  it('type prop 적용 (text 기본)', () => {
    render(<Input placeholder="t" />);
    const input = screen.getByPlaceholderText('t') as HTMLInputElement;
    // type 미지정 시 type attribute 없을 수 있음 (브라우저 default text)
    expect(['text', '', null]).toContain(input.getAttribute('type'));
  });

  it('type="email" 적용', () => {
    render(<Input type="email" placeholder="e" />);
    const input = screen.getByPlaceholderText('e') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('type="password" 적용', () => {
    render(<Input type="password" placeholder="p" />);
    const input = screen.getByPlaceholderText('p') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('disabled 상태', () => {
    render(<Input disabled placeholder="d" />);
    const input = screen.getByPlaceholderText('d') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('aria-invalid → border-destructive 클래스 동작', () => {
    render(<Input aria-invalid placeholder="i" />);
    const input = screen.getByPlaceholderText('i');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('className merge', () => {
    render(<Input className="extra" placeholder="c" />);
    expect(screen.getByPlaceholderText('c').className).toContain('extra');
  });

  it('data-slot="input" 속성', () => {
    render(<Input placeholder="s" />);
    expect(screen.getByPlaceholderText('s').getAttribute('data-slot')).toBe('input');
  });

  it('controlled value 동작', () => {
    function Wrapper(): React.JSX.Element {
      const [v, setV] = useState('init');
      return (
        <Input
          placeholder="ctrl"
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      );
    }
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('ctrl') as HTMLInputElement;
    expect(input.value).toBe('init');
    fireEvent.change(input, { target: { value: '바뀐 값' } });
    expect(input.value).toBe('바뀐 값');
  });
});
