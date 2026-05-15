/**
 * /admin/dictionaries — 모더레이션 사전 CRUD.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/moderation-policy.md §2.4
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { listDictionariesForAdmin } from '@/lib/moderation/dictionaries';
import { AdminDictionaryTable } from '@/components/feature/admin-dictionary-table';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';

export const metadata: Metadata = {
  title: 'Admin — 모더레이션 사전',
  robots: { index: false, follow: false },
};

export default async function AdminDictionariesPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/');
  const initial = await listDictionariesForAdmin();

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>Admin / 사전</HeroMetaBadge>
          <span className="font-mono">{initial.length}건</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          모더레이션 사전
        </h1>
        <p className="mt-3 text-text-soft">
          금칙어 / 스팸 키워드 / 화이트리스트 관리. 5분 캐시 후 클라이언트 마스킹에 적용.
        </p>
      </header>

      <Note variant="info" title="사전 외부화 (Sprint V1 인풋 #4)">
        Sprint v2의 하드코딩 11종은 fallback으로 유지. 본 콘솔에서 추가/비활성화하면 즉시 반영 (5분 캐시 후).
      </Note>

      <section className="mt-6">
        <AdminDictionaryTable initial={initial} />
      </section>
    </main>
  );
}
