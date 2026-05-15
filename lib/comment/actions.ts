/**
 * 댓글 Server Actions — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.2
 *      + types/comment.ts COMMENT_LIMITS
 *
 * 정책:
 *  - depth 2 강제 (parentCommentId의 부모가 non-null이면 reject)
 *  - 본문 1-500자
 *  - 수정: 5분 내 본인만
 *  - 삭제: 본인 또는 admin
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth/auth';
import {
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import { COMMENT_LIMITS, type CommentDoc } from '@/types/comment';

const CommentInputSchema = z
  .object({
    body: z
      .string()
      .trim()
      .min(COMMENT_LIMITS.body.min, '댓글을 입력해주세요')
      .max(COMMENT_LIMITS.body.max, `댓글은 최대 ${COMMENT_LIMITS.body.max}자`),
    parentCommentId: z.string().nullable(),
  })
  .strict();

export type CommentActionResult =
  | { ok: true; commentId?: string }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'BANNED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'DEPTH_EXCEEDED'
        | 'EDIT_WINDOW_EXPIRED'
        | 'VALIDATION_FAILED'
        | 'ADMIN_NOT_CONFIGURED'
        | 'INTERNAL';
      message?: string;
    };

async function requireUnbannedUser(): Promise<
  | { ok: true; uid: string; nickname: string; classId?: 'warrior' | 'swordsman' | 'medium' }
  | { ok: false; result: CommentActionResult }
> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, result: { ok: false, error: 'UNAUTHENTICATED' } };
  if (!session.user.registered) {
    return { ok: false, result: { ok: false, error: 'NOT_REGISTERED' } };
  }
  if (session.user.role === 'banned') {
    return { ok: false, result: { ok: false, error: 'BANNED' } };
  }
  if (!hasAdminCredentials()) {
    return { ok: false, result: { ok: false, error: 'ADMIN_NOT_CONFIGURED' } };
  }
  const nickname = session.user.nickname ?? '';
  if (!nickname) return { ok: false, result: { ok: false, error: 'NOT_REGISTERED' } };
  return {
    ok: true,
    uid,
    nickname,
    ...(session.user.classId
      ? { classId: session.user.classId as 'warrior' | 'swordsman' | 'medium' }
      : {}),
  };
}

export async function createComment(
  postId: string,
  raw: unknown,
): Promise<CommentActionResult> {
  const guard = await requireUnbannedUser();
  if (!guard.ok) return guard.result;

  const parsed = CommentInputSchema.safeParse(raw);
  if (!parsed.success) {
    const firstMessage = parsed.error.issues[0]?.message;
    return {
      ok: false,
      error: 'VALIDATION_FAILED',
      ...(firstMessage ? { message: firstMessage } : {}),
    };
  }
  const input = parsed.data;

  try {
    const db = getAdminFirestore();
    const postRef = db.collection('posts').doc(postId);
    const commentsRef = postRef.collection('comments');
    const commentRef = commentsRef.doc();

    await db.runTransaction(async (tx) => {
      const postSnap = await tx.get(postRef);
      if (!postSnap.exists) throw new Error('NOT_FOUND');
      const postData = postSnap.data() as { status?: string };
      if (postData.status === 'deleted' || postData.status === 'hidden_auto') {
        throw new Error('NOT_FOUND');
      }

      // depth 2 강제 — parent의 부모가 non-null이면 reject
      if (input.parentCommentId) {
        const parentSnap = await tx.get(commentsRef.doc(input.parentCommentId));
        if (!parentSnap.exists) throw new Error('NOT_FOUND');
        const parentData = parentSnap.data() as { parentCommentId?: string | null };
        if (parentData.parentCommentId) throw new Error('DEPTH_EXCEEDED');
      }

      const now = FieldValue.serverTimestamp();
      tx.set(commentRef, {
        id: commentRef.id,
        postId,
        authorUid: guard.uid,
        authorNickname: guard.nickname,
        ...(guard.classId ? { authorClassId: guard.classId } : {}),
        body: input.body,
        parentCommentId: input.parentCommentId,
        likeCount: 0,
        reportedCount: 0,
        hidden: false,
        keptByOperator: false,
        deletedByOperator: false,
        createdAt: now,
        updatedAt: now,
      });

      tx.update(postRef, {
        commentCount: FieldValue.increment(1),
        updatedAt: now,
      });
    });

    revalidatePath(`/post/${postId}`);
    return { ok: true, commentId: commentRef.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg === 'NOT_FOUND') return { ok: false, error: 'NOT_FOUND' };
    if (msg === 'DEPTH_EXCEEDED') return { ok: false, error: 'DEPTH_EXCEEDED' };
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

export async function updateComment(
  postId: string,
  commentId: string,
  body: string,
): Promise<CommentActionResult> {
  const guard = await requireUnbannedUser();
  if (!guard.ok) return guard.result;

  const trimmed = body.trim();
  if (trimmed.length < COMMENT_LIMITS.body.min || trimmed.length > COMMENT_LIMITS.body.max) {
    return { ok: false, error: 'VALIDATION_FAILED' };
  }

  try {
    const db = getAdminFirestore();
    const commentRef = db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .doc(commentId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(commentRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      const data = snap.data() as CommentDoc & {
        createdAt?: { toMillis(): number };
      };
      if (data.authorUid !== guard.uid) throw new Error('FORBIDDEN');
      const createdAtMs = data.createdAt?.toMillis() ?? 0;
      if (Date.now() - createdAtMs > COMMENT_LIMITS.editWindowMs) {
        throw new Error('EDIT_WINDOW_EXPIRED');
      }
      tx.update(commentRef, {
        body: trimmed,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    revalidatePath(`/post/${postId}`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg === 'NOT_FOUND') return { ok: false, error: 'NOT_FOUND' };
    if (msg === 'FORBIDDEN') return { ok: false, error: 'FORBIDDEN' };
    if (msg === 'EDIT_WINDOW_EXPIRED') return { ok: false, error: 'EDIT_WINDOW_EXPIRED' };
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<CommentActionResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'UNAUTHENTICATED' };
  if (!hasAdminCredentials()) {
    return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };
  }
  const isAdmin = session.user.role === 'admin';

  try {
    const db = getAdminFirestore();
    const postRef = db.collection('posts').doc(postId);
    const commentRef = postRef.collection('comments').doc(commentId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(commentRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      const data = snap.data() as { authorUid: string };
      if (!isAdmin && data.authorUid !== uid) throw new Error('FORBIDDEN');

      tx.update(commentRef, {
        deletedByOperator: isAdmin && data.authorUid !== uid,
        body: '[삭제된 댓글]',
        hidden: true,
        updatedAt: FieldValue.serverTimestamp(),
      });
      tx.update(postRef, {
        commentCount: FieldValue.increment(-1),
      });
    });

    if (isAdmin) {
      await db.collection('moderation_logs').add({
        actorUid: uid,
        action: 'comment_delete_by_admin',
        targetUid: '',
        metadata: { postId, commentId },
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    revalidatePath(`/post/${postId}`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg === 'NOT_FOUND') return { ok: false, error: 'NOT_FOUND' };
    if (msg === 'FORBIDDEN') return { ok: false, error: 'FORBIDDEN' };
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

/**
 * 게시물 상세 페이지에서 댓글 목록 조회 (Server Component).
 * 부모-자식 정렬 + hidden 필터.
 */
