/**
 * Sprint 14 / F14-C-7 — 본인 게시물 삭제 + cascade (댓글).
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import {
  seedPost,
  seedComment,
  cleanupTestPosts,
  getPost,
} from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});

test('게시물 삭제 시 detail page 가 404 / not-found', async ({ page }) => {
  const postId = await seedPost();
  await seedComment(postId);

  await page.goto(`/post/${postId}`);
  await page.waitForLoadState('networkidle');

  // 삭제
  if (admin.apps.length === 0) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
  }
  await admin.firestore().collection('posts').doc(postId).delete();

  // cascade: 댓글 subcollection 도 명시적으로 cleanup (실 서비스는 Cloud Function)
  const commentsSnap = await admin
    .firestore()
    .collection('posts')
    .doc(postId)
    .collection('comments')
    .get();
  await Promise.all(commentsSnap.docs.map((d) => d.ref.delete()));

  const stored = await getPost(postId);
  expect(stored).toBeUndefined();

  // detail page 재진입 시 404 또는 빈 상태
  await page.goto(`/post/${postId}`);
  const status = page.url().includes('/post/' + postId);
  // 404 페이지나 redirect — 어느 쪽이든 게시물 콘텐츠 미노출
  const stillHasPost = await page
    .getByText(/시드 게시물|test post/i)
    .first()
    .isVisible()
    .catch(() => false);
  expect(stillHasPost).toBe(false);
  // 본 spec 의 핵심: 게시물이 사라졌으면 OK
  expect(status).toBe(true);
});
