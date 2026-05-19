/**
 * Sprint 14 / F14-H-2 — /post/[id] a11y (axe-core critical/serious 0).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('/post 목록 axe-core critical / serious violation 0', async ({ page }) => {
  await page.goto('/post');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter((v) =>
    ['critical', 'serious'].includes(v.impact ?? ''),
  );

  if (blocking.length > 0) {
     
    console.log(JSON.stringify(blocking, null, 2));
  }
  expect(blocking).toEqual([]);
});

test('/post/e2e-seed-post-001 detail axe-core critical / serious violation 0', async ({ page }) => {
  await page.goto('/post/e2e-seed-post-001');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter((v) =>
    ['critical', 'serious'].includes(v.impact ?? ''),
  );

  if (blocking.length > 0) {
     
    console.log(JSON.stringify(blocking, null, 2));
  }
  expect(blocking).toEqual([]);
});
