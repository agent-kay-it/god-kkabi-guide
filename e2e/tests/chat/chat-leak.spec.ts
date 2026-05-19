/**
 * Sprint 14 / F14-D-9 — XSS / script injection 차단.
 *
 * 메시지 본문에 <script> 가 포함되어도 page 에서 실행되어선 안 된다.
 */
import { test, expect } from '@playwright/test';
import {
  seedMessage,
  cleanupTestMessages,
  TEST_PREFIX,
} from '../../fixtures/test-chat-helpers';

test.afterAll(async () => {
  await cleanupTestMessages();
});

test('script injection 메시지는 실행되지 않고 텍스트로 노출', async ({ page }) => {
  const payload = `${TEST_PREFIX} <script>window.__xssTriggered = true</script>`;
  await seedMessage({ channel: 'global', body: payload });

  await page.goto('/chat');
  await page.waitForLoadState('networkidle');

  const xssTriggered = await page.evaluate(
    () => (window as unknown as { __xssTriggered?: boolean }).__xssTriggered === true,
  );
  expect(xssTriggered).toBe(false);
});

test('on-* event handler injection 도 차단', async ({ page }) => {
  const payload = `${TEST_PREFIX} <img src=x onerror="window.__onerrorTriggered=true">`;
  await seedMessage({ channel: 'global', body: payload });

  await page.goto('/chat');
  await page.waitForLoadState('networkidle');

  const triggered = await page.evaluate(
    () => (window as unknown as { __onerrorTriggered?: boolean }).__onerrorTriggered === true,
  );
  expect(triggered).toBe(false);
});
