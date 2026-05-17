/**
 * <MobileChannelDrawer> — 모바일 (<md) 채널 nav drawer.
 * 출처: docs/sprint/10-sprint-launch/design.md §7.1 + mobile-nav.tsx 패턴 재사용
 *
 * Radix Dialog primitive 기반 — focus trap / ESC / scroll lock 자동.
 * Link 클릭 시 자동 닫힘 (DialogPrimitive.Close asChild로 Link wrap 대신
 * onChannelClick 콜백으로 명시적 setOpen(false) 호출 — Link prefetch와 호환).
 */
'use client';

import { useState } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Menu, X } from 'lucide-react';

import { ChannelSidebar } from './channel-sidebar';
import { cn } from '@/lib/utils';
import type { ChannelNavEntry } from '@/lib/chat/types';

export interface MobileChannelDrawerProps {
  readonly channels: readonly ChannelNavEntry[];
  readonly currentLabel: string;
}

export function MobileChannelDrawer({
  channels,
  currentLabel,
}: MobileChannelDrawerProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="채널 목록 열기"
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-ink-line bg-ink-elev px-3 py-1.5 text-sm text-text-soft md:hidden',
            'transition-colors hover:bg-ink-card-strong hover:text-text',
            'focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2',
          )}
        >
          <Menu aria-hidden className="h-4 w-4" />
          <span className="font-medium">{currentLabel}</span>
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-40 bg-ink-base/80 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex h-full w-[min(80vw,300px)] flex-col border-r border-ink-line bg-ink-base shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
            'duration-200',
          )}
        >
          <header className="flex items-center justify-between border-b border-ink-line px-3 py-3">
            <DialogPrimitive.Title className="text-sm font-bold text-text">
              채팅 채널
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              참여 가능한 채널 목록 — 클릭하면 해당 채널로 이동합니다.
            </DialogPrimitive.Description>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="닫기"
                className="rounded-md p-1 text-text-mute hover:bg-ink-elev hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </header>
          <ChannelSidebar
            channels={channels}
            onChannelClick={() => setOpen(false)}
            className="flex-1 border-r-0"
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
