/**
 * Sprint 14 / F14-E-6 — 북마크 추가 / 제거 / 정렬.
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

test.afterAll(async () => {
  ensureAdmin();
  const snap = await admin
    .firestore()
    .collection('users')
    .doc('e2e-regular')
    .collection('bookmarks')
    .where('e2eSeedId', '==', 'sprint-14-e-profile')
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
});

test('북마크 추가 시 /me/bookmarks 에 노출', async ({ page }) => {
  ensureAdmin();
  const bookmarkId = `bm-${Date.now()}`;
  await admin
    .firestore()
    .collection('users')
    .doc('e2e-regular')
    .collection('bookmarks')
    .doc(bookmarkId)
    .set({
      id: bookmarkId,
      targetType: 'post',
      targetId: 'e2e-seed-post-001',
      title: '[TEST-Sprint14] 시드 게시물 001',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      e2eTestPrefix: '[TEST-Sprint14]',
      e2eSeedId: 'sprint-14-e-profile',
    });

  await loginAs(page, 'regular');
  await page.goto('/me/bookmarks');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(/시드 게시물 001/i).first()).toBeVisible({ timeout: 10_000 });
});
