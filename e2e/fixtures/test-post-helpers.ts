/**
 * Sprint 14 / F14-C — Post 시나리오 공통 헬퍼.
 *
 * Admin SDK 로 직접 게시물 생성/삭제 (UI 거치지 않음 — 빠른 setup/teardown).
 * UI flow 자체의 검증은 각 spec 의 본문에서.
 */
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../emulator/admin-helper';

export const TEST_PREFIX = '[TEST-Sprint14]';
export const SEED_ID = 'sprint-14-c-post';

// Sprint 28 F28-B 단계 2 — admin app race condition fix.
function ensureAdmin(): admin.app.App {
  return ensureE2eAdmin();
}

export interface SeedPostOptions {
  readonly id?: string;
  readonly title?: string;
  readonly body?: string;
  readonly category?: string;
  readonly authorUid?: string;
  readonly authorName?: string;
  readonly images?: readonly string[];
  readonly status?: 'pending' | 'published' | 'rejected';
}

export async function seedPost(opts: SeedPostOptions = {}): Promise<string> {
  ensureAdmin();
  const id = opts.id ?? `test-post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await admin
    .firestore()
    .collection('posts')
    .doc(id)
    .set({
      id,
      title: opts.title ?? `${TEST_PREFIX} 자동 생성 게시물`,
      body: opts.body ?? '본문 자동 생성',
      category: opts.category ?? 'free',
      authorUid: opts.authorUid ?? 'e2e-regular',
      authorName: opts.authorName ?? 'E2E Regular',
      images: opts.images ?? [],
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      status: opts.status ?? 'published',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      e2eTestPrefix: TEST_PREFIX,
      e2eSeedId: SEED_ID,
    });
  return id;
}

export async function deletePost(id: string): Promise<void> {
  ensureAdmin();
  await admin.firestore().collection('posts').doc(id).delete();
}

export async function getPost(id: string): Promise<FirebaseFirestore.DocumentData | undefined> {
  ensureAdmin();
  const snap = await admin.firestore().collection('posts').doc(id).get();
  return snap.data();
}

export async function cleanupTestPosts(): Promise<number> {
  ensureAdmin();
  const snap = await admin
    .firestore()
    .collection('posts')
    .where('e2eSeedId', '==', SEED_ID)
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
  return snap.size;
}

export async function seedComment(
  postId: string,
  opts: { authorUid?: string; body?: string } = {},
): Promise<string> {
  ensureAdmin();
  const id = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await admin
    .firestore()
    .collection('posts')
    .doc(postId)
    .collection('comments')
    .doc(id)
    .set({
      id,
      body: opts.body ?? `${TEST_PREFIX} 시드 댓글`,
      authorUid: opts.authorUid ?? 'e2e-regular',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      e2eTestPrefix: TEST_PREFIX,
      e2eSeedId: SEED_ID,
    });
  return id;
}
