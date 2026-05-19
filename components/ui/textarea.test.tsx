/**
 * components/ui/textarea.tsx — Sprint 19 F19-F RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { createRef, useState } from 'react';

import { Textarea } from './textarea';

afterEach(() => cleanup());

describe('Textarea', () => {
  it('textarea 요소 렌더', () => {
    render(<Textarea placeholder="내용" />);
    const ta = screen.getByPlaceholderText('내용');
    expect(ta.tagName).toBe('TEXTAREA');
  });

  it('disabled 상태', () => {
    render(<Textarea disabled placeholder="d" />);
    const ta = screen.getByPlaceholderText('d') as HTMLTextAreaElement;
    expect(ta.disabled).toBe(true);
  });

  it('rows / cols prop 적용', () => {
    render(<Textarea rows={5} cols={40} placeholder="rc" />);
    const ta = screen.getByPlaceholderText('rc') as HTMLTextAreaElement;
    expect(ta.rows).toBe(5);
    expect(ta.cols).toBe(40);
  });

  it('forwardRef — ref 로 직접 접근', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} placeholder="r" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('TEXTAREA');
  });

  it('aria-invalid 상태', () => {
    render(<Textarea aria-invalid placeholder="i" />);
    const ta = screen.getByPlaceholderText('i');
    expect(ta.getAttribute('aria-invalid')).toBe('true');
  });

  it('controlled value 동작', () => {
    function Wrapper(): React.JSX.Element {
      const [v, setV] = useState('초기');
      return (
        <Textarea
          placeholder="ctrl"
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      );
    }
    render(<Wrapper />);
    const ta = screen.getByPlaceholderText('ctrl') as HTMLTextAreaElement;
    expect(ta.value).toBe('초기');
    fireEvent.change(ta, { target: { value: '수정' } });
    expect(ta.value).toBe('수정');
  });

  it('className merge + min-h-[80px] 기본', () => {
    render(<Textarea className="extra" placeholder="c" />);
    const ta = screen.getByPlaceholderText('c');
    expect(ta.className).toContain('extra');
    expect(ta.className).toContain('min-h-[80px]');
  });

  it('displayName === "Textarea"', () => {
    expect(Textarea.displayName).toBe('Textarea');
  });
});
