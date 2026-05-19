/**
 * Sprint 14 / F14-D-5 — 외부 링크 메시지.
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

test('http URL 포함 메시지는 anchor 또는 plain text 로 노출', async ({ page }) => {
  await loginAs(page, 'regular');
  const url = 'https://example.com/sprint-14';
  await seedMessage({ channel: 'global', body: `${TEST_PREFIX} ${url}` });

  await page.goto('/chat');
  await page.waitForLoadState('networkidle');

  const hasLink =
    (await page
      .locator('a[href*="example.com/sprint-14"]')
      .first()
      .isVisible()
      .catch(() => false)) ||
    (await page.getByText(url).first().isVisible().catch(() => false));
  expect(hasLink).toBe(true);
});
