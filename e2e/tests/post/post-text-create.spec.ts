/**
 * Sprint 14 / F14-C-1 — 텍스트 게시물 작성 → DB 저장 → 목록 반영.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';
import { cleanupTestPosts, TEST_PREFIX } from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});

test('regular 사용자가 텍스트 게시물을 작성하면 목록에 노출된다', async ({ page }) => {
  const uniqueTitle = `${TEST_PREFIX} 텍스트 게시물 ${Date.now()}`;

  await loginAs(page, 'regular');
  await page.goto('/post/new');

  // 폼 필드 (라벨 기반)
  const titleInput = page.getByLabel(/제목|title/i).first();
  const bodyInput = page.getByLabel(/본문|내용|content|body/i).first();

  await titleInput.fill(uniqueTitle);
  await bodyInput.fill('Sprint 14 F14-C-1 자동 생성 본문');

  // 게시 버튼 클릭
  await page.getByRole('button', { name: /게시|등록|submit/ }).first().click();

  // /post/{id} 로 redirect 되거나 /post 로 돌아감
  await page.waitForLoadState('networkidle');

  // 목록 진입 + 제목 확인
  await page.goto('/post');
  await expect(page.getByText(uniqueTitle, { exact: false })).toBeVisible({ timeout: 10_000 });
});
