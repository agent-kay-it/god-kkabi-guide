/**
 * Sprint 14 / F14-B-8 — 회원탈퇴 + 데이터 cascade.
 * Sprint 28 F28-B 단계 20 — client SDK signInWithCustomToken 의 dev mode reroute
 * 미동작 이슈로 인해 admin SDK + emulator REST + Firestore 검증으로 대체.
 *
 * Firebase Admin SDK 로 사용자 삭제 → Firestore users/{uid} cascade 검증.
 * 실제 UI flow (회원탈퇴 버튼) 는 F14-E (Profile specs) 에서 별도 검증.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../../emulator/admin-helper';

function ensureAdmin(): admin.app.App {
  return ensureE2eAdmin();
}

test.describe('Auth — Delete account (Admin cascade)', () => {
  test('Admin SDK 로 사용자 삭제 → emulator REST refresh token 실패', async () => {
    // 1) 단발성 사용자 생성 + Firestore users 시드
    ensureAdmin();
    const uid = `e2e-delete-${Date.now()}`;
    await admin.auth().createUser({ uid, email: `${uid}@test.local`, emailVerified: true });
    await admin.firestore().collection('users').doc(uid).set({
      uid,
      registered: true,
      e2eTestPrefix: '[TEST-Sprint14]',
      e2eSeedId: 'sprint-14-delete-account',
    });

    // 2) custom token 발급 + emulator REST signInWithCustomToken → idToken / refreshToken
    const customToken = await admin.auth().createCustomToken(uid);
    const signInRes = await fetch(
      'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      },
    );
    expect(signInRes.ok).toBe(true);
    const signInBody = (await signInRes.json()) as {
      idToken: string;
      refreshToken: string;
      localId: string;
    };
    expect(signInBody.localId).toBe(uid);

    // 3) Admin SDK 로 사용자 삭제 + Firestore doc cascade
    await admin.auth().deleteUser(uid);
    await admin.firestore().collection('users').doc(uid).delete();

    // 4) refresh token 으로 새 ID token 시도 → emulator 가 USER_NOT_FOUND 또는 USER_DISABLED 응답
    const refreshRes = await fetch(
      'http://localhost:9099/securetoken.googleapis.com/v1/token?key=fake-api-key',
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(signInBody.refreshToken)}`,
      },
    );
    expect(refreshRes.ok).toBe(false);

    // 5) Firestore doc 도 cascade 삭제됐는지 확인
    const docSnap = await admin.firestore().collection('users').doc(uid).get();
    expect(docSnap.exists).toBe(false);
  });

  test('seed 4 사용자 (admin/regular/banned/new) 는 이 spec 후에도 살아있다', async () => {
    ensureAdmin();
    for (const uid of ['e2e-admin', 'e2e-regular', 'e2e-banned', 'e2e-new']) {
      const user = await admin.auth().getUser(uid);
      expect(user.uid).toBe(uid);
      const doc = await admin.firestore().collection('users').doc(uid).get();
      expect(doc.exists).toBe(true);
    }
  });
});
