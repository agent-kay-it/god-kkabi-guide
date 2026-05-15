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
} from '@/components/domain';
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
  robots: { index: false, follow: false },
};

type WikiJinryeongData = Omit<WikiJinryeongDoc, 'updatedAt'>;

const FACTION_VARIANT: Record<WikiJinryeongData['faction'], 'indigo' | 'jade' | 'bronze'> = {
  sin: 'indigo',
  yo: 'jade',
  in: 'bronze',
};

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
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-10">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>위키 / 진령</HeroMetaBadge>
          <span className="font-mono">{allJinryeong.length}종 · 2026.05</span>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          진령 — 등급보다 시너지
        </h1>
        <p className="mt-3 max-w-2xl text-text-soft">
          진령은 캐릭터와 함께 전투에 참여하는 최대 3명의 동료 시스템. 등급(★)이 아닌 시너지가
          더 중요합니다.
        </p>
      </header>

      {/* 티어 리스트 */}
      <section className="mb-12 space-y-6" aria-labelledby="tier-list">
        <div className="flex items-end justify-between gap-4">
          <h2 id="tier-list" className="text-xl font-bold tracking-tight text-text sm:text-2xl">
            티어 리스트
          </h2>
          <span className="font-mono text-xs text-text-mute">2026.05 메타 기준</span>
        </div>

        {([0, 1, 2] as const).map((tier) => (
          <TierRow key={tier} tier={tier} jinryeongs={byTier[tier]} />
        ))}
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

      {/* Featured 진령 */}
      {allJinryeong
        .filter((j) => j.featured)
        .map((j) => (
          <FeaturedJinryeong key={j.id} data={j} />
        ))}

      {/* 카드 뷰 */}
      <section className="mb-10" aria-labelledby="card-view">
        <h2
          id="card-view"
          className="mb-4 text-xl font-bold tracking-tight text-text sm:text-2xl"
        >
          카드로 보기
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allJinryeong.map((j) => (
            <JinryeongCard key={j.id} data={j} canBookmark={canBookmark} />
          ))}
        </div>
      </section>
    </main>
  );
}

function TierRow({
  tier,
  jinryeongs,
}: {
  tier: 0 | 1 | 2;
  jinryeongs: readonly WikiJinryeongData[];
}): React.JSX.Element {
  return (
    <div className="flex gap-4">
      <div
        className={cn(
          'flex w-12 shrink-0 items-center justify-center rounded-[var(--radius-card)] font-mono text-3xl font-black sm:w-16',
          tier === 0 && 'bg-vermilion/15 text-vermilion',
          tier === 1 && 'bg-bronze/15 text-bronze',
          tier === 2 && 'bg-indigo/15 text-indigo',
        )}
        aria-label={`티어 ${tier}`}
      >
        {tier}
      </div>
      <div className="flex flex-1 flex-wrap content-start gap-2">
        {jinryeongs.map((j) => (
          <div
            key={j.id}
            className="flex items-center gap-2 rounded-full border border-ink-line bg-ink-elev px-3 py-1.5"
          >
            <span className="text-sm font-semibold text-text">{j.name}</span>
            <span className="text-[0.7rem] text-text-mute">{j.effectShort}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import Image from 'next/image';

function FeaturedJinryeong({ data }: { data: WikiJinryeongData }): React.JSX.Element {
  return (
    <section className="mb-12" aria-labelledby={`featured-${data.id}`}>
      <GlassCard className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row" accent="swordsman">
        {data.imageUrl ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] md:w-64 md:shrink-0">
            <Image
              src={data.imageUrl}
              alt={`${data.name} 상세 이미지`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[0.7rem] uppercase tracking-wider text-bronze-soft">
            Featured · 모든 직업 공통 핵심
          </span>
          <h3
            id={`featured-${data.id}`}
            className="text-2xl font-bold tracking-tight text-text"
          >
            {data.name}
          </h3>
          <p className="text-sm leading-relaxed text-text-soft">{data.effectLong}</p>
          <div className="flex flex-wrap gap-2">
            {data.recommendedFor.map((r) => (
              <Badge key={r} variant="bronze" className="text-[0.7rem]">
                {r}
              </Badge>
            ))}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
