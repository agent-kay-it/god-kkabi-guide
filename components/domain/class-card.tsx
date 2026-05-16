/**
 * <ClassCard> — 직업 1종 상세 카드.
 *
 * V7 P5 (현재): 좌/우 캐릭터 이미지 + 중앙 설명 패널 레이아웃
 *   - 데스크톱: [캐릭터 이미지 | 설명] 또는 [설명 | 캐릭터 이미지] (props.imageOrientation)
 *   - 모바일:   캐릭터 이미지(상) → 설명(하) stack
 *   - 캐릭터 이미지의 카드 쪽 가장자리는 카드 배경색(rgb(15,15,23))으로 fade
 *   - 설명 패널 상단에 직업 아이콘 + 이름 + 부제 + 티어 + 북마크 헤더 통합 (기존 배너 오버레이 → 패널 내부 이동)
 *
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3.4.3 + source line 1352-1456
 */
import Image from 'next/image';
import { Check, X } from 'lucide-react';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { StatCell } from './stat-cell';
import { RelatedItems, type RelatedItem } from './related-items';
import {
  CLASS_ACCENT,
  CLASS_ICON_URL,
  CLASS_CHARACTER_IMAGE_URL,
  type WikiClassDoc,
  type WikiClassId,
} from '@/types/wiki';
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
  /** V7 P5: 좌/우 캐릭터 이미지 배치 — 카드별 alternating으로 부모에서 결정 */
  imageOrientation: 'left' | 'right';
  /** V7 P5: 표시할 캐릭터 성별 — 페이지 새로고침마다 부모에서 랜덤 결정 */
  characterGender: 'male' | 'female';
  /** V7 P5: above-the-fold 첫 카드에 priority 부여 → LCP 최적화 */
  priority?: boolean;
  className?: string;
}

export function ClassCard({
  data,
  stats,
  bookmarkSlot,
  relatedJinryeong,
  imageOrientation,
  characterGender,
  priority = false,
  className,
}: ClassCardProps): React.JSX.Element {
  const accent = CLASS_ACCENT[data.id];
  const characterUrl = CLASS_CHARACTER_IMAGE_URL[data.id as WikiClassId][characterGender];

  // V7 P5 fix: orientation에 따라 grid-cols 자체를 swap — DOM 순서는 [이미지, 설명] 고정이고
  // order로 좌/우 위치만 바꾸므로, 설명이 cell-1로 가는 'right' 케이스에서 cell 폭도 함께 swap해야
  // "설명이 항상 넓고 이미지가 항상 좁은" 비율이 유지됨.
  //   - 'left':  cell-1=1fr(이미지) | cell-2=1.6fr(설명)
  //   - 'right': cell-1=1.6fr(설명) | cell-2=1fr(이미지)
  const gridColsClass =
    imageOrientation === 'left'
      ? 'md:grid-cols-[1fr_1.6fr]'
      : 'md:grid-cols-[1.6fr_1fr]';

  return (
    <GlassCard
      accent={accent}
      className={cn(
        'flex flex-col overflow-hidden md:grid',
        gridColsClass,
        className,
      )}
    >
      <CharacterPanel
        src={characterUrl}
        alt={`${data.name} 캐릭터 (${characterGender === 'male' ? '남' : '여'})`}
        orientation={imageOrientation}
        priority={priority}
      />

      <DescriptionPanel
        data={data}
        orientation={imageOrientation}
        {...(stats !== undefined ? { stats } : {})}
        {...(bookmarkSlot !== undefined ? { bookmarkSlot } : {})}
        {...(relatedJinryeong !== undefined ? { relatedJinryeong } : {})}
      />
    </GlassCard>
  );
}

/**
 * 캐릭터 이미지 패널 — 모바일에서는 항상 상단(DOM 순서), 데스크톱에서 orientation에 따라 좌/우 order.
 *
 * fade 끝 색 결정 (사용자 지적: "경계가 밝게 보여"):
 *   .glass = rgba(22,22,32,0.55) + backdrop-filter blur(12px) saturate(160%) over #07070b
 *   단순 알파 합성: rgb(12,12,18) — 이전 rgb(15,15,23)은 살짝 밝아 fade 끝과 본문 사이 1-2px 밝은 경계
 *   saturate(160%) 푸른빛 보정 후 실제 본문 ≈ rgb(12,12,20)
 *   추가로 마지막 stop 비율을 88→96→100로 부드럽게 + 이미지 div 자체에 bg fallback 깔아
 *   이미지 transparent 영역이 있어도 경계 차이 없도록 함.
 */
