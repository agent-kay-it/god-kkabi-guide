/**
 * <CouponList> — F3.4 검증된 쿠폰 카드 리스트 + 좋아요/싫어요.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §4
 */
'use client';

import { useState, useTransition } from 'react';
import { ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { voteCoupon } from '@/lib/coupon/actions';
import { COUPON_STATUS_LABEL, COUPON_STATUS_COLOR, type CouponDoc } from '@/types/coupon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

export interface CouponListProps {
  readonly coupons: readonly CouponDoc[];
  readonly canVote: boolean;
}

export function CouponList({ coupons, canVote }: CouponListProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  // mount 시 한 번 캡처 — React Compiler 순수성 규칙 준수 (Date.now 직접 호출 금지)
  const [nowMs] = useState<number>(() => Date.now());

  function handleVote(couponId: string, direction: 'up' | 'down') {
    if (!canVote) {
      toast.error('등록 사용자만 투표할 수 있습니다');
      return;
    }
    startTransition(async () => {
      const r = await voteCoupon(couponId, direction);
      if (!r.ok) toast.error('투표 실패');
    });
  }

  if (coupons.length === 0) {
    return (
      <GlassCard className="p-8 text-center text-text-mute">
        검증된 쿠폰이 아직 없습니다.
      </GlassCard>
    );
  }

  return (
    <ul className="grid gap-3 lg:grid-cols-2" role="list">
      {coupons.map((c) => {
        const expired = c.expiresAtMs < nowMs;
        return (
          <li key={c.id}>
            <GlassCard className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <code className="font-mono text-sm font-bold uppercase tracking-wide text-bronze-soft">
                    {c.code}
                  </code>
                  <p className="line-clamp-2 text-sm font-medium text-text">{c.title}</p>
                </div>
                <Badge variant={expired ? 'muted' : COUPON_STATUS_COLOR[c.status]}>
                  {expired ? '만료' : COUPON_STATUS_LABEL[c.status]}
                </Badge>
              </div>
              <p className="text-xs text-text-soft">{c.rewards}</p>
              <div className="flex items-center justify-between text-xs text-text-mute">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  {new Date(c.expiresAtMs).toLocaleDateString('ko-KR')} 까지
                </span>
                <span className="font-mono">제보 {c.submittedByNickname}</span>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-ink-line pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(c.id, 'up')}
                  disabled={isPending || expired}
                  className="gap-1 text-jade"
                  aria-label="작동 확인"
                >
                  <ThumbsUp className="h-3 w-3" />
                  {c.upvotes}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(c.id, 'down')}
                  disabled={isPending || expired}
                  className="gap-1 text-vermilion"
                  aria-label="작동 안 함"
                >
                  <ThumbsDown className="h-3 w-3" />
                  {c.downvotes}
                </Button>
              </div>
            </GlassCard>
          </li>
        );
      })}
    </ul>
  );
}
