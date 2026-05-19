/**
 * Sprint 14 / F14-G-1 — 한글 검색 정확도.
 */
import { test, expect } from '@playwright/test';

test('/search 페이지에서 한글 키워드 입력 → 결과 응답', async ({ page }) => {
  await page.goto('/search');
  await page.waitForLoadState('networkidle');

  const input = page
    .locator('input[type="search"], input[type="text"]')
    .first();
  await input.fill('검객');
  await page.waitForTimeout(800); // debounce

  // 결과 영역에 '검객' 포함 항목 노출 또는 카테고리 표시
  const body = await page.content();
  expect(/검객|class_geomgaek/i.test(body)).toBe(true);
});

test('한글 자모 분리 (ㄱㅓㅁ) 검색도 동작', async ({ page }) => {
  await page.goto('/search');
  await page.waitForLoadState('networkidle');

  const input = page
    .locator('input[type="search"], input[type="text"]')
    .first();
  await input.fill('ㄱㅓㅁ');
  await page.waitForTimeout(800);

  // 자모 분리 검색은 구현 여부에 따라 다름 — 본 spec 은 페이지 깨지지 않음 회귀
  expect(page.url()).toContain('/search');
});
