/**
 * /premium — F3.6 프리미엄 구독 페이지 (Toss Payments).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §6
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Crown, Check } from 'lucide-react';

import { auth } from '@/lib/auth/auth';
import { getActiveSubscription } from '@/lib/subscription/actions';
import { isPremium } from '@/lib/subscription/guards';
import { isActivePremium, SUBSCRIPTION_PRICE } from '@/types/subscription';
import { PremiumCheckoutButton } from '@/components/feature/premium-checkout-button';
import { PaymentViewTracker } from '@/components/feature/payment-view-tracker';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '프리미엄 구독 — 월 ₩4,900',
  description: '광고 제거 · 무제한 시뮬레이션 · 우선 모더레이션 · 다중 북마크',
};

const BENEFITS = [
  '광고 제거 (AdSense 노출 차단)',
  '무제한 시뮬레이션 + 결과 영구 보관',
  '다중 북마크 (현재 50건 → 무제한)',
  '우선 모더레이션 (신고/문의 응답 24h 내)',
  '커뮤니티 게시물 우선 노출 옵션',
  '프리미엄 배지 (닉네임 옆 왕관)',
] as const;

export default async function PremiumPage(): Promise<React.JSX.Element> {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);
  const isRegistered = Boolean(session?.user?.registered);
  const premium = isPremium(session);
  const sub = isLoggedIn ? await getActiveSubscription() : null;
  const activePremium = sub
    ? isActivePremium(sub.status, sub.currentPeriodEndMs)
    : false;

  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      {/* GAP-MAJ-1: /premium 진입 시 payment_view GA4 */}
      <PaymentViewTracker />
      <header className="mb-8 text-center">
        <HeroMeta className="mb-4 justify-center">
          <HeroMetaBadge>프리미엄</HeroMetaBadge>
          <span className="font-mono">월 ₩{SUBSCRIPTION_PRICE.premium_monthly.amount.toLocaleString('ko-KR')}</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          프리미엄 구독
        </h1>
        <p className="mt-3 text-text-soft">
          가이드 운영을 응원해주시는 모든 분들께 광고 없는 경험을 제공합니다.
        </p>
      </header>

      <GlassCard className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-bronze" aria-hidden />
            <h2 className="text-lg font-bold tracking-tight text-text">Premium Monthly</h2>
          </div>
          {premium || activePremium ? (
            <Badge variant="jade">구독 중</Badge>
          ) : null}
        </div>

        <ul className="space-y-2" role="list">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-jade" aria-hidden />
              <span className="text-sm text-text">{b}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-ink-line pt-4">
          {!isLoggedIn ? (
            <Note variant="info" title="로그인이 필요합니다">
              <Button asChild variant="bronze" size="sm" className="mt-2">
                <Link href="/login?callbackUrl=/premium">로그인하고 구독</Link>
              </Button>
            </Note>
          ) : !isRegistered ? (
            <Note variant="info" title="등록 완료가 필요합니다">
              <Button asChild variant="bronze" size="sm" className="mt-2">
                <Link href="/register?callbackUrl=/premium">등록 완료</Link>
              </Button>
            </Note>
          ) : premium || activePremium ? (
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/me/subscription">내 구독 관리</Link>
            </Button>
          ) : (
            <PremiumCheckoutButton uid={session!.user!.id!} />
          )}
        </div>
      </GlassCard>

      <p className="mt-6 text-center text-xs text-text-mute">
        결제 후 즉시 활성화 · 매월 자동 결제 · 언제든지 취소 가능
      </p>
    </main>
  );
}
