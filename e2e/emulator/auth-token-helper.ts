/**
 * Sprint 14 / F14-A — Emulator Auth Token Helper.
 * Sprint 28 F28-B — page.evaluate dynamic import 제거. emulator REST + NextAuth
 * JWT 직접 발급 패턴으로 전환. 이전 패턴은 브라우저 컨텍스트에서 'firebase/auth'
 * bare specifier 가 resolve 안 되어 1주일(Sprint 14~27) 동안 100% fail.
 *
 * 사용:
 *   import { loginAs } from '../../emulator/auth-token-helper';
 *   test.beforeEach(async ({ page }) => { await loginAs(page, 'regular'); });
 */
import admin from 'firebase-admin';
import type { Page } from '@playwright/test';
import { TEST_USERS, type TestUserSeed } from './seed-fixtures';

export type TestRole = 'admin' | 'regular' | 'banned' | 'new';

function getUserSeed(role: TestRole): TestUserSeed {
  const uid = `e2e-${role}`;
  const seed = TEST_USERS.find((u) => u.uid === uid);
  if (!seed) throw new Error(`Test user not found: ${role}`);
  return seed;
}

function ensureAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.app();
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  return admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
}

export async function createCustomToken(role: TestRole): Promise<string> {
  ensureAdminApp();
  const seed = getUserSeed(role);
  return admin.auth().createCustomToken(seed.uid, seed.claims);
}

/**
 * Page 에 emulator NextAuth session 으로 로그인.
 *
 * 절차 (Sprint 28 F28-B 신규):
 *  1. Admin SDK 로 Firebase custom token 발급 (RTDB / Storage rules 가 필요할 경우)
 *  2. emulator REST: custom token → ID token + refresh token (Firebase Auth 측 인증)
 *  3. /api/auth/e2e-bridge POST: uid + claims → NextAuth JWT cookie 직접 set
 *  4. page.goto('/') 시 인증된 SSR 세션
 *
 * @param page Playwright Page
 * @param role 'admin' | 'regular' | 'banned' | 'new'
 */
export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const seed = getUserSeed(role);

  // 1) emulator REST 를 통한 Firebase Auth ID token 발급
  //    custom token 발급은 admin SDK 가 emulator host env 인식 시 자동 emulator 사용.
  const customToken = await createCustomToken(role);
  const signInRes = await page.context().request.post(
    'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key',
    {
      data: { token: customToken, returnSecureToken: true },
      ignoreHTTPSErrors: true,
    },
  );
  if (!signInRes.ok()) {
    const errBody = await signInRes.text().catch(() => '<unreadable>');
    throw new Error(
      `[loginAs ${role}] emulator signInWithCustomToken failed: ${signInRes.status()} ${errBody.slice(0, 200)}`,
    );
  }

  // 2) /api/auth/e2e-bridge → NextAuth JWT cookie set
  const bridgeRes = await page.context().request.post('http://localhost:3000/api/auth/e2e-bridge', {
    data: {
      uid: seed.uid,
      claims: seed.claims,
    },
  });
  if (!bridgeRes.ok()) {
    const errBody = await bridgeRes.text().catch(() => '<unreadable>');
    throw new Error(
      `[loginAs ${role}] /api/auth/e2e-bridge failed: ${bridgeRes.status()} ${errBody.slice(0, 200)}`,
    );
  }

  // 3) cookie 가 context 에 저장됨 → 다음 navigation 시 인증된 세션
  await page.goto('/', { waitUntil: 'domcontentloaded' });


  console.log(`[loginAs] Logged in as ${role} (uid=${seed.uid})`);
}

/** 로그아웃 — NextAuth cookie 삭제 + reload */
export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies({ name: 'authjs.session-token' });
  await page.reload({ waitUntil: 'domcontentloaded' });
}
