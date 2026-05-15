/**
 * 게시물 Server Actions — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.1
 *      + phase-2-design/firestore-schema-v1.md §1.1
 *
 * 보안:
 *  - 'use server' + 'server-only'
 *  - auth() 세션 가드 + registered=true + role!='banned'
 *  - Zod validation + Markdown sanitize (lib/post/markdown.ts)
 *  - 트랜잭션: posts.add + users.postCount++
 *
 * 24h 수정 정책:
 *  - createdAt + 24h 이내: 본인 자유 수정
 *  - 24h 후: 운영자 승인 큐 (pendingEdit field)
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
import { PostInputSchema, POST_FREE_EDIT_WINDOW_MS } from './schema';
import { extractExcerpt } from './markdown';
import { recordReport } from '@/lib/penalty/actions';
import type {
  PostCategory,
  PostDoc,
  PostFilter,
  PostListItem,
  PostListResult,
  PostReportInput,
  PostSort,
} from '@/types/post';
import type { ReportReason } from '@/types/chat';

const POSTS_PAGE_SIZE = 20;
const POST_REPORT_AUTO_HIDE_THRESHOLD = 5;

export type PostActionResult =
  | { ok: true; postId?: string }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'BANNED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'EDIT_WINDOW_EXPIRED'
        | 'VALIDATION_FAILED'
        | 'ADMIN_NOT_CONFIGURED'
        | 'INTERNAL';
      fieldErrors?: Partial<Record<'title' | 'body' | 'category' | 'tags' | 'imageUrls', string>>;
      message?: string;
    };

// ─────────────────────────────────────────────────────────────────
// Internal guards
// ─────────────────────────────────────────────────────────────────

async function requireUnbannedUser(): Promise<
  | {
      ok: true;
      uid: string;
      nickname: string;
      classId?: 'warrior' | 'swordsman' | 'medium';
    }
  | { ok: false; result: PostActionResult }
> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return { ok: false, result: { ok: false, error: 'UNAUTHENTICATED' } };
  }
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
  if (!nickname) {
    return { ok: false, result: { ok: false, error: 'NOT_REGISTERED' } };
  }
  return {
    ok: true,
    uid,
    nickname,
    ...(session.user.classId
      ? { classId: session.user.classId as 'warrior' | 'swordsman' | 'medium' }
      : {}),
  };
}

// ─────────────────────────────────────────────────────────────────
// createPost
// ─────────────────────────────────────────────────────────────────

export async function createPost(raw: unknown): Promise<PostActionResult> {
  const guard = await requireUnbannedUser();
  if (!guard.ok) return guard.result;

  const parsed = PostInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<
      Record<'title' | 'body' | 'category' | 'tags' | 'imageUrls', string>
    > = {};
    for (const issue of parsed.error.issues) {
      const rawKey = issue.path[0];
      if (typeof rawKey !== 'string') continue;
      if (
        rawKey === 'title' ||
        rawKey === 'body' ||
        rawKey === 'category' ||
        rawKey === 'tags' ||
        rawKey === 'imageUrls'
      ) {
        if (!fieldErrors[rawKey]) {
          fieldErrors[rawKey] = issue.message;
        }
      }
    }
    return { ok: false, error: 'VALIDATION_FAILED', fieldErrors };
  }
  const input = parsed.data;

  try {
    const db = getAdminFirestore();
    const postRef = db.collection('posts').doc();
    const userRef = db.collection('users').doc(guard.uid);

    await db.runTransaction(async (tx) => {
      const now = FieldValue.serverTimestamp();
      tx.set(postRef, {
        id: postRef.id,
        authorUid: guard.uid,
        authorNickname: guard.nickname,
        ...(guard.classId ? { authorClassId: guard.classId } : {}),
        category: input.category,
        title: input.title,
        body: input.body,
        bodyExcerpt: extractExcerpt(input.body, 150),
        tags: input.tags,
        imageUrls: input.imageUrls,
        status: 'published',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        reportedCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      tx.set(
        userRef,
        {
          postCount: FieldValue.increment(1),
          updatedAt: now,
        },
        { merge: true },
      );
    });

    revalidatePath('/post');
    revalidatePath('/me/posts');
    return { ok: true, postId: postRef.id };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// updatePost
// ─────────────────────────────────────────────────────────────────

export async function updatePost(
  postId: string,
  raw: unknown,
): Promise<PostActionResult> {
  const guard = await requireUnbannedUser();
  if (!guard.ok) return guard.result;

  const parsed = PostInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_FAILED' };
  }
  const input = parsed.data;

  try {
    const db = getAdminFirestore();
    const postRef = db.collection('posts').doc(postId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(postRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      const data = snap.data() as PostDoc & {
        createdAt?: { toMillis(): number };
      };
      if (data.authorUid !== guard.uid) throw new Error('FORBIDDEN');

      const createdAtMs = data.createdAt?.toMillis() ?? 0;
      const withinFreeWindow =
        Date.now() - createdAtMs < POST_FREE_EDIT_WINDOW_MS;

      const now = FieldValue.serverTimestamp();
      if (withinFreeWindow) {
        // 24h 이내: 본문 직접 수정
        tx.update(postRef, {
          title: input.title,
          body: input.body,
          bodyExcerpt: extractExcerpt(input.body, 150),
          tags: input.tags,
          imageUrls: input.imageUrls,
          // category는 수정 불가 (스팸 방지)
          updatedAt: now,
        });
      } else {
        // 24h 후: 운영자 승인 큐 (pendingEdit field)
        tx.update(postRef, {
          status: 'pending_edit',
          pendingEdit: {
            title: input.title,
            body: input.body,
            bodyExcerpt: extractExcerpt(input.body, 150),
            tags: input.tags,
            imageUrls: input.imageUrls,
          },
          updatedAt: now,
        });
      }
    });

    revalidatePath(`/post/${postId}`);
    revalidatePath('/me/posts');
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'INTERNAL';
    if (msg === 'NOT_FOUND') return { ok: false, error: 'NOT_FOUND' };
    if (msg === 'FORBIDDEN') return { ok: false, error: 'FORBIDDEN' };
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

// ─────────────────────────────────────────────────────────────────
// deletePost
// ─────────────────────────────────────────────────────────────────

export async function deletePost(postId: string): Promise<PostActionResult> {
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

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(postRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      const data = snap.data() as { authorUid: string };
      if (!isAdmin && data.authorUid !== uid) throw new Error('FORBIDDEN');

      // soft delete (audit 유지 + revertible)
      tx.update(postRef, {
        status: 'deleted',
        updatedAt: FieldValue.serverTimestamp(),
      });

      // users.postCount-- (작성자 본인이 삭제하는 경우만)
      if (data.authorUid === uid) {
        const userRef = db.collection('users').doc(uid);
        tx.set(
          userRef,
          { postCount: FieldValue.increment(-1) },
          { merge: true },
        );
      }
    });

    if (isAdmin) {
      await db.collection('moderation_logs').add({
        actorUid: uid,
        action: 'post_delete_by_admin',
        targetUid: '',
        metadata: { postId },
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    revalidatePath('/post');
    revalidatePath(`/post/${postId}`);
    revalidatePath('/me/posts');
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'INTERNAL';
    if (msg === 'NOT_FOUND') return { ok: false, error: 'NOT_FOUND' };
    if (msg === 'FORBIDDEN') return { ok: false, error: 'FORBIDDEN' };
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

// ─────────────────────────────────────────────────────────────────
// listPosts (Server Component에서 호출)
// ─────────────────────────────────────────────────────────────────

export async function listPosts(
  filter: PostFilter,
  cursor?: number,
): Promise<PostListResult> {
  if (!hasAdminCredentials()) {
    return { items: [], nextCursor: null };
  }
  try {
    const db = getAdminFirestore();
    let q: FirebaseFirestore.Query = db.collection('posts');

    // Sprint V1 GAP-M2: 본인 글 조회 시 pending_edit도 포함 (운영자 승인 대기 표시).
    // 외부 viewer / 카테고리 탐색 시는 published만 노출.
    const session = filter.authorUid ? await auth() : null;
    const isOwnerView =
      Boolean(filter.authorUid) && session?.user?.id === filter.authorUid;
    if (isOwnerView) {
      q = q.where('status', 'in', ['published', 'pending_edit']);
    } else {
      q = q.where('status', '==', 'published');
    }

    if (filter.category) {
      q = q.where('category', '==', filter.category);
    }
    if (filter.classId) {
      q = q.where('authorClassId', '==', filter.classId);
    }
    if (filter.authorUid) {
      q = q.where('authorUid', '==', filter.authorUid);
    }

    // 정렬
    const sortField = sortFieldOf(filter.sort);
    q = q.orderBy(sortField, 'desc').orderBy('createdAt', 'desc');

    if (cursor) {
      q = q.startAfter(cursor);
    }
    q = q.limit(POSTS_PAGE_SIZE + 1); // +1로 hasMore 판정

    const snap = await q.get();
    const docs = snap.docs;
    const hasMore = docs.length > POSTS_PAGE_SIZE;
    const items = docs.slice(0, POSTS_PAGE_SIZE).map((d) => toListItem(d));
    const last = items[items.length - 1];
    const nextCursor =
      hasMore && last ? sortValueOf(filter.sort, last) : null;
    return { items, nextCursor };
  } catch {
    return { items: [], nextCursor: null };
  }
}

function sortFieldOf(sort: PostSort): string {
  if (sort === 'popular') return 'likeCount';
  if (sort === 'hot') return 'commentCount';
  return 'createdAt';
}

function sortValueOf(sort: PostSort, item: PostListItem): number {
  if (sort === 'popular') return item.likeCount;
  if (sort === 'hot') return item.commentCount;
  return item.createdAtMs;
}

function toListItem(
  d: FirebaseFirestore.QueryDocumentSnapshot,
): PostListItem {
  const data = d.data() as Omit<PostDoc, 'createdAtMs' | 'updatedAtMs'> & {
    createdAt?: { toMillis(): number };
    updatedAt?: { toMillis(): number };
  };
  return {
    id: data.id,
    authorUid: data.authorUid,
    authorNickname: data.authorNickname,
    ...(data.authorClassId ? { authorClassId: data.authorClassId } : {}),
    category: data.category,
    title: data.title,
    bodyExcerpt: data.bodyExcerpt,
    tags: data.tags ?? [],
    imageUrls: data.imageUrls ?? [],
    status: data.status,
    viewCount: data.viewCount ?? 0,
    likeCount: data.likeCount ?? 0,
    commentCount: data.commentCount ?? 0,
    reportedCount: data.reportedCount ?? 0,
    createdAtMs: data.createdAt?.toMillis() ?? 0,
    updatedAtMs: data.updatedAt?.toMillis() ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────
// getPost (Server Component)
// ─────────────────────────────────────────────────────────────────

export async function getPost(
  postId: string,
  options: { incrementView?: boolean } = {},
): Promise<PostDoc | null> {
  if (!hasAdminCredentials()) return null;
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('posts').doc(postId).get();
    if (!snap.exists) return null;
    const raw = snap.data() as Omit<PostDoc, 'createdAtMs' | 'updatedAtMs'> & {
      createdAt?: { toMillis(): number };
      updatedAt?: { toMillis(): number };
    };
    if (raw.status === 'deleted') return null;

    if (options.incrementView) {
      // 디바운스는 별도 (페이지 컴포넌트에서 cookie/IP 기반) — 여기서는 단순 increment
      await snap.ref.update({ viewCount: FieldValue.increment(1) });
    }

    return {
      id: raw.id,
      authorUid: raw.authorUid,
      authorNickname: raw.authorNickname,
      ...(raw.authorClassId ? { authorClassId: raw.authorClassId } : {}),
      category: raw.category,
      title: raw.title,
      body: raw.body,
      bodyExcerpt: raw.bodyExcerpt,
      tags: raw.tags ?? [],
      imageUrls: raw.imageUrls ?? [],
      status: raw.status,
      ...(raw.pendingEdit ? { pendingEdit: raw.pendingEdit } : {}),
      viewCount: raw.viewCount ?? 0,
      likeCount: raw.likeCount ?? 0,
      commentCount: raw.commentCount ?? 0,
      reportedCount: raw.reportedCount ?? 0,
      createdAtMs: raw.createdAt?.toMillis() ?? 0,
      updatedAtMs: raw.updatedAt?.toMillis() ?? 0,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// reportPost / reportComment (통합 신고 Server Action)
// ─────────────────────────────────────────────────────────────────

export type ReportResult =
  | { ok: true; autoHidden: boolean; penaltyApplied: 'warning' | 'ban_7d' | 'ban_permanent' | null }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'SELF_REPORT'
        | 'NO_REASON'
        | 'TARGET_NOT_FOUND'
        | 'ADMIN_NOT_CONFIGURED'
        | 'INTERNAL';
      message?: string;
    };

export async function reportPostOrComment(
  input: PostReportInput,
): Promise<ReportResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'UNAUTHENTICATED' };
  if (!session?.user?.registered) return { ok: false, error: 'NOT_REGISTERED' };
  if (input.reportedUid === uid) return { ok: false, error: 'SELF_REPORT' };
  if (input.reasons.length === 0) return { ok: false, error: 'NO_REASON' };
  if (!hasAdminCredentials()) {
    return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };
  }

  try {
    const db = getAdminFirestore();
    const reportColl =
      input.targetType === 'post' ? 'post_reports' : 'comment_reports';
    const reportId = `${input.targetType}_${input.targetId}__${uid}`;
    const reportRef = db.collection(reportColl).doc(reportId);

    const targetRef =
      input.targetType === 'post'
        ? db.collection('posts').doc(input.targetId)
        : db
            .collection('posts')
            .doc(input.postId)
            .collection('comments')
            .doc(input.targetId);

    let autoHidden = false;

    await db.runTransaction(async (tx) => {
      const [existingReport, targetSnap] = await Promise.all([
        tx.get(reportRef),
        tx.get(targetRef),
      ]);
      if (existingReport.exists) return; // 중복 신고 차단
      if (!targetSnap.exists) throw new Error('TARGET_NOT_FOUND');

      const currentCount =
        (targetSnap.data()?.reportedCount as number | undefined) ?? 0;
      const nextCount = currentCount + 1;

      tx.set(reportRef, {
        id: reportId,
        targetType: input.targetType,
        targetId: input.targetId,
        postId: input.postId,
        reporterUid: uid,
        reportedUid: input.reportedUid,
        reasons: input.reasons as ReportReason[],
        snapshot: input.snapshot,
        ...(input.extraText ? { extraText: input.extraText } : {}),
        resolved: 'pending',
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.update(targetRef, {
        reportedCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (nextCount >= POST_REPORT_AUTO_HIDE_THRESHOLD) {
        if (input.targetType === 'post') {
          tx.update(targetRef, { status: 'hidden_auto' });
        } else {
          tx.update(targetRef, { hidden: true });
        }
        autoHidden = true;
      }
    });

    // 페널티 자동화 트리거 (사용자 누적 신고)
    const penaltyResult = await recordReport({
      targetUid: input.reportedUid,
      source: input.targetType,
      sourceId: input.targetId,
    });

    revalidatePath('/admin');
    revalidatePath(input.targetType === 'post' ? `/post/${input.targetId}` : `/post/${input.postId}`);

    return {
      ok: true,
      autoHidden,
      penaltyApplied: penaltyResult.ok ? (penaltyResult.penaltyApplied ?? null) : null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg === 'TARGET_NOT_FOUND') {
      return { ok: false, error: 'TARGET_NOT_FOUND' };
    }
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

/** category 라벨 동결 export — UI 무관 */
export type PostCategoryConst = PostCategory;
