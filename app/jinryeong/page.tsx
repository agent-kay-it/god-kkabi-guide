/**
 * /jinryeong — 진령 11종 + 티어 + 진영 + 표 + 추천 프리셋.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §위키/진령 + source line 1532-1700
 */
import type { Metadata } from 'next';

import { listWikiJinryeong } from '@/lib/wiki/jinryeong-adapter';
import { auth } from '@/lib/auth/auth';
import {
  JinryeongCard,
  Note,
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
  TierStack,
  type TierStackItem,
} from '@/components/domain';
import { FeaturedJinryeongZoomable } from '@/components/feature/featured-jinryeong-zoomable';
import { BookmarkButton } from '@/components/feature/bookmark-button';
import { WikiCardTracker } from '@/components/feature/wiki-card-tracker';
import { FAQStructuredData } from '@/components/feature/structured-data';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import {
  FACTION_LABEL,
  ROLE_LABEL,
  RARITY_LABEL,
  type WikiJinryeongDoc,
} from '@/types/wiki';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: '진령 — 등급보다 시너지',
  description:
    '갓깨비 키우기 진령 11종 (0~2티어). 신·요·인 3 진영 시너지. 메타 정석 프리셋과 추천 조합.',
  // Sprint 25 / F25-C: canonical + OG/Twitter override + keywords (5 페이지 강화 #3)
  alternates: { canonical: '/jinryeong' },
  keywords: [
    '갓깨비 키우기 진령',
    '진령 11종',
    '진령 티어',
    '진령 시너지',
    '신 요 인 진영',
    '진령 프리셋',
  ],
  openGraph: {
    title: '진령 가이드 — 11종 0~2티어 시너지',
    description: '신·요·인 3 진영 시너지 매트릭스 + 메타 프리셋.',
    url: '/jinryeong',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '갓깨비 키우기 진령 11종',
    description: '0~2티어 시너지 매트릭스 + 추천 조합',
  },
};

type WikiJinryeongData = Omit<WikiJinryeongDoc, 'updatedAt'>;

const FACTION_VARIANT: Record<WikiJinryeongData['faction'], 'indigo' | 'jade' | 'bronze'> = {
  sin: 'indigo',
  yo: 'jade',
  in: 'bronze',
};

const TIER_LABEL: Record<0 | 1 | 2, string> = {
  0: 'T0',
  1: 'T1',
  2: 'T2',
};

// Sprint 27 / F27-C — FAQ schema (3 진영 시너지).
// 페이지의 신·요·인 진영 분류 (data/wiki/jinryeong faction) 와 1:1 매칭.
const JINRYEONG_FAQ: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: '신(神) 진영의 특징은 무엇인가요?',
    answer:
      '신 진영은 음영귀, 명왕 같은 진령으로 구성되며, 강력한 단일 데미지와 천상 효과를 제공합니다. 보스전과 PvP에서 우수한 성능을 발휘합니다.',
  },
  {
    question: '요(妖) 진영의 추천 조합은 무엇인가요?',
    answer:
      '요 진영은 서해용왕(0티어), 구미요호 등의 진령이 핵심입니다. 어둠 + 속성 시너지가 강력하며, 다수 적과의 광역 전투에 효과적입니다.',
  },
  {
    question: '인(人) 진영은 어떻게 운영하나요?',
    answer:
      '인 진영은 홍길동(0티어), 항아, 치우 등 안정적인 DPS 위주의 진령입니다. 균형 잡힌 효과와 자동 사냥에서 꾸준한 효율을 보장합니다.',
  },
];

