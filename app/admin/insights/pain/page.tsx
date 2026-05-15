/**
 * /admin/insights/pain — F3.5 Pain Topic 인사이트 (admin only).
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { listPainTopics, TOTAL_PAIN_KEYWORDS } from '@/lib/nlp/aggregate';
import { PAIN_CATEGORY_LABEL, PAIN_CATEGORY_COLOR, type PainCategory } from '@/types/nlp';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';

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
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>Admin / NLP</HeroMetaBadge>
          <span className="font-mono">사전 {TOTAL_PAIN_KEYWORDS} 키워드</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          Pain Topic 인사이트
        </h1>
        <p className="mt-3 max-w-2xl text-text-soft">
          매주 월요일 00:00 KST 자동 집계 — 게시물 + 댓글 본문에서 KR 키워드 매칭 빈도.
          LLM 미사용 (비용 회피), 정규식 + aliases 기반.
        </p>
      </header>

      {topics.length === 0 ? (
        <Note variant="info" title="집계 데이터가 아직 없습니다.">
          매주 월요일에 자동 갱신됩니다.
        </Note>
      ) : (
        <ul className="space-y-2" role="list">
          {topics.map((t) => (
            <li key={t.id}>
              <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="flex items-center gap-3">
                  <Badge variant="bronze">#{t.rank}</Badge>
                  <Badge variant={PAIN_CATEGORY_COLOR[t.category]}>{PAIN_CATEGORY_LABEL[t.category]}</Badge>
                  <span className="font-medium text-text">{t.term}</span>
                  <span className="text-xs text-text-mute">언급 {t.count}회</span>
                  {t.delta !== undefined ? (
                    <span className={`text-xs ${t.delta > 0 ? 'text-jade' : t.delta < 0 ? 'text-vermilion' : 'text-text-mute'}`}>
                      {t.delta > 0 ? `↑${t.delta}` : t.delta < 0 ? `↓${-t.delta}` : '—'}
                    </span>
                  ) : null}
                </div>
                <span className="font-mono text-xs text-text-mute">{t.weekISO}</span>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
