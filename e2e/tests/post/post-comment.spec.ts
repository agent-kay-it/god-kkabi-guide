/**
 * Sprint 14 / F14-C-8 — 댓글 작성 / 노출 / 삭제.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import {
  seedPost,
  seedComment,
  cleanupTestPosts,
  TEST_PREFIX,
} from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});

test('seed 댓글이 게시물 detail page 에 노출된다', async ({ page }) => {
  const postId = await seedPost();
  await seedComment(postId, { body: `${TEST_PREFIX} 자동 시드 댓글` });

  await page.goto(`/post/${postId}`);
  await page.waitForLoadState('networkidle');

  // 댓글 영역 확인 — 본문 텍스트 매칭 (실 UI 의 라벨에 따라 조정)
  await expect(page.getByText(`${TEST_PREFIX} 자동 시드 댓글`, { exact: false })).toBeVisible({
    timeout: 10_000,
  });
});

test('댓글 삭제 시 detail page 에서 사라진다', async ({ page }) => {
  const postId = await seedPost();
  const commentId = await seedComment(postId, { body: `${TEST_PREFIX} 삭제 대상 댓글` });

  await page.goto(`/post/${postId}`);
  await expect(page.getByText(`${TEST_PREFIX} 삭제 대상 댓글`, { exact: false })).toBeVisible({
    timeout: 10_000,
  });

  if (admin.apps.length === 0) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
  }
  await admin
    .firestore()
    .collection('posts')
    .doc(postId)
    .collection('comments')
    .doc(commentId)
    .delete();

  await page.reload();
  const stillVisible = await page
    .getByText(`${TEST_PREFIX} 삭제 대상 댓글`, { exact: false })
    .isVisible()
    .catch(() => false);
  expect(stillVisible).toBe(false);
});
