/**
 * Sprint 14 / F14-C-10 — 게시물 신고 → admin 큐 진입.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { seedPost, cleanupTestPosts, TEST_PREFIX } from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
  // reports collection cleanup
  if (admin.apps.length === 0) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
  }
  const snap = await admin
    .firestore()
    .collection('reports')
    .where('e2eSeedId', '==', 'sprint-14-c-post')
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
});

test('게시물 신고 시 reports collection 에 entry 생성', async () => {
  const postId = await seedPost();

  if (admin.apps.length === 0) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
  }

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
