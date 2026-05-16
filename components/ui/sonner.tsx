/**
 * shadcn/ui Sonner Toast wrapper — new-york style + v2 4-색 매핑.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.0.1
 *
 * v2 변경: v1 토큰 (bg-card, accent-gold) → v2 토큰 (ink-card-strong, bronze, jade, vermilion, indigo)
 * layout.tsx에서 <Toaster /> 마운트.
 */
'use client';

import { Toaster as SonnerToaster } from 'sonner';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/** Sonner Toaster — v2 다크 테마 + 4-색 액센트. */
export function Toaster({ ...props }: ToasterProps): React.JSX.Element {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--color-ink-card-strong)',
          border: '1px solid var(--color-ink-line-strong)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-sans)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: 'var(--shadow-glass-elev)',
        },
        classNames: {
          toast: 'group toast',
          description: 'text-text-soft text-sm',
          actionButton: 'bg-bronze text-ink-base',
          cancelButton: 'bg-ink-elev text-text-mute',
          success: 'border-jade/50',
          error: 'border-vermilion/50',
          warning: 'border-bronze/50',
          info: 'border-indigo/50',
        },
      }}
      {...props}
    />
  );
}
