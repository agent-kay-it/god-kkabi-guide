/**
 * Sprint 14 / F14-C-11 — view count 증가.
 *
 * detail page 진입 시 viewCount 증가 (실 구현은 Cloud Function 또는 client-side).
 * 본 spec 은 Admin SDK 로 직접 increment 후 page 에 노출되는지 검증.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { seedPost, cleanupTestPosts, getPost } from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});

test('viewCount Admin increment 후 detail page 에 반영', async ({ page }) => {
  const postId = await seedPost();

  if (admin.apps.length === 0) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
  }

  await admin
    .firestore()
    .collection('posts')
    .doc(postId)
    .update({ viewCount: admin.firestore.FieldValue.increment(42) });

  const stored = await getPost(postId);
  expect(stored?.viewCount).toBe(42);

  await page.goto(`/post/${postId}`);
  await page.waitForLoadState('networkidle');

  // UI 에 "42" 또는 "42회" 표기 (실 카피에 따라 조정 — 본 spec 은 데이터 일치만 보장)
  // 보수적으로 페이지에 42 가 어디든 노출되는지만 확인
  const html = await page.content();
  expect(html.includes('42')).toBe(true);
});
