/**
 * <CouponSubmitForm> — F3.4 쿠폰 제보 폼.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §4
 */
'use client';

import { useState, useTransition } from 'react';
import { Ticket } from 'lucide-react';
import { toast } from 'sonner';

import { submitCoupon } from '@/lib/coupon/actions';
import { logEvent } from '@/lib/firebase/analytics';
import { COUPON_LIMITS } from '@/types/coupon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/glass-card';

export function CouponSubmitForm(): React.JSX.Element {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [rewards, setRewards] = useState('');
  const [expires, setExpires] = useState(''); // yyyy-mm-dd
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const expMs = expires ? new Date(expires).getTime() : 0;
    if (!expMs || expMs <= Date.now()) {
      setErrors({ expiresAtMs: '만료일은 미래 날짜여야 합니다' });
      return;
    }
    startTransition(async () => {
      const r = await submitCoupon({
        code: code.trim().toUpperCase(),
        title: title.trim(),
        rewards: rewards.trim(),
        expiresAtMs: expMs,
      });
      if (r.ok) {
        void logEvent('coupon_submit', { code: code.trim().toUpperCase() });
        toast.success('제보가 접수되었습니다. 운영자 검토 후 공개됩니다.');
        setCode('');
        setTitle('');
        setRewards('');
        setExpires('');
      } else if (r.error === 'VALIDATION_FAILED' && r.fieldErrors) {
        setErrors(r.fieldErrors as Record<string, string>);
      } else {
        toast.error('제출 실패: ' + (r.error ?? 'unknown'));
      }
    });
  }

  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Ticket className="h-5 w-5 text-bronze" aria-hidden />
        <h2 className="text-lg font-bold tracking-tight text-text">쿠폰 제보</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="coupon-code" className="text-xs text-text-mute">
              쿠폰 코드 ({COUPON_LIMITS.code.min}-{COUPON_LIMITS.code.max}자, 영문/숫자/_/-)
            </Label>
            <Input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: GODKKABI2026"
              className="font-mono uppercase"
              required
              aria-describedby={errors.code ? 'coupon-code-error' : undefined}
            />
            {errors.code ? (
              <p id="coupon-code-error" className="text-xs text-vermilion">
                {errors.code}
              </p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="coupon-expires" className="text-xs text-text-mute">
              만료일
            </Label>
            <Input
              id="coupon-expires"
              type="date"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              required
              aria-describedby={errors.expiresAtMs ? 'coupon-exp-error' : undefined}
            />
            {errors.expiresAtMs ? (
              <p id="coupon-exp-error" className="text-xs text-vermilion">
                {errors.expiresAtMs}
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="coupon-title" className="text-xs text-text-mute">
            제목 ({COUPON_LIMITS.title.min}-{COUPON_LIMITS.title.max}자)
          </Label>
          <Input
            id="coupon-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 2주년 기념 무료 진령 소환권 5장"
            required
          />
          {errors.title ? <p className="text-xs text-vermilion">{errors.title}</p> : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="coupon-rewards" className="text-xs text-text-mute">
            보상 내용 ({COUPON_LIMITS.rewards.min}-{COUPON_LIMITS.rewards.max}자)
          </Label>
          <Textarea
            id="coupon-rewards"
            value={rewards}
            onChange={(e) => setRewards(e.target.value)}
            placeholder="예: 진령 소환권 ×5, 영기 ×10000"
            rows={3}
            required
          />
          {errors.rewards ? <p className="text-xs text-vermilion">{errors.rewards}</p> : null}
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="bronze" size="sm" disabled={isPending}>
            제보하기
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
