/**
 * useRevealOnScroll — Sprint V4 P3.B.
 * IntersectionObserver로 요소가 viewport 진입 시 `.visible` 클래스 추가.
 * 1회만 실행 (unobserve) — 성능 보호.
 *
 * 출처: source/godkkabi-guide/index.html IntersectionObserver 로직.
 *
 * 사용법:
 *   const ref = useRevealOnScroll<HTMLDivElement>();
 *   <div ref={ref} className="reveal" data-delay="1">...</div>
 */
'use client';

import { useEffect, useRef } from 'react';

export interface RevealOptions {
  /** 0~1, 기본 0.12 (source default) */
  readonly threshold?: number;
  /** rootMargin, 기본 '0px 0px -8% 0px' (source default) */
  readonly rootMargin?: string;
  /** 1회만 실행 후 unobserve. 기본 true */
  readonly once?: boolean;
}

export function useRevealOnScroll<T extends HTMLElement>(
  options: RevealOptions = {},
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const threshold = options.threshold ?? 0.12;
  const rootMargin = options.rootMargin ?? '0px 0px -8% 0px';
  const once = options.once ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('visible');
          }
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
