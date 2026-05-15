/**
 * /admin/coupons — F3.4 쿠폰 운영자 승인 큐.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { listPendingCouponsAdmin } from '@/lib/coupon/actions';
import { AdminCouponTable } from '@/components/feature/admin-coupon-table';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';

export const metadata: Metadata = {
  title: 'Admin — 쿠폰 검토 큐',
  robots: { index: false, follow: false },
};

export default async function AdminCouponsPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin/coupons');
  if (session.user.role !== 'admin') redirect('/');

  const pending = await listPendingCouponsAdmin();
  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>Admin / 쿠폰</HeroMetaBadge>
          <span className="font-mono">{pending.length}건 대기</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          쿠폰 검토 큐
        </h1>
      </header>
      {pending.length === 0 ? (
        <Note variant="info" title="대기 중인 쿠폰 제보가 없습니다.">
          사용자가 제보하면 여기에 표시됩니다.
        </Note>
      ) : (
        <AdminCouponTable initial={pending} />
      )}
    </main>
  );
}
