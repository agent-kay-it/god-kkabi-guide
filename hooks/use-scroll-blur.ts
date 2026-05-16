/**
 * useScrollBlur — Sprint V4 P3.B.
 * 스크롤이 threshold(기본 24px)를 넘으면 boolean true 반환.
 * Topbar / Sticky header 등 scroll-state 의존 컴포넌트에서 사용.
 *
 * 출처: source/godkkabi-guide/index.html `topbar.scrolled` 로직.
 */
'use client';

import { useEffect, useState } from 'react';

export function useScrollBlur(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
