/**
 * <AdminPenaltyTable> — 자동 페널티 audit + 수동 우회.
 * 출처: docs/sprint/04-sprint-v1/design.md §9 (admin/penalties)
 */
'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';

import { recoverFromPenalty } from '@/lib/penalty/actions';
import { unbanUser } from '@/lib/moderation/actions';
import { Button } from '@/components/ui/button';
import { PenaltyBadge } from '@/components/domain/penalty-badge';
import { GlassCard } from '@/components/ui/glass-card';
import type { PenaltyDoc } from '@/types/penalty';

export interface AdminPenaltyTableProps {
  readonly penalties: readonly PenaltyDoc[];
}

export function AdminPenaltyTable({ penalties }: AdminPenaltyTableProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();

  function handleRecover(p: PenaltyDoc) {
    const reason = prompt('복구 사유를 입력하세요 (false positive 등):');
    if (!reason) return;
    startTransition(async () => {
      const r = await recoverFromPenalty(p.targetUid, reason);
      if (!r.ok) {
        toast.error('복구 실패: ' + (r.error ?? 'unknown'));
        return;
      }
      // ban 해제 (필요 시)
      if (p.level === 'ban_7d' || p.level === 'ban_permanent') {
        const r2 = await unbanUser(p.targetUid);
        if (!r2.ok) {
          toast.warning('reportedTotal 감소는 성공했지만 ban 해제 실패: ' + (r2.message ?? ''));
          return;
        }
      }
      toast.success('페널티가 복구되었습니다');
    });
  }

  if (penalties.length === 0) {
    return (
      <GlassCard className="p-8 text-center text-text-mute">
        활성 페널티가 없습니다.
      </GlassCard>
    );
  }

  return (
    <ul className="space-y-3" role="list">
      {penalties.map((p) => (
        <li key={p.id}>
          <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <PenaltyBadge
                level={p.level}
                {...(p.expiresAtMs ? { expiresAtMs: p.expiresAtMs } : {})}
              />
              <code className="font-mono text-xs text-text-mute">{p.targetUid}</code>
              <span className="text-xs text-text-soft">
                누적 {p.reportedCountAtTime}건 / {new Date(p.appliedAtMs).toLocaleString('ko-KR')}
              </span>
              {p.revokedBy ? (
                <span className="rounded-full bg-jade/20 px-2 py-0.5 font-mono text-[0.65rem] text-jade-soft">
                  복구됨
                </span>
              ) : null}
            </div>
            {!p.revokedBy ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRecover(p)}
                disabled={isPending}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                복구
              </Button>
            ) : null}
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}
