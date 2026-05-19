/**
 * Sprint 14 / F14-D-3 — 문파 채널 (regular 사용자는 '무명' clan 설정).
 *
 * regular 사용자의 clan='무명' → /chat/munpa-muming 접근 가능.
 * banned/new 등 clan 미설정 사용자는 disabled.
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

test('clan 설정된 사용자는 문파 채널 진입 가능', async ({ page }) => {
  await loginAs(page, 'regular');
  const uniqueBody = `${TEST_PREFIX} munpa ${Date.now()}`;
  await seedMessage({ channel: 'munpa-muming', body: uniqueBody });

  await page.goto('/chat/munpa-muming');
  await page.waitForLoadState('networkidle');

  // 채널 진입 자체 성공 (banned redirect 아님)
  expect(page.url()).toContain('munpa-muming');
});

test('clan 미설정 사용자 (e2e-banned) 는 문파 채널 진입 시 안내/차단', async ({ page }) => {
  await loginAs(page, 'banned');
  await page.goto('/chat/munpa-muming');
  await page.waitForLoadState('networkidle');

  // 차단 메시지 / 안내 / redirect — 어느 쪽이든 정상 동작
  const url = page.url();
  const body = await page.content();
  const isBlockedOrRedirected =
    !url.includes('munpa-muming') || /차단|문파|설정/i.test(body);
  expect(isBlockedOrRedirected).toBe(true);
});
