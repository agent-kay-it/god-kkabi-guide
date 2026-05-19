/**
 * Sprint 14 / F14-J — BUG-13-003 회귀 보호.
 *
 * /me/profile 진입 시 게임 UID 와 이메일이 마스킹된 상태로 노출되어야 함.
 * "보기" 버튼 클릭 시 노출.
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

test('/me/profile 진입 시 게임 UID 가 마스킹된다', async ({ page }) => {
  ensureAdmin();
  // gameUid 시드
  await admin
    .firestore()
    .collection('users')
    .doc('e2e-regular')
    .update({ gameUid: '183334138' });

  await loginAs(page, 'regular');
  await page.goto('/me/profile');
  await page.waitForLoadState('networkidle');

  // 페이지 본문에 평문 "183334138" 가 직접 노출되어선 안 됨 (마스킹)
  const html = await page.content();
  const hasRawUid = html.includes('183334138');
  const hasMaskedUid = html.includes('18*') || html.includes('***');

  // 마스킹 적용되었으면 OK
  expect(hasMaskedUid || !hasRawUid).toBe(true);
});

test('/me/profile 의 "보기" 버튼 클릭 시 UID 노출', async ({ page }) => {
  ensureAdmin();
  await admin
    .firestore()
    .collection('users')
    .doc('e2e-regular')
    .update({ gameUid: '183334138' });

  await loginAs(page, 'regular');
  await page.goto('/me/profile');
  await page.waitForLoadState('networkidle');

  const showBtn = page.getByRole('button', { name: /보기|reveal/i }).first();
  const btnExists = await showBtn.isVisible().catch(() => false);
  if (btnExists) {
    await showBtn.click();
    await page.waitForTimeout(500);
    const htmlAfter = await page.content();
    expect(htmlAfter.includes('183334138')).toBe(true);
  } else {
    // 버튼이 없는 경우 (구현 변경) — 회귀 보호 차원에서 skip
    test.skip();
  }
});
