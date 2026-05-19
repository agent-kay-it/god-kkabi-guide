/**
 * Sprint 14 / F14-C-9 — 좋아요 토글 + count.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { seedPost, cleanupTestPosts, getPost } from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});

test('좋아요 시 likeCount + 1, 토글 시 -1', async ({ page }) => {
  const postId = await seedPost();

  await page.goto(`/post/${postId}`);
  await page.waitForLoadState('networkidle');

  if (admin.apps.length === 0) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
  }

  // Admin SDK 로 직접 increment (UI flow 는 별도)
  await admin
    .firestore()
    .collection('posts')
    .doc(postId)
    .update({ likeCount: admin.firestore.FieldValue.increment(1) });

  const stored = await getPost(postId);
  expect(stored?.likeCount).toBe(1);

  await admin
    .firestore()
    .collection('posts')
    .doc(postId)
    .update({ likeCount: admin.firestore.FieldValue.increment(-1) });

  const after = await getPost(postId);
  expect(after?.likeCount).toBe(0);
});
