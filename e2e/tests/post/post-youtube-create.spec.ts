/**
 * Sprint 14 / F14-C-3 — youtube URL 임베드 게시물.
 */
import { test, expect } from '@playwright/test';
import { seedPost, cleanupTestPosts, TEST_PREFIX } from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});

test('youtube URL 이 본문에 포함된 게시물은 iframe 또는 thumbnail 로 렌더된다', async ({
  page,
}) => {
  const postId = await seedPost({
    title: `${TEST_PREFIX} YouTube 게시물`,
    body: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  });

  await page.goto(`/post/${postId}`);
  await page.waitForLoadState('networkidle');

  // youtube embed 또는 thumbnail link 가 노출 (실 정책에 따라 변경 가능)
  const ytContent =
    (await page.locator('iframe[src*="youtube"]').first().isVisible().catch(() => false)) ||
    (await page.locator('a[href*="youtube"]').first().isVisible().catch(() => false)) ||
    (await page.locator('img[src*="ytimg"]').first().isVisible().catch(() => false));

  expect(ytContent).toBe(true);
});
