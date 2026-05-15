/**
 * 리액션 (좋아요) 도메인 타입 — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/firestore-schema-v1.md §1.3
 *
 * 정책:
 *  - 본인 게시물/댓글 좋아요 금지 (Server Action에서 검증)
 *  - 1인 1회 토글 (uid deterministic document)
 *  - 카운트는 denormalize (posts.likeCount / comments.likeCount)
 *  - 현재 type='like'만 지원. 향후 reaction 다양화 가능.
 */

export type ReactionType = 'like';

export type ReactionTargetType = 'post' | 'comment';

/** Firestore subcollection 경로:
 *   posts/{postId}/reactions/{uid}
 *   posts/{postId}/comments/{commentId}/reactions/{uid}
 */
export interface ReactionDoc {
  readonly uid: string;
  readonly type: ReactionType;
  readonly createdAtMs: number;
}

export interface ReactionToggleInput {
  readonly targetType: ReactionTargetType;
  readonly targetId: string;
  /** comment의 경우 부모 postId 필수 */
  readonly postId?: string;
}

export interface ReactionToggleResult {
  readonly ok: boolean;
  /** 토글 후 좋아요 상태 (true=ON, false=OFF) */
  readonly isLiked?: boolean;
  /** 토글 후 likeCount (denormalize 결과) */
  readonly likeCount?: number;
  readonly error?:
    | 'UNAUTHENTICATED'
    | 'NOT_REGISTERED'
    | 'SELF_REACTION'
    | 'TARGET_NOT_FOUND'
    | 'ADMIN_NOT_CONFIGURED'
    | 'INTERNAL';
  readonly message?: string;
}
