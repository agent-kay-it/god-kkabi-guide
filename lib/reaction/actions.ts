/**
 * 리액션 (좋아요) Server Actions — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.3
 *      + types/reaction.ts
 *
 * 정책:
 *  - 본인 게시물/댓글 좋아요 금지
 *  - 1인 1회 toggle (uid deterministic — reactions/{uid} 문서)
 *  - likeCount denormalize (posts.likeCount / comments.likeCount)
 *  - idempotent: 같은 사용자가 ON → OFF → ON 안전
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth/auth';
import {
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import type {
  ReactionToggleInput,
  ReactionToggleResult,
} from '@/types/reaction';

export async function toggleReaction(
  input: ReactionToggleInput,
): Promise<ReactionToggleResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'UNAUTHENTICATED' };
  if (!session.user.registered) return { ok: false, error: 'NOT_REGISTERED' };
  if (!hasAdminCredentials()) return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };

  try {
    const db = getAdminFirestore();
    const targetRef =
      input.targetType === 'post'
        ? db.collection('posts').doc(input.targetId)
        : db
            .collection('posts')
            .doc(input.postId!) // comment의 경우 postId 필수 — Zod에서 보장
            .collection('comments')
            .doc(input.targetId);
    const reactionRef = targetRef.collection('reactions').doc(uid);

    let isLiked = false;
    let likeCount = 0;

    await db.runTransaction(async (tx) => {
      const [targetSnap, reactionSnap] = await Promise.all([
        tx.get(targetRef),
        tx.get(reactionRef),
      ]);
      if (!targetSnap.exists) throw new Error('TARGET_NOT_FOUND');

      const targetData = targetSnap.data() as { authorUid: string; likeCount?: number };
      if (targetData.authorUid === uid) throw new Error('SELF_REACTION');

      const currentCount = targetData.likeCount ?? 0;
      const wasLiked = reactionSnap.exists;
      isLiked = !wasLiked;

      if (wasLiked) {
        tx.delete(reactionRef);
        tx.update(targetRef, {
          likeCount: FieldValue.increment(-1),
          updatedAt: FieldValue.serverTimestamp(),
        });
        likeCount = Math.max(0, currentCount - 1);
      } else {
        tx.set(reactionRef, {
          uid,
          type: 'like',
          createdAt: FieldValue.serverTimestamp(),
        });
        tx.update(targetRef, {
          likeCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
        likeCount = currentCount + 1;
      }
    });

    if (input.targetType === 'post') {
      revalidatePath(`/post/${input.targetId}`);
    } else {
      revalidatePath(`/post/${input.postId}`);
    }

    return { ok: true, isLiked, likeCount };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg === 'TARGET_NOT_FOUND') return { ok: false, error: 'TARGET_NOT_FOUND' };
    if (msg === 'SELF_REACTION') return { ok: false, error: 'SELF_REACTION' };
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

/**
 * 본인의 좋아요 상태를 일괄 조회 (게시물 리스트/상세 페이지 초기 렌더용).
 * targetIds 길이 ≤ 30 권장 (Firestore in 쿼리 한계).
 */
export async function getMyReactionsForPosts(
  postIds: readonly string[],
): Promise<ReadonlyMap<string, boolean>> {
  const session = await auth();
  const uid = session?.user?.id;
  const result = new Map<string, boolean>();
  if (!uid || !hasAdminCredentials() || postIds.length === 0) return result;
  try {
    const db = getAdminFirestore();
    const promises = postIds.slice(0, 30).map((postId) =>
      db.collection('posts').doc(postId).collection('reactions').doc(uid).get(),
    );
    const snaps = await Promise.all(promises);
    snaps.forEach((snap, i) => {
      result.set(postIds[i]!, snap.exists);
    });
    return result;
  } catch {
    return result;
  }
}

/**
 * 본인의 댓글 좋아요 상태를 일괄 조회 (게시물 상세 페이지 댓글 트리 초기 렌더용).
 * Sprint V1 — Phase 5 Act (GAP-M1).
 *
 * commentIds 길이 ≤ 30 권장. 각 댓글의 reactions/{uid} 문서 존재 여부로 판정.
 */
export async function getMyReactionsForComments(
  postId: string,
  commentIds: readonly string[],
): Promise<ReadonlyMap<string, boolean>> {
  const session = await auth();
  const uid = session?.user?.id;
  const result = new Map<string, boolean>();
  if (!uid || !hasAdminCredentials() || commentIds.length === 0) return result;
  try {
    const db = getAdminFirestore();
    const promises = commentIds.slice(0, 30).map((commentId) =>
      db
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .doc(commentId)
        .collection('reactions')
        .doc(uid)
        .get(),
    );
    const snaps = await Promise.all(promises);
    snaps.forEach((snap, i) => {
      result.set(commentIds[i]!, snap.exists);
    });
    return result;
  } catch {
    return result;
  }
}
