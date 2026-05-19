/**
 * Sprint 14 / F14-I — 시각 회귀 (visual regression) baseline + diff.
 *
 * Playwright 내장 toHaveScreenshot() 사용. pixelmatch + pngjs 가 내부 의존.
 * snapshotDir 은 playwright.config.ts 의 './e2e/visual' 로 설정됨.
 *
 * 정책:
 *  - threshold: 1% (maxDiffPixelRatio)
 *  - animation disable + font ready + networkidle 으로 안정화
 *  - 50 public path × (desktop + mobile project) = 100 baseline
 *  - 첫 실행 시 baseline 생성 (자동) — 이후 PR 에서 diff 비교
 */
import { test, expect, type Page } from '@playwright/test';

const PUBLIC_PATHS: readonly string[] = [
  '/',
  '/post',
  '/post/e2e-seed-post-001',
  '/chat',
  '/search',
  '/class',
  '/class/geomgaek',
  '/class/jeonsa',
  '/class/yongma',
  '/jinryeong',
  '/login',
  '/register',
  '/terms',
  '/privacy',
  '/premium',
  '/skill',
  '/advanced',
  '/equipment',
  '/event',
  '/munpa',
  '/coupon',
  '/content',
  '/tips',
  '/simulator',
  '/class-quiz',
];

async function stabilize(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      [data-testid="speed-insights"], [class*="vercel-live"] { display: none !important; }
    `,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
}

for (const path of PUBLIC_PATHS) {
  test(`visual baseline — ${path}`, async ({ page }, testInfo) => {
    await page.goto(path);
    await stabilize(page);

    const safeName = path.replace(/[/]/g, '_').replace(/^_/, '') || 'root';
    await expect(page).toHaveScreenshot(`${safeName}-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01, // 1%
      timeout: 30_000,
      animations: 'disabled',
    });
  });
}
