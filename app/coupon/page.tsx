/**
 * /coupon — F3.4 검증된 쿠폰 목록 (사용자 제보 + admin 승인).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §4
 */
import type { Metadata } from 'next';

import { auth } from '@/lib/auth/auth';
import { listCoupons } from '@/lib/coupon/actions';
import { CouponSubmitForm } from '@/components/feature/coupon-submit-form';
import { CouponList } from '@/components/feature/coupon-list';
import {
  HeroMeta,
  HeroMetaBadge,
  Note,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '쿠폰 — 커뮤니티 검증',
  description: '사용자가 제보하고 운영자가 승인한 게임 쿠폰 목록.',
};

export default async function CouponPage(): Promise<React.JSX.Element> {
  const session = await auth();
  const canSubmit = Boolean(session?.user?.registered && session.user.role !== 'banned');
  const coupons = await listCoupons('verified');

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>쿠폰 / 커뮤니티</HeroMetaBadge>
          <span className="font-mono">{coupons.length}건</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow num="07b" label="Coupons" />
          <SectionTitle as="h1">쿠폰 — 커뮤니티 검증</SectionTitle>
          <SectionLead>
            공식이 아닌 커뮤니티 제보 정보입니다. 실제 사용은 게임 내에서 직접 확인해주세요.
            작동 여부는 좋아요/싫어요로 알려주세요.
          </SectionLead>
        </SectionHead>
      </header>

      <Note variant="info" title="제보 정책" className="mb-6">
        쿠폰 제보는 등록 사용자만 가능합니다. 운영자 승인 후 공개됩니다.
        스팸/광고성 제보는 페널티 대상입니다.
      </Note>

      {canSubmit ? (
        <div className="mb-8">
          <CouponSubmitForm />
        </div>
      ) : null}

      <CouponList coupons={coupons} canVote={canSubmit} />
    </main>
  );
}