export default async function JinryeongPage(): Promise<React.JSX.Element> {
  const allJinryeong = await listWikiJinryeong();
  const session = await auth();
  const canBookmark = Boolean(session?.user?.registered);
  const byTier = {
    0: allJinryeong.filter((j) => j.tier === 0),
    1: allJinryeong.filter((j) => j.tier === 1),
    2: allJinryeong.filter((j) => j.tier === 2),
  };

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      {/* Sprint 27 / F27-C — FAQ schema */}
      <FAQStructuredData items={JINRYEONG_FAQ} />
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>위키 / 진령</HeroMetaBadge>
          <span className="font-mono">{allJinryeong.length}종 · 2026.05</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow num="03" label="Jinryeong" />
          <SectionTitle as="h1">진령 — 등급보다 시너지</SectionTitle>
          <SectionLead>
            진령은 캐릭터와 함께 전투에 참여하는 최대 3명의 동료 시스템. 등급(★)이 아닌
            시너지가 더 중요합니다.
          </SectionLead>
        </SectionHead>
      </header>

      {/* 티어 리스트 */}
      <section className="mb-12 space-y-6" aria-labelledby="tier-list">
        <div className="flex items-end justify-between gap-4">
          <h2 id="tier-list" className="text-xl font-bold tracking-tight text-text sm:text-2xl">
            티어 리스트
          </h2>
          <span className="font-mono text-xs text-text-mute">2026.05 메타 기준</span>
        </div>

        <TierStack
          tiers={[0, 1, 2].map((tier) => ({
            tier: tier as 0 | 1 | 2,
            label: TIER_LABEL[tier as 0 | 1 | 2],
            items: byTier[tier as 0 | 1 | 2].map(
              (j): TierStackItem => ({
                id: j.id,
                name: j.name,
                trait: j.effectShort,
                href: `/jinryeong#${j.id}`,
              }),
            ),
          }))}
        />
      </section>

      {/* 진영 안내 */}
      <Note variant="info" title="신 · 요 · 인 — 진령 3대 진영" className="mb-10">
        모든 진령은 게임 내에서 <strong className="text-text">신(神) · 요(妖) · 인(人)</strong>{' '}
        세 진영으로 분류됩니다. 진영별 보기가 가능하며, 콘텐츠에 따라 진영 시너지가 발생할 수
        있습니다.
        <ul className="mt-2 space-y-1">
          <li>
            <strong className="text-indigo">신(神)</strong> — 신적 존재. 음영귀 · 태양여신 · 산신
          </li>
          <li>
            <strong className="text-jade-soft">요(妖)</strong> — 요괴·도깨비. 서해용왕 · 구미요호 ·
            격투귀 · 궁귀
          </li>
          <li>
            <strong className="text-bronze-soft">인(人)</strong> — 인간 영웅. 홍길동 · 항아 · 치우
            · 명왕
          </li>
        </ul>
      </Note>

      {/* 상세 표 */}
      <section className="mb-12" aria-labelledby="detail-table">
        <h2
          id="detail-table"
          className="mb-4 text-xl font-bold tracking-tight text-text sm:text-2xl"
        >
          상세 비교 — 메타 정석 11종
        </h2>
        <GlassCard className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left text-[0.72rem] uppercase tracking-wider text-text-mute">
                <th className="px-4 py-3 font-medium">진령</th>
                <th className="px-4 py-3 font-medium">등급</th>
                <th className="px-4 py-3 font-medium">진영</th>
                <th className="px-4 py-3 font-medium">역할</th>
                <th className="px-4 py-3 font-medium">효과</th>
              </tr>
            </thead>
            <tbody>
              {allJinryeong.map((j) => (
                <tr
                  key={j.id}
                  className={cn(
                    'border-b border-ink-line last:border-b-0 transition-colors hover:bg-ink-card-strong',
                    j.featured && 'bg-bronze/5',
                  )}
                >
                  <td className="px-4 py-3 font-semibold text-text">
                    {j.name}
                    {j.featured ? (
                      <span className="ml-2 text-[0.65rem] font-mono uppercase tracking-wider text-bronze-soft">
                        Featured
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={j.rarity === 'rare_ssr' ? 'vermilion' : 'bronze'}
                      className="text-[0.7rem]"
                    >
                      {RARITY_LABEL[j.rarity]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={FACTION_VARIANT[j.faction]} className="text-[0.7rem]">
                      {FACTION_LABEL[j.faction]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-soft">{ROLE_LABEL[j.role]}</td>
                  <td className="px-4 py-3 text-text-soft">{j.effectShort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </section>

      {/* Featured 진령 — V5 P3.B: lightbox 연동 (FeaturedJinryeongZoomable) */}
      {allJinryeong
        .filter((j) => j.featured)
        .map((j) => (
          <div key={j.id} className="mb-12">
            <FeaturedJinryeongZoomable data={j} />
          </div>
        ))}

      {/* 카드 뷰 */}
      <section className="mb-10" aria-labelledby="card-view">
        <h2
          id="card-view"
          className="mb-4 text-xl font-bold tracking-tight text-text sm:text-2xl"
        >
          카드로 보기
        </h2>
        {/* V7 P5: 모바일/태블릿(<md)은 1열 — 카드 콘텐츠가 풍부해 좁은 폭에서 가독성 저하.
            md+ 2열, lg+ 3열. */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allJinryeong.map((j) => (
            <WikiCardTracker
              key={j.id}
              category="jinryeong"
              targetId={j.id}
              recentlyViewed={{
                title: j.name,
                href: `/jinryeong#${j.id}`,
              }}
            >
              <JinryeongCard
                data={j}
                bookmarkSlot={
                  <BookmarkButton
                    targetType="jinryeong"
                    targetId={j.id}
                    title={j.name}
                    href={`/jinryeong#${j.id}`}
                    canBookmark={canBookmark}
                  />
                }
              />
            </WikiCardTracker>
          ))}
        </div>
      </section>

      {/* Sprint 27 / F27-C hotfix — FAQ schema 가시 Q&A 콘텐츠 (Google 가이드라인 준수).
          JSON-LD mainEntity[] 과 1:1 매칭. */}
      <section
        aria-labelledby="faq-jinryeong"
        className="mt-12 rounded-[var(--radius-card)] border border-bronze/25 bg-ink-elev/40 p-6"
      >
        <header className="mb-4">
          <h2
            id="faq-jinryeong"
            className="text-xl font-bold tracking-tight text-text"
          >
            자주 묻는 질문 (FAQ)
          </h2>
          <p className="mt-1 text-sm text-text-soft">
            신·요·인 3 진영 시너지와 운영 핵심.
          </p>
        </header>
        <dl className="space-y-4">
          {JINRYEONG_FAQ.map((qa) => (
            <div
              key={qa.question}
              className="rounded-md border border-ink-line/40 bg-ink-card/40 p-4"
            >
              <dt className="mb-2 font-semibold text-text">Q. {qa.question}</dt>
              <dd className="text-sm leading-relaxed text-text-soft">{qa.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}

// inline TierRow + FeaturedJinryeong removed — extracted to
// components/domain/{tier-stack,featured-jinryeong}.tsx (Sprint V4 P3.D)
