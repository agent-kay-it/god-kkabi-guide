/**
 * Sprint 14 / F14-D-1 — 전체 (global) 채널 메시지 송수신.
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

test('global 채널에 seed 메시지가 노출된다', async ({ page }) => {
  await loginAs(page, 'regular');
  const uniqueBody = `${TEST_PREFIX} global ${Date.now()}`;
  await seedMessage({ channel: 'global', body: uniqueBody });

  await page.goto('/chat');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(uniqueBody, { exact: false })).toBeVisible({ timeout: 15_000 });
});
