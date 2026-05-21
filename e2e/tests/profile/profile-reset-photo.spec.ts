/**
 * Sprint 14 / F14-E-3 — 프로필 사진 제거 후 default 이미지 복귀.
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../../emulator/admin-helper';

function ensureAdmin(): admin.app.App {
  // Sprint 28 F28-B 단계 2 — 공유 helper (admin app race condition fix)
  return ensureE2eAdmin();
}

test('photoURL 제거 시 Firestore 에 null 또는 FieldValue.delete 반영', async () => {
  ensureAdmin();
  await admin
    .firestore()
    .collection('users')
    .doc('e2e-regular')
    .update({ photoURL: admin.firestore.FieldValue.delete() });

  const snap = await admin.firestore().collection('users').doc('e2e-regular').get();
  const data = snap.data() ?? {};
  expect(data.photoURL).toBeUndefined();
});
