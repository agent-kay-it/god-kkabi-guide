/**
 * Sprint 14 / F14-D-7 — 메시지 신고 → reports collection 진입.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../../emulator/admin-helper';
import {
  seedMessage,
  cleanupTestMessages,
  TEST_PREFIX,
} from '../../fixtures/test-chat-helpers';

test.afterAll(async () => {
  await cleanupTestMessages();
  ensureE2eAdmin(); // Sprint 28 F28-B 단계 2 — 공유 helper
  const snap = await admin
    .firestore()
    .collection('reports')
    .where('e2eSeedId', '==', 'sprint-14-d-chat')
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
});

test('채팅 메시지 신고 시 reports collection 에 entry 생성', async () => {
  const messageId = await seedMessage({ body: `${TEST_PREFIX} report target` });

  ensureE2eAdmin(); // Sprint 28 F28-B 단계 2 — 공유 helper
  await admin.firestore().collection('reports').add({
    targetType: 'chat-message',
    targetId: messageId,
    channel: 'global',
    reportedBy: 'e2e-regular',
    reason: 'spam',
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    e2eTestPrefix: TEST_PREFIX,
    e2eSeedId: 'sprint-14-d-chat',
  });

  const snap = await admin
    .firestore()
    .collection('reports')
    .where('targetId', '==', messageId)
    .get();
  expect(snap.size).toBeGreaterThan(0);
});
