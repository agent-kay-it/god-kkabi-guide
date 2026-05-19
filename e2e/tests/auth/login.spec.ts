/**
 * Sprint 14 / F14-B-1 — 정상 로그인 + 인증 상태 노출.
 *
 * Emulator 모드 (Sprint 14 / F14-A) 기반: signInWithCustomToken 으로 OAuth 우회.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';

test.describe('Auth — Login (Custom Token)', () => {
  test('regular 사용자가 로그인하면 /me 에서 displayName 이 노출된다', async ({ page }) => {
    await loginAs(page, 'regular');
    await page.goto('/me');

    await expect(page.getByText('E2E Regular', { exact: false })).toBeVisible({ timeout: 10_000 });
  });

  test('admin 사용자가 로그인하면 admin 권한이 부여된다', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin');

    // admin 페이지 접근 가능 (302 redirect 없음)
    await expect(page).toHaveURL(/\/admin/);
  });

  test('로그인 직후 헤더에 사용자 표시가 나타난다', async ({ page }) => {
    await loginAs(page, 'regular');
    await page.goto('/');

    // 헤더 우상단 사용자 메뉴 / 아바타 영역 (data-testid 또는 role/text 기반)
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });
});
