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
import { buildRelatedJinryeongForClass } from '@/lib/personalization/related';
import {
  ClassCard,
  Note,
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { WikiCardTracker } from '@/components/feature/wiki-card-tracker';
import { BookmarkButton } from '@/components/feature/bookmark-button';
import { FAQStructuredData } from '@/components/feature/structured-data';
import { Button } from '@/components/ui/button';
import { CLASS_ICON_URL, type WikiClassDoc } from '@/types/wiki';

export const metadata: Metadata = {
  title: '직업 가이드 — 전사 · 검객 · 영매',
  description:
    '갓깨비 키우기 3 직업 비교. 전사(도깨비) / 검객(무당) / 영매(저승사자). 추천 진령 조합 + 강점/약점 + 메타 티어.',
  // Sprint 25 / F25-C: canonical + OG/Twitter override + keywords (5 페이지 강화 #2)
  alternates: { canonical: '/class' },
  keywords: [
    '갓깨비 키우기 직업',
    '갓깨비 전사',
    '갓깨비 검객',
    '갓깨비 영매',
    '도깨비 무당 저승사자',
    '직업 비교 티어',
  ],
  openGraph: {
    title: '직업 가이드 — 전사 · 검객 · 영매 3종 비교',
    description: '직업별 추천 진령 조합 + 강점/약점 + 메타 티어 — 한눈 비교.',
    url: '/class',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '갓깨비 키우기 직업 비교',
    description: '전사/검객/영매 3종 + 추천 진령 + 메타 티어',
  },
};

// V7 P5: 캐릭터 이미지 좌/우 배치 + 성별이 페이지 새로고침마다 랜덤 변경되어야 하므로
// SSR 결과를 캐시하지 않도록 dynamic 강제.
export const dynamic = 'force-dynamic';

/**
 * V7 P5: 페이지 렌더링 시 카드별 좌/우 배치 + 성별 분포를 한 번에 결정.
 * React 19 react-hooks/purity 규칙으로 Server Component render 함수 안에서는 Math.random() 직접 호출 불가 →
 * 모든 randomness를 헬퍼로 격리. 동일 성별 케이스도 함께 회피 (n=3에서 1/4 단조 분포 제거).
 */
function pickClassLayoutRandomness(n: number): {
  flipFirst: boolean;
  genders: ReadonlyArray<'male' | 'female'>;
} {
  const flipFirst = Math.random() < 0.5;
  const list: Array<'male' | 'female'> = Array.from({ length: n }, () =>
    Math.random() < 0.5 ? 'male' : 'female',
  );
  if (n >= 2 && list.every((g) => g === list[0])) {
    list[list.length - 1] = list[0] === 'male' ? 'female' : 'male';
  }
  return { flipFirst, genders: list };
}

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

// Sprint 27 / F27-C — FAQ schema (직업별 운영 핵심).
// 페이지 가시 콘텐츠(3 ClassCard) 의 강점/약점/추천 진령 정보와 1:1 매칭.
const CLASS_FAQ: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: '전사(도깨비)는 어떤 강점이 있나요?',
    answer:
      '전사는 직접 타격 + 천탈창경 코어 스킬을 바탕으로 안정적인 DPS를 제공합니다. 자동 사냥과 보스전 모두에서 균등하게 활약하며, 초보자에게 추천되는 직업입니다.',
  },
  {
    question: '검객(무당)의 추천 진령은 무엇인가요?',
    answer:
      '검객은 광역과 단일 모두에 강하며, 0티어 진령(홍길동, 서해용왕)과 호환성이 매우 높습니다. 핵심 진영은 신·인 중심이며, 보조로 요 진영도 효과적입니다.',
  },
  {
    question: '영매(저승사자)는 어떻게 운영하나요?',
    answer:
      '영매는 원거리 + 디버프 위주의 직업입니다. 보조 효과를 가진 진령과 시너지가 좋으며, 파티 콘텐츠에서 우수한 성능을 발휘합니다. 음영귀, 명왕 같은 신 진영 진령과 잘 어울립니다.',
  },
];

export default async function ClassPage(): Promise<React.JSX.Element> {
  const classes = await listWikiClasses();
  const session = await auth();
  const isRegistered = Boolean(session?.user?.registered);
  const canBookmark = isRegistered;

  // V7 P5: 카드별 좌/우 이미지 배치 + 성별 랜덤 결정 (Math.random은 헬퍼에서 격리).
  //   - flipFirst: 페이지 새로고침마다 첫 카드가 좌 시작인지 우 시작인지 랜덤 → alternating 패턴은 유지
  //   - genders: 3개 카드 성별 랜덤 분포 (모두 같은 성별 회피)
  const { flipFirst, genders } = pickClassLayoutRandomness(classes.length);

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      {/* Sprint 27 / F27-C — FAQ schema */}
      <FAQStructuredData items={CLASS_FAQ} />
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>위키 / 직업</HeroMetaBadge>
          <span className="font-mono">{classes.length}종</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow num="02" label="Class" />
          <SectionTitle as="h1">직업 가이드</SectionTitle>
          <SectionLead>
            전사·검객·영매 3 직업의 메타 비교. 추천 진령 조합과 자동 사냥 효율을 한눈에.
          </SectionLead>
        </SectionHead>
      </header>

      {/* V7 P5: 3 직업 카드 1열 3행 (PC/모바일 공통).
          데스크톱 카드는 [캐릭터|설명] 또는 [설명|캐릭터] 좌우 분할 — flipFirst + 인덱스로 alternating.
          모바일 카드는 캐릭터(상) → 설명(하) stack. */}
      <div className="mb-12 grid gap-6">
        {classes.map((c, i) => {
          // alternating: 인덱스 짝수 = left, 홀수 = right (flipFirst가 true면 반전)
          const baseLeft = i % 2 === 0;
          const orientation: 'left' | 'right' = (baseLeft ? !flipFirst : flipFirst) ? 'left' : 'right';
          const gender = genders[i] ?? 'male';
          return (
            <WikiCardTracker
              key={c.id}
              category="class"
              targetId={c.id}
              recentlyViewed={{
                title: `${c.name} · ${c.subName}`,
                href: `/class#${c.id}`,
                iconUrl: CLASS_ICON_URL[c.id],
                emoji: c.emoji,
              }}
            >
              <ClassCard
                data={c}
                stats={CLASS_STATS[c.id]}
                relatedJinryeong={buildRelatedJinryeongForClass(c)}
                imageOrientation={orientation}
                characterGender={gender}
                // V7 P5: 첫 카드 캐릭터 이미지는 LCP 후보 → priority 부여 (eager + preload)
                priority={i === 0}
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
            </WikiCardTracker>
          );
        })}
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

      {/* Sprint 27 / F27-C hotfix — FAQ schema 가시 Q&A 콘텐츠 (Google 가이드라인 준수).
          JSON-LD mainEntity[] 과 1:1 매칭. */}
      <section
        aria-labelledby="faq-class"
        className="mt-12 rounded-[var(--radius-card)] border border-bronze/25 bg-ink-elev/40 p-6"
      >
        <header className="mb-4">
          <h2
            id="faq-class"
            className="text-xl font-bold tracking-tight text-text"
          >
            자주 묻는 질문 (FAQ)
          </h2>
          <p className="mt-1 text-sm text-text-soft">
            전사·검객·영매 3 직업 운영 핵심.
          </p>
        </header>
        <dl className="space-y-4">
          {CLASS_FAQ.map((qa) => (
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
