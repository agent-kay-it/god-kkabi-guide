/**
 * shadcn/ui Sonner Toast wrapper — new-york style.
 * 갓깨비 오컬트 다크 테마 적용.
 * layout.tsx에서 <Toaster /> 마운트.
 */
'use client';

import { Toaster as SonnerToaster } from 'sonner';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/** Sonner Toaster — 갓깨비 다크 테마 스타일링 */
export function Toaster({ ...props }: ToasterProps): React.JSX.Element {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-gold)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-sans)',
        },
        classNames: {
          toast: 'group toast',
          description: 'text-[var(--color-text-secondary)] text-sm',
          actionButton: 'bg-[var(--color-accent-gold)] text-[var(--color-bg-primary)]',
          cancelButton:
            'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]',
          success: 'border-[var(--color-accent-green)]/50',
          error: 'border-[var(--color-accent-red)]/50',
          warning: 'border-[var(--color-accent-gold)]/50',
          info: 'border-[var(--color-accent-cyan)]/50',
        },
      }}
      {...props}
    />
  );
}
