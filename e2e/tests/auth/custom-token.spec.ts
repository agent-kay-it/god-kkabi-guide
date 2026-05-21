/**
 * Sprint 14 / F14-B-7 — Admin SDK custom token flow 검증.
 *
 * loginAs() 자체가 Admin SDK 의 createCustomToken + signInWithCustomToken 흐름.
 * 본 spec 은 그 흐름이 4 role 모두에 대해 동작하는지 확인.
 */
import { test, expect } from '@playwright/test';
import { loginAs, createCustomToken, type TestRole } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';
import { waitForE2eFirebase } from '../../fixtures/window-firebase';

const ROLES: TestRole[] = ['admin', 'regular', 'banned', 'new'];

test.describe('Auth — Custom token (Admin SDK bridge)', () => {
  for (const role of ROLES) {
    test(`createCustomToken('${role}') returns a non-empty JWT`, async () => {
      const token = await createCustomToken(role);
      expect(token).toBeTruthy();
      expect(token.split('.').length).toBe(3); // JWT header.payload.signature
    });

    test(`loginAs('${role}') 후 currentUser.uid === e2e-${role}`, async ({ page }) => {
      await loginAs(page, role);
      await waitForUserLoaded(page);
      // Sprint 28 F28-B 단계 2 — window.__e2eFirebase 사용 (bare import 제거)
      await waitForE2eFirebase(page);
      const uid = await page.evaluate(() => {
        const fb = (window as unknown as {
          __e2eFirebase: { auth: { getAuth: () => { currentUser: { uid: string } | null } } };
        }).__e2eFirebase;
        return fb.auth.getAuth().currentUser?.uid ?? null;
      });
      expect(uid).toBe(`e2e-${role}`);
    });
  }
});
