/**
 * /tenant/reports — Sprint V3 P3.C.
 * 분기 리포트 다운로드 + CSV/JSON export 안내. admin demo.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileDown, FileText } from 'lucide-react';

import { auth } from '@/lib/auth/auth';
import { GlassCard } from '@/components/ui/glass-card';
import { Note } from '@/components/domain';

export const metadata: Metadata = {
  title: '리포트',
};

const REPORTS = [
  {
    id: 'quarterly-meta',
    title: '분기 메타 인사이트',
    description: 'V2 NLP + 진령 채용률 + 빌드 트렌드 종합',
    cadence: '분기 1회',
    priceKrw: '₩5M-15M',
  },
  {
    id: 'churn-signal',
    title: '이탈 시그널 SaaS',
    description: 'Pain Point + 페이지 funnel + 결제 drop',
    cadence: '월간',
    priceKrw: '₩3M/월',
  },
  {
    id: 'sequel-research',
    title: '후속작 사전 리서치',
    description: '다국어 트래픽 + 외부 신호 ETL (4399 채용 / 산업 매출)',
    cadence: '분기',
    priceKrw: '₩30M-100M/년',
  },
];

export default async function TenantReportsPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/tenant/reports');
  if (session.user.role !== 'admin') redirect('/');

  return (
    <div className="space-y-6">
      <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
        리포트
      </h1>

      <Note variant="info" title="Demo 모드">
        실제 PDF 다운로드는 운영자가 분기마다 수기 작성 후 제공. 본 화면은 카탈로그.
      </Note>

      <section aria-labelledby="catalog-heading" className="space-y-3">
        <h2 id="catalog-heading" className="text-sm font-bold uppercase tracking-wider text-text-mute">
          리포트 카탈로그
        </h2>
        <ul className="space-y-3" role="list">
          {REPORTS.map((r) => (
            <li key={r.id}>
              <GlassCard className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-bronze" aria-hidden />
                    <h3 className="text-base font-bold tracking-tight text-text">{r.title}</h3>
                  </div>
                  <span className="font-mono text-sm text-bronze">{r.priceKrw}</span>
                </div>
                <p className="text-sm text-text-soft">{r.description}</p>
                <div className="flex items-center justify-between text-xs text-text-mute">
                  <span>주기: {r.cadence}</span>
                  <Link
                    href={`/api/v1/builds?limit=10`}
                    className="inline-flex items-center gap-1 text-bronze hover:underline"
                  >
                    <FileDown className="h-3 w-3" aria-hidden />
                    샘플 JSON
                  </Link>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="export-heading" className="space-y-3">
        <h2 id="export-heading" className="text-sm font-bold uppercase tracking-wider text-text-mute">
          데이터 Export
        </h2>
        <GlassCard className="space-y-2 p-4 text-sm text-text-soft">
          <p>REST API로 직접 export — Authorization: Bearer &lt;API_KEY&gt;</p>
          <ul className="mt-2 space-y-1 font-mono text-xs">
            <li>GET /api/v1/builds?limit=100&amp;classId=warrior</li>
            <li>GET /api/v1/adoption-rate?weekISO=2026-W19</li>
            <li>GET /api/v1/pain-points?weekISO=2026-W19&amp;category=bug</li>
            <li>GET /api/v1/coupons-trend?limit=50</li>
            <li>GET /api/v1/simulator-results?limit=20 (Pro+)</li>
          </ul>
          <p className="mt-2 text-xs text-text-mute">
            CSV 변환은 클라이언트 측에서 — 표준 JSON envelope이라 직접 가공 가능.
          </p>
        </GlassCard>
      </section>
    </div>
  );
}
