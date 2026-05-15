/**
 * BuildTag → 시맨틱 색 카테고리 매핑 테이블.
 * 출처: docs/sprint/03-sprint-mvp-v2/component-inventory-v2.md §3.2
 *
 * v1의 BuildTagBadge 컴포넌트가 shadcn Badge로 흡수되면서 enum 매핑만 본 모듈로 분리.
 * 소비처: <Badge variant={getBuildTagVariant(tag)}>{tag}</Badge>
 */
import type { BuildTag } from '@/types';

export type BuildTagBadgeVariant =
  | 'vermilion'
  | 'jade'
  | 'bronze'
  | 'indigo';

/**
 * BuildTag → Badge variant (v2 4-색 시스템).
 *  - pvp / 결투장 = vermilion (전투 콘텐츠)
 *  - pve / boss / 무한던전 / 비경 = jade (콘텐츠 클리어)
 *  - 초보 / 중수 / 고수 = bronze (레벨 라벨)
 *  - meta = bronze (메인 액센트, glow는 컴포넌트 props에서 처리)
 *  - experimental = indigo (실험적/임시)
 */
const BUILD_TAG_VARIANT: Record<BuildTag, BuildTagBadgeVariant> = {
  pvp: 'vermilion',
  pve: 'jade',
  boss: 'jade',
  결투장: 'vermilion',
  무한던전: 'jade',
  비경: 'jade',
  초보: 'bronze',
  중수: 'bronze',
  고수: 'bronze',
  meta: 'bronze',
  experimental: 'indigo',
};

/** BuildTag enum 값을 Badge variant으로 변환. */
export function getBuildTagVariant(tag: BuildTag): BuildTagBadgeVariant {
  return BUILD_TAG_VARIANT[tag];
}

/** meta 태그 여부 (Hero CTA 등에서 glow 효과 적용 판단용). */
export function isMetaTag(tag: BuildTag): boolean {
  return tag === 'meta';
}
