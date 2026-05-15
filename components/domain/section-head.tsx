/**
 * <SectionHead> + <SectionEyebrow> + <SectionTitle> + <SectionLead>
 * Sprint V4 P3.C — source/godkkabi-guide/index.html `.section-head` 이식.
 *
 * 합성 가능한 4종 컴포넌트:
 *   <SectionHead>
 *     <SectionEyebrow num="01" label="Overview" />
 *     <SectionTitle>동양 설화를 입은 방치형 RPG</SectionTitle>
 *     <SectionLead>…</SectionLead>
 *   </SectionHead>
 *
 * 디자인 토큰 (globals.css @theme):
 *   - eyebrow: --color-bronze + --font-jet + uppercase + tracking 0.2em
 *   - title:   clamp(1.75rem, 4vw, 2.5rem) bold + text + letter-spacing -0.02em
 *   - lead:    text-soft + line-height 1.75 + max-width 680px
 *
 * 출처: docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.3
 */
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface SectionHeadProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function SectionHead({ children, className }: SectionHeadProps): React.JSX.Element {
  return <div className={cn('mb-12 sm:mb-12', className)}>{children}</div>;
}

export interface SectionEyebrowProps {
  /** 두 자리 번호 (예: "01", "07") — 생략 가능 */
  readonly num?: string;
  readonly label: string;
  readonly className?: string;
}

/**
 * <SectionEyebrow num="01" label="Overview" />
 * source `.section-eyebrow`: ::before 24×1px bronze bar + uppercase mono.
 */
export function SectionEyebrow({
  num,
  label,
  className,
}: SectionEyebrowProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'mb-3.5 flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-bronze',
        // before pseudo bar
        'before:h-px before:w-6 before:bg-bronze before:content-[""]',
        className,
      )}
    >
      {num ? <span>{num}</span> : null}
      {num ? <span aria-hidden>·</span> : null}
      <span>{label}</span>
    </div>
  );
}

export interface SectionTitleProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** 헤딩 레벨 — 기본 h2 */
  readonly as?: 'h1' | 'h2' | 'h3';
  readonly id?: string;
}

export function SectionTitle({
  children,
  className,
  as: Tag = 'h2',
  id,
}: SectionTitleProps): React.JSX.Element {
  return (
    <Tag
      id={id}
      className={cn(
        'max-w-[780px] font-bold leading-[1.15] tracking-[-0.02em] text-text',
        'text-[clamp(1.75rem,4vw,2.5rem)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export interface SectionLeadProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function SectionLead({ children, className }: SectionLeadProps): React.JSX.Element {
  return (
    <p
      className={cn(
        'mt-4 max-w-[680px] text-[1.02rem] leading-[1.75] text-text-soft',
        className,
      )}
    >
      {children}
    </p>
  );
}
