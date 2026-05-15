/**
 * <SearchResults> — Sprint V6 P3.A.
 *
 * 클라이언트 컴포넌트:
 *  - controlled input (debounce 150ms)
 *  - searchIndex(...) 메모리 매칭
 *  - 카테고리별 그룹 + score 정렬
 *  - URL query (?q=...) sync (replaceState로 history 오염 방지)
 *  - 빈 query → 인기 카테고리 link 안내
 *  - WCAG: input aria-label + role="region" + 결과 개수 라이브 영역
 *
 * Server에서 받은 index는 한 번만 렌더 후 메모리 유지 (refs).
 *
 * 출처: docs/sprint/08-sprint-v6/MASTER-PLAN.md §2
 */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search as SearchIcon, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import {
  SEARCH_TYPE_LABEL,
  SEARCH_TYPE_VARIANT,
  searchIndex,
  type SearchEntry,
  type SearchEntryType,
  type SearchHit,
} from '@/lib/search/wiki-search-index';
import { cn } from '@/lib/utils';

const POPULAR_LINKS: ReadonlyArray<{
  href: string;
  label: string;
  emoji: string;
  type: SearchEntryType;
}> = [
  { href: '/class', label: '직업 3종', emoji: '⚔️', type: 'class' },
  { href: '/jinryeong', label: '진령 11종', emoji: '🔮', type: 'jinryeong' },
  { href: '/skill', label: '스킬 31종', emoji: '✨', type: 'skill' },
  { href: '/equipment', label: '장비 가이드', emoji: '🛡️', type: 'equipment' },
  { href: '/content', label: '콘텐츠 22종', emoji: '🎯', type: 'content' },
  { href: '/tips', label: '실전 팁 12개', emoji: '💡', type: 'tip' },
];

export interface SearchResultsProps {
  readonly index: readonly SearchEntry[];
  readonly initialQuery: string;
}

export function SearchResults({
  index,
  initialQuery,
}: SearchResultsProps): React.JSX.Element {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // debounce 150ms — 키 입력마다 매칭하면 100여 항목이라도 인지 가능한 지연 발생 가능
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 150);
    return () => window.clearTimeout(t);
  }, [query]);

  // URL ?q= sync (replaceState로 history 깔끔)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const current = url.searchParams.get('q') ?? '';
    if (current === debouncedQuery) return;
    if (debouncedQuery.length === 0) {
      url.searchParams.delete('q');
    } else {
      url.searchParams.set('q', debouncedQuery);
    }
    window.history.replaceState(null, '', url.toString());
  }, [debouncedQuery]);

  const hits = useMemo<readonly SearchHit[]>(
    () => searchIndex(index, debouncedQuery),
    [index, debouncedQuery],
  );

  // 카테고리별 그룹 (정렬은 hits 자체 score순 유지)
  const grouped = useMemo(() => {
    const map = new Map<SearchEntryType, SearchHit[]>();
    for (const hit of hits) {
      const arr = map.get(hit.entry.type);
      if (arr) arr.push(hit);
      else map.set(hit.entry.type, [hit]);
    }
    return map;
  }, [hits]);

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="relative">
        <label htmlFor="search-input" className="sr-only">
          검색어 입력
        </label>
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-mute"
        />
        <input
          id="search-input"
          type="search"
          inputMode="search"
          autoFocus
          autoComplete="off"
          placeholder="직업 / 진령 / 스킬 / 콘텐츠 — 키워드를 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="검색어 입력"
          className={cn(
            'w-full rounded-[var(--radius-card)] border border-ink-line-strong bg-ink-elev pl-12 pr-12 py-4 text-base text-text',
            'placeholder:text-text-mute',
            'transition-colors duration-200 ease-out',
            'focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/30',
          )}
        />
        {query.length > 0 ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-mute transition-colors hover:bg-ink-card-strong hover:text-text"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {hasQuery
          ? `${hits.length}개 결과를 찾았습니다.`
          : '검색어를 입력해주세요.'}
      </div>

      {/* Body */}
      {!hasQuery ? (
        <PopularSection />
      ) : hits.length === 0 ? (
        <EmptyHits query={debouncedQuery} />
      ) : (
        <GroupedResults grouped={grouped} totalHits={hits.length} />
      )}
    </div>
  );
}

