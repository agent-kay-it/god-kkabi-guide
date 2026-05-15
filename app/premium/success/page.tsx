/**
 * /premium/success — Toss 결제 성공 callback.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §6.2
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import { confirmSubscription } from '@/lib/subscription/actions';
import { Note, HeroMeta, HeroMetaBadge } from '@/components/domain';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { PaymentSuccessTracker } from '@/components/feature/payment-success-tracker';

export const metadata: Metadata = {
  title: '결제 완료 — 프리미엄',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  orderId?: string;
  paymentKey?: string;
  amount?: string;
}>;

export default async function PremiumSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const { orderId, paymentKey, amount } = params;

  if (!orderId || !paymentKey || !amount) {
    redirect('/premium');
  }

  const amountNum = Number(amount);
  const result = await confirmSubscription({
    orderId,
    paymentKey,
    amount: amountNum,
  });

  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8 text-center">
        <HeroMeta className="mb-4 justify-center">
          <HeroMetaBadge>프리미엄 / 결제</HeroMetaBadge>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight">
          {result.ok ? '구독 완료' : '결제 검증 실패'}
        </h1>
      </header>

      {result.ok ? (
        <GlassCard className="space-y-4 p-6 text-center">
          {/* GAP-MAJ-1 + CA2-I1 + CA2-I9: 결제 확정 성공 시 payment_success + premium_subscribe 1회 */}
          <PaymentSuccessTracker orderId={orderId} amount={amountNum} />
          <CheckCircle2 className="mx-auto h-12 w-12 text-jade" aria-hidden />
          <p className="text-text">
            결제가 정상 처리되었습니다. 프리미엄 권한이 즉시 활성화됩니다.
          </p>
          <p className="text-xs text-text-mute">
            세션 갱신 후 광고가 사라집니다. 페이지를 새로고침 해주세요.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">홈으로</Link>
            </Button>
            <Button asChild variant="bronze" size="sm">
              <Link href="/me/subscription">구독 관리</Link>
            </Button>
          </div>
        </GlassCard>
      ) : (
        <Note variant="warn" title="결제 검증 실패">
          오류: {result.error}
          {result.message ? ` (${result.message})` : ''}
          <br />
          이미 결제된 경우 운영자에게 문의해주세요 (kay@agentkay.it).
        </Note>
      )}
    </main>
  );
}
