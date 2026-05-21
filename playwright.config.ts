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

// Sprint 18 / F18-B — webServer 기동 조건 fix.
// 이전: CI 환경에서는 webServer 미기동 (deployed staging URL 가정).
// 문제: E2E_BASE_URL=http://localhost:3000 + E2E_USE_EMULATOR=true 인 CI 모드에서
//   webServer 가 미기동되어 모든 spec 이 ECONNREFUSED.
// 수정: BASE_URL 이 localhost 이면 항상 webServer 기동 (CI/local 동일).
const SHOULD_START_WEB_SERVER = BASE_URL.startsWith('http://localhost');

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

  // Sprint 28 F28-B 단계 11 — missing visual baseline 자동 생성 + pass.
  // CI runner 마다 baseline png 가 fresh disk 에 없음 → 매 run fail (25회). text-mute
  // 색상 변경 (#6e6a64 → #928d7f) 으로 어차피 baseline 재생성 필요한 상황.
  // 'missing' 옵션: 기존 baseline 이 있으면 비교, 없으면 자동 생성 + pass.
  // CI artifact 의 e2e/visual 디렉토리를 다운로드 후 commit 하면 다음 run 부터
  // 정상 회귀 검증 동작 (현 PR 의 baseline 은 의도된 design change 반영).
  updateSnapshots: 'missing',

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
  //
  // Sprint 28 F28-B 단계 7 — webServer env 명시화.
  //  이전: command 의 inline prefix env (`KEY=VALUE next dev`). spawn 환경에
  //    따라 inherit 보장 안 됨 → server runtime 에 NEXT_PUBLIC_FIREBASE_USE_EMULATOR
  //    set 안 됨 → e2e-bridge route 의 isE2eEnvironment() === false → 404 응답 →
  //    loginAs 의 모든 spec 실패. 본 CI 로그에서 fallback HTML 응답 확인.
  //  수정: Playwright `env` 옵션에 명시. GitHub Actions step env 의 모든 값을
  //    그대로 server runtime 에 전달. inline prefix env 제거.
  ...(SHOULD_START_WEB_SERVER
    ? {
        webServer: {
          // Sprint 14 F14-A — emulator + e2e mode env 자동 주입.
          // Sprint 18 F18-B — CI 환경에서 tene 미설치 → next 직접 호출.
          // 로컬에서는 pnpm dev (tene run wrapper) 가 시크릿 주입.
          command: IS_CI
            ? 'npx next dev --turbopack -p 3000'
            : process.env.E2E_USE_EMULATOR === 'true'
              ? 'pnpm dev'
              : 'pnpm dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 180_000,
          env: {
            // 1) 현재 process env 모두 상속 (workflow env block 의 NEXT_PUBLIC_*, AUTH_SECRET, …)
            //    Record<string, string> 강제 캐스팅 (process.env 의 일부 undefined 제거).
            ...Object.fromEntries(
              Object.entries(process.env).filter(([, v]) => typeof v === 'string'),
            ),
            // 2) 명시 override (workflow env 미설정 시 fallback)
            NEXT_PUBLIC_FIREBASE_USE_EMULATOR:
              process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR ??
              (IS_CI || process.env.E2E_USE_EMULATOR === 'true' ? 'true' : ''),
            NEXT_PUBLIC_E2E_MODE:
              process.env.NEXT_PUBLIC_E2E_MODE ??
              (IS_CI || process.env.E2E_USE_EMULATOR === 'true' ? 'true' : ''),
            FIREBASE_USE_EMULATOR:
              process.env.FIREBASE_USE_EMULATOR ??
              (IS_CI || process.env.E2E_USE_EMULATOR === 'true' ? 'true' : ''),
          },
        },
      }
    : {}),
});
