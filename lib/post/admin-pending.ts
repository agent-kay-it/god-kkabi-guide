/**
 * Admin pending edit 큐 — Sprint V2 P3.A (GAP-M3).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §0 (carry-over GAP-M3)
 *      + docs/sprint/04-sprint-v1/prd.md §3.1.3 (운영자 승인 큐 요구사항)
 *
 * 책임:
 *  - 24시간 이후 본인 수정한 게시물 (status='pending_edit') 운영자 검토 워크플로
 *  - approve: pendingEdit payload → body로 적용 + audit log
 *  - reject: pendingEdit 폐기 + audit log
 *  - 모든 액션은 admin role 필수
 *
 * 데이터 흐름:
 *  운영자 list → diff view → approve/reject → Firestore update + audit log + revalidate
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import type { PostDoc, PostListItem } from '@/types/post';

export interface PendingEditDoc {
  readonly title: string;
  readonly body: string;
  readonly bodyExcerpt: string;
  readonly tags: readonly string[];
  readonly imageUrls: readonly string[];
  readonly requestedAt?: { toMillis(): number };
}

export interface PendingPostListItem extends PostListItem {
  readonly pendingEdit: PendingEditDoc;
  readonly pendingEditRequestedAtMs: number;
}

export type AdminPendingResult =
  | { ok: true; postId?: string }
  | { ok: false; error: 'FORBIDDEN' | 'NOT_FOUND' | 'NOT_PENDING' | 'INTERNAL' | 'ADMIN_NOT_CONFIGURED'; message?: string };

async function requireAdminGuard(): Promise<
  | { ok: true; uid: string }
  | { ok: false; result: AdminPendingResult }
> {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return { ok: false, result: { ok: false, error: 'FORBIDDEN' } };
  }
  if (!hasAdminCredentials()) {
    return { ok: false, result: { ok: false, error: 'ADMIN_NOT_CONFIGURED' } };
  }
  return { ok: true, uid: session.user.id ?? 'admin' };
}

/**
 * pending_edit 상태 게시물 목록 (운영자 큐).
 * pendingEdit.requestedAt desc 정렬.
 */
export async function listPendingPosts(): Promise<readonly PendingPostListItem[]> {
  const guard = await requireAdminGuard();
  if (!guard.ok) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('posts')
      .where('status', '==', 'pending_edit')
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .get();
    return snap.docs.map((d) => {
      const data = d.data() as PostDoc & {
        pendingEdit?: PendingEditDoc;
        createdAt?: { toMillis(): number };
        updatedAt?: { toMillis(): number };
      };
      const pending = data.pendingEdit ?? {
        title: data.title,
        body: data.body,
        bodyExcerpt: data.bodyExcerpt,
        tags: data.tags,
        imageUrls: data.imageUrls,
      };
      return {
        id: data.id,
        authorUid: data.authorUid,
        authorNickname: data.authorNickname,
        ...(data.authorClassId ? { authorClassId: data.authorClassId } : {}),
        category: data.category,
        title: data.title,
        bodyExcerpt: data.bodyExcerpt,
        tags: data.tags,
        imageUrls: data.imageUrls,
        status: data.status,
        viewCount: data.viewCount,
        likeCount: data.likeCount,
        commentCount: data.commentCount,
        reportedCount: data.reportedCount,
        createdAtMs: data.createdAt?.toMillis() ?? 0,
        updatedAtMs: data.updatedAt?.toMillis() ?? 0,
        pendingEdit: pending,
        pendingEditRequestedAtMs: pending.requestedAt?.toMillis() ?? 0,
      } as PendingPostListItem;
    });
  } catch (err) {
    console.error('[lib/post/admin-pending] listPendingPosts:', err);
    return [];
  }
}

/**
 * pending edit 승인 — pendingEdit payload → body로 적용 + audit log.
 */
export async function approvePendingEdit(
  postId: string,
  reason?: string,
): Promise<AdminPendingResult> {
  const guard = await requireAdminGuard();
  if (!guard.ok) return guard.result;
  try {
    const db = getAdminFirestore();
    const postRef = db.collection('posts').doc(postId);
    const auditRef = db.collection('post_edit_audits').doc();

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(postRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      const data = snap.data() as PostDoc & { pendingEdit?: PendingEditDoc };
      if (data.status !== 'pending_edit' || !data.pendingEdit) throw new Error('NOT_PENDING');

      const now = FieldValue.serverTimestamp();
      const pending = data.pendingEdit;
      tx.update(postRef, {
        title: pending.title,
        body: pending.body,
        bodyExcerpt: pending.bodyExcerpt,
        tags: pending.tags,
        imageUrls: pending.imageUrls,
        status: 'published',
        pendingEdit: FieldValue.delete(),
        updatedAt: now,
      });
      tx.set(auditRef, {
        id: auditRef.id,
        postId,
        action: 'approve',
        adminUid: guard.uid,
        ...(reason ? { reason } : {}),
        beforeBody: data.body,
        afterBody: pending.body,
        timestamp: now,
      });
    });

    revalidatePath(`/post/${postId}`);
    revalidatePath('/admin/posts/pending');
    revalidatePath('/me/posts');
    return { ok: true, postId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'INTERNAL';
    if (msg === 'NOT_FOUND') return { ok: false, error: 'NOT_FOUND' };
    if (msg === 'NOT_PENDING') return { ok: false, error: 'NOT_PENDING' };
    console.error('[lib/post/admin-pending] approvePendingEdit:', err);
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

/**
 * pending edit 거절 — pendingEdit 폐기 + audit log + status='published' 복원.
 */
export async function rejectPendingEdit(
  postId: string,
  reason: string,
): Promise<AdminPendingResult> {
  if (!reason.trim()) {
    return { ok: false, error: 'INTERNAL', message: 'REASON_REQUIRED' };
  }
  const guard = await requireAdminGuard();
  if (!guard.ok) return guard.result;
  try {
    const db = getAdminFirestore();
    const postRef = db.collection('posts').doc(postId);
    const auditRef = db.collection('post_edit_audits').doc();

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(postRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      const data = snap.data() as PostDoc & { pendingEdit?: PendingEditDoc };
      if (data.status !== 'pending_edit' || !data.pendingEdit) throw new Error('NOT_PENDING');

      const now = FieldValue.serverTimestamp();
      tx.update(postRef, {
        status: 'published',
        pendingEdit: FieldValue.delete(),
        updatedAt: now,
      });
      tx.set(auditRef, {
        id: auditRef.id,
        postId,
        action: 'reject',
        adminUid: guard.uid,
        reason,
        beforeBody: data.body,
        rejectedBody: data.pendingEdit.body,
        timestamp: now,
      });
    });

    revalidatePath(`/post/${postId}`);
    revalidatePath('/admin/posts/pending');
    revalidatePath('/me/posts');
    return { ok: true, postId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'INTERNAL';
    if (msg === 'NOT_FOUND') return { ok: false, error: 'NOT_FOUND' };
    if (msg === 'NOT_PENDING') return { ok: false, error: 'NOT_PENDING' };
    console.error('[lib/post/admin-pending] rejectPendingEdit:', err);
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}
