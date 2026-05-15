/**
 * <CouponCode> — 쿠폰 카드 (클릭 복사 + D-day + Toast + GA4 발화).
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.7
 *
 * Client Component:
 *  - navigator.clipboard.writeText
 *  - sonner Toast
 *  - logEvent('coupon_copy', {...})
 *  - D-day 카운트다운 (date-fns)
 */
'use client';

import { Copy, Check, Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { differenceInCalendarDays } from 'date-fns';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { logEvent } from '@/lib/firebase/analytics';
import type { CouponStatus } from '@/types';

const couponVariants = cva(
  'group flex flex-col gap-3 rounded-card border bg-bg-card p-5 transition-card',
  {
    variants: {
      status: {
        valid: 'border-accent-green hover:bg-bg-card-hover',
        expired: 'border-border-soft opacity-60',
        unknown: 'border-accent-gold',
      },
    },
    defaultVariants: { status: 'unknown' },
  },
);

export interface CouponCodeProps extends VariantProps<typeof couponVariants> {
  code: string;
  description: string;
  reward: string;
  status: CouponStatus;
  expiresAt?: Date;
  className?: string;
}

function formatDDay(now: Date, expiresAt?: Date): string {
  if (!expiresAt) return '상시';
  const days = differenceInCalendarDays(expiresAt, now);
  if (days < 0) return '만료';
  if (days === 0) return '오늘 만료';
  return `D-${days}`;
}

export function CouponCode({
  code,
  description,
  reward,
  status,
  expiresAt,
  className,
}: CouponCodeProps): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);
  const now = new Date();
  const dday = formatDDay(now, expiresAt);
  const daysToExpire = expiresAt ? differenceInCalendarDays(expiresAt, now) : null;

  const handleCopy = async (): Promise<void> => {
    if (status === 'expired') {
      toast.error('만료된 쿠폰입니다');
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`${code} 복사됨`, { duration: 2000 });
      window.setTimeout(() => setCopied(false), 2000);

      await logEvent('coupon_copy', {
        code,
        status,
        days_to_expire: daysToExpire ?? -1,
      });
    } catch {
      toast.error('복사 실패. 브라우저 권한을 확인해주세요.');
    }
  };

  return (
    <article
      className={cn(couponVariants({ status }), className)}
      aria-label={`${description} 쿠폰 (${status})`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-text-primary">{description}</h3>
          <p className="text-xs text-text-secondary">{reward}</p>
        </div>
        <span
          className={cn(
            'flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-bold',
            status === 'valid'
              ? 'bg-accent-green/15 text-accent-green'
              : status === 'expired'
                ? 'bg-text-muted/15 text-text-muted'
                : 'bg-accent-gold/15 text-accent-gold',
          )}
        >
          <Calendar aria-hidden="true" className="h-3 w-3" />
          {dday}
        </span>
      </header>

      <button
        type="button"
        onClick={handleCopy}
        disabled={status === 'expired'}
        aria-label={`${code} 코드 복사`}
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg border border-border-gold bg-bg-secondary px-4 py-3 font-mono text-sm font-bold tracking-wider text-accent-gold transition-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2',
          'enabled:hover:border-accent-gold enabled:hover:bg-bg-card-hover',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <span>{code}</span>
        {copied ? (
          <Check aria-hidden="true" className="h-4 w-4 text-accent-green" />
        ) : (
          <Copy aria-hidden="true" className="h-4 w-4" />
        )}
      </button>
    </article>
  );
}
