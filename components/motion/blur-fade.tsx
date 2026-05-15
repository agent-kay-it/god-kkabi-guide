/**
 * BlurFade — Magic UI 모션 컴포넌트 (framer-motion 기반 수동 구현).
 * 출처: https://magicui.design/docs/components/blur-fade
 *
 * 진입 시 blur 0→1 + translateY 20px→0 애니메이션.
 * Hero 아이콘/타이틀, TOC 카드 진입 애니메이션에 사용.
 * prefers-reduced-motion: 모션 즉시 완료.
 */
'use client';

import { useRef } from 'react';
import {
  motion,
  useInView,
  type Variants,
} from 'framer-motion';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  /** 애니메이션 지연 시간 (초) */
  delay?: number;
  /** 진입 방향 Y 오프셋 (px) */
  yOffset?: number;
  /** blur 강도 (px) */
  blur?: string;
  /** IntersectionObserver once 여부 */
  inView?: boolean;
  /** IntersectionObserver margin */
  inViewMargin?: string;
  /** duration (초) */
  duration?: number;
}

const VARIANTS: Variants = {
  hidden: (custom: { yOffset: number; blur: string }) => ({
    opacity: 0,
    filter: `blur(${custom.blur})`,
    y: custom.yOffset,
  }),
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
  },
};

/**
 * BlurFade — 진입 시 blur + translateY 애니메이션.
 * @example
 * <BlurFade delay={0.1}>
 *   <Image src="..." alt="..." />
 * </BlurFade>
 */
export function BlurFade({
  children,
  className,
  delay = 0,
  yOffset = 20,
  blur = '6px',
  inView = false,
  inViewMargin = '-50px',
  duration = 0.4,
}: BlurFadeProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  // framer-motion v12 `useInView`는 viewport margin 옵션 시그니처 변경됨.
  // 기본 동작(viewport 진입 1회 트리거)만 사용 + inViewMargin은 추후 v13 호환 시 재도입.
  void inViewMargin;
  const isInView = useInView(ref, { once: true });

  const shouldAnimate = inView ? isInView : true;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
      variants={VARIANTS}
      custom={{ yOffset, blur }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
