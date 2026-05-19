# Sprint 14 — Design (Technical Implementation Guide)

> Plan 의 13 PR 을 실제 구현하기 위한 기술 가이드.
> Architecture / Schema / API / 환경 분기 / 코드 컨벤션을 정의.

---

## 1. Firebase Emulator Suite Architecture

### 1.1 emulator vs prod 분기

```
┌─────────────────────────────────────────────────────────┐
│ NEXT_PUBLIC_FIREBASE_USE_EMULATOR  →  분기 변수        │
├─────────────────────────────────────────────────────────┤
│ default (false)                                         │
│   ↓                                                     │
│   god-kkabi-guide (Firebase prod project)               │
│   ↓                                                     │
│   staging + prod 공유 Firestore + Auth + Storage + RTDB │
├─────────────────────────────────────────────────────────┤
│ e2e mode (true)                                         │
│   ↓                                                     │
│   demo-kkaebizigi-test (emulator dummy project)         │
│   ↓                                                     │
│   localhost:9099 (Auth)                                 │
│   localhost:8080 (Firestore)                            │
│   localhost:9199 (Storage)                              │
│   localhost:9000 (Realtime DB)                          │
│   localhost:4400 (Emulator UI)                          │
└─────────────────────────────────────────────────────────┘
```

### 1.2 `firebase.json` (emulator suite 구성)

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "database": { "port": 9000 },
    "ui": { "enabled": true, "port": 4400 },
    "singleProjectMode": true
  },
  "firestore": { "rules": "firestore.rules" },
  "storage": { "rules": "storage.rules" }
}
```

### 1.3 client 분기 (`lib/firebase/client.ts`)

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';

const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true';

const config = useEmulator
  ? { projectId: 'demo-kkaebizigi-test', apiKey: 'demo' }
  : { /* god-kkabi-guide 기존 config */ };

const app = getApps()[0] ?? initializeApp(config);

if (useEmulator && typeof window !== 'undefined') {
  // Idempotent — 두 번 연결 시 throw 방지
  try { connectAuthEmulator(getAuth(app), 'http://localhost:9099', { disableWarnings: true }); } catch {}
  try { connectFirestoreEmulator(getFirestore(app), 'localhost', 8080); } catch {}
  try { connectStorageEmulator(getStorage(app), 'localhost', 9199); } catch {}
  try { connectDatabaseEmulator(getDatabase(app), 'localhost', 9000); } catch {}
}
```

### 1.4 server (admin) 분기 (`lib/firebase/admin.ts`)

```typescript
if (process.env.FIREBASE_USE_EMULATOR === 'true') {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.STORAGE_EMULATOR_HOST = 'http://localhost:9199';
  process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
}
```

### 1.5 e2e mode 시 AdSense/Sentry 비활성화

```typescript
// components/feature/adsense-script.tsx
if (process.env.NEXT_PUBLIC_E2E_MODE === 'true') return null;

// instrumentation-client.ts
if (process.env.NEXT_PUBLIC_E2E_MODE !== 'true') {
  // Sentry.init() 호출
}
```

---

## 2. Test User Provisioning (Emulator)

### 2.1 4 role test user

| Role | Email | Display Name | Custom Claims |
|---|---|---|---|
| admin | e2e-admin@test.local | E2E Admin | `{ role: 'admin' }` |
| regular | e2e-regular@test.local | E2E Regular | `{ role: 'user', registered: true }` |
| banned | e2e-banned@test.local | E2E Banned | `{ role: 'banned' }` |
| new | e2e-new@test.local | E2E New | `{ registered: false }` |

### 2.2 `e2e/emulator/seed-fixtures.ts`

```typescript
import admin from 'firebase-admin';

export async function seedEmulator() {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

  if (admin.apps.length === 0) {
    admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
  }

  const users = [
    { uid: 'e2e-admin',   email: 'e2e-admin@test.local',   claims: { role: 'admin' } },
    { uid: 'e2e-regular', email: 'e2e-regular@test.local', claims: { role: 'user', registered: true } },
    { uid: 'e2e-banned',  email: 'e2e-banned@test.local',  claims: { role: 'banned' } },
    { uid: 'e2e-new',     email: 'e2e-new@test.local',     claims: { registered: false } },
  ];

  for (const u of users) {
    await admin.auth().createUser({ uid: u.uid, email: u.email, emailVerified: true });
    await admin.auth().setCustomUserClaims(u.uid, u.claims);
    await admin.firestore().collection('users').doc(u.uid).set({
      uid: u.uid,
      displayName: u.email.split('@')[0],
      server: 'S785',
      clan: u.claims.role === 'admin' ? '관리자' : null,
      class: 'class_geomgaek',
      registered: u.claims.registered ?? true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // 기본 게시물 / 진령 / 직업 dictionary seed
  await seedBasicData();
}
```

