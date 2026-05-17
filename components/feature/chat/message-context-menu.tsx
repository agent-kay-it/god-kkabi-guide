/**
 * <MessageContextMenu> — 메시지별 dropdown menu (신고 / 본인 삭제 / admin 액션).
 * 출처: docs/sprint/10-sprint-launch/design.md §7.1 (ContextMenuTrigger)
 *
 * radix-ui DropdownMenu primitive 사용 — click-trigger (모바일 long-press 보다 안정).
 * 옵션 노출 정책:
 *  - 신고: 본인 메시지 아님 + canReport === true
 *  - 본인 삭제: 본인 메시지 + Sprint 11 후속 (현재는 비활성 placeholder)
 *  - admin: hide / keep / delete (admin 권한일 때만)
 */
'use client';

import { DropdownMenu as DM } from 'radix-ui';
import { MoreHorizontal, Flag, EyeOff, ShieldCheck, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface MessageContextMenuProps {
  readonly isOwn: boolean;
  readonly isAdmin: boolean;
  readonly canReport: boolean;
  readonly currentlyHidden: boolean;
  readonly currentlyKept: boolean;
  readonly onReport: () => void;
  readonly onAdminHide?: () => void;
  readonly onAdminKeep?: () => void;
  readonly onAdminDelete?: () => void;
}

const ITEM_CLASS = cn(
  'flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none',
  'data-[highlighted]:bg-ink-elev data-[highlighted]:text-text',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40',
);

export function MessageContextMenu({
  isOwn,
  isAdmin,
  canReport,
  currentlyHidden,
  currentlyKept,
  onReport,
  onAdminHide,
  onAdminKeep,
  onAdminDelete,
}: MessageContextMenuProps): React.JSX.Element | null {
  // 신고/admin 액션 모두 불가하면 메뉴 자체를 렌더하지 않음
  const hasUserActions = !isOwn && canReport;
  const hasAdminActions = isAdmin && (onAdminHide || onAdminKeep || onAdminDelete);
  if (!hasUserActions && !hasAdminActions) return null;

  return (
    <DM.Root>
      <DM.Trigger asChild>
        <button
          type="button"
          aria-label="메시지 옵션"
          className={cn(
            'inline-flex h-6 w-6 items-center justify-center rounded-md text-text-mute',
            'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
            'hover:bg-ink-elev hover:text-text',
            'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-1',
          )}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content
          align="end"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[160px] rounded-md border border-ink-line bg-ink-card-strong p-1 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          )}
        >
          {hasUserActions ? (
            <DM.Item className={cn(ITEM_CLASS, 'text-text-soft hover:text-vermilion')} onSelect={onReport}>
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              신고
            </DM.Item>
          ) : null}

          {hasUserActions && hasAdminActions ? (
            <DM.Separator className="my-1 h-px bg-ink-line" />
          ) : null}

          {isAdmin && onAdminHide ? (
            <DM.Item
              className={cn(ITEM_CLASS, 'text-text-soft')}
              onSelect={onAdminHide}
              disabled={currentlyHidden && !currentlyKept}
            >
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              숨기기
            </DM.Item>
          ) : null}

          {isAdmin && onAdminKeep ? (
            <DM.Item
              className={cn(ITEM_CLASS, 'text-text-soft')}
              onSelect={onAdminKeep}
              disabled={currentlyKept}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              유지 결정
            </DM.Item>
          ) : null}

          {isAdmin && onAdminDelete ? (
            <DM.Item
              className={cn(ITEM_CLASS, 'text-vermilion-soft hover:text-vermilion')}
              onSelect={onAdminDelete}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              완전 삭제
            </DM.Item>
          ) : null}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}