function PopularSection(): React.JSX.Element {
  return (
    <section aria-labelledby="popular-categories">
      <h2
        id="popular-categories"
        className="mb-4 text-[0.72rem] uppercase tracking-[0.2em] text-text-mute"
      >
        인기 카테고리
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR_LINKS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group block focus-visible:outline-none"
          >
            <GlassCard
              interactive
              className="flex items-center gap-3 p-4 transition-card hover:border-bronze/40"
            >
              <span aria-hidden className="text-2xl">
                {p.emoji}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-text group-hover:text-bronze-soft">
                  {p.label}
                </span>
                <span className="block text-xs text-text-mute">
                  {SEARCH_TYPE_LABEL[p.type]} 카테고리 둘러보기
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-text-mute transition-transform group-hover:translate-x-0.5 group-hover:text-bronze"
              />
            </GlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EmptyHits({ query }: { query: string }): React.JSX.Element {
  return (
    <GlassCard className="p-8 text-center" accent="swordsman">
      <p className="text-base font-semibold text-text">
        &lsquo;{query}&rsquo;에 대한 결과가 없습니다
      </p>
      <p className="mt-2 text-sm text-text-soft">
        다른 키워드를 시도하거나 위 카테고리에서 직접 둘러보세요.
      </p>
    </GlassCard>
  );
}

function GroupedResults({
  grouped,
  totalHits,
}: {
  grouped: Map<SearchEntryType, SearchHit[]>;
  totalHits: number;
}): React.JSX.Element {
  // 표시 순서 — UX: 직업/진령 우선, 그 다음 콘텐츠/스킬
  const order: readonly SearchEntryType[] = [
    'class',
    'jinryeong',
    'skill',
    'equipment',
    'content',
    'tip',
    'munpa',
  ];

  return (
    <div className="space-y-8">
      <div className="text-sm text-text-mute">
        총 <span className="font-mono font-semibold text-bronze-soft">{totalHits}</span>개
        결과
      </div>

      {order.map((type) => {
        const items = grouped.get(type);
        if (!items || items.length === 0) return null;
        return (
          <section key={type} aria-labelledby={`result-${type}`}>
            <div className="mb-3 flex items-baseline gap-2">
              <h2
                id={`result-${type}`}
                className="text-[1.05rem] font-semibold text-text"
              >
                {SEARCH_TYPE_LABEL[type]}
              </h2>
              <span className="font-mono text-xs text-text-mute">
                {items.length}건
              </span>
            </div>
            <ul className="space-y-2" role="list">
              {items.map((hit) => (
                <li key={hit.entry.id}>
                  <ResultRow hit={hit} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ResultRow({ hit }: { hit: SearchHit }): React.JSX.Element {
  const { entry } = hit;
  return (
    <Link
      href={entry.href}
      className="group flex items-start gap-3 rounded-[var(--radius-card)] border border-ink-line bg-ink-elev/40 p-4 transition-card hover:-translate-y-0.5 hover:border-bronze/40 hover:bg-ink-card-strong/70 focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2"
    >
      {entry.emoji ? (
        <span aria-hidden className="text-xl">
          {entry.emoji}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-base font-semibold text-text group-hover:text-bronze-soft">
            {entry.title}
          </span>
          <Badge variant={SEARCH_TYPE_VARIANT[entry.type]} className="text-[0.65rem]">
            {SEARCH_TYPE_LABEL[entry.type]}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-text-soft">{entry.description}</p>
      </div>
      <ArrowRight
        aria-hidden
        className="mt-1 h-4 w-4 shrink-0 text-text-mute transition-transform group-hover:translate-x-0.5 group-hover:text-bronze"
      />
    </Link>
  );
}
