/**
 * /admin/penalties — 자동 페널티 audit + 수동 우회.
 * 출처: docs/sprint/04-sprint-v1/design.md §9
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import {
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import { AdminPenaltyTable } from '@/components/feature/admin-penalty-table';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import type { PenaltyDoc } from '@/types/penalty';

export const metadata: Metadata = {
  title: 'Admin — 페널티 큐',
  robots: { index: false, follow: false },
};

async function listRecentPenalties(): Promise<readonly PenaltyDoc[]> {
  if (!hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('penalties')
      .orderBy('appliedAt', 'desc')
      .limit(50)
      .get();
    return snap.docs.map((d) => {
      const raw = d.data() as Omit<PenaltyDoc, 'appliedAtMs' | 'expiresAtMs' | 'revokedAtMs'> & {
        appliedAt?: { toMillis(): number };
        expiresAt?: { toMillis(): number };
        revokedAt?: { toMillis(): number };
      };
      return {
        id: raw.id,
        targetUid: raw.targetUid,
        level: raw.level,
        reason: raw.reason,
        appliedBy: raw.appliedBy,
        appliedAtMs: raw.appliedAt?.toMillis() ?? 0,
        ...(raw.expiresAt ? { expiresAtMs: raw.expiresAt.toMillis() } : {}),
        reportedCountAtTime: raw.reportedCountAtTime ?? 0,
        ...(raw.revokedBy ? { revokedBy: raw.revokedBy } : {}),
        ...(raw.revokedAt ? { revokedAtMs: raw.revokedAt.toMillis() } : {}),
      } as PenaltyDoc;
    });
  } catch {
    return [];
  }
}

export default async function AdminPenaltiesPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/');
  const penalties = await listRecentPenalties();

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>Admin / 페널티</HeroMetaBadge>
          <span className="font-mono">{penalties.length}건</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          페널티 audit
        </h1>
        <p className="mt-3 text-text-soft">
          자동 / 수동 페널티 이력. false positive 결정 시 복구 가능.
        </p>
      </header>

      <Note variant="info" title="자동 페널티 룰">
        누적 신고 5건 = 경고 / 10건 = 7일 정지 / 20건 = 영구 정지. 복구 시 reportedTotal -= 1 및 ban 해제.
      </Note>

      <section className="mt-6">
        <AdminPenaltyTable penalties={penalties} />
      </section>
    </main>
  );
}
