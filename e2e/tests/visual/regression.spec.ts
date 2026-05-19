/**
 * Sprint 14 / F14-I + Sprint 15 / F15-C — 시각 회귀 (visual regression).
 *
 * Playwright 내장 toHaveScreenshot() 사용. pixelmatch + pngjs 가 내부 의존.
 * snapshotDir 은 playwright.config.ts 의 './e2e/visual' 로 설정됨.
 *
 * 정책:
 *  - threshold: 1% (maxDiffPixelRatio)
 *  - F15-C 강화 stabilization: prefers-reduced-motion + font ready + RSC streaming + lazy mount
 *  - 25 public path × 2-3 project = 50-75 baseline
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

/**
 * Sprint 15 F15-C — 강화된 stabilize().
 *
 * 추가 사항:
 *  - prefers-reduced-motion: reduce (emulateMedia)
 *  - lazy image mount 트리거 (scroll bounce)
 *  - Vercel toolbar / Speed Insights / vercel.live / autoplay carousel 숨김 + 정지
 *  - 추가 500ms idle (RSC streaming + 이미지 decode buffer)
 */
async function stabilize(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }
      [data-testid="speed-insights"],
      [class*="vercel-live"],
      [class*="vercel-toolbar"],
      iframe[src*="vercel.live"],
      [data-vercel-toolbar] { display: none !important; }
      [data-autoplay="true"] { animation-play-state: paused !important; }
    `,
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  // lazy image mount 트리거
  await page.evaluate(() => {
    window.scrollTo({ top: 1, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
  });
  // 추가 idle (이미지 decode + paint buffer)
  await page.evaluate(() => new Promise<void>((r) => setTimeout(r, 500)));
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
