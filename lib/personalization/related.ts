/**
 * Related items 매핑 — Sprint V7 P3.B.
 *
 * 직업 → 추천 진령 / 진령 → 추천 직업 cross-reference 빌더.
 * WIKI seed의 recommendedJinryeong / recommendedClasses를 RelatedItem[]으로 변환.
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §3
 */
import 'server-only';

import { WIKI_JINRYEONG_SEED } from '@/data/wiki/jinryeong';
import { WIKI_CLASSES_SEED } from '@/data/wiki/classes';
import type { RelatedItem } from '@/components/domain/related-items';
import type { WikiClassDoc, WikiJinryeongDoc } from '@/types/wiki';

const CLASS_NAME_LABEL: Record<WikiClassDoc['id'], string> = {
  warrior: '전사',
  swordsman: '검객',
  medium: '영매',
};

/**
 * 직업의 recommendedJinryeong (한국어 이름 배열) → RelatedItem[].
 * 시드에 없는 이름은 그대로 라벨만 표시 (href는 /jinryeong 본 페이지로 fallback).
 */
export function buildRelatedJinryeongForClass(
  classDoc: Omit<WikiClassDoc, 'updatedAt'>,
): readonly RelatedItem[] {
  const recommendedNames = classDoc.recommendedJinryeong ?? [];
  return recommendedNames.map((name) => {
    const match = WIKI_JINRYEONG_SEED.find((j) => j.name === name);
    return {
      href: match ? `/jinryeong#${match.id}` : '/jinryeong',
      label: name,
      ...(match?.effectShort ? { note: match.effectShort } : {}),
    } as RelatedItem;
  });
}

/**
 * 진령의 recommendedClasses (id 배열) → RelatedItem[].
 */
export function buildRelatedClassesForJinryeong(
  jinryeong: Omit<WikiJinryeongDoc, 'updatedAt'>,
): readonly RelatedItem[] {
  const recommendedIds = jinryeong.recommendedClasses ?? [];
  return recommendedIds.map((id) => {
    const match = WIKI_CLASSES_SEED.find((c) => c.id === id);
    return {
      href: `/class#${id}`,
      label: CLASS_NAME_LABEL[id] ?? id,
      ...(match?.tagline ? { note: match.tagline } : {}),
    } as RelatedItem;
  });
}
