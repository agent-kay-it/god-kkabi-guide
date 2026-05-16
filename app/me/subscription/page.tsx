/**
 * /me/subscription — F3.6 본인 구독 상태 + 취소.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { auth } from '@/lib/auth/auth';
import { getActiveSubscription } from '@/lib/subscription/actions';
import {
  SUBSCRIPTION_STATUS_LABEL,
  SUBSCRIPTION_STATUS_COLOR,
  SUBSCRIPTION_PRICE,
} from '@/types/subscription';
import { SubscriptionCancelButton } from '@/components/feature/subscription-cancel-button';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

export const metadata: Metadata = {
  title: '내 구독',
  robots: { index: false, follow: false },
};

export default async function MySubscriptionPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/me/subscription');
  if (!session.user.registered) redirect('/register?callbackUrl=/me/subscription');

  const sub = await getActiveSubscription();

  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>내 구독</HeroMetaBadge>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          구독 관리
        </h1>
      </header>

      {!sub ? (
        <Note variant="info" title="활성 구독이 없습니다.">
          프리미엄 혜택을 받으려면 구독해보세요.
          <Button asChild variant="bronze" size="sm" className="mt-3">
            <Link href="/premium">프리미엄 구독하기</Link>
          </Button>
        </Note>
      ) : (
        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">Premium Monthly</h2>
            <Badge variant={SUBSCRIPTION_STATUS_COLOR[sub.status]}>
              {SUBSCRIPTION_STATUS_LABEL[sub.status]}
            </Badge>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-mute">시작일</dt>
              <dd className="font-mono text-text">
                {new Date(sub.startedAtMs).toLocaleDateString('ko-KR')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-mute">현재 기간 종료</dt>
              <dd className="font-mono text-text">
                {new Date(sub.currentPeriodEndMs).toLocaleDateString('ko-KR')}
              </dd>
            </div>
            {sub.nextChargeAtMs ? (
              <div className="flex justify-between">
                <dt className="text-text-mute">다음 결제일</dt>
                <dd className="font-mono text-text">
                  {new Date(sub.nextChargeAtMs).toLocaleDateString('ko-KR')}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-text-mute">월 결제액</dt>
              <dd className="font-mono text-text">
                ₩{SUBSCRIPTION_PRICE.premium_monthly.amount.toLocaleString('ko-KR')}
              </dd>
            </div>
          </dl>
          {sub.status === 'active' ? (
            <div className="border-t border-ink-line pt-4">
              <SubscriptionCancelButton />
            </div>
          ) : sub.status === 'canceled' ? (
            <Note variant="info" title="구독이 취소되었습니다">
              현재 기간이 끝나는 {new Date(sub.currentPeriodEndMs).toLocaleDateString('ko-KR')}까지
              프리미엄 혜택이 유지됩니다.
            </Note>
          ) : null}
        </GlassCard>
      )}
    </main>
  );
}
