/**
 * 북마크 Server Actions — add / remove / list.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.6
 *
 * 보안:
 *  - 로그인 + registered=true 필수
 *  - 자신의 컬렉션만 read/write (Firestore rules 보강)
 *  - 1인당 최대 200개 (V1+ 결정 게이트)
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
import type { BookmarkSummary, BookmarkTargetType } from '@/types/bookmark';

const MAX_BOOKMARKS_PER_USER = 200;

export type BookmarkActionResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'ADMIN_NOT_CONFIGURED'
        | 'LIMIT_EXCEEDED'
        | 'INTERNAL';
      message?: string;
    };

interface BookmarkInput {
  readonly targetType: BookmarkTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly href: string;
  readonly emoji?: string;
}

/** 북마크 ID 생성 */
function bookmarkId(targetType: BookmarkTargetType, targetId: string): string {
  return `${targetType}:${targetId}`;
}

export async function addBookmark(input: BookmarkInput): Promise<BookmarkActionResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'UNAUTHENTICATED' };
  if (!session?.user?.registered) return { ok: false, error: 'NOT_REGISTERED' };
  if (!hasAdminCredentials()) {
    return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };
  }

  try {
    const db = getAdminFirestore();
    const itemsRef = db.collection('bookmarks').doc(uid).collection('items');
    const userRef = db.collection('users').doc(uid);
    const docId = bookmarkId(input.targetType, input.targetId);

    await db.runTransaction(async (tx) => {
      // ── READS (트랜잭션 규칙: 모든 read는 write 이전)
      // users.bookmarkCount denormalize 카운터 사용 (M4: 200건+ select() 비용 회피).
      const [userSnap, existingSnap] = await Promise.all([
        tx.get(userRef),
        tx.get(itemsRef.doc(docId)),
      ]);
      const currentCount =
        (userSnap.data()?.bookmarkCount as number | undefined) ?? 0;
      const isNew = !existingSnap.exists;
      if (isNew && currentCount >= MAX_BOOKMARKS_PER_USER) {
        throw new Error('LIMIT_EXCEEDED');
      }

      // ── WRITES
      tx.set(
        itemsRef.doc(docId),
        {
          id: docId,
          userId: uid,
          targetType: input.targetType,
          targetId: input.targetId,
          title: input.title,
          href: input.href,
          ...(input.emoji ? { emoji: input.emoji } : {}),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      if (isNew) {
        tx.set(
          userRef,
          {
            bookmarkCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
    });

    revalidatePath('/me/bookmarks');
    revalidatePath(input.href);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'UNKNOWN';
    if (msg === 'LIMIT_EXCEEDED') {
      return { ok: false, error: 'LIMIT_EXCEEDED' };
    }
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

export async function removeBookmark(
  targetType: BookmarkTargetType,
  targetId: string,
): Promise<BookmarkActionResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'UNAUTHENTICATED' };
  if (!hasAdminCredentials()) {
    return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };
  }
  try {
    const db = getAdminFirestore();
    const docId = bookmarkId(targetType, targetId);
    const bookmarkRef = db
      .collection('bookmarks')
      .doc(uid)
      .collection('items')
      .doc(docId);
    const userRef = db.collection('users').doc(uid);

    await db.runTransaction(async (tx) => {
      const existing = await tx.get(bookmarkRef);
      if (!existing.exists) return; // 이미 삭제된 경우 멱등 처리
      tx.delete(bookmarkRef);
      tx.set(
        userRef,
        {
          bookmarkCount: FieldValue.increment(-1),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    revalidatePath('/me/bookmarks');
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'UNKNOWN',
    };
  }
}

/** 본인의 북마크 목록 조회 (Server Component / Server Action에서 사용) */
export async function listMyBookmarks(): Promise<readonly BookmarkSummary[]> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid || !hasAdminCredentials()) {
    return [];
  }
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('bookmarks')
      .doc(uid)
      .collection('items')
      .orderBy('createdAt', 'desc')
      .limit(MAX_BOOKMARKS_PER_USER)
      .get();
    return snap.docs.map((doc) => {
      const data = doc.data() as {
        id: string;
        targetType: BookmarkTargetType;
        targetId: string;
        title: string;
        href: string;
        emoji?: string;
        createdAt?: FirebaseFirestore.Timestamp;
      };
      return {
        id: data.id,
        targetType: data.targetType,
        targetId: data.targetId,
        title: data.title,
        href: data.href,
        ...(data.emoji ? { emoji: data.emoji } : {}),
        createdAtMs: data.createdAt?.toMillis() ?? 0,
      };
    });
  } catch {
    return [];
  }
}

/** 단일 북마크 존재 여부 확인 — BookmarkButton 초기 상태 */
export async function isBookmarked(
  targetType: BookmarkTargetType,
  targetId: string,
): Promise<boolean> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid || !hasAdminCredentials()) return false;
  try {
    const db = getAdminFirestore();
    const doc = await db
      .collection('bookmarks')
      .doc(uid)
      .collection('items')
      .doc(bookmarkId(targetType, targetId))
      .get();
    return doc.exists;
  } catch {
    return false;
  }
}
