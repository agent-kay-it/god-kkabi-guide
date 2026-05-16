/**
 * 북마크 도메인 타입.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.6 (bookmarks)
 *
 * 북마크 대상:
 *  - 직업 (class), 진령 (jinryeong), 장비/스킬/콘텐츠 (P3.C 추가), Tip (tip)
 *
 * 컬렉션 구조: `bookmarks/{userId}/items/{bookmarkId}` (subcollection)
 *  - bookmarkId = `${targetType}:${targetId}` (예: "jinryeong:seohaeyongwang")
 */
import type { Timestamp } from 'firebase/firestore';

export type BookmarkTargetType =
  | 'class'
  | 'jinryeong'
  | 'tip'
  | 'equipment' // P3.C
  | 'skill' // P3.C
  | 'content' // P3.C
  | 'post'; // V1+

export interface BookmarkDoc {
  id: string; // `${targetType}:${targetId}`
  userId: string;
  targetType: BookmarkTargetType;
  targetId: string;
  title: string; // 표시용 제목 (denormalized)
  href: string; // 클릭 시 이동할 경로
  emoji?: string;
  createdAt: Timestamp;
}

export interface BookmarkSummary {
  id: string;
  targetType: BookmarkTargetType;
  targetId: string;
  title: string;
  href: string;
  emoji?: string;
  createdAtMs: number;
}

export const BOOKMARK_TYPE_LABEL: Record<BookmarkTargetType, string> = {
  class: '직업',
  jinryeong: '진령',
  tip: '팁',
  equipment: '장비',
  skill: '스킬',
  content: '콘텐츠',
  post: '게시물',
};
