/**
 * Sprint 14 / F14-B-3 — 로그아웃 + 세션 cleanup.
 * Sprint 28 F28-B 단계 2 — page.evaluate bare specifier 'firebase/auth' 제거.
 * window.__e2eFirebase namespace 사용 (lib/firebase/client.ts emulator 분기 expose).
 */
import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';
import { waitForE2eFirebase } from '../../fixtures/window-firebase';

test.describe('Auth — Logout', () => {
  test('로그아웃 후 보호 페이지 접근 시 /login 으로 redirect', async ({ page }) => {
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);
    await page.goto('/me');
    await expect(page.getByText('E2E Regular', { exact: false })).toBeVisible({ timeout: 10_000 });

    await logout(page);
    await page.goto('/me');

    // /me 는 인증 필수 → /login 으로 리다이렉트 (또는 game-gate)
    await expect(page).toHaveURL(/\/(login|register)/, { timeout: 10_000 });
  });

  test('로그아웃 후 Firebase Auth currentUser === null', async ({ page }) => {
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);
    await logout(page);

    await waitForE2eFirebase(page);
    const isSignedIn = await page.evaluate(() => {
      const fb = (window as unknown as {
        __e2eFirebase: { auth: { getAuth: () => { currentUser: unknown } } };
      }).__e2eFirebase;
      return !!fb.auth.getAuth().currentUser;
    });
    expect(isSignedIn).toBe(false);
  });
});