function CharacterPanel({
  src,
  alt,
  orientation,
  priority,
}: {
  src: string;
  alt: string;
  orientation: 'left' | 'right';
  priority: boolean;
}): React.JSX.Element {
  // 데스크톱 fade 방향:
  //  - orientation='left'  → 이미지가 좌측, 우측이 카드 본문 쪽으로 fade (90deg)
  //  - orientation='right' → 이미지가 우측, 좌측이 카드 본문 쪽으로 fade (270deg)
  const desktopFadeClass =
    orientation === 'left'
      ? 'bg-[linear-gradient(90deg,transparent_0%,transparent_42%,rgba(12,12,20,0.55)_72%,rgba(12,12,20,0.88)_88%,rgba(12,12,20,0.97)_96%,rgb(12,12,20)_100%)]'
      : 'bg-[linear-gradient(270deg,transparent_0%,transparent_42%,rgba(12,12,20,0.55)_72%,rgba(12,12,20,0.88)_88%,rgba(12,12,20,0.97)_96%,rgb(12,12,20)_100%)]';

  // 모바일은 이미지가 항상 상단 → 하단이 카드 본문 쪽으로 fade
  const mobileFadeClass =
    'bg-[linear-gradient(180deg,transparent_0%,transparent_50%,rgba(12,12,20,0.55)_78%,rgba(12,12,20,0.88)_90%,rgba(12,12,20,0.97)_97%,rgb(12,12,20)_100%)]';

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        // 모바일 전체 (<768px = md 미만): aspect-[3/4] — sm/<sm 일관 적용
        'aspect-[3/4]',
        // 데스크톱 (md+): grid cell 높이 채우기
        'md:aspect-auto md:h-full md:min-h-[520px]',
        // 데스크톱에서 orientation에 따라 grid order
        orientation === 'left' ? 'md:order-1' : 'md:order-2',
      )}
      // 이미지 transparent 영역 + 그라데이션 끝 색 mismatch 방지 — 본문 색과 일치한 bg fallback
      style={{ backgroundColor: 'rgb(12, 12, 20)' }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 40vw"
        priority={priority}
        className="object-cover object-top"
      />
      {/* 모바일 fade (md:hidden) — 이미지 하단이 카드 본문 쪽으로 어두워짐 */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 md:hidden', mobileFadeClass)}
      />
      {/* 데스크톱 fade (hidden md:block) — orientation에 따라 좌/우 fade */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 hidden md:block',
          desktopFadeClass,
        )}
      />
    </div>
  );
}

/**
 * 설명 패널 — 직업 아이콘 + 이름 + 부제 + 티어 + 북마크 헤더 + 요약 + 스탯 + 강점/약점 + 추천 진령.
 * 데스크톱에서 orientation에 따라 grid order 결정.
 */
function DescriptionPanel({
  data,
  stats,
  bookmarkSlot,
  relatedJinryeong,
  orientation,
}: {
  data: WikiClassData;
  stats?: ReadonlyArray<{ label: string; value: string; rate?: string }>;
  bookmarkSlot?: React.ReactNode;
  relatedJinryeong?: readonly RelatedItem[];
  orientation: 'left' | 'right';
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 p-5 sm:p-6',
        // 데스크톱에서 orientation에 따라 order (이미지 left면 설명은 right, 이미지 right면 설명은 left)
        orientation === 'left' ? 'md:order-2' : 'md:order-1',
      )}
    >
      {/* 헤더 — 직업 아이콘 + 이름 + 부제 + 티어 + 북마크 (기존 배너 오버레이를 패널 내부로 이동) */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-end gap-3">
          <span
            aria-hidden
            className="block h-12 w-12 shrink-0 overflow-hidden rounded-[10px] ring-1 ring-bronze/40 sm:h-14 sm:w-14"
          >
            <Image
              src={CLASS_ICON_URL[data.id]}
              alt=""
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          </span>
          <div>
            <h3 className="text-2xl font-bold text-text">
              {data.name}
              <span className="ml-2 text-sm font-normal text-text-mute">· {data.subName}</span>
            </h3>
            <p className="font-mono text-xs uppercase tracking-wider text-bronze-soft">
              {data.tagline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={`tier-${data.tier}` as 'tier-0' | 'tier-1' | 'tier-2' | 'tier-3'}>
            T{data.tier}
          </Badge>
          {bookmarkSlot}
        </div>
      </header>

      <p className="text-sm leading-relaxed text-text-soft">{data.summary}</p>

      {stats && stats.length > 0 ? (
        // V7 P5: 모바일/태블릿(<md, ≤768)은 2x2 유지, 데스크톱(md+)부터 4열.
        // sm 분기(640~768)에서 4열로 가던 이전 동작 제거 — sm도 모바일로 일관 처리.
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
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

      {/* V7 P5: 모바일/태블릿(<md)은 강점→약점 상하 stack(1열),
          데스크톱(md+)부터 좌우 2열. sm 분기 제거 일관 처리. */}
      <div className="grid gap-4 md:grid-cols-2">
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
          <p className="mt-2 text-xs leading-relaxed text-text-soft">{data.jinryeongNote}</p>
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
  );
}
