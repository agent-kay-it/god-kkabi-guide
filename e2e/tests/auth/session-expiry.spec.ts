/**
 * Sprint 14 / F14-B-6 — 세션 만료 (refresh token).
 * Sprint 28 F28-B 단계 2 — page.evaluate bare specifier 'firebase/auth' 제거.
 * window.__e2eFirebase namespace 사용.
 *
 * Firebase Auth 의 ID 토큰은 1시간 마다 자동 refresh. 본 spec 은 강제 refresh 후
 * 새 토큰이 발급되는지 검증.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';
import { waitForE2eFirebase } from '../../fixtures/window-firebase';

test.describe('Auth — Session expiry / refresh', () => {
  test('user.getIdToken(true) 호출 시 새 토큰이 발급된다', async ({ page }) => {
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);
    await waitForE2eFirebase(page);

    const { tokenA, tokenB } = await page.evaluate(async () => {
      const fb = (window as unknown as {
        __e2eFirebase: {
          auth: {
            getAuth: () => {
              currentUser: { getIdToken: (forceRefresh?: boolean) => Promise<string> } | null;
            };
          };
        };
      }).__e2eFirebase;
      const user = fb.auth.getAuth().currentUser!;
      const a = await user.getIdToken();
      const b = await user.getIdToken(true);
      return { tokenA: a, tokenB: b };
    });

    expect(tokenA).toBeTruthy();
    expect(tokenB).toBeTruthy();
    expect(tokenA).not.toBe(tokenB);
  });

  test('refresh 후에도 userId 는 동일하게 유지된다', async ({ page }) => {
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);
    await waitForE2eFirebase(page);

    const { uidA, uidB } = await page.evaluate(async () => {
      const fb = (window as unknown as {
        __e2eFirebase: {
          auth: {
            getAuth: () => {
              currentUser: {
                uid: string;
                getIdToken: (forceRefresh?: boolean) => Promise<string>;
              } | null;
            };
          };
        };
      }).__e2eFirebase;
      const user = fb.auth.getAuth().currentUser!;
      await user.getIdToken(true);
      return { uidA: user.uid, uidB: fb.auth.getAuth().currentUser!.uid };
    });

    expect(uidA).toBe('e2e-regular');
    expect(uidB).toBe('e2e-regular');
  });
});
