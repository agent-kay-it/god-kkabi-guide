/**
 * /admin/insights/pain — F3.5 Pain Topic 인사이트 (admin only).
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { listPainTopics, TOTAL_PAIN_KEYWORDS } from '@/lib/nlp/aggregate';
import { type PainCategory } from '@/types/nlp';
import {
  HeroMeta,
  HeroMetaBadge,
  Note,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { PainTopicRow } from '@/components/feature/pain-topic-row';

export const metadata: Metadata = {
  title: 'Admin — Pain Topic 인사이트',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ category?: string; week?: string }>;

const CATEGORIES: ReadonlyArray<PainCategory> = ['bug', 'balance', 'monetization', 'qol', 'event', 'class'];

export default async function AdminPainPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin/insights/pain');
  if (session.user.role !== 'admin') redirect('/');

  const params = await searchParams;
  const category = CATEGORIES.includes(params.category as PainCategory)
    ? (params.category as PainCategory)
    : undefined;
  const topics = await listPainTopics(params.week, category);

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>Admin / NLP</HeroMetaBadge>
          <span className="font-mono">사전 {TOTAL_PAIN_KEYWORDS} 키워드</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Admin · NLP" />
          <SectionTitle as="h1">Pain Topic 인사이트</SectionTitle>
          <SectionLead>
            매주 월요일 00:00 KST 자동 집계 — 게시물 + 댓글 본문에서 KR 키워드 매칭 빈도.
            LLM 미사용 (비용 회피), 정규식 + aliases 기반.
          </SectionLead>
        </SectionHead>
      </header>

      {topics.length === 0 ? (
        <Note variant="info" title="집계 데이터가 아직 없습니다.">
          매주 월요일에 자동 갱신됩니다.
        </Note>
      ) : (
        <ul className="space-y-2" role="list">
          {topics.map((t) => (
            <li key={t.id}>
              {/* CA2-I4: client wrapper로 pain_topic_click GA4 발화 */}
              <PainTopicRow
                id={t.id}
                rank={t.rank}
                category={t.category}
                term={t.term}
                count={t.count}
                weekISO={t.weekISO}
                {...(t.delta !== undefined ? { delta: t.delta } : {})}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
