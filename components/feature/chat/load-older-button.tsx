/**
 * <LoadOlderButton> — 메시지 목록 상단 "이전 메시지" 트리거.
 * 출처: docs/sprint/10-sprint-launch/design.md §7.1
 *
 * useChannel hook의 loadOlder + hasMore 와 통합.
 * Intersection Observer (자동 로드)는 비활성 — 사용자가 명시적으로 클릭해야 추가 fetch.
 * 사유: 자동 fetch는 RTDB 비용 증가 + 사용자가 위 스크롤 의도 없을 때 불필요한 호출.
 */
'use client';

import { ChevronUp, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LoadOlderButtonProps {
  readonly hasMore: boolean;
  readonly isLoading: boolean;
  readonly onClick: () => void;
  readonly className?: string;
}

export function LoadOlderButton({
  hasMore,
  isLoading,
  onClick,
  className,
}: LoadOlderButtonProps): React.JSX.Element | null {
  if (!hasMore) return null;
  return (
    <div className={cn('border-b border-ink-line p-2 text-center', className)}>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={onClick}
        disabled={isLoading}
        className="gap-1 text-text-mute"
        aria-label="이전 메시지 더 불러오기"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        ) : (
          <ChevronUp className="h-3 w-3" aria-hidden="true" />
        )}
        이전 메시지 보기
      </Button>
    </div>
  );
}
