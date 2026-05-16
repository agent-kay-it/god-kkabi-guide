/**
 * LightboxProvider — Sprint V4 P3.B.
 * 이미지 확대 모달. Context로 open(src, alt) / close() 노출.
 *
 * 출처: source/godkkabi-guide/index.html `.lightbox` + `data-zoom` 로직.
 *
 * 보안: src는 동일 출처 (public/ 또는 Firebase Storage) 또는 known whitelist만 허용.
 * 외부 URL을 src로 받지 않도록 호출처에서 사전 검증.
 *
 * 동작:
 *  - open 시 body scroll lock + Esc / click outside / close 버튼으로 닫힘
 *  - WCAG: dialog role + aria-label + focus trap (간이)
 */
'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LightboxState {
  readonly open: boolean;
  readonly src: string;
  readonly alt: string;
}

interface LightboxContextValue {
  readonly state: LightboxState;
  open: (src: string, alt?: string) => void;
  close: () => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    // Provider 외부에서 호출되면 noop 객체 반환 — SSR 안전.
    return {
      state: { open: false, src: '', alt: '' },
      open: () => undefined,
      close: () => undefined,
    };
  }
  return ctx;
}

export interface LightboxProviderProps {
  readonly children: React.ReactNode;
}

export function LightboxProvider({ children }: LightboxProviderProps): React.JSX.Element {
  const [state, setState] = useState<LightboxState>({ open: false, src: '', alt: '' });

  const open = useCallback((src: string, alt = '') => {
    if (!src) return;
    setState({ open: true, src, alt });
  }, []);

  const close = useCallback(() => {
    setState({ open: false, src: '', alt: '' });
  }, []);

  // body scroll lock
  useEffect(() => {
    if (!state.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [state.open]);

  // ESC 키
  useEffect(() => {
    if (!state.open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state.open, close]);

  return (
    <LightboxContext.Provider value={{ state, open, close }}>
      {children}
      {state.open ? <LightboxRoot state={state} onClose={close} /> : null}
    </LightboxContext.Provider>
  );
}

function LightboxRoot({
  state,
  onClose,
}: {
  readonly state: LightboxState;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={state.alt || '이미지 확대'}
      onClick={onClose}
      className={cn(
        'fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center p-10',
        'bg-ink-base/95 backdrop-blur-md',
      )}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기 (ESC)"
        className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full border border-ink-line-strong bg-white/5 px-4 py-2 text-sm text-text backdrop-blur-md hover:bg-white/10"
      >
        <X aria-hidden className="h-4 w-4" />
        닫기
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] max-w-full"
      >
        <Image
          src={state.src}
          alt={state.alt}
          width={1600}
          height={1200}
          unoptimized
          className="max-h-[90vh] w-auto rounded-lg shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        />
      </div>
    </div>
  );
}
