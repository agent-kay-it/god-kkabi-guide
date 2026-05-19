/**
 * Sprint 14 / F14-G-4 — tag 검색 / facet.
 */
import { test, expect } from '@playwright/test';

test('/search 페이지에서 카테고리 필터 (chips) 가 노출된다', async ({ page }) => {
  await page.goto('/search');
  await page.waitForLoadState('networkidle');

  // 카테고리 chip 또는 facet 영역 — role=button/link/chip 중 하나
  const chips = page.locator('[role="button"], button, a').filter({ hasText: /직업|진령|무기|보스|게시물|가이드/ });
  const chipCount = await chips.count();
  expect(chipCount).toBeGreaterThan(0);
});
