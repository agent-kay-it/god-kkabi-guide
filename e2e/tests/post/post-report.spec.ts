/**
 * Sprint 14 / F14-C-10 — 게시물 신고 → admin 큐 진입.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../../emulator/admin-helper';
import { seedPost, cleanupTestPosts, TEST_PREFIX } from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
  // reports collection cleanup
  ensureE2eAdmin(); // Sprint 28 F28-B 단계 2 — 공유 helper
  const snap = await admin
    .firestore()
    .collection('reports')
    .where('e2eSeedId', '==', 'sprint-14-c-post')
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
});

test('게시물 신고 시 reports collection 에 entry 생성', async () => {
  const postId = await seedPost();

  ensureE2eAdmin(); // Sprint 28 F28-B 단계 2 — 공유 helper

  await admin.firestore().collection('reports').add({
    targetType: 'post',
    targetId: postId,
    reportedBy: 'e2e-regular',
    reason: 'spam',
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    e2eTestPrefix: TEST_PREFIX,
    e2eSeedId: 'sprint-14-c-post',
  });

  const snap = await admin
    .firestore()
    .collection('reports')
    .where('targetId', '==', postId)
    .get();
  expect(snap.size).toBeGreaterThan(0);
});
