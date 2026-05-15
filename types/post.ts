/**
 * 사용자 게시물 도메인 타입 — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/firestore-schema-v1.md §1.1
 *      + design.md §2.1
 *
 * 카테고리 3종:
 *  - build: 빌드 공유 (직업/진령 조합 + 장비 추천)
 *  - guide: 공략 (콘텐츠/이벤트/메커니즘)
 *  - review: 후기 (이벤트 리뷰 / 메타 변화 의견 / 결제 가성비)
 *
 * 정책:
 *  - 본인 24h 내 자유 수정 / 이후 운영자 승인 큐 (pendingEdit field)
 *  - 본인 삭제 즉시 / 운영자 삭제 즉시 (audit log)
 *  - 자동 hidden 임계값 reportedCount >= 5
 */

import type { ReportReason } from './chat';

export type PostCategory = 'build' | 'guide' | 'review';

export const POST_CATEGORY_LABEL: Record<PostCategory, string> = {
  build: '빌드',
  guide: '공략',
  review: '후기',
};

export const POST_CATEGORY_DESCRIPTION: Record<PostCategory, string> = {
  build: '직업·진령 조합 + 장비 추천 빌드 공유',
  guide: '콘텐츠·이벤트·메커니즘 공략',
  review: '이벤트 후기 + 메타 변화 의견 + 결제 가성비',
};

export type PostStatus = 'published' | 'pending_edit' | 'hidden_auto' | 'deleted';

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  published: '게시됨',
  pending_edit: '수정 검토 중',
  hidden_auto: '자동 숨김',
  deleted: '삭제됨',
};

export type PostSort = 'latest' | 'popular' | 'hot';

export const POST_SORT_LABEL: Record<PostSort, string> = {
  latest: '최신순',
  popular: '인기순',
  hot: '핫이슈',
};

/** Firestore `posts/{postId}` 문서. */
export interface PostDoc {
  readonly id: string;
  readonly authorUid: string;
  readonly authorNickname: string;
  readonly authorClassId?: 'warrior' | 'swordsman' | 'medium';
  readonly category: PostCategory;
  /** 4-60자 */
  readonly title: string;
  /** 30-5000자, Markdown lite */
  readonly body: string;
  /** 본문 첫 150자 plain text (리스트 미리보기용) */
  readonly bodyExcerpt: string;
  /** 0-5개 태그 (사전 정의 화이트리스트 — classId / jinryeong_id / content_id) */
  readonly tags: readonly string[];
  /** 0-3개 Firebase Storage URL */
  readonly imageUrls: readonly string[];
  readonly status: PostStatus;
  /** 24h 후 수정 시 운영자 큐 — 통과 시 본문에 적용 */
  readonly pendingEdit?: Partial<Pick<PostDoc, 'title' | 'body' | 'bodyExcerpt' | 'tags' | 'imageUrls'>>;
  readonly viewCount: number;
  readonly likeCount: number;
  readonly commentCount: number;
  readonly reportedCount: number;
  /** 게시 시각 (ms) — 클라이언트 정렬용 */
  readonly createdAtMs: number;
  /** 수정 시각 (ms) */
  readonly updatedAtMs: number;
}

/**
 * 사용자 입력 (Zod 검증 대상).
 * react-hook-form + zodResolver 호환을 위해 mutable array 사용
 * (zod의 z.array(...) 추론 타입은 mutable이다).
 */
export interface PostInput {
  title: string;
  body: string;
  category: PostCategory;
  tags: string[];
  imageUrls: string[];
}

/** 리스트 페이지 표시용 — body 제외 (excerpt만) */
export type PostListItem = Omit<PostDoc, 'body' | 'pendingEdit'>;

/** 필터 — 리스트 쿼리 파라미터 */
export interface PostFilter {
  readonly category?: PostCategory;
  /** 작성자 직업 필터 */
  readonly classId?: 'warrior' | 'swordsman' | 'medium';
  readonly authorUid?: string;
  readonly sort: PostSort;
}

/** 페이지네이션 결과 */
export interface PostListResult {
  readonly items: readonly PostListItem[];
  /** 다음 페이지 cursor (createdAtMs of last item) — null이면 더 이상 없음 */
  readonly nextCursor: number | null;
}

/** Post 신고 입력 (chat과 동일 ReportReason 재사용) */
export interface PostReportInput {
  readonly targetType: 'post' | 'comment';
  readonly targetId: string;
  /** comment의 경우 부모 postId */
  readonly postId: string;
  readonly reportedUid: string;
  readonly reasons: readonly ReportReason[];
  readonly snapshot: string;
  readonly extraText?: string;
}

/** 본문 길이 / 이미지 / 태그 한도 — 클라이언트 + Server 일관 */
export const POST_LIMITS = {
  title: { min: 4, max: 60 },
  body: { min: 30, max: 5000 },
  excerpt: 150,
  tags: { max: 5 },
  images: { max: 3 },
} as const;
