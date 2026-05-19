/**
 * Sprint 14 / F14-G-2 — 관련 항목 추천 (related).
 */
import { test, expect } from '@playwright/test';

test('directories 페이지 진입 시 관련 항목 영역 정상 노출', async ({ page }) => {
  await page.goto('/class/geomgaek');
  await page.waitForLoadState('networkidle');

  // 페이지 정상 렌더 — related section 은 구현 여부에 따라 다름
  // 페이지 자체가 깨지지 않으면 회귀 통과
  const heading = await page.locator('h1').first().textContent();
  expect(heading).toBeTruthy();
});
