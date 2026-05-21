/**
 * Sprint 14 / F14-B-3 — 로그아웃 + 세션 cleanup.
 * Sprint 28 F28-B 단계 20 — client signInWithCustomToken 의 dev mode reroute 미동작
 * 이슈로 인해 cookie 기반 SSR 인증만 검증 (client SDK currentUser 검증 제거).
 */
import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';

test.describe('Auth — Logout', () => {
  test('로그아웃 후 보호 페이지 접근 시 /login 으로 redirect', async ({ page }) => {
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);
    await page.goto('/me');
    await expect(page.getByText('E2E Regular', { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });

    await logout(page);
    await page.goto('/me');

    // /me 는 인증 필수 → /login 으로 리다이렉트 (또는 game-gate)
    await expect(page).toHaveURL(/\/(login|register)/, { timeout: 10_000 });
  });

  test('로그아웃 후 NextAuth session cookie 가 cleared', async ({ page }) => {
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);

    // login 직후 cookie 확인
    const cookiesBefore = await page.context().cookies();
    const sessionCookieBefore = cookiesBefore.find((c) => c.name === 'authjs.session-token');
    expect(sessionCookieBefore).toBeTruthy();

    await logout(page);

    // logout 후 session cookie 가 cleared
    const cookiesAfter = await page.context().cookies();
    const sessionCookieAfter = cookiesAfter.find((c) => c.name === 'authjs.session-token');
    expect(sessionCookieAfter).toBeFalsy();
  });
});
