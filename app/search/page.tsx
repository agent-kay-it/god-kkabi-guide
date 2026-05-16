/**
 * /search — 사이트 통합 검색.
 * Sprint V6 P3.A.
 *
 * Server Component:
 *  - lib/search/wiki-search-index.getSearchIndex()로 ~100여 항목 인덱스 build-time 생성
 *  - 정적 JSON으로 직렬화 → SearchResults client 컴포넌트에 props 전달
 *
 * Client (SearchResults):
 *  - debounced input → searchIndex() 메모리 매칭
 *  - 카테고리별 그룹 + score 정렬
 *  - 빈 query → 인기 카테고리 (정적) 안내
 *
 * 출처: docs/sprint/08-sprint-v6/MASTER-PLAN.md §2
 */
import type { Metadata } from 'next';

import {
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { SearchResults } from '@/components/feature/search-results';
import { getSearchIndex } from '@/lib/search/wiki-search-index';

export const metadata: Metadata = {
  title: '검색',
  description:
    '갓깨비 키우기 가이드 통합 검색. 직업 · 진령 · 스킬 · 장비 · 콘텐츠 · 팁 · 문파 ~100여 항목.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/search' },
};

interface SearchPageProps {
  // Next.js 16: searchParams는 Promise
  readonly searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps): Promise<React.JSX.Element> {
  const { q: initialQuery = '' } = await searchParams;
  const index = getSearchIndex();

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>검색</HeroMetaBadge>
          <span className="font-mono">{index.length}개 항목 색인</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Search" />
          <SectionTitle as="h1">통합 검색</SectionTitle>
          <SectionLead>
            직업 · 진령 · 스킬 · 장비 · 콘텐츠 · 팁 · 문파를 한 곳에서 찾아보세요. 검색어를
            입력하면 카테고리별로 결과가 그룹화됩니다.
          </SectionLead>
        </SectionHead>
      </header>

      <SearchResults index={index} initialQuery={initialQuery} />
    </main>
  );
}
