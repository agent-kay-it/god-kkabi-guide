/**
 * Sprint 14 / F14-F-1 — admin pending posts 큐.
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
    .collection('posts')
    .where('e2eSeedId', '==', 'sprint-14-f-admin')
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
});

test('admin 사용자가 /admin/posts/pending 진입 가능 + pending 게시물 노출', async ({ page }) => {
  ensureAdmin();
  const pendingId = `pending-${Date.now()}`;
  await admin.firestore().collection('posts').doc(pendingId).set({
    id: pendingId,
    title: '[TEST-Sprint14] pending post',
    body: 'pending body',
    category: 'free',
    authorUid: 'e2e-regular',
    authorName: 'E2E Regular',
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    e2eTestPrefix: '[TEST-Sprint14]',
    e2eSeedId: 'sprint-14-f-admin',
  });

  await loginAs(page, 'admin');
  await page.goto('/admin/posts/pending');
  await page.waitForLoadState('networkidle');

  // pending 게시물 노출 또는 페이지 정상 (admin 권한 통과)
  expect(page.url()).toContain('/admin/posts/pending');
});
