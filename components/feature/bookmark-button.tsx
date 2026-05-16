/**
 * BookmarkButton — Tip/Wiki/게시물 북마크 토글.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.6
 *      + component-inventory-v2.md §4.3
 *
 * 책임:
 *  - 낙관적 업데이트 (useOptimistic) + 실패 시 롤백
 *  - 비로그인/미등록 시 /login으로 리다이렉트
 *  - aria-pressed로 상태 노출
 */
'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';

import { addBookmark, removeBookmark } from '@/lib/bookmark/actions';
import { logEvent } from '@/lib/firebase/analytics';
import { Button } from '@/components/ui/button';
import type { BookmarkTargetType } from '@/types/bookmark';
import { cn } from '@/lib/utils';

export interface BookmarkButtonProps {
  readonly targetType: BookmarkTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly href: string;
  readonly emoji?: string;
  readonly initialBookmarked?: boolean;
  /** 로그인된 사용자인지 (Server에서 결정 후 전달) */
  readonly canBookmark: boolean;
  readonly size?: 'sm' | 'default' | 'lg';
  readonly variant?: 'icon' | 'icon-text';
  readonly className?: string;
}

export function BookmarkButton({
  targetType,
  targetId,
  title,
  href,
  emoji,
  initialBookmarked = false,
  canBookmark,
  size = 'sm',
  variant = 'icon',
  className,
}: BookmarkButtonProps): React.JSX.Element {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic<boolean, boolean>(
    bookmarked,
    (_state, next) => next,
  );
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!canBookmark) {
      toast.message('로그인 후 등록을 완료하면 북마크를 사용할 수 있어요.', {
        action: { label: '로그인', onClick: () => router.push('/login') },
      });
      return;
    }

    const next = !bookmarked;
    startTransition(async () => {
      setOptimisticBookmarked(next);
      const result = next
        ? await addBookmark({
            targetType,
            targetId,
            title,
            href,
            ...(emoji ? { emoji } : {}),
          })
        : await removeBookmark(targetType, targetId);

      if (result.ok) {
        setBookmarked(next);
        toast.success(next ? '북마크에 추가했습니다' : '북마크에서 제거했습니다');
        void logEvent(next ? 'bookmark_add' : 'bookmark_remove', {
          target_type: targetType,
          target_id: targetId,
        });
      } else {
        // 롤백
        setOptimisticBookmarked(!next);
        const msg =
          result.error === 'LIMIT_EXCEEDED'
            ? '북마크는 최대 200개까지 가능합니다'
            : result.error === 'NOT_REGISTERED'
              ? '등록을 완료한 후 사용할 수 있습니다'
              : result.error === 'ADMIN_NOT_CONFIGURED'
                ? '서비스 점검 중입니다'
                : (result.message ?? '북마크 처리에 실패했습니다');
        toast.error(msg);
      }
    });
  }

  const isOn = optimisticBookmarked;
  const Icon = isOn ? BookmarkCheck : Bookmark;
  const label = isOn ? '북마크 해제' : '북마크 추가';

  if (variant === 'icon-text') {
    return (
      <Button
        type="button"
        size={size}
        variant={isOn ? 'bronze' : 'outline'}
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isOn}
        aria-label={label}
        className={cn('gap-2', className)}
      >
        <Icon className="h-4 w-4" />
        {isOn ? '북마크됨' : '북마크'}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isOn}
      aria-label={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
        isOn
          ? 'border-bronze bg-bronze/15 text-bronze-soft'
          : 'border-ink-line bg-ink-elev text-text-soft hover:border-bronze/50 hover:text-bronze',
        isPending && 'opacity-60',
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
