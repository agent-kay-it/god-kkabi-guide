/**
 * <FeaturedJinryeong> — Sprint V4 P3.D.
 * source/godkkabi-guide/index.html `.featured-jinryeong` 이식 +
 * V2 inline FeaturedJinryeong (app/jinryeong/page.tsx) 통합 추출.
 *
 * 디자인:
 *  - jade tint + bronze tint 듀얼 그라데이션 (rgba(126,182,168,0.06) → rgba(200,153,104,0.04))
 *  - 720px 이상에서 280px (이미지) + 1fr (본문) 2-col layout
 *  - 그 미만에서 단일 column (이미지 16:9)
 *  - hover 시 이미지 scale(1.03) — group-hover로 전이
 *
 * Server Component — 이벤트 핸들러 없음.
 * Lightbox zoom 등의 인터랙션은 부모에서 별도 client 래퍼로 처리.
 *
 * 출처:
 *  - source CSS 784-822
 *  - docs/sprint/06-sprint-v4/MASTER-PLAN.md §5.4.4
 */
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import {
  FACTION_LABEL,
  RARITY_LABEL,
  ROLE_LABEL,
  type WikiJinryeongDoc,
} from '@/types/wiki';
import { cn } from '@/lib/utils';

type WikiJinryeongData = Omit<WikiJinryeongDoc, 'updatedAt'>;

export interface FeaturedJinryeongProps {
  readonly data: WikiJinryeongData;
  /** 라벨 (예: "Featured · 모든 직업 공통 핵심") */
  readonly eyebrow?: string;
  /** feature 레이어 슬롯 (BookmarkButton 등) */
  readonly bookmarkSlot?: React.ReactNode;
  readonly className?: string;
}

export function FeaturedJinryeong({
  data,
  eyebrow = 'Featured · 모든 직업 공통 핵심',
  bookmarkSlot,
  className,
}: FeaturedJinryeongProps): React.JSX.Element {
  return (
    <section
      aria-labelledby={`featured-${data.id}`}
      className={cn(
        'group grid overflow-hidden rounded-[14px] border backdrop-blur-[10px]',
        'border-jade/20',
        '[background:linear-gradient(135deg,rgba(126,182,168,0.06)_0%,rgba(200,153,104,0.04)_100%)]',
        'grid-cols-1 md:grid-cols-[280px_1fr]',
        className,
      )}
    >
      {data.imageUrl ? (
        <div className="aspect-[16/9] overflow-hidden bg-ink-elev md:aspect-auto md:min-h-[180px]">
          <Image
            src={data.imageUrl}
            alt={`${data.name} 상세 — ${data.effectShort}`}
            width={560}
            height={320}
            sizes="(max-width: 720px) 100vw, 280px"
            className="h-full w-full object-cover object-[center_28%] transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 p-[18px_22px_20px]">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-bronze-soft">
            {eyebrow}
          </span>
          {bookmarkSlot}
        </div>

        <h3
          id={`featured-${data.id}`}
          className="text-[1.5rem] font-bold tracking-[-0.01em] text-text"
        >
          {data.name}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={data.rarity === 'rare_ssr' ? 'vermilion' : 'bronze'}
            className="text-[0.7rem]"
          >
            {RARITY_LABEL[data.rarity]}
          </Badge>
          <Badge
            variant={FACTION_VARIANT[data.faction]}
            className="text-[0.7rem]"
          >
            {FACTION_LABEL[data.faction]}
          </Badge>
          <Badge variant="outline" className="text-[0.7rem]">
            {ROLE_LABEL[data.role]}
          </Badge>
        </div>

        <p className="text-sm leading-[1.75] text-text-soft">{data.effectLong}</p>

        {data.recommendedFor.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.recommendedFor.map((r) => (
              <Badge key={r} variant="bronze" className="text-[0.7rem]">
                {r}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

const FACTION_VARIANT: Record<
  WikiJinryeongData['faction'],
  'indigo' | 'jade' | 'bronze'
> = {
  sin: 'indigo',
  yo: 'jade',
  in: 'bronze',
};
