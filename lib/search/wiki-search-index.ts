/**
 * 사이트 통합 검색 인덱스 — Sprint V6 P3.A.
 *
 * 빌드 시점에 7 카테고리 (직업/진령/스킬/장비/콘텐츠/팁/문파) 시드 데이터를
 * 합쳐서 ~100여 항목의 정적 검색 인덱스를 만든다. 외부 검색 서비스 없이
 * 클라이언트가 한 번에 받아서 메모리에서 substring 매칭.
 *
 * 구조:
 *   { id, type, title, description, href, emoji?, tokens[] }
 *
 * 매칭:
 *   - 정규화: lowercase + NFC + whitespace collapse
 *   - title/description/tokens substring 어디든 hit이면 결과 포함
 *   - title hit이 우선 (score 가중치)
 *
 * 출처: docs/sprint/08-sprint-v6/MASTER-PLAN.md §2
 */
import { WIKI_CLASSES_SEED } from '@/data/wiki/classes';
import { WIKI_JINRYEONG_SEED } from '@/data/wiki/jinryeong';
import { WIKI_SKILLS_SEED } from '@/data/wiki/skills';
import { WIKI_EQUIPMENT_SEED } from '@/data/wiki/equipment';
import { WIKI_CONTENTS_SEED } from '@/data/wiki/contents';
import { WIKI_TIPS_SEED } from '@/data/wiki/tips';
import { WIKI_MUNPA_GUIDE_SEED } from '@/data/wiki/munpa-guide';

export type SearchEntryType =
  | 'class'
  | 'jinryeong'
  | 'skill'
  | 'equipment'
  | 'content'
  | 'tip'
  | 'munpa';

export interface SearchEntry {
  readonly id: string;
  readonly type: SearchEntryType;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly emoji?: string;
  /** 사전 정규화된 검색용 토큰 (lowercase + NFC) */
  readonly tokens: readonly string[];
}

export const SEARCH_TYPE_LABEL: Record<SearchEntryType, string> = {
  class: '직업',
  jinryeong: '진령',
  skill: '스킬',
  equipment: '장비',
  content: '콘텐츠',
  tip: '실전 팁',
  munpa: '문파',
};

export const SEARCH_TYPE_VARIANT: Record<
  SearchEntryType,
  'bronze' | 'jade' | 'vermilion' | 'indigo'
> = {
  class: 'bronze',
  jinryeong: 'indigo',
  skill: 'bronze',
  equipment: 'jade',
  content: 'vermilion',
  tip: 'jade',
  munpa: 'jade',
};

/** 정규화: lowercase + NFC + whitespace collapse */
export function normalizeQuery(s: string): string {
  return s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * 인덱스 한 entry 생성 — title/description/추가 키워드 모두 tokens에 합산.
 * 모든 항목은 lowercase + NFC 후 substring 매칭에 사용.
 */
function makeEntry(args: {
  id: string;
  type: SearchEntryType;
  title: string;
  description: string;
  href: string;
  emoji?: string;
  extraTokens?: readonly string[];
}): SearchEntry {
  const tokens: string[] = [
    normalizeQuery(args.title),
    normalizeQuery(args.description),
    ...(args.extraTokens ?? []).map(normalizeQuery),
  ].filter((t) => t.length > 0);
  return {
    id: args.id,
    type: args.type,
    title: args.title,
    description: args.description,
    href: args.href,
    ...(args.emoji !== undefined ? { emoji: args.emoji } : {}),
    tokens,
  };
}

let cachedIndex: readonly SearchEntry[] | null = null;

/**
 * 빌드 시 한 번 만들고 module-level 캐시.
 * 7 카테고리 → 단일 배열로 평탄화.
 */
export function getSearchIndex(): readonly SearchEntry[] {
  if (cachedIndex) return cachedIndex;

  const entries: SearchEntry[] = [];

  // 직업 3종
  for (const c of WIKI_CLASSES_SEED) {
    entries.push(
      makeEntry({
        id: `class-${c.id}`,
        type: 'class',
        title: `${c.name} · ${c.subName}`,
        description: c.summary,
        href: `/class#${c.id}`,
        emoji: c.emoji,
        extraTokens: [c.tagline, c.subName],
      }),
    );
  }

  // 진령 11종
  for (const j of WIKI_JINRYEONG_SEED) {
    entries.push(
      makeEntry({
        id: `jinryeong-${j.id}`,
        type: 'jinryeong',
        title: j.name,
        description: j.effectShort,
        href: `/jinryeong#${j.id}`,
        extraTokens: [j.effectLong, ...j.recommendedFor],
      }),
    );
  }

  // 스킬 ~31종
  for (const s of WIKI_SKILLS_SEED) {
    entries.push(
      makeEntry({
        id: `skill-${s.id}`,
        type: 'skill',
        title: s.name,
        description: s.description,
        href: `/skill#${s.id}`,
        extraTokens: [s.kind, s.classId],
      }),
    );
  }

  // 장비 ~12종
  for (const e of WIKI_EQUIPMENT_SEED) {
    entries.push(
      makeEntry({
        id: `equipment-${e.id}`,
        type: 'equipment',
        title: e.name,
        description: e.summary,
        href: `/equipment#${e.id}`,
        extraTokens: e.description ? [e.description, e.topic] : [e.topic],
      }),
    );
  }

  // 콘텐츠 ~22종
  for (const c of WIKI_CONTENTS_SEED) {
    entries.push(
      makeEntry({
        id: `content-${c.id}`,
        type: 'content',
        title: c.name,
        description: c.summary,
        href: `/content#${c.id}`,
        extraTokens: c.description ? [c.description, c.kind] : [c.kind],
      }),
    );
  }

  // 팁 ~12종
  for (const t of WIKI_TIPS_SEED) {
    entries.push(
      makeEntry({
        id: `tip-${t.id}`,
        type: 'tip',
        title: t.title,
        description: t.content,
        href: `/tips#${t.id}`,
        extraTokens: [t.category],
      }),
    );
  }

  // 문파 ~12종 (WikiMunpaGuideDoc은 title/summary 사용)
  for (const m of WIKI_MUNPA_GUIDE_SEED) {
    entries.push(
      makeEntry({
        id: `munpa-${m.id}`,
        type: 'munpa',
        title: m.title,
        description: m.summary,
        href: `/munpa#${m.id}`,
        extraTokens: [m.category, ...(m.bullets ?? [])],
      }),
    );
  }

  cachedIndex = entries;
  return cachedIndex;
}

/**
 * 클라이언트가 메모리에서 호출하는 매칭 함수.
 * 빈 query → 빈 결과 (전체 노출은 의도적 회피).
 * 점수: title prefix 매치 > title contains > description contains > tokens contains
 */
export interface SearchHit {
  readonly entry: SearchEntry;
  readonly score: number;
}

export function searchIndex(
  index: readonly SearchEntry[],
  rawQuery: string,
  limit = 40,
): readonly SearchHit[] {
  const q = normalizeQuery(rawQuery);
  if (q.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const entry of index) {
    const titleNorm = normalizeQuery(entry.title);
    const descNorm = normalizeQuery(entry.description);

    let score = 0;
    if (titleNorm.startsWith(q)) score = 100;
    else if (titleNorm.includes(q)) score = 70;
    else if (descNorm.includes(q)) score = 40;
    else if (entry.tokens.some((t) => t.includes(q))) score = 20;

    if (score > 0) {
      hits.push({ entry, score });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}
