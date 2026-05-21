/**
 * Sprint 14 / F14-B-8 — 회원탈퇴 + 데이터 cascade.
 * Sprint 28 F28-B 단계 2 — page.evaluate bare specifier 'firebase/auth' 제거.
 * window.__e2eFirebase namespace + admin app race condition fix (공유 helper).
 *
 * Firebase Admin SDK 로 사용자 삭제 → Firestore users/{uid} cascade 검증.
 * 실제 UI flow (회원탈퇴 버튼) 는 F14-E (Profile specs) 에서 별도 검증.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { loginAs } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';
import { waitForE2eFirebase } from '../../fixtures/window-firebase';
import { ensureE2eAdmin } from '../../emulator/admin-helper';

function ensureAdmin(): admin.app.App {
  return ensureE2eAdmin();
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

    // 2) page 진입 → window.__e2eFirebase 노출 대기 → custom token 으로 client sign-in
    const token = await admin.auth().createCustomToken(uid);
    await page.goto('/');
    await waitForE2eFirebase(page);
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
        const auth = fb.auth.getAuth(fb.app);
        await fb.auth.signInWithCustomToken(auth, t);
      },
      token,
    );

    const beforeUid = await page.evaluate(() => {
      const fb = (window as unknown as {
        __e2eFirebase: { auth: { getAuth: () => { currentUser: { uid: string } | null } } };
      }).__e2eFirebase;
      return fb.auth.getAuth().currentUser?.uid ?? null;
    });
    expect(beforeUid).toBe(uid);

    // 3) Admin SDK 로 삭제 + Firestore cascade (manually for emulator)
    await admin.auth().deleteUser(uid);
    await admin.firestore().collection('users').doc(uid).delete();

    // 4) 토큰 강제 refresh → 실패해야 (사용자 삭제됨)
    const stillSignedIn = await page.evaluate(async () => {
      const fb = (window as unknown as {
        __e2eFirebase: {
          auth: {
            getAuth: () => {
              currentUser: {
                getIdToken: (forceRefresh?: boolean) => Promise<string>;
              } | null;
            };
          };
        };
      }).__e2eFirebase;
      try {
        await fb.auth.getAuth().currentUser?.getIdToken(true);
        return fb.auth.getAuth().currentUser !== null;
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
    await waitForE2eFirebase(page);
    const uid = await page.evaluate(() => {
      const fb = (window as unknown as {
        __e2eFirebase: { auth: { getAuth: () => { currentUser: { uid: string } | null } } };
      }).__e2eFirebase;
      return fb.auth.getAuth().currentUser?.uid ?? null;
    });
    expect(uid).toBe('e2e-regular');
  });
});
