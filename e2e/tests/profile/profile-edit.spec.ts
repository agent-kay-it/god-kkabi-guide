/**
 * Sprint 14 / F14-E-1 — 프로필 수정 (서버 / 문파 / 직업).
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { loginAs } from '../../emulator/auth-token-helper';

function ensureAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.app();
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  return admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
}

test.afterEach(async () => {
  // 다른 spec 의 displayName/clan/server 보호 — 원상 복구
  ensureAdmin();
  await admin.firestore().collection('users').doc('e2e-regular').update({
    displayName: 'E2E Regular',
    server: 'S785',
    clan: '무명',
    classId: 'class_geomgaek',
  });
});

test('Admin SDK 로 displayName 변경 시 /me 에 반영', async ({ page }) => {
  ensureAdmin();
  const newName = `Renamed-${Date.now()}`;
  await admin.firestore().collection('users').doc('e2e-regular').update({
    displayName: newName,
  });

  await loginAs(page, 'regular');
  await page.goto('/me');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(newName, { exact: false })).toBeVisible({ timeout: 10_000 });
});
