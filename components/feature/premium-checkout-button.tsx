/**
 * <PremiumCheckoutButton> — Toss Payments 위젯 호출.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §6
 *
 * 흐름:
 *  1) Toss SDK 동적 로드 (@tosspayments/payment-sdk)
 *  2) requestPayment 호출 → Toss 결제창 redirect
 *  3) 결제 성공 후 /premium/success?orderId=...&paymentKey=...&amount=...
 *  4) 해당 페이지에서 confirmSubscription Server Action 호출
 *
 * 환경변수: NEXT_PUBLIC_TOSS_CLIENT_KEY
 */
'use client';

import { useState, useTransition } from 'react';
import { Crown } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { SUBSCRIPTION_PRICE } from '@/types/subscription';
import { logEvent } from '@/lib/firebase/analytics';

export interface PremiumCheckoutButtonProps {
  readonly uid: string;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (method: string, options: {
        amount: number;
        orderId: string;
        orderName: string;
        customerName?: string;
        successUrl: string;
        failUrl: string;
      }) => Promise<void>;
    };
  }
}

export function PremiumCheckoutButton({ uid }: PremiumCheckoutButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [loadingSdk, setLoadingSdk] = useState(false);

  async function loadTossSdk(): Promise<NonNullable<Window['TossPayments']>> {
    if (typeof window !== 'undefined' && window.TossPayments) return window.TossPayments;
    setLoadingSdk(true);
    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v1/payment';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Toss SDK load failed'));
        document.head.appendChild(script);
      });
      if (!window.TossPayments) throw new Error('Toss SDK 초기화 실패');
      return window.TossPayments;
    } finally {
      setLoadingSdk(false);
    }
  }

  function checkout() {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      toast.error('결제 시스템이 아직 설정되지 않았습니다. 운영자에게 문의하세요.');
      return;
    }
    startTransition(async () => {
      try {
        const TossPayments = await loadTossSdk();
        const tossPayments = TossPayments(clientKey);
        const orderId = `premium_${uid}_${Date.now()}`;
        const amount = SUBSCRIPTION_PRICE.premium_monthly.amount;
        const origin =
          typeof window !== 'undefined'
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SITE_URL ?? '';
        void logEvent('premium_subscribe', { amount, plan: 'premium_monthly' });
        await tossPayments.requestPayment('카드', {
          amount,
          orderId,
          orderName: '갓깨비 가이드 프리미엄 (월간)',
          successUrl: `${origin}/premium/success`,
          failUrl: `${origin}/premium/fail`,
        });
      } catch (err) {
        console.error('[PremiumCheckoutButton]', err);
        toast.error('결제 시작 실패: ' + (err instanceof Error ? err.message : 'unknown'));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="bronze"
      size="lg"
      onClick={checkout}
      disabled={isPending || loadingSdk}
      className="w-full gap-2"
    >
      <Crown className="h-4 w-4" />
      {loadingSdk ? '결제 모듈 로드 중...' : '구독하기 (월 ₩4,900)'}
    </Button>
  );
}
