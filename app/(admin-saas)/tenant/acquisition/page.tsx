/**
 * /tenant/acquisition — Sprint V3 P5 (GAP-V3-MAJ-1).
 *
 * 인수 / 라이선스 / Pilot 가격 안내 페이지. admin demo 모드.
 * 접근 시 acquisition_loi_view GA4 발화 (영업 funnel 추적).
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/components/domain';
import { AcquisitionViewTracker } from '@/components/feature/acquisition-view-tracker';

export const metadata: Metadata = {
  title: 'Acquisition / License',
};

const PACKAGES = [
  {
    id: 'A',
    name: '분기 리포트 일회성',
    price: '₩5M-15M',
    cadence: '1회',
    target: 'PM / 마케팅',
    trigger: '분기 결산 직전',
  },
  {
    id: 'B',
    name: 'SaaS 메타 인사이트 구독',
    price: '₩3M-10M/월',
    cadence: '12+개월',
    target: '사업개발',
    trigger: '신규 패치 신호',
  },
  {
    id: 'C',
    name: 'API 라이선스 (raw)',
    price: '₩30M-100M/년',
    cadence: '12-36개월',
    target: '본사 데이터팀',
    trigger: '후속작 사전 리서치',
  },
  {
    id: 'D',
    name: 'Whitelabel 대시보드',
    price: '₩100M-300M/년',
    cadence: '36+개월',
    target: '4399 본사',
    trigger: '후속작 출시 6개월 전',
  },
  {
    id: 'E',
    name: '완전 인수 (M&A)',
    price: '₩300M-1.5B',
    cadence: '일시',
    target: 'JOY MOBILE NETWORK / 4399',
    trigger: 'DAU 5K+ 빌드 10K+ 검증',
  },
] as const;

export default async function TenantAcquisitionPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/tenant/acquisition');
  if (session.user.role !== 'admin') redirect('/');

  return (
    <div className="space-y-6">
      {/* GAP-V3-MAJ-1: 인수/라이선스 안내 페이지 진입 GA4 */}
      <AcquisitionViewTracker />
      <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
        Acquisition / License
      </h1>

      <Note variant="info" title="Demo 모드">
        본 페이지는 영업 단계 의사결정자에게 가격 패키지를 안내합니다. 상세 가치평가는
        <code className="mx-1 rounded bg-ink-elev px-1 py-0.5 text-xs">
          docs/sprint/05-sprint-v3/acquisition-package.md
        </code>
        참조.
      </Note>

      <section aria-labelledby="packages-heading" className="space-y-3">
        <h2 id="packages-heading" className="text-sm font-bold uppercase tracking-wider text-text-mute">
          5 패키지 (Step-up 사다리)
        </h2>
        <ul className="space-y-3" role="list">
          {PACKAGES.map((p) => (
            <li key={p.id}>
              <GlassCard className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="bronze">{p.id}</Badge>
                    <h3 className="text-base font-bold tracking-tight text-text">{p.name}</h3>
                  </div>
                  <span className="font-mono text-sm text-bronze">{p.price}</span>
                </div>
                <p className="text-sm text-text-soft">
                  대상: {p.target} · 주기: {p.cadence} · 트리거: {p.trigger}
                </p>
              </GlassCard>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="anchor-heading" className="space-y-3">
        <h2 id="anchor-heading" className="text-sm font-bold uppercase tracking-wider text-text-mute">
          가격 앵커링 (참고 사례)
        </h2>
        <GlassCard className="space-y-1 p-4 font-mono text-sm text-text-soft">
          <p>· Game8 (日, 2015 Gunosy 인수): ₩500M-2B</p>
          <p>· GameWith (日, 상장사): 시총 수십억엔</p>
          <p>· Sensor Tower Enterprise: $50K-100K+/년</p>
          <p>· Mobile Index INSIGHT: ₩300K-1M+/월</p>
        </GlassCard>
      </section>
    </div>
  );
}
