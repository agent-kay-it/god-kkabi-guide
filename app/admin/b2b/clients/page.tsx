/**
 * /admin/b2b/clients — admin B2B API client 관리 (Sprint V3 P3.C).
 *
 * 운영자가 게임사에게 API Key를 발급하고 사용량 모니터링.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { listApiClients } from '@/lib/b2b/actions';
import { HeroMeta, HeroMetaBadge } from '@/components/domain';
import { AdminB2bIssueForm } from '@/components/feature/admin-b2b-issue-form';
import { AdminB2bClientsTable } from '@/components/feature/admin-b2b-clients-table';

export const metadata: Metadata = {
  title: 'Admin — B2B API Clients',
  robots: { index: false, follow: false },
};

export default async function AdminB2bClientsPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin/b2b/clients');
  if (session.user.role !== 'admin') redirect('/');

  const clients = await listApiClients();

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>Admin / B2B</HeroMetaBadge>
          <span className="font-mono">{clients.length} clients</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          B2B API Clients
        </h1>
        <p className="mt-3 max-w-2xl text-text-soft">
          게임사(Joy Net Games / 4399 / Juxin) 별 API Key를 발급하고 사용량을 모니터링합니다.
          plaintext key는 발급 시점 1회만 표시되므로 즉시 안전한 채널로 전달해야 합니다.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="issue-heading">
          <h2 id="issue-heading" className="sr-only">
            새 client 발급
          </h2>
          <AdminB2bIssueForm />
        </section>
        <section aria-labelledby="list-heading">
          <h2 id="list-heading" className="mb-3 text-base font-bold tracking-tight text-text">
            발급된 Clients ({clients.length})
          </h2>
          <AdminB2bClientsTable initialClients={clients} />
        </section>
      </div>
    </main>
  );
}
