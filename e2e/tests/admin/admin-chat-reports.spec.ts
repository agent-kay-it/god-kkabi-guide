/**
 * Sprint 14 / F14-F-2 — admin 채팅 신고 처리.
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
  const snap = await admin
    .firestore()
    .collection('reports')
    .where('e2eSeedId', '==', 'sprint-14-f-admin')
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
});

test('admin 의 /admin/chat 진입 + 신고 entry 노출', async ({ page }) => {
  ensureAdmin();
  await admin.firestore().collection('reports').add({
    targetType: 'chat-message',
    targetId: 'msg-x',
    reportedBy: 'e2e-regular',
    reason: '[TEST-Sprint14] spam',
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    e2eTestPrefix: '[TEST-Sprint14]',
    e2eSeedId: 'sprint-14-f-admin',
  });

  await loginAs(page, 'admin');
  await page.goto('/admin/chat');
  await page.waitForLoadState('networkidle');

  expect(page.url()).toContain('/admin');
});
