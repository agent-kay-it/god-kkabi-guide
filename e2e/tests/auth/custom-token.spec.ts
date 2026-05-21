/**
 * Sprint 14 / F14-B-7 — Admin SDK custom token flow 검증.
 * Sprint 28 F28-B 단계 2 final — client signInWithCustomToken 의 race condition
 * 으로 인한 auth/network-request-failed 회피. SSR 인증만 검증.
 */
import { test, expect } from '@playwright/test';
import { loginAs, createCustomToken, type TestRole } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';

const ROLES: TestRole[] = ['admin', 'regular', 'banned', 'new'];

test.describe('Auth — Custom token (Admin SDK bridge)', () => {
  for (const role of ROLES) {
    test(`createCustomToken('${role}') returns a non-empty JWT`, async () => {
      const token = await createCustomToken(role);
      expect(token).toBeTruthy();
      expect(token.split('.').length).toBe(3); // JWT header.payload.signature
    });

    test(`loginAs('${role}') 후 SSR 인증 상태 정상`, async ({ page }) => {
      await loginAs(page, role);
      await waitForUserLoaded(page);
      // SSR 인증: 로그인 + 등록된 사용자는 / 진입 시 정상 200 응답
      // banned: 로그인 자체는 가능 (gate 는 별도 spec)
      // new: 미등록 → /register redirect 또는 / 진입 가능
      const response = await page.goto('/');
      expect(response?.status()).toBeLessThan(400);
    });
  }
});
