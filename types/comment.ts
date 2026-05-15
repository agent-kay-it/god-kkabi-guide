/**
 * 게시물 댓글 도메인 타입 — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/firestore-schema-v1.md §1.2
 *      + design.md §2.1
 *
 * 정책:
 *  - depth 2 강제 (게시물 → 댓글 → 답글). 답글의 답글 금지.
 *  - 본문 1-500자
 *  - 수정: 5분 내 본인만
 *  - 삭제: 본인 / 운영자
 *  - 자동 hidden: reportedCount >= 5
 */

/** Firestore `posts/{postId}/comments/{commentId}` 문서. */
export interface CommentDoc {
  readonly id: string;
  readonly postId: string;
  readonly authorUid: string;
  readonly authorNickname: string;
  readonly authorClassId?: 'warrior' | 'swordsman' | 'medium';
  /** 1-500자 */
  readonly body: string;
  /** null = top-level / non-null = depth 2 답글 (parent comment id) */
  readonly parentCommentId: string | null;
  readonly likeCount: number;
  readonly reportedCount: number;
  /** 자동 hidden (신고 5건 누적) */
  readonly hidden: boolean;
  /** 운영자가 유지 결정한 경우 hidden 우회 */
  readonly keptByOperator: boolean;
  /** 운영자 명시 삭제 */
  readonly deletedByOperator: boolean;
  readonly createdAtMs: number;
  readonly updatedAtMs: number;
}

/** 사용자 입력 (Zod 검증 대상) */
export interface CommentInput {
  readonly body: string;
  /** null = top-level comment / non-null = 답글 */
  readonly parentCommentId: string | null;
}

/** 트리 구조 표시용 — children은 depth 2만 */
export interface CommentNode {
  readonly comment: CommentDoc;
  readonly children: readonly CommentDoc[];
}

export const COMMENT_LIMITS = {
  body: { min: 1, max: 500 },
  /** 수정 가능 기간 (ms) */
  editWindowMs: 5 * 60 * 1000,
  /** 자동 hidden 신고 누적 */
  autoHideThreshold: 5,
} as const;
