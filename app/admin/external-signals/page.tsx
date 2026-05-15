/**
 * /admin/external-signals — Sprint V3 P3.D (F4.1).
 * 외부 신호 수집 결과 모니터링. admin only.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { listSignals } from '@/lib/etl/repo';
import {
  HeroMeta,
  HeroMetaBadge,
  Note,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import type { ExternalSignalSource } from '@/types/etl';

export const metadata: Metadata = {
  title: 'Admin — External Signals',
  robots: { index: false, follow: false },
};

const SOURCE_LABEL: Record<ExternalSignalSource, string> = {
  linkedin: 'LinkedIn',
  saramin: '사람인',
  jobkorea: '잡코리아',
  sensor_tower: 'Sensor Tower',
  google_news: 'Google News',
};

const SOURCE_VARIANT = {
  linkedin: 'indigo',
  saramin: 'jade',
  jobkorea: 'jade',
  sensor_tower: 'bronze',
  google_news: 'vermilion',
} as const;

type SearchParams = Promise<{ source?: string; signalType?: string }>;

const VALID_SOURCES: readonly ExternalSignalSource[] = [
  'linkedin',
  'saramin',
  'jobkorea',
  'sensor_tower',
  'google_news',
];

export default async function AdminExternalSignalsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin/external-signals');
  if (session.user.role !== 'admin') redirect('/');

  const params = await searchParams;
  const source = (VALID_SOURCES as readonly string[]).includes(params.source ?? '')
    ? (params.source as ExternalSignalSource)
    : undefined;

  const signals = await listSignals({
    ...(source ? { source } : {}),
    limit: 100,
  });

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>Admin / ETL</HeroMetaBadge>
          <span className="font-mono">{signals.length} signals</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Admin · ETL" />
          <SectionTitle as="h1">External Signals</SectionTitle>
          <SectionLead>
            외부 데이터 수집 결과. 사람인/Google News는 cron 자동 수집, LinkedIn/Sensor Tower는
            운영자 수동 upload. Sensor Tower 분기 데이터는 manually_verified 후 R3-C4 차트에
            반영.
          </SectionLead>
        </SectionHead>
      </header>

      <section aria-labelledby="filter-heading" className="mb-4">
        <h2 id="filter-heading" className="sr-only">
          Source 필터
        </h2>
        <ul className="flex flex-wrap gap-2" role="list">
          <li>
            <Link
              href="/admin/external-signals"
              className={
                !source
                  ? 'inline-flex items-center gap-1 rounded-full bg-bronze px-3 py-1 text-xs font-bold text-on-bronze'
                  : 'inline-flex items-center gap-1 rounded-full border border-ink-line bg-ink-elev px-3 py-1 text-xs text-text-soft hover:text-text'
              }
            >
              전체
            </Link>
          </li>
          {VALID_SOURCES.map((s) => (
            <li key={s}>
              <Link
                href={`/admin/external-signals?source=${s}`}
                className={
                  source === s
                    ? 'inline-flex items-center gap-1 rounded-full bg-bronze px-3 py-1 text-xs font-bold text-on-bronze'
                    : 'inline-flex items-center gap-1 rounded-full border border-ink-line bg-ink-elev px-3 py-1 text-xs text-text-soft hover:text-text'
                }
              >
                {SOURCE_LABEL[s]}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {signals.length === 0 ? (
        <Note variant="info" title="수집된 신호가 없습니다">
          /api/cron/etl-external-signals (일 1회) cron 실행 후 누적됩니다. 또는 운영자가 LinkedIn
          CSV/Sensor Tower PDF를 수동 upload할 수 있습니다.
        </Note>
      ) : (
        <ul className="space-y-2" role="list">
          {signals.map((s) => (
            <li key={s.id}>
              <GlassCard className="space-y-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={SOURCE_VARIANT[s.source]}>{SOURCE_LABEL[s.source]}</Badge>
                    <span className="font-mono text-xs text-text-soft">{s.signalType}</span>
                    {s.manuallyVerified ? (
                      <Badge variant="jade">verified</Badge>
                    ) : null}
                  </div>
                  <span className="font-mono text-xs text-text-mute">
                    {new Date(s.fetchedAtMs).toISOString().slice(0, 10)}
                    {s.period ? ` · ${s.period}` : ''}
                    {s.confidence !== undefined ? ` · conf ${(s.confidence * 100).toFixed(0)}%` : ''}
                  </span>
                </div>
                {s.keywords && s.keywords.length > 0 ? (
                  <p className="text-xs text-text-mute">
                    keywords: {s.keywords.join(', ')}
                  </p>
                ) : null}
                <details>
                  <summary className="cursor-pointer text-xs text-text-mute hover:text-text">
                    payload
                  </summary>
                  <pre className="mt-2 overflow-x-auto rounded bg-ink-elev p-2 font-mono text-xs">
                    {JSON.stringify(s.payload, null, 2)}
                  </pre>
                </details>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
