/**
 * Sprint 14 / F14-E-4 — 회원탈퇴 + cascade.
 *
 * (F14-B-8 의 spec 와 유사 — 본 spec 은 Profile flow 시점 검증).
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';

function ensureAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.app();
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  return admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
}

test('회원탈퇴 후 users/{uid} + Auth user 모두 제거', async () => {
  ensureAdmin();
  const uid = `e2e-quit-${Date.now()}`;
  await admin.auth().createUser({ uid, email: `${uid}@test.local`, emailVerified: true });
  await admin.firestore().collection('users').doc(uid).set({
    uid,
    registered: true,
    e2eTestPrefix: '[TEST-Sprint14]',
    e2eSeedId: 'sprint-14-e-profile',
  });

  await admin.auth().deleteUser(uid);
  await admin.firestore().collection('users').doc(uid).delete();

  let stillExists = false;
  try {
    await admin.auth().getUser(uid);
    stillExists = true;
  } catch {
    stillExists = false;
  }
  expect(stillExists).toBe(false);

  const snap = await admin.firestore().collection('users').doc(uid).get();
  expect(snap.exists).toBe(false);
});
