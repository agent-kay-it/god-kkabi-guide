/**
 * Sprint 14 / F14-A — Emulator Auth Token Helper.
 *
 * Playwright page 에서 Google OAuth 우회 → Admin SDK custom token →
 * signInWithCustomToken 으로 즉시 로그인.
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
 * Page 에 emulator 토큰으로 로그인.
 *
 * 절차:
 *  1. Admin SDK 로 custom token 발급
 *  2. page.goto('/')
 *  3. page.evaluate 로 signInWithCustomToken 호출
 *  4. authState 변경 대기
 *
 * @param page Playwright Page
 * @param role 'admin' | 'regular' | 'banned' | 'new'
 */
export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const token = await createCustomToken(role);
  const seed = getUserSeed(role);

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.evaluate(
    async ({ t, projectId }) => {
      // 동적 import — emulator 모드 클라이언트의 firebase/auth 사용
      const { getAuth, signInWithCustomToken, connectAuthEmulator } = await import(
        'firebase/auth'
      );
      const { initializeApp, getApps } = await import('firebase/app');
      const app = getApps()[0] ?? initializeApp({ projectId, apiKey: 'demo-api-key' });
      const auth = getAuth(app);
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      } catch {
        // 이미 연결됨
      }
      await signInWithCustomToken(auth, t);
    },
    { t: token, projectId: 'demo-kkaebizigi-test' },
  );

  // 로그인 후 페이지 갱신 — 인증 상태가 SSR 에 반영되도록
  await page.reload({ waitUntil: 'domcontentloaded' });

  // banned / new 는 게이트 페이지로 redirect 될 수 있음 — 호출자가 검증
   
  console.log(`[loginAs] Logged in as ${role} (uid=${seed.uid})`);
}

/** 로그아웃 (signOut + reload) */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const { getAuth, signOut } = await import('firebase/auth');
    await signOut(getAuth());
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
}
