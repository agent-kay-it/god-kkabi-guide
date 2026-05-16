/**
 * useMouseGradient — Sprint V4 P3.B.
 * 카드 위 mousemove → `--mx`, `--my` CSS variable percent 갱신.
 * `.glass-interactive::before`가 이 변수를 읽어 radial gradient 위치 갱신.
 *
 * 출처: source/godkkabi-guide/index.html `data-interactive` mousemove 로직.
 *
 * 사용법:
 *   const ref = useMouseGradient<HTMLDivElement>();
 *   <div ref={ref} className="glass glass-interactive">...</div>
 */
'use client';

import { useEffect, useRef } from 'react';

export function useMouseGradient<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMove(e: MouseEvent) {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty('--mx', `${x}%`);
      target.style.setProperty('--my', `${y}%`);
    }
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return ref;
}
