/**
 * Sprint 14 / F14-B-2 — 회원가입 (첫 진입 → registered=true 전환).
 *
 * 신규 사용자 (e2e-new) 는 registered=false 로 시작 → /register 로 redirect.
 * 등록 폼 작성 → Firestore users/{uid} 에 registered=true + 캐릭터 정보 저장.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';
import { waitForUserLoaded } from '../../fixtures/wait-helpers';

test.describe('Auth — Register (신규 사용자 첫 진입)', () => {
  test('e2e-new 사용자는 / 진입 시 /register 로 redirect 된다', async ({ page }) => {
    await loginAs(page, 'new');
    await waitForUserLoaded(page);
    await page.goto('/');

    // app middleware 가 registered=false 사용자를 /register 로 보낸다
    await expect(page).toHaveURL(/\/register/, { timeout: 10_000 });
  });

  test('register 페이지 폼 요소가 노출된다 (서버 / 문파 / 직업)', async ({ page }) => {
    await loginAs(page, 'new');
    await waitForUserLoaded(page);
    await page.goto('/register');

    // 서버 입력 (S785 등) — 라벨 기반
    await expect(page.getByText(/서버/i).first()).toBeVisible();
    await expect(page.getByText(/직업/i).first()).toBeVisible();
  });
});
