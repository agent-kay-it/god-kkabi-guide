/**
 * <CommentThread> — 댓글 트리 (2-depth).
 * 출처: docs/sprint/04-sprint-v1/design.md §1
 *
 * Clean Architecture:
 *  - 본 컴포넌트는 트리 구조 + 자식 렌더링만 담당
 *  - 좋아요/신고/수정 액션은 부모(`CommentItem` feature)에서 itemRenderer 슬롯으로 주입
 */
import type { CommentDoc, CommentNode } from '@/types/comment';
import { cn } from '@/lib/utils';

export interface CommentThreadProps {
  readonly comments: readonly CommentDoc[];
  /** 부모-자식 트리 렌더 시 각 댓글을 렌더링하는 함수 (feature 슬롯) */
  readonly renderItem: (
    comment: CommentDoc,
    options: { readonly isReply: boolean },
  ) => React.ReactNode;
  readonly className?: string;
}

export function CommentThread({
  comments,
  renderItem,
  className,
}: CommentThreadProps): React.JSX.Element {
  const tree = buildTree(comments);
  if (tree.length === 0) {
    return (
      <div className={cn('rounded-md border border-ink-line p-6 text-center text-sm text-text-mute', className)}>
        첫 댓글을 남겨보세요.
      </div>
    );
  }
  return (
    <ul className={cn('space-y-4', className)} role="list">
      {tree.map((node) => (
        <li key={node.comment.id} className="space-y-3">
          {renderItem(node.comment, { isReply: false })}
          {node.children.length > 0 ? (
            <ul className="space-y-2 border-l border-ink-line pl-4" role="list">
              {node.children.map((reply) => (
                <li key={reply.id}>
                  {renderItem(reply, { isReply: true })}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * 평탄 배열을 부모-자식 2-depth 트리로 변환.
 * top-level (parentCommentId=null) 순서 유지 + 답글은 createdAt asc.
 */
function buildTree(comments: readonly CommentDoc[]): readonly CommentNode[] {
  const tops: CommentDoc[] = [];
  const repliesByParent = new Map<string, CommentDoc[]>();

  for (const c of comments) {
    if (!c.parentCommentId) {
      tops.push(c);
    } else {
      const arr = repliesByParent.get(c.parentCommentId) ?? [];
      arr.push(c);
      repliesByParent.set(c.parentCommentId, arr);
    }
  }

  return tops.map((top) => ({
    comment: top,
    children: (repliesByParent.get(top.id) ?? []).sort(
      (a, b) => a.createdAtMs - b.createdAtMs,
    ),
  }));
}
