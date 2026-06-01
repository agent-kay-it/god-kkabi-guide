/**
 * Sprint 14 / F14-E-1 — 프로필 수정 (서버 / 문파 / 직업).
 */
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../../emulator/admin-helper';
import { loginAs } from '../../emulator/auth-token-helper';

function ensureAdmin(): admin.app.App {
  // Sprint 28 F28-B 단계 2 — 공유 helper (admin app race condition fix)
  return ensureE2eAdmin();
}

test.afterEach(async () => {
  // 다른 spec 의 displayName/nickname/clan/server 보호 — 원상 복구
  ensureAdmin();
  await admin.firestore().collection('users').doc('e2e-regular').update({
    displayName: 'E2E Regular',
    nickname: 'E2E Regular',
    server: 'S785',
    serverId: 'S785',
    clan: '무명',
    munpa: '무명',
    munpaId: 'muming',
    classId: 'class_geomgaek',
  });
});

test('Admin SDK 로 displayName 변경 시 /me 에 반영', async ({ page }) => {
  ensureAdmin();
  const newName = `Renamed-${Date.now()}`;
  // Sprint 28 F28-B 단계 14 — /me 페이지는 `userDoc.nickname` 우선 lookup.
  //   단계 11 에서 Firestore users 에 nickname 필드 추가 → spec 이 nickname 도 update.
  await admin.firestore().collection('users').doc('e2e-regular').update({
    displayName: newName,
    nickname: newName,
  });

  await loginAs(page, 'regular');
  await page.goto('/me');
  await page.waitForLoadState('networkidle');

  // first() — /me 페이지에 nickname 다중 표시 (header + breadcrumb + h1 + profile + nickname-change)
  await expect(page.getByText(newName, { exact: false }).first()).toBeVisible({ timeout: 10_000 });
});
