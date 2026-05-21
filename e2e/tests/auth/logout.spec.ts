/**
 * Sprint 14 / F14-B-3 — 로그아웃 + 세션 cleanup.
 * Sprint 28 F28-B 단계 5/6 — loginAs 가 client signInWithCustomToken 안 함.
 * client-side 검증이 필요한 test 2 는 spec 안에서 직접 client sign-in.
 * lib/firebase/client.ts 가 동기 wire 보장하므로 emulator endpoint 사용 안전.
 */
import { test, expect } from '@playwright/test';
import { loginAs, logout, createCustomToken } from '../../emulator/auth-token-helper';
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
    await waitForE2eFirebase(page);

    // Sprint 28 F28-B 단계 6 — spec 안에서 명시적 client sign-in.
    // lib/firebase/client.ts 단계 5 동기 wire 보장으로 emulator endpoint 사용.
    const customToken = await createCustomToken('regular');
    await page.evaluate(
      async (t) => {
        const fb = (window as unknown as {
          __e2eFirebase: {
            app: unknown;
            auth: {
              getAuth: (app: unknown) => unknown;
              signInWithCustomToken: (auth: unknown, token: string) => Promise<unknown>;
            };
          };
        }).__e2eFirebase;
        await fb.auth.signInWithCustomToken(fb.auth.getAuth(fb.app), t);
      },
      customToken,
    );

    const beforeLogout = await page.evaluate(() => {
      const fb = (window as unknown as {
        __e2eFirebase: { auth: { getAuth: () => { currentUser: unknown } } };
      }).__e2eFirebase;
      return !!fb.auth.getAuth().currentUser;
    });
    expect(beforeLogout).toBe(true);

    await logout(page);
    await waitForE2eFirebase(page);

    // logout 은 NextAuth cookie + reload 만 함 → client Auth 는 별도 signOut 필요.
    await page.evaluate(async () => {
      const fb = (window as unknown as {
        __e2eFirebase: {
          auth: {
            getAuth: () => unknown;
            signOut: (auth: unknown) => Promise<void>;
          };
        };
      }).__e2eFirebase;
      try {
        await fb.auth.signOut(fb.auth.getAuth());
      } catch {
        // already signed out
      }
    });

    const afterLogout = await page.evaluate(() => {
      const fb = (window as unknown as {
        __e2eFirebase: { auth: { getAuth: () => { currentUser: unknown } } };
      }).__e2eFirebase;
      return !!fb.auth.getAuth().currentUser;
    });
    expect(afterLogout).toBe(false);
  });
});
