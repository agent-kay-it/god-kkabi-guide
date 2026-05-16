/**
 * /tenant (whitelabel) — Sprint V3 P3.C.
 * 게임사 demo dashboard. KPI 4-card + 최근 채용률 + Pain Topic top.
 *
 * Admin only — 운영자 시연용. 실제 환경에서는 tenant API Key 인증.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TrendingUp, AlertCircle, Activity, Users } from 'lucide-react';

import { auth } from '@/lib/auth/auth';
import {
  fetchAdoptionRate,
  fetchPainPoints,
  fetchBuilds,
  fetchSimulatorResults,
} from '@/lib/b2b/data-sources';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/components/domain';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function TenantDashboardPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/tenant');
  if (session.user.role !== 'admin') redirect('/');

  const [adoption, pain, builds, sim] = await Promise.all([
    fetchAdoptionRate({ limit: 5 }),
    fetchPainPoints({ limit: 5 }),
    fetchBuilds({ limit: 20 }),
    fetchSimulatorResults({ limit: 5 }),
  ]);

  const totalBuilds = builds.length;
  const avgLikes = builds.length > 0
    ? Math.round(builds.reduce((acc, b) => acc + b.likes, 0) / builds.length)
    : 0;
  const totalSimRuns = sim.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="space-y-6">
      <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
        Tenant Dashboard
      </h1>

      <section aria-labelledby="kpi-heading" className="space-y-3">
        <h2 id="kpi-heading" className="text-sm font-bold uppercase tracking-wider text-text-mute">
          핵심 KPI
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard icon={<Activity className="h-4 w-4" />} label="최근 빌드" value={`${totalBuilds}`} suffix="건" />
          <KpiCard icon={<TrendingUp className="h-4 w-4" />} label="평균 좋아요" value={`${avgLikes}`} suffix="" />
          <KpiCard icon={<Users className="h-4 w-4" />} label="시뮬레이션" value={`${totalSimRuns}`} suffix="회" />
          <KpiCard icon={<AlertCircle className="h-4 w-4" />} label="Pain Topic TOP" value={`${pain.length}`} suffix="개" />
        </div>
      </section>

      <section aria-labelledby="adoption-heading" className="space-y-3">
        <h2 id="adoption-heading" className="text-sm font-bold uppercase tracking-wider text-text-mute">
          진령 채용률 TOP 5
        </h2>
        {adoption.length === 0 ? (
          <Note variant="info" title="데이터 없음">
            주간 cron이 누적 후 표시됩니다.
          </Note>
        ) : (
          <ul className="space-y-2" role="list">
            {adoption.map((a) => (
              <li key={`${a.weekISO}_${a.classId}_${a.jinryeongId}`}>
                <GlassCard className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="bronze">#{a.rank}</Badge>
                    <span className="font-medium text-text">{a.jinryeongId}</span>
                    <Badge variant="indigo">{a.classId}</Badge>
                  </div>
                  <span className="font-mono text-sm text-text-soft">
                    {(a.rate * 100).toFixed(1)}% ({a.totalRuns})
                  </span>
                  <span className="font-mono text-xs text-text-mute">{a.weekISO}</span>
                </GlassCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pain-heading" className="space-y-3">
        <h2 id="pain-heading" className="text-sm font-bold uppercase tracking-wider text-text-mute">
          Pain Topic TOP 5
        </h2>
        {pain.length === 0 ? (
          <Note variant="info" title="데이터 없음">
            주간 NLP cron 결과가 누적되면 표시됩니다.
          </Note>
        ) : (
          <ul className="space-y-2" role="list">
            {pain.map((p) => (
              <li key={`${p.weekISO}_${p.term}`}>
                <GlassCard className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="bronze">#{p.rank}</Badge>
                    <Badge variant="vermilion">{p.category}</Badge>
                    <span className="font-medium text-text">{p.term}</span>
                  </div>
                  <span className="font-mono text-sm text-text-soft">{p.count}회</span>
                </GlassCard>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix: string;
}): React.JSX.Element {
  return (
    <GlassCard className="space-y-1 p-3">
      <div className="flex items-center gap-1 text-bronze">
        {icon}
        <span className="text-xs text-text-mute">{label}</span>
      </div>
      <p className="font-mono text-2xl font-bold text-text">
        {value}
        <span className="ml-1 text-sm text-text-mute">{suffix}</span>
      </p>
    </GlassCard>
  );
}