export async function listComments(
  postId: string,
  viewerIsAdmin: boolean,
): Promise<readonly CommentDoc[]> {
  if (!hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .limit(500) // V1 MVP — 페이지네이션 V2
      .get();
    return snap.docs
      .map((d) => {
        const data = d.data() as Omit<CommentDoc, 'createdAtMs' | 'updatedAtMs'> & {
          createdAt?: { toMillis(): number };
          updatedAt?: { toMillis(): number };
        };
        return {
          id: data.id,
          postId: data.postId,
          authorUid: data.authorUid,
          authorNickname: data.authorNickname,
          ...(data.authorClassId ? { authorClassId: data.authorClassId } : {}),
          body: data.body,
          parentCommentId: data.parentCommentId ?? null,
          likeCount: data.likeCount ?? 0,
          reportedCount: data.reportedCount ?? 0,
          hidden: Boolean(data.hidden),
          keptByOperator: Boolean(data.keptByOperator),
          deletedByOperator: Boolean(data.deletedByOperator),
          createdAtMs: data.createdAt?.toMillis() ?? 0,
          updatedAtMs: data.updatedAt?.toMillis() ?? 0,
        } as CommentDoc;
      })
      .filter((c) => viewerIsAdmin || !c.hidden || c.keptByOperator);
  } catch {
    return [];
  }
}