### 2.3 Custom token 로그인 helper

```typescript
// e2e/emulator/auth-token-helper.ts
import admin from 'firebase-admin';
import type { Page } from '@playwright/test';

export async function loginAs(page: Page, role: 'admin' | 'regular' | 'banned' | 'new') {
  const uid = `e2e-${role}`;
  const token = await admin.auth().createCustomToken(uid);

  await page.goto('/');
  await page.evaluate(async (t) => {
    const { getAuth, signInWithCustomToken } = await import('firebase/auth');
    await signInWithCustomToken(getAuth(), t);
  }, token);

  await page.waitForFunction(() => !!(window as unknown as { firebase?: unknown }).firebase);
}
```

---

## 3. [TEST-Sprint14] Cleanup Schema

### 3.1 데이터 태깅 컨벤션

모든 e2e 테스트 데이터는 다음 필드를 가짐:

```typescript
{
  e2eSeedId: 'sprint-14-' + Date.now(),  // unique per spec run
  e2eTestPrefix: '[TEST-Sprint14]',       // human-readable prefix
  e2eOwner: 'sprint-14-spec-id',          // spec 이름
  // ... 실제 데이터 ...
}
```

### 3.2 cleanup 시나리오

```typescript
// scripts/cleanup-test-data.mjs
import admin from 'firebase-admin';

const collections = [
  'posts', 'comments', 'chat-messages',
  'reports', 'notifications', 'penalties',
];

for (const c of collections) {
  const snap = await admin.firestore().collection(c)
    .where('e2eTestPrefix', '==', '[TEST-Sprint14]')
    .get();

  await Promise.all(snap.docs.map(d => d.ref.delete()));
  console.log(`cleanup ${c}: ${snap.size} docs`);
}
```

### 3.3 자동 실행 위치

- `e2e/global-teardown.ts` — 전체 e2e run 종료 후 1회
- `e2e/fixtures/seed-data.ts` 의 afterAll — spec 별 (안전망)
- GitHub Actions e2e.yml 의 마지막 step — emulator state export 직전

---

## 4. Spec File 컨벤션

### 4.1 디렉토리 구조

```
e2e/
├── tests/
│   ├── auth/          # F14-B (8 specs)
│   ├── post/          # F14-C (12 specs)
│   ├── chat/          # F14-D (10 specs)
│   ├── profile/       # F14-E (6 specs)
│   ├── admin/         # F14-F (6 specs)
│   ├── search/        # F14-G (5 specs)
│   ├── a11y/          # F14-H (3 specs)
│   └── visual/        # F14-I (1 spec, 100 screenshot)
├── fixtures/
│   ├── test-users.ts
│   ├── seed-data.ts
│   └── chrome-mcp-helpers.ts
├── emulator/
│   ├── seed-fixtures.ts
│   ├── auth-token-helper.ts
│   └── README.md
├── visual/
│   ├── baseline.config.ts
│   ├── snapshots/
│   └── capture-baseline.ts
├── global-setup.ts
├── global-teardown.ts
└── tsconfig.json
```

### 4.2 spec template

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';
import { seedPost, cleanupTestData } from '../../fixtures/seed-data';

test.describe('Post CRUD — text create', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'regular');
  });

  test.afterEach(async () => {
    await cleanupTestData();
  });

  test('텍스트 게시물 작성 → 목록 반영', async ({ page }) => {
    await page.goto('/post/new');
    await page.getByLabel('제목').fill('[TEST-Sprint14] 텍스트 게시물');
    await page.getByLabel('본문').fill('테스트 본문');
    await page.getByRole('button', { name: '게시' }).click();

    await expect(page).toHaveURL(/\/post\/[\w-]+$/);
    await expect(page.getByRole('heading', { level: 1 }))
      .toContainText('[TEST-Sprint14] 텍스트 게시물');
  });
});
```

---

## 5. Playwright Config 확장

```typescript
// playwright.config.ts 추가 사항
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    extraHTTPHeaders: { 'x-e2e-mode': 'true' },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  retries: process.env.CI ? 3 : 1,
  workers: process.env.CI ? 4 : 2,
  reporter: [['html'], ['github']],

  webServer: process.env.E2E_BASE_URL?.startsWith('http://localhost')
    ? {
        command: 'NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true NEXT_PUBLIC_E2E_MODE=true pnpm dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,

  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 14'] } },
  ],
});
```

### 5.1 `e2e/global-setup.ts`

```typescript
import { spawn } from 'child_process';
import { seedEmulator } from './emulator/seed-fixtures';

