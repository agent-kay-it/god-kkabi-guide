/**
 * Sprint 14 / F14-C-6 — 본인 게시물 수정 (Admin SDK 직접 수정).
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../../emulator/admin-helper';
import {
  seedPost,
  cleanupTestPosts,
  getPost,
  TEST_PREFIX,
} from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});

test('게시물 본문이 수정되고 updatedAt 이 갱신된다', async ({ page }) => {
  const postId = await seedPost({
    title: `${TEST_PREFIX} 수정 전`,
    body: '초기 본문',
  });

  const before = await getPost(postId);
  const beforeTs = (before?.updatedAt as { _seconds: number })._seconds;

  // 1 초 이상 차이 보장
  await new Promise((r) => setTimeout(r, 1100));

  // Admin SDK 로 직접 수정 (UI flow 는 별도 spec)
  ensureE2eAdmin(); // Sprint 28 F28-B 단계 2 — 공유 helper
  await admin
    .firestore()
    .collection('posts')
    .doc(postId)
    .update({
      title: `${TEST_PREFIX} 수정 후`,
      body: '수정된 본문',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  const after = await getPost(postId);
  const afterTs = (after?.updatedAt as { _seconds: number })._seconds;
  expect(afterTs).toBeGreaterThan(beforeTs);

  await page.goto(`/post/${postId}`);
  await expect(page.getByText(`${TEST_PREFIX} 수정 후`, { exact: false })).toBeVisible({
    timeout: 10_000,
  });
});
