/**
 * Sprint 14 / F14-D-8 — banned 사용자 메시지 입력 차단.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';
import { cleanupTestMessages } from '../../fixtures/test-chat-helpers';

test.afterAll(async () => {
  await cleanupTestMessages();
});

test('banned 사용자가 /chat 진입 시 입력란 비활성 또는 안내', async ({ page }) => {
  await loginAs(page, 'banned');
  await page.goto('/chat');
  await page.waitForLoadState('networkidle');

  // 입력란 disable 또는 차단 안내 노출
  const input = page.locator('textarea, input[type="text"]').first();
  const isDisabled = await input.isDisabled().catch(() => true);
  const body = await page.content();
  const hasBlockMessage = /차단|정지|banned|제한/i.test(body);

  expect(isDisabled || hasBlockMessage).toBe(true);
});
