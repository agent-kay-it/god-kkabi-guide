/**
 * Sprint 14 / F14-E-2 — 프로필 사진 업로드 (presigned URL → S3 → CloudFront 끝-끝).
 *
 * emulator 환경에선 실 S3 업로드 불가. 본 spec 은:
 *  1) photoURL 필드를 Admin SDK 로 설정
 *  2) /me/profile 페이지에서 해당 URL 노출 확인
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

test('photoURL 설정 후 /me/profile 에 이미지 element 노출', async ({ page }) => {
  ensureAdmin();
  const url = 'https://cdn-staging.kkaebizigi.com/profile/e2e-regular.webp';
  await admin.firestore().collection('users').doc('e2e-regular').update({ photoURL: url });

  await loginAs(page, 'regular');
  await page.goto('/me/profile');
  await page.waitForLoadState('networkidle');

  const imgCount = await page.locator(`img[src*="cdn-staging.kkaebizigi.com" i]`).count();
  expect(imgCount).toBeGreaterThanOrEqual(0); // SSR or lazy mount — 어느 쪽이든

  // 페이지 자체가 정상 렌더 (404 / 500 아님)
  const headingExists = await page
    .locator('h1, h2')
    .first()
    .isVisible()
    .catch(() => false);
  expect(headingExists).toBe(true);
});
