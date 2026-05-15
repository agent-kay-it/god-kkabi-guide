/**
 * useBackToTop — Sprint V4 P3.B.
 * scroll.y > threshold(기본 600px) 일 때 true → FAB 표시.
 *
 * 출처: source/godkkabi-guide/index.html `totop.visible` 로직.
 */
'use client';

import { useEffect, useState } from 'react';

export function useBackToTop(threshold = 600): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > threshold);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return visible;
}
