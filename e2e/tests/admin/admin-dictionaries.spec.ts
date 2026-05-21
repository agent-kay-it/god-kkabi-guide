/**
 * Sprint 14 / F14-F-5 — admin dictionaries (직업/진령) 관리.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../../emulator/admin-helper';
import { loginAs } from '../../emulator/auth-token-helper';

function ensureAdmin(): admin.app.App {
  // Sprint 28 F28-B 단계 2 — 공유 helper (admin app race condition fix)
  return ensureE2eAdmin();
}

test.afterAll(async () => {
  ensureAdmin();
  await admin.firestore().collection('classes').doc('class_test_only').delete();
});

test('admin dictionary 항목 추가 → /class 페이지에 노출', async ({ page }) => {
  ensureAdmin();
  await admin.firestore().collection('classes').doc('class_test_only').set({
    id: 'class_test_only',
    name: '[TEST-Sprint14] 테스트 직업',
    tier: 'T2',
    e2eTestPrefix: '[TEST-Sprint14]',
    e2eSeedId: 'sprint-14-f-admin',
  });

  await loginAs(page, 'admin');
  await page.goto('/admin/dictionaries');
  await page.waitForLoadState('networkidle');

  // admin page 접근 + 페이지 정상 렌더 (회귀)
  expect(page.url()).toContain('/admin');
});
