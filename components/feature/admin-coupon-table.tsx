/**
 * <AdminCouponTable> — F3.4 쿠폰 승인/거절.
 */
'use client';

import { useState, useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { verifyCoupon } from '@/lib/coupon/actions';
import { logEvent } from '@/lib/firebase/analytics';
import type { CouponDoc } from '@/types/coupon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';

export interface AdminCouponTableProps {
  readonly initial: readonly CouponDoc[];
}

export function AdminCouponTable({ initial }: AdminCouponTableProps): React.JSX.Element {
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function approve(id: string, code: string) {
    startTransition(async () => {
      const r = await verifyCoupon(id, 'verified');
      if (r.ok) {
        void logEvent('coupon_verify', { code });
        toast.success('쿠폰이 승인되었습니다');
      } else toast.error('승인 실패');
    });
  }

  function reject(id: string) {
    const reason = (reasons[id] ?? '').trim();
    if (!reason) {
      toast.error('거절 사유 필수');
      return;
    }
    startTransition(async () => {
      const r = await verifyCoupon(id, 'rejected', reason);
      if (r.ok) toast.success('쿠폰이 거절되었습니다');
      else toast.error('거절 실패');
    });
  }

  return (
    <ul className="space-y-3" role="list">
      {initial.map((c) => (
        <li key={c.id}>
          <GlassCard className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <code className="font-mono text-sm font-bold uppercase text-bronze-soft">
                  {c.code}
                </code>
                <p className="text-sm font-medium text-text">{c.title}</p>
                <p className="text-xs text-text-soft">{c.rewards}</p>
                <p className="text-xs text-text-mute">
                  만료 {new Date(c.expiresAtMs).toLocaleDateString('ko-KR')} · 제보 {c.submittedByNickname}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`coupon-reject-${c.id}`} className="text-xs text-text-mute">
                거절 사유 (rejection 시 필수)
              </Label>
              <Textarea
                id={`coupon-reject-${c.id}`}
                value={reasons[c.id] ?? ''}
                onChange={(e) => setReasons((p) => ({ ...p, [c.id]: e.target.value }))}
                rows={2}
                placeholder="예: 이미 만료 / 가짜 정보"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => reject(c.id)}
                disabled={isPending}
                className="gap-1 text-vermilion"
              >
                <X className="h-3 w-3" />
                거절
              </Button>
              <Button
                type="button"
                variant="bronze"
                size="sm"
                onClick={() => approve(c.id, c.code)}
                disabled={isPending}
                className="gap-1"
              >
                <Check className="h-3 w-3" />
                승인
              </Button>
            </div>
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}
