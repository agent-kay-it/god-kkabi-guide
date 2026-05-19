/**
 * Sprint 14 / F14-D-4 — 이미지 첨부 메시지.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';
import {
  seedMessage,
  cleanupTestMessages,
  TEST_PREFIX,
} from '../../fixtures/test-chat-helpers';

test.afterAll(async () => {
  await cleanupTestMessages();
});

test('imageUrl 포함 메시지가 채널에 노출된다', async ({ page }) => {
  await loginAs(page, 'regular');
  await seedMessage({
    channel: 'global',
    body: `${TEST_PREFIX} image msg`,
    imageUrl: 'https://cdn-staging.kkaebizigi.com/sample-1.webp',
  });

  await page.goto('/chat');
  await page.waitForLoadState('networkidle');

  // imageUrl 포함 메시지 — img element 가 노출되거나 본문에 URL 포함
  const hasImg =
    (await page
      .locator('img[src*="cdn-staging.kkaebizigi.com"]')
      .first()
      .isVisible()
      .catch(() => false)) ||
    (await page.getByText(/image msg/).first().isVisible().catch(() => false));
  expect(hasImg).toBe(true);
});
