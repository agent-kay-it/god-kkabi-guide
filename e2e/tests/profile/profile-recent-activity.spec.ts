/**
 * Sprint 14 / F14-E-5 — 최근 본 항목 표시 (Sprint V7 / Personalization).
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../../emulator/admin-helper';
import { loginAs } from '../../emulator/auth-token-helper';

function ensureAdmin(): admin.app.App {
  // Sprint 28 F28-B 단계 2 — 공유 helper (admin app race condition fix)
  return ensureE2eAdmin();
}

test('users/{uid}/recentViews 추가 시 /me 에 반영 또는 페이지 정상 노출', async ({ page }) => {
  ensureAdmin();
  await admin
    .firestore()
    .collection('users')
    .doc('e2e-regular')
    .collection('recentViews')
    .doc('class_geomgaek')
    .set({
      targetId: 'class_geomgaek',
      targetType: 'class',
      viewedAt: admin.firestore.FieldValue.serverTimestamp(),
      e2eTestPrefix: '[TEST-Sprint14]',
      e2eSeedId: 'sprint-14-e-profile',
    });

  await loginAs(page, 'regular');
  await page.goto('/me');
  await page.waitForLoadState('networkidle');

  // /me 페이지 정상 노출 (회귀: recentViews 추가가 페이지 깨뜨리지 않음)
  const headingExists = await page
    .locator('h1, h2')
    .first()
    .isVisible()
    .catch(() => false);
  expect(headingExists).toBe(true);
});
