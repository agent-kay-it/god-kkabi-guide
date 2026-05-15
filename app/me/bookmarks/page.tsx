/**
 * /me/bookmarks — 본인 북마크 모음 페이지.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.6
 *
 * 보호: proxy.ts authorized에서 /me/* 미로그인 거부.
 */
import type { Metadata } from 'next';

import { listMyBookmarks } from '@/lib/bookmark/actions';
import { BookmarkList } from '@/components/feature/bookmark-list';
import {
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '내 북마크',
  description: '내가 저장한 위키 카드와 팁 모음',
  robots: { index: false, follow: false },
};

export default async function BookmarksPage(): Promise<React.JSX.Element> {
  const bookmarks = await listMyBookmarks();

  return (
    <main className="mx-auto max-w-screen-md px-5 pb-20 pt-8 sm:px-6">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>내 정보</HeroMetaBadge>
          <span className="font-mono">{bookmarks.length}개 저장</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Bookmarks" />
          <SectionTitle as="h1">북마크</SectionTitle>
          <SectionLead>
            위키 / 팁 / 게시물을 모아둔 개인 공간. 카테고리별 필터 + 최신/가나다순 정렬.
          </SectionLead>
        </SectionHead>
      </header>

      <BookmarkList initialBookmarks={bookmarks} />
    </main>
  );
}
