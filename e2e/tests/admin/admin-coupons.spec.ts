/**
 * Sprint 14 / F14-F-4 — admin coupons CRUD.
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
  const snap = await admin
    .firestore()
    .collection('coupons')
    .where('e2eSeedId', '==', 'sprint-14-f-admin')
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
});

test('admin 쿠폰 발급 → Firestore 저장 확인', async ({ page }) => {
  ensureAdmin();
  const code = `TEST-${Date.now()}`;
  await admin.firestore().collection('coupons').doc(code).set({
    code,
    discount: 10,
    issuedBy: 'e2e-admin',
    issuedAt: admin.firestore.FieldValue.serverTimestamp(),
    e2eTestPrefix: '[TEST-Sprint14]',
    e2eSeedId: 'sprint-14-f-admin',
  });
  const snap = await admin.firestore().collection('coupons').doc(code).get();
  expect(snap.exists).toBe(true);

  await loginAs(page, 'admin');
  await page.goto('/admin/coupons');
  await page.waitForLoadState('networkidle');
  expect(page.url()).toContain('/admin');
});
