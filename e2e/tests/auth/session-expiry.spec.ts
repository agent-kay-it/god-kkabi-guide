/**
 * Sprint 14 / F14-B-6 — 세션 만료 (refresh token).
 * Sprint 28 F28-B 단계 21 — emulator REST response 의 실제 응답 format 정합.
 * signInWithCustomToken 응답에는 idToken/refreshToken/expiresIn 만 존재 (localId 없음).
 * refresh 응답은 iat 가 같은 second 면 동일 idToken 반환 가능 → user_id 만 검증.
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
      expiresIn: string;
    };
    expect(body.idToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
    expect(body.expiresIn).toBeTruthy();
    // idToken decode 시 sub === uid. base64url decode 후 payload 검증.
    const payload = JSON.parse(
      Buffer.from(body.idToken.split('.')[1] ?? '', 'base64').toString('utf-8'),
    ) as { sub?: string; user_id?: string };
    expect(payload.sub ?? payload.user_id).toBe('e2e-regular');
  });

  test('emulator REST: refresh token 으로 새 ID token 발급 + user_id 보존', async ({ page }) => {
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);

    const customToken = await createCustomToken('regular');
    const signInRes = await page.context().request.post(
      'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key',
      {
        data: { token: customToken, returnSecureToken: true },
      },
    );
    const signInBody = (await signInRes.json()) as { refreshToken: string };

    const refreshRes = await page.context().request.post(
      'http://localhost:9099/securetoken.googleapis.com/v1/token?key=fake-api-key',
      {
        form: { grant_type: 'refresh_token', refresh_token: signInBody.refreshToken },
      },
    );
    expect(refreshRes.ok()).toBe(true);
    const refreshBody = (await refreshRes.json()) as { id_token: string; user_id: string };
    expect(refreshBody.id_token).toBeTruthy();
    expect(refreshBody.user_id).toBe('e2e-regular');
  });
});
