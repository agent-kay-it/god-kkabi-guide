/**
 * /class — 직업 3종 비교 페이지.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §위키 카테고리 + source line 1351-1525
 *
 * Server Component. Firestore wiki_classes (fallback: data/wiki/classes.ts seed).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { listWikiClasses } from '@/lib/wiki/classes-adapter';
import { auth } from '@/lib/auth/auth';
import { ClassCard, Note, HeroMeta, HeroMetaBadge } from '@/components/domain';
import { BookmarkButton } from '@/components/feature/bookmark-button';
import { Button } from '@/components/ui/button';
import type { WikiClassDoc } from '@/types/wiki';

export const metadata: Metadata = {
  title: '직업 가이드 — 전사 · 검객 · 영매',
  description:
    '갓깨비 키우기 3 직업 비교. 전사(도깨비) / 검객(무당) / 영매(저승사자). 추천 진령 조합 + 강점/약점 + 메타 티어.',
  robots: { index: false, follow: false },
};

/** 직업 카드별 통계 그리드 (난이도/자동사냥/광역기/스타일) — source line 1367-1478 */
const CLASS_STATS: Record<
  WikiClassDoc['id'],
  ReadonlyArray<{ label: string; value: string; rate?: string }>
> = {
  warrior: [
    { label: '스타일', value: '근접 단일 딜링' },
    { label: '난이도', value: '쉬움', rate: '★☆☆' },
    { label: '자동 사냥', value: '매우 우수', rate: '★★★' },
    { label: '광역기', value: '약함', rate: '★☆☆' },
  ],
  swordsman: [
    { label: '스타일', value: '중거리 콤보 딜링' },
    { label: '난이도', value: '보통', rate: '★★☆' },
    { label: '자동 사냥', value: '매우 우수', rate: '★★★' },
    { label: 'PvE 범용성', value: '최상', rate: '★★★' },
  ],
  medium: [
    { label: '스타일', value: '원거리 광역 딜링' },
    { label: '난이도', value: '보통', rate: '★★☆' },
    { label: '자동 사냥', value: '우수', rate: '★★☆' },
    { label: '광역기', value: '최상', rate: '★★★' },
  ],
};

export default async function ClassPage(): Promise<React.JSX.Element> {
  const classes = await listWikiClasses();
  const session = await auth();
  const isRegistered = Boolean(session?.user?.registered);
  const canBookmark = isRegistered;

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-10">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>위키 / 직업</HeroMetaBadge>
          <span className="font-mono">{classes.length}종</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          직업 가이드
        </h1>
        <p className="mt-3 max-w-2xl text-text-soft">
          전사·검객·영매 3 직업의 메타 비교. 추천 진령 조합과 자동 사냥 효율을 한눈에.
        </p>
      </header>

      <div className="mb-12 grid gap-6 lg:grid-cols-3">
        {classes.map((c) => (
          <ClassCard
            key={c.id}
            data={c}
            stats={CLASS_STATS[c.id]}
            bookmarkSlot={
              <BookmarkButton
                targetType="class"
                targetId={c.id}
                title={`${c.name} (${c.subName})`}
                href={`/class#${c.id}`}
                emoji={c.emoji}
                canBookmark={canBookmark}
              />
            }
          />
        ))}
      </div>

      <section className="mb-10 grid gap-4 md:grid-cols-2">
        <Note variant="success" title="결론 — 초보부터 메타까지">
          <strong className="text-text">초보·무과금</strong>은 검객 (자동 전투 범용성),{' '}
          <strong className="text-text">스테이지 빠른 밀기</strong>는 영매 (광역),{' '}
          <strong className="text-text">심플한 플레이</strong>는 전사 (사망 위험 최소).
          <br />
          상위 랭커 풀에서는 검객 채용률이 가장 높음.
        </Note>
        <Note variant="info" title="진단으로 직업 추천 받기">
          7개 질문 진단으로 본인 플레이 스타일에 맞는 직업을 추천받을 수 있습니다.
          <div className="mt-3">
            <Button asChild variant="bronze" size="sm">
              <Link href="/class-quiz" className="gap-2">
                직업 진단 시작 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </Note>
      </section>

      {!isRegistered ? (
        <Note variant="warn" title="로그인하면 본인 직업으로 자동 매칭">
          로그인 후 등록 시 본인 직업을 저장해두면, 위키 추천이 본인 직업에 맞춰 개인화됩니다.
          채팅·북마크·신고 기능도 함께 활성화됩니다.
        </Note>
      ) : null}
    </main>
  );
}
