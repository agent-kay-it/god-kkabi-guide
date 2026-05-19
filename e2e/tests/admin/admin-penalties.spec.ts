/**
 * Sprint 14 / F14-F-3 — admin penalties (ban / unban).
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { loginAs } from '../../emulator/auth-token-helper';

function ensureAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.app();
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  return admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
}

test.afterAll(async () => {
  ensureAdmin();
  // e2e-banned 의 claims 원복
  await admin
    .auth()
    .setCustomUserClaims('e2e-banned', { role: 'banned', registered: true, bannedReason: 'e2e test' });
});

test('admin 이 사용자 ban 후 즉시 해제 (Auth custom claims toggle)', async ({ page }) => {
  ensureAdmin();
  // 1) e2e-regular 를 ban
  await admin.auth().setCustomUserClaims('e2e-regular', {
    role: 'banned',
    registered: true,
    bannedReason: '[TEST-Sprint14] admin ban',
  });
  const banned = await admin.auth().getUser('e2e-regular');
  expect(banned.customClaims?.role).toBe('banned');

  // 2) 해제
  await admin
    .auth()
    .setCustomUserClaims('e2e-regular', { role: 'user', registered: true });
  const restored = await admin.auth().getUser('e2e-regular');
  expect(restored.customClaims?.role).toBe('user');

  // admin 페이지 접근 검증
  await loginAs(page, 'admin');
  await page.goto('/admin/penalties');
  await page.waitForLoadState('networkidle');
  expect(page.url()).toContain('/admin');
});
