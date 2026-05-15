/**
 * <PenaltyBadge> — 페널티 단계 시각 뱃지.
 * 출처: docs/sprint/04-sprint-v1/design.md §1
 *
 * 운영자 콘솔 + 사용자 본인 알림 (`/me/posts` 상단)에서 사용.
 */
import { AlertTriangle, ShieldOff, Ban } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { PENALTY_LEVEL_LABEL, type PenaltyLevel } from '@/types/penalty';
import { cn } from '@/lib/utils';

export interface PenaltyBadgeProps {
  readonly level: PenaltyLevel;
  readonly expiresAtMs?: number;
  readonly className?: string;
}

export function PenaltyBadge({
  level,
  expiresAtMs,
  className,
}: PenaltyBadgeProps): React.JSX.Element {
  const Icon =
    level === 'warning'
      ? AlertTriangle
      : level === 'ban_7d'
        ? ShieldOff
        : Ban;
  const variant: 'bronze' | 'vermilion' =
    level === 'warning' ? 'bronze' : 'vermilion';
  return (
    <Badge
      variant={variant}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      <Icon aria-hidden className="h-3 w-3" />
      <span>{PENALTY_LEVEL_LABEL[level]}</span>
      {expiresAtMs && level === 'ban_7d' ? (
        <span className="font-mono text-[0.65rem] opacity-80">
          ~{formatExpiry(expiresAtMs)}
        </span>
      ) : null}
    </Badge>
  );
}

function formatExpiry(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
