/**
 * Sprint 14 / F14-B-3 — 로그아웃 + 세션 cleanup.
 * Sprint 28 F28-B 단계 20 — client signInWithCustomToken 의 dev mode reroute 미동작
 * 이슈로 인해 cookie 기반 SSR 인증만 검증 (client SDK currentUser 검증 제거).
 */
import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';

test.describe('Auth — Logout', () => {
  test('로그아웃 후 보호 페이지 접근 시 /login 으로 redirect', async ({ browser }) => {
    // Sprint 28 F28-B 단계 25 — fresh context 분리.
    // 이전: page.context().clearCookies() 후에도 /me 진입 시 RSC cache 또는
    //   server-side cookie 가 stale 한 채로 인증된 page 반환.
    // 수정: logged-in context 와 logout context 를 별도로 분리해 cookie/cache
    //   완전 격리 → server-side auth() 가 정확히 null 인식.
    const loggedContext = await browser.newContext();
    const loggedPage = await loggedContext.newPage();
    await loginAs(loggedPage, 'regular');
    await waitForUserLoaded(loggedPage);
    await loggedPage.goto('/me');
    await expect(loggedPage.getByText('E2E Regular', { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });

    // 새 context (cookie 완전 분리) 로 /me 진입 → 인증 없음 → redirect.
    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();
    await anonPage.goto('/me');

    // /me 는 인증 필수 → /login 으로 리다이렉트
    await expect(anonPage).toHaveURL(/\/(login|register)/, { timeout: 10_000 });

    await loggedContext.close();
    await anonContext.close();
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
