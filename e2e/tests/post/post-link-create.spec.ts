/**
 * Sprint 14 / F14-C-4 — 외부 링크 게시물 + og preview.
 */
import { test, expect } from '@playwright/test';
import { seedPost, cleanupTestPosts, TEST_PREFIX } from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});

test('외부 링크가 본문에 포함된 게시물은 link 로 노출된다', async ({ page }) => {
  const postId = await seedPost({
    title: `${TEST_PREFIX} 외부 링크 게시물`,
    body: 'https://example.com 참고하세요',
  });

  await page.goto(`/post/${postId}`);
  // 본문 내 링크가 anchor 로 변환되었는지
  const hasLink =
    (await page.getByRole('link', { name: /example\.com/ }).first().isVisible().catch(() => false)) ||
    (await page.locator('a[href*="example.com"]').first().isVisible().catch(() => false));
  expect(hasLink).toBe(true);
});
