/**
 * <ClassCard> — 직업 1종 상세 카드 (배너 + 통계 그리드 + 강점/약점 + 추천 진령).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.3 + source line 1352-1456 (전사/검객/영매)
 *
 * 데이터 어댑터 형태: Firestore DocSnap → props (WikiClassData).
 */
import Image from 'next/image';
import { Check, X } from 'lucide-react';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { StatCell } from './stat-cell';
import { RelatedItems, type RelatedItem } from './related-items';
import { CLASS_ACCENT, type WikiClassDoc } from '@/types/wiki';
import { cn } from '@/lib/utils';

type WikiClassData = Omit<WikiClassDoc, 'updatedAt'>;

export interface ClassCardProps {
  data: WikiClassData;
  /** 추가 통계 셀 (자동 사냥, 광역기 등) */
  stats?: ReadonlyArray<{ label: string; value: string; rate?: string }>;
  /**
   * 북마크 슬롯 — feature 레이어 컴포넌트(BookmarkButton 등)를 부모에서 주입.
   * Clean Architecture 일방향(ui→motion→domain→feature) 준수를 위해 직접 import 금지.
   */
  bookmarkSlot?: React.ReactNode;
  /**
   * Sprint V7 P3.B — 클릭 가능한 추천 진령 link 목록.
   * 미제공 시 기존 정적 Badge fallback 유지 (하위 호환).
   */
  relatedJinryeong?: readonly RelatedItem[];
  className?: string;
}

export function ClassCard({
  data,
  stats,
  bookmarkSlot,
  relatedJinryeong,
  className,
}: ClassCardProps): React.JSX.Element {
  const accent = CLASS_ACCENT[data.id];
  return (
    <GlassCard accent={accent} className={cn('flex flex-col', className)}>
      <div className="relative aspect-[16/8] w-full overflow-hidden">
        <Image
          src={data.imageUrl}
          alt={`${data.name} · ${data.subName} 배너`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-base/80 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <div>
            <h3 className="text-2xl font-bold text-text">
              <span className="mr-2" aria-hidden>
                {data.emoji}
              </span>
              {data.name}
              <span className="ml-2 text-sm font-normal text-text-mute">· {data.subName}</span>
            </h3>
            <p className="font-mono text-xs uppercase tracking-wider text-bronze-soft">
              {data.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={`tier-${data.tier}` as 'tier-0' | 'tier-1' | 'tier-2' | 'tier-3'}>
              T{data.tier}
            </Badge>
            {bookmarkSlot}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-text-soft">{data.summary}</p>

        {stats && stats.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => (
              <StatCell
                key={s.label}
                label={s.label}
                value={s.value}
                {...(s.rate ? { rate: s.rate } : {})}
              />
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <section aria-label={`${data.name} 강점`}>
            <h4 className="mb-2 text-[0.72rem] font-semibold uppercase tracking-wider text-jade-soft">
              강점
            </h4>
            <ul className="space-y-1.5 text-sm text-text">
              {data.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <Check aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jade" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label={`${data.name} 약점`}>
            <h4 className="mb-2 text-[0.72rem] font-semibold uppercase tracking-wider text-vermilion-soft">
              약점
            </h4>
            <ul className="space-y-1.5 text-sm text-text">
              {data.weaknesses.map((w) => (
                <li key={w} className="flex items-start gap-2">
                  <X aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vermilion" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sprint V7 P3.B: relatedJinryeong이 제공되면 클릭 가능한 chip 사용,
            아니면 기존 정적 Badge fallback (하위 호환). */}
        {relatedJinryeong && relatedJinryeong.length > 0 ? (
          <div>
            <RelatedItems
              title={`${data.name} 추천 진령 조합`}
              items={relatedJinryeong}
              className="mt-0"
            />
            <p className="mt-2 text-xs leading-relaxed text-text-soft">
              {data.jinryeongNote}
            </p>
          </div>
        ) : (
          <section
            aria-label={`${data.name} 추천 진령 조합`}
            className="rounded-[var(--radius-card)] border border-bronze/20 bg-bronze/5 p-4"
          >
            <h4 className="mb-2 text-[0.72rem] font-semibold uppercase tracking-wider text-bronze-soft">
              추천 진령 조합
            </h4>
            <div className="mb-2 flex flex-wrap gap-2">
              {data.recommendedJinryeong.map((j) => (
                <Badge key={j} variant="bronze" className="text-[0.72rem]">
                  {j}
                </Badge>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-text-soft">{data.jinryeongNote}</p>
          </section>
        )}
      </div>
    </GlassCard>
  );
}
