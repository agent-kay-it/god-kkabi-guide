/**
 * Sprint 14 / F14-C-2 — 이미지 첨부 게시물 작성.
 *
 * 이미지 업로드 자체 (S3/CloudFront) 는 F14-E (Profile) 에서 끝-끝 검증.
 * 여기선 게시물 schema 의 images 필드가 정상 저장되는지 검증.
 */
import { test, expect } from '@playwright/test';
import {
  seedPost,
  cleanupTestPosts,
  getPost,
  TEST_PREFIX,
} from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});

test('이미지 URL 포함 게시물이 정상 저장되고 detail page 에 노출된다', async ({ page }) => {
  const postId = await seedPost({
    title: `${TEST_PREFIX} 이미지 게시물`,
    body: '<p>이미지 본문</p>',
    images: ['https://cdn-staging.kkaebizigi.com/sample-1.webp'],
  });

  const stored = await getPost(postId);
  expect(stored?.images).toEqual(['https://cdn-staging.kkaebizigi.com/sample-1.webp']);

  await page.goto(`/post/${postId}`);
  await expect(page.getByText(`${TEST_PREFIX} 이미지 게시물`, { exact: false })).toBeVisible({
    timeout: 10_000,
  });
});
