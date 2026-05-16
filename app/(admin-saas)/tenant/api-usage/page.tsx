/**
 * /tenant/api-usage — Sprint V3 P3.C.
 * 게임사 별 API 사용량 30일 + tier 한도 표시. admin demo.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { listApiClients, getApiUsageDaily } from '@/lib/b2b/actions';
import { API_RATE_LIMITS } from '@/types/b2b';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/components/domain';

export const metadata: Metadata = {
  title: 'API 사용량',
};

type SearchParams = Promise<{ clientId?: string }>;

export default async function TenantApiUsagePage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/tenant/api-usage');
  if (session.user.role !== 'admin') redirect('/');

  const clients = await listApiClients();
  const { clientId } = await searchParams;
  const activeClient = clientId
    ? clients.find((c) => c.id === clientId)
    : clients[0];
  const usage = activeClient ? await getApiUsageDaily(activeClient.id, 30) : [];

  const limit = activeClient ? API_RATE_LIMITS[activeClient.tier] : 0;

  return (
    <div className="space-y-6">
      <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
        API 사용량
      </h1>

      {clients.length === 0 ? (
        <Note variant="info" title="발급된 API client가 없습니다">
          /admin/b2b/clients 에서 새 client를 발급하세요.
        </Note>
      ) : (
        <>
          <section aria-labelledby="select-heading" className="space-y-2">
            <h2 id="select-heading" className="sr-only">
              Client 선택
            </h2>
            <ul className="flex flex-wrap gap-2" role="list">
              {clients.map((c) => (
                <li key={c.id}>
                  <a
                    href={`/tenant/api-usage?clientId=${encodeURIComponent(c.id)}`}
                    className={
                      activeClient?.id === c.id
                        ? 'inline-flex items-center gap-1 rounded-full bg-bronze px-3 py-1 text-xs font-bold text-on-bronze'
                        : 'inline-flex items-center gap-1 rounded-full border border-ink-line bg-ink-elev px-3 py-1 text-xs text-text-soft hover:text-text'
                    }
                  >
                    {c.tenantName}
                    <Badge variant="indigo">{c.tier}</Badge>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {activeClient ? (
            <>
              <GlassCard className="space-y-2 p-4">
                <p className="text-sm text-text-soft">
                  <span className="font-bold text-text">{activeClient.tenantName}</span>
                  {' · '}tier <Badge variant="bronze">{activeClient.tier}</Badge>
                  {' · '}일일 한도{' '}
                  <span className="font-mono">
                    {Number.isFinite(limit) ? limit.toLocaleString() : '∞'}
                  </span>
                </p>
              </GlassCard>

              <section aria-labelledby="usage-heading" className="space-y-2">
                <h2 id="usage-heading" className="text-sm font-bold uppercase tracking-wider text-text-mute">
                  최근 30일 일별 호출 (UTC)
                </h2>
                {usage.length === 0 ? (
                  <Note variant="info" title="아직 호출 기록 없음">
                    API Key로 첫 호출 시 표시됩니다.
                  </Note>
                ) : (
                  <ul className="space-y-1 font-mono text-sm" role="list">
                    {usage.map((row) => {
                      const pct = Number.isFinite(limit)
                        ? Math.min(100, Math.round((row.count / limit) * 100))
                        : 0;
                      return (
                        <li key={row.date}>
                          <GlassCard className="flex items-center justify-between gap-3 p-2">
                            <span className="text-text-soft">{row.date}</span>
                            <span className="flex items-center gap-2">
                              <span className="text-text">{row.count.toLocaleString()}</span>
                              {Number.isFinite(limit) ? (
                                <span className="rounded bg-ink-elev px-2 py-0.5 text-xs text-text-mute">
                                  {pct}%
                                </span>
                              ) : null}
                            </span>
                          </GlassCard>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
