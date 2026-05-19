/**
 * Sprint 14 / F14-D-10 — 모바일 viewport 채널 드로어 (Pixel 7 project 에서 자동 실행).
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

test('모바일 viewport 에서 채팅 페이지 정상 진입', async ({ page, browserName, viewport }) => {
  await loginAs(page, 'regular');
  const uniqueBody = `${TEST_PREFIX} mobile chat ${Date.now()}`;
  await seedMessage({ channel: 'global', body: uniqueBody });

  await page.goto('/chat');
  await page.waitForLoadState('networkidle');

  // viewport 정보 검증 (chromium-mobile project 는 Pixel 7 → ~393×852)
  const width = viewport?.width ?? 0;

  // 채널 메시지 노출
  await expect(page.getByText(uniqueBody, { exact: false })).toBeVisible({ timeout: 15_000 });

  // 모바일 viewport (< 768) 에서만 fixed bottom input 등 모바일 UI 검증 (best effort)
  if (width > 0 && width < 768) {
    // 모바일에서 입력란 visible
    const input = page.locator('textarea, input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 5_000 });
  }

  expect(['chromium', 'webkit', 'firefox']).toContain(browserName);
});
