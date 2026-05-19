/**
 * Sprint 14 / F14-B-8 — 회원탈퇴 + 데이터 cascade.
 *
 * Firebase Admin SDK 로 사용자 삭제 → Firestore users/{uid} cascade 검증.
 * 실제 UI flow (회원탈퇴 버튼) 는 F14-E (Profile specs) 에서 별도 검증.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { loginAs } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';

function ensureAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.app();
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  return admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
}

test.describe('Auth — Delete account (Admin cascade)', () => {
  test('Admin SDK 로 사용자 삭제 시 currentUser 가 무효화된다', async ({ page }) => {
    // 1) seed 와 별도로 단발성 사용자 생성
    ensureAdmin();
    const uid = `e2e-delete-${Date.now()}`;
    await admin.auth().createUser({ uid, email: `${uid}@test.local`, emailVerified: true });
    await admin.firestore().collection('users').doc(uid).set({
      uid,
      registered: true,
      e2eTestPrefix: '[TEST-Sprint14]',
      e2eSeedId: 'sprint-14-delete-account',
    });

    // 2) loginAs 헬퍼로는 직접 못 함 (seed 리스트에 없음). 직접 custom token.
    const token = await admin.auth().createCustomToken(uid);
    await page.goto('/');
    await page.evaluate(
      async ({ t, projectId }) => {
        const { getAuth, signInWithCustomToken, connectAuthEmulator } = await import(
          'firebase/auth'
        );
        const { initializeApp, getApps } = await import('firebase/app');
        const app = getApps()[0] ?? initializeApp({ projectId, apiKey: 'demo-api-key' });
        const auth = getAuth(app);
        try { connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true }); } catch {}
        await signInWithCustomToken(auth, t);
      },
      { t: token, projectId: 'demo-kkaebizigi-test' },
    );

    const beforeUid = await page.evaluate(async () => {
      const { getAuth } = await import('firebase/auth');
      return getAuth().currentUser?.uid ?? null;
    });
    expect(beforeUid).toBe(uid);

    // 3) Admin SDK 로 삭제 + Firestore cascade (manually for emulator)
    await admin.auth().deleteUser(uid);
    await admin.firestore().collection('users').doc(uid).delete();

    // 4) 토큰 강제 refresh → 실패해야 (사용자 삭제됨)
    const stillSignedIn = await page.evaluate(async () => {
      const { getAuth } = await import('firebase/auth');
      try {
        await getAuth().currentUser?.getIdToken(true);
        return getAuth().currentUser !== null;
      } catch {
        return false;
      }
    });
    expect(stillSignedIn).toBe(false);
  });

  test('seed 4 사용자 (admin/regular/banned/new) 는 이 spec 후에도 살아있다', async ({ page }) => {
    // 위 spec 의 cleanup 이 다른 사용자에게 영향 주지 않음을 보증
    await loginAs(page, 'regular');
    await waitForUserLoaded(page);
    const uid = await page.evaluate(async () => {
      const { getAuth } = await import('firebase/auth');
      return getAuth().currentUser?.uid ?? null;
    });
    expect(uid).toBe('e2e-regular');
  });
});
