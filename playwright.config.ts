/**
 * Playwright config — Sprint 13 / F13-A-2.
 * 출처: docs/sprint/13-sprint-qa/design.md §1.2
 *
 * Projects:
 *  - chromium-desktop (1440×900)
 *  - chromium-mobile (Pixel 7 emulation)
 *  - webkit-mobile (iPhone 14 emulation)
 *
 * 기본 baseURL: staging.kkaebizigi.com (E2E_BASE_URL env 로 override)
 * Local dev: webServer 자동 기동 (외부 URL 미지정 시)
 * CI: retries=2, workers=2, github reporter
 *
 * globalSetup 에서 Google sign-in 1회 → storageState 저장 (다음 sprint task).
 */
import { defineConfig, devices } from '@playwright/test';

const BASE_URL =
  process.env.E2E_BASE_URL ??
  (process.env.CI ? 'https://staging.kkaebizigi.com' : 'http://localhost:3000');

const IS_CI = !!process.env.CI;

const SHOULD_START_WEB_SERVER = !IS_CI && BASE_URL.startsWith('http://localhost');

// Playwright 의 build.babelPlugins 가 인식할 수 있게 tsconfig 위치 명시.
// e2e/tsconfig.json 이 root tsconfig (moduleResolution: bundler) 와 분리되어
// Playwright 환경 (node + esm interop) 에 맞춤.
process.env.TS_NODE_PROJECT = process.env.TS_NODE_PROJECT ?? './e2e/tsconfig.json';

export default defineConfig({
  testDir: './e2e/tests',
  // visual snapshots 별도 directory
  snapshotDir: './e2e/visual',
  outputDir: './e2e/test-results',

  // Sprint 14 F14-A — emulator seed + cleanup
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),

  // 병렬 + 안정성
  fullyParallel: true,
  forbidOnly: IS_CI,
  // Sprint 15 F15-A: CI flake 강화 — retries 2 → 3 (transient 보호).
  // 더 높이면 실 fail 의 catch 가 느려지므로 3 이 최적 균형.
  retries: IS_CI ? 3 : 0,
  workers: IS_CI ? 2 : '50%',

  // 글로벌 timeout
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // 보고
  reporter: IS_CI
    ? [
        ['html', { outputFolder: 'e2e/playwright-report', open: 'never' }],
        ['json', { outputFile: 'e2e/playwright-report/results.json' }],
        ['github'],
      ]
    : [
        ['html', { outputFolder: 'e2e/playwright-report', open: 'on-failure' }],
        ['list'],
      ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    // viewport 는 project 별로 override
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'webkit-mobile',
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],

  // 로컬에서 baseURL 이 localhost 일 때 dev server 자동 기동.
  // staging URL 사용 시 webServer key 자체 omit (이미 deployed).
  ...(SHOULD_START_WEB_SERVER
    ? {
        webServer: {
          // Sprint 14 F14-A — emulator + e2e mode env 자동 주입
          command:
            process.env.E2E_USE_EMULATOR === 'true'
              ? 'NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true NEXT_PUBLIC_E2E_MODE=true pnpm dev'
              : 'pnpm dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 180_000,
        },
      }
    : {}),
});
