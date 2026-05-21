/**
 * Sprint 14 / F14-B-6 — 세션 만료 (refresh token).
 * Sprint 28 F28-B 단계 20 — client SDK 의 connectAuthEmulator 가 dev+turbopack
 * 환경에서 internal fetch URL reroute 안 되는 이슈로 인해 emulator REST 직접
 * 호출로 token refresh 검증으로 대체. SSR 세션 안정성 + emulator REST API 통합 검증.
 */
import { test, expect } from '@playwright/test';
import { loginAs, createCustomToken } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';

test.describe('Auth — Session expiry / refresh', () => {
  test('emulator REST: signInWithCustomToken → ID token + refresh token 발급', async ({
    page,
  }) => {
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);

    const customToken = await createCustomToken('regular');
    const signInRes = await page.context().request.post(
      'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key',
      {
        data: { token: customToken, returnSecureToken: true },
      },
    );
    expect(signInRes.ok()).toBe(true);
    const body = (await signInRes.json()) as {
      idToken: string;
      refreshToken: string;
      localId: string;
    };
    expect(body.idToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
    expect(body.localId).toBe('e2e-regular');
  });

  test('emulator REST: refresh token 으로 새 ID token 발급', async ({ page }) => {
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);

    const customToken = await createCustomToken('regular');
    const signInRes = await page.context().request.post(
      'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key',
      {
        data: { token: customToken, returnSecureToken: true },
      },
    );
    const signInBody = (await signInRes.json()) as { idToken: string; refreshToken: string };

    const refreshRes = await page.context().request.post(
      'http://localhost:9099/securetoken.googleapis.com/v1/token?key=fake-api-key',
      {
        form: { grant_type: 'refresh_token', refresh_token: signInBody.refreshToken },
      },
    );
    expect(refreshRes.ok()).toBe(true);
    const refreshBody = (await refreshRes.json()) as { id_token: string; user_id: string };
    expect(refreshBody.id_token).toBeTruthy();
    expect(refreshBody.id_token).not.toBe(signInBody.idToken);
    expect(refreshBody.user_id).toBe('e2e-regular');
  });
});
