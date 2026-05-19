/**
 * Sprint 14 / F14-D-2 — 서버 (S785) 채널 자동 라우팅.
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

test('regular 사용자는 /chat 진입 시 /chat/server-S785 로 자동 redirect', async ({ page }) => {
  await loginAs(page, 'regular');
  await page.goto('/chat');
  await page.waitForLoadState('networkidle');

  // middleware 또는 client redirect — 어느 쪽이든 server-S785 path 가 최종
  await expect(page).toHaveURL(/server-S785/i, { timeout: 10_000 });
});

test('server-S785 채널에 seed 메시지가 노출된다', async ({ page }) => {
  await loginAs(page, 'regular');
  const uniqueBody = `${TEST_PREFIX} server-S785 ${Date.now()}`;
  await seedMessage({ channel: 'server-S785', body: uniqueBody });

  await page.goto('/chat/server-S785');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(uniqueBody, { exact: false })).toBeVisible({ timeout: 15_000 });
});
