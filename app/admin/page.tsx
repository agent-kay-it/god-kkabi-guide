/**
 * /admin — 운영자 콘솔.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §14 (모더레이션)
 *
 * 보호: proxy.ts authorized() — role=admin 외 접근 거부.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { listPendingReports, listBannedUsers } from '@/lib/moderation/actions';
import { AdminModerationTable } from '@/components/feature/admin-moderation-table';
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
  title: '운영자 콘솔',
  description: '신고 검토 + 사용자 정지/해제 + 등록 초기화',
  robots: { index: false, follow: false },
};

export default async function AdminPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    redirect('/');
  }
  const [pendingReports, bannedUsers] = await Promise.all([
    listPendingReports(),
    listBannedUsers(),
  ]);

  return (
    <main className="mx-auto max-w-screen-lg px-5 pb-20 pt-8 sm:px-6">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>운영자 콘솔</HeroMetaBadge>
          <span className="font-mono">admin only</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Admin · Moderation" />
          <SectionTitle as="h1">모더레이션</SectionTitle>
          <SectionLead>
            신고 검토 + 정지 처리 + 등록 초기화. 모든 액션은 moderation_logs에 기록됩니다.
          </SectionLead>
        </SectionHead>
      </header>

      <Note variant="warn" title="운영자 책임" className="mb-6">
        본 콘솔은 사용자 데이터에 영향을 미치는 액션을 수행합니다. 정지/삭제는 audit log에
        기록되며, 사용자에게 사후 통지될 수 있습니다.
      </Note>

      <AdminModerationTable pendingReports={pendingReports} bannedUsers={bannedUsers} />
    </main>
  );
}