export default async function globalSetup() {
  if (process.env.E2E_USE_EMULATOR !== 'true') return;

  // emulator 가 이미 실행 중인지 확인 → 없으면 시작
  // CI 에서는 별도 step 으로 시작하므로 검사만
  await waitForEmulator();
  await seedEmulator();
}
```

---

## 6. Visual Diff Pipeline

### 6.1 baseline 캡처 전략

50 page × (desktop 1920×1080 + mobile 393×852) = 100 screenshot.

```typescript
const PAGES = [
  '/', '/me', '/me/profile', '/me/bookmarks',
  '/post', '/post/new',
  '/chat',
  '/search',
  '/class', '/class/geomgaek', '/class/yongma', '/class/jeonsa',
  '/jinryeong', '/jinryeong/[id]', // × 11
  '/sign-in',
  // ... 총 50 page
];
```

### 6.2 stabilization

```typescript
// 시각 비교 전 안정화
await page.addStyleTag({
  content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
  `,
});
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');
```

### 6.3 diff threshold

- pixel diff ratio < 1% → pass
- font rendering jitter 흡수 (small antialiasing) — threshold 0.1 per pixel
- baseline 변경은 별도 PR (`chore(visual): rebaseline`)

---

## 7. a11y axe-core 통합

```typescript
import AxeBuilder from '@axe-core/playwright';

test('홈 — axe-core critical/serious 0', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  const critical = results.violations.filter(v => ['critical', 'serious'].includes(v.impact ?? ''));
  expect(critical).toEqual([]);
});
```

---

## 8. CI Workflow 갱신

### 8.1 `.github/workflows/e2e.yml`

```yaml
name: e2e

on:
  pull_request:
    branches: [staging, main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: [chromium-desktop, chromium-mobile]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile

      # Java for Firebase emulator
      - uses: actions/setup-java@v4
        with: { distribution: 'temurin', java-version: '17' }

      # Firebase emulator 시작 (백그라운드)
      - run: npm install -g firebase-tools
      - run: firebase emulators:start --only auth,firestore,storage,database --project demo-kkaebizigi-test &
      - run: npx wait-on tcp:9099 tcp:8080 tcp:9199 tcp:9000

      # Playwright 실행
      - run: npx playwright install --with-deps chromium
      - run: pnpm playwright test --project=${{ matrix.project }}
        env:
          NEXT_PUBLIC_FIREBASE_USE_EMULATOR: 'true'
          NEXT_PUBLIC_E2E_MODE: 'true'
          E2E_USE_EMULATOR: 'true'

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.project }}
          path: playwright-report/
```

---

## 9. Coding Conventions (Sprint 14 specific)

- spec 파일명: `{domain}-{action}.spec.ts` (예: `post-text-create.spec.ts`)
- selector 우선순위: `getByRole > getByLabel > getByTestId > CSS`
- assertion: `expect.poll` 로 비동기 상태 polling
- 한국어 라벨 사용: `getByRole('button', { name: '게시' })`
- 모바일 spec: viewport project (`chromium-mobile`) 로 자동 분리
- artifact: 실패 시 screenshot + video + trace 보존

---

## 10. Risk Mitigation Matrix

| Risk (PRD #4) | 대응 위치 | 효과 |
|---|---|---|
| emulator 분리 시 staging 깨짐 | `lib/firebase/client.ts` 의 default false | 0 영향 |
| 사용자 실 계정 데이터 누적 | [TEST-Sprint14] 프리픽스 + cleanup 자동화 | 0 누적 |
| Playwright OAuth 자동화 실패 | emulator 의 custom token | 100% bypass |
| Visual noise | animation disable + font ready + networkidle | flake < 5% |
| phase timeout | phaseTimeoutHours: 240 | 안전 마진 |
| AdSense/Sentry 노이즈 | `NEXT_PUBLIC_E2E_MODE=true` 분기 | 0 노이즈 |
| admin 권한 계정 | emulator custom claims `{ role: 'admin' }` | 100% 가능 |
