/**
 * Sprint 14 / F14-B-3 — 로그아웃 + 세션 cleanup.
 */
import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../emulator/auth-token-helper';

test.describe('Auth — Logout', () => {
  test('로그아웃 후 보호 페이지 접근 시 /login 으로 redirect', async ({ page }) => {
    await loginAs(page, 'regular');
    await page.goto('/me');
    await expect(page.getByText('E2E Regular', { exact: false })).toBeVisible({ timeout: 10_000 });

    await logout(page);
    await page.goto('/me');

    // /me 는 인증 필수 → /login 으로 리다이렉트 (또는 game-gate)
    await expect(page).toHaveURL(/\/(login|register)/, { timeout: 10_000 });
  });

  test('로그아웃 후 Firebase Auth currentUser === null', async ({ page }) => {
    await loginAs(page, 'regular');
    await logout(page);

    const isSignedIn = await page.evaluate(async () => {
      const { getAuth } = await import('firebase/auth');
      return !!getAuth().currentUser;
    });
    expect(isSignedIn).toBe(false);
  });
});
