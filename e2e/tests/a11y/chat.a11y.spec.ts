/**
 * Sprint 14 / F14-H-3 — /chat a11y (axe-core critical/serious 0).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginAs } from '../../emulator/auth-token-helper';

test('/chat axe-core critical / serious violation 0 (인증 후)', async ({ page }) => {
  await loginAs(page, 'regular');
  await page.goto('/chat');
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
