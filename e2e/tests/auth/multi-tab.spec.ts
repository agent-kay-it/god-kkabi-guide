/**
 * Sprint 14 / F14-B-5 — 다중 탭 세션 동기화.
 *
 * 탭 1 에서 로그인 → 탭 2 에서도 인증 상태 공유 (Firebase Auth 의 broadcastChannel).
 * 탭 1 에서 로그아웃 → 탭 2 도 reload 후 로그아웃 상태.
 */
import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';

test.describe('Auth — Multi-tab session sync', () => {
  test('탭 1 로그인 → 탭 2 (같은 context) 도 인증 상태 공유', async ({ context }) => {
    const tab1 = await context.newPage();
    const tab2 = await context.newPage();

    await loginAs(tab1, 'regular');
    await waitForUserLoaded(tab1);

    await tab2.goto('/me');
    await tab2.reload();

    // 탭 2 에서 사용자 정보 노출
    await expect(tab2.getByText('E2E Regular', { exact: false })).toBeVisible({ timeout: 10_000 });

    await tab1.close();
    await tab2.close();
  });

  test('탭 1 로그아웃 → 탭 2 reload 시 로그아웃', async ({ context }) => {
    const tab1 = await context.newPage();
    const tab2 = await context.newPage();

    await loginAs(tab1, 'regular');
    await waitForUserLoaded(tab1);
    await tab2.goto('/me');

    await logout(tab1);
    await tab2.reload();

    await expect(tab2).toHaveURL(/\/(login|register)/, { timeout: 10_000 });

    await tab1.close();
    await tab2.close();
  });
});
