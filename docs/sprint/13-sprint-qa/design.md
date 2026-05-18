# Sprint 13 — Design (Playwright 아키텍처 + 시나리오 카탈로그)

**Sprint ID**: `13-sprint-qa`
**상위 문서**: `prd.md`, `plan.md`
**작성일**: 2026-05-18

---

## 1. Playwright Workspace 아키텍처

### 1.1 Directory Layout

```
e2e/
├── playwright.config.ts                # projects + retries + reporters
├── fixtures/
│   ├── test-users.ts                  # admin/regular/banned/new account 풀
│   ├── seed-data.ts                   # Firebase Admin SDK 시드/정리
│   ├── auth-state.ts                  # storageState 재사용 패턴
│   ├── chrome-mcp-helpers.ts          # MCP scenario 실행 헬퍼
│   └── lighthouse-runner.ts           # Playwright 내 lighthouse 호출 wrapper
├── tests/
│   ├── auth/                          # 8 specs
│   ├── post/                          # 12 specs
│   ├── chat/                          # 10 specs
│   ├── profile/                       # 6 specs
│   ├── admin/                         # 6 specs
│   ├── search/                        # 5 specs
│   └── a11y/                          # 3 specs
├── visual/                            # snapshot baselines
└── playwright-report/                 # gitignore
```

### 1.2 `playwright.config.ts` 설계

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : '50%',
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://staging.kkaebizigi.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'webkit-mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

### 1.3 Auth Fixture 패턴 (storageState 재사용)

```ts
// e2e/fixtures/auth-state.ts
import { test as base, type Page } from '@playwright/test';
import path from 'node:path';

const STORAGE_DIR = path.join(import.meta.dirname, '.storage');

export const test = base.extend<{
  authedPage: Page;
  adminPage: Page;
  bannedPage: Page;
}>({
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(STORAGE_DIR, 'regular.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(STORAGE_DIR, 'admin.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  bannedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(STORAGE_DIR, 'banned.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

**storageState 생성**: 별도 `e2e/setup/global-setup.ts` 가 globalSetup 단계에서 3개 role 별로 Google sign-in 1회 후 storageState 저장 → 모든 test 가 재사용.

### 1.4 Console / Network Error 감시

```ts
// e2e/fixtures/error-tracker.ts
export function attachErrorTracker(page: Page) {
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', (resp) => {
    if (resp.status() >= 400) networkErrors.push(`${resp.status()} ${resp.url()}`);
  });
  return { consoleErrors, networkErrors };
}
```

**모든 test 의 afterEach 에 `expect(consoleErrors).toEqual([])` + `expect(networkErrors).toEqual([])` 강제** (DoD-2).

### 1.5 a11y 검증 패턴

```ts
import AxeBuilder from '@axe-core/playwright';

test('홈 페이지 a11y violations 0', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
});
```

### 1.6 시각 회귀 패턴

```ts
test('홈 페이지 모바일 시각 회귀', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('home-mobile.png', {
    maxDiffPixelRatio: 0.01, // 1% tolerance
    animations: 'disabled',
  });
});
```

---

## 2. 시나리오 카탈로그 (60건)

### 2.1 Auth (F13-B / 8건)

| ID | 시나리오 | 7-Layer 검증 |
|---|---|:--:|
| auth-01 | 새 사용자 Google sign-in → registration 폼 → /me 진입 | UI→Client→API→DB→Response→Client→UI ✅ |
| auth-02 | 기존 사용자 1-tap 로그인 | ✅ |
| auth-03 | 로그아웃 → 보호 페이지 접근 시 /login redirect | ✅ |
| auth-04 | banned role 사용자가 chat / post 작성 차단 | ✅ (S2-S6 hop) |
| auth-05 | 탭 A 로그아웃 → 탭 B 보호 page refresh → redirect | multi-context |
| auth-06 | JWT 만료 시뮬 (cookie 만료시간 강제) → 자동 갱신 | ✅ |
| auth-07 | NextAuth session → Firebase custom token sync → RTDB 연결 OK | full hop |
| auth-08 | 탈퇴 신청 → 30일 cooldown UI 표시 → 다시 로그인 시 복원 | ✅ |

### 2.2 Post (F13-C / 12건)

| ID | 시나리오 | 핵심 검증 |
|---|---|:--:|
| post-01 | 텍스트 post 작성 → /post/[id] 진입 | full hop |
| post-02 | 이미지 첨부 → presigned URL → S3 → CDN HEAD 200 → 본문 next/image 렌더 | Sprint 11 회귀 |
| post-03 | YouTube URL → embed 자동 변환 (rehype-youtube-embed) | rehype 검증 |
| post-04 | 일반 URL → OG preview 카드 (link-preview SSRF guard 통과) | OG fetch |
| post-05 | 작성 중 새로고침 → autosave draft 복원 | localStorage |
| post-06 | 본인 post 편집 → 본문 변경 → 재배포 | full hop |
| post-07 | 본인 post 삭제 → /post/[id] 404 | full hop |
| post-08 | 댓글 작성 + 답글 + 좋아요 | comment thread |
| post-09 | 좋아요 → /me/bookmarks 노출 | bookmark resolver |
| post-10 | 신고 → admin/posts/pending 대기열 등장 | report flow |
| post-11 | 두 사용자 view → view count == 2 | increment |
| post-12 | 레거시 firebasestorage URL post 가 native `<img>` 로 렌더 (Sprint 11 E 회귀) | markdown-render segment |

### 2.3 Chat (F13-D / 10건)

| ID | 시나리오 | 핵심 검증 |
|---|---|:--:|
| chat-01 | global 채널 텍스트 메시지 broadcast | RTDB write/read |
| chat-02 | 서버 채널 (등록 serverId 만 접근) | channel-permission |
| chat-03 | 문파 채널 (등록 guildId 만 접근) | channel-permission |
| chat-04 | 이미지 메시지 + Lightbox 열기 + ESC 닫기 | Sprint 11 D 회귀 |
| chat-05 | URL 메시지 → OG preview inline | link-preview-in-message |
| chat-06 | 5초 내 5건 초과 → rate limit | rate-limit-policy |
| chat-07 | 신고 → admin/chat 대기열 | report flow |
| chat-08 | banned 사용자 input 비활성 | role guard |
| chat-09 | global 메시지가 server/guild 채널 누락 노출 안됨 (leak 차단) | channel-resolver |
| chat-10 | 모바일 drawer 열기/닫기 + 채널 전환 | mobile UX |

### 2.4 Profile (F13-E / 6건)

| ID | 시나리오 |
|---|---|
| profile-01 | 닉네임/서버/문파 변경 → Firestore 반영 |
| profile-02 | 프로필 사진 업로드 → customPhotoURL 반영 (Sprint 11 E) |
| profile-03 | 구글 사진으로 리셋 → customPhotoURL null |
| profile-04 | 탈퇴 신청 → 30일 cooldown 표시 |
| profile-05 | /me 최근 활동 5건 노출 |
| profile-06 | /me/bookmarks 정렬 + 페이지네이션 |

### 2.5 Admin (F13-F / 6건)

| ID | 시나리오 |
|---|---|
| admin-01 | 신고된 post 승인/거절 |
| admin-02 | 신고된 chat 메시지 처리 |
| admin-03 | 사용자 ban / temp-ban / unban |
| admin-04 | 쿠폰 생성 + 발급 + 사용자 redeem |
| admin-05 | 사전 단어 추가 / 검색 마스킹 회귀 |
| admin-06 | regular role 이 /admin/* 진입 시 403 |

### 2.6 Search & Discovery (F13-G / 5건)

| ID | 시나리오 |
|---|---|
| search-01 | 한글 부분 매칭 + diacritic stripping |
| search-02 | post 하단 관련 post 5건 표시 |
| search-03 | 최근 본 5건 노출 + 로그아웃 후 초기화 |
| search-04 | 카테고리/태그 클릭 → 필터 적용 |
| search-05 | 검색 결과 0건 → empty state UI |

### 2.7 a11y + 시각 회귀 + Chrome MCP (F13-H / 13건)

| ID | 시나리오 |
|---|---|
| a11y-01 | 홈 페이지 0 violations |
| a11y-02 | post detail 0 violations |
| a11y-03 | chat 0 violations |
| visual-01 | 50개 page 모바일 + 데스크탑 baseline screenshot |
| mcp-01 | Chrome MCP — Google sign-in mobile 시나리오 |
| mcp-02 | Chrome MCP — post 작성 + 이미지 업로드 |
| mcp-03 | Chrome MCP — chat 이미지 메시지 + lightbox |
| mcp-04 | Chrome MCP — 프로필 사진 업로드 |
| mcp-05 | Chrome MCP — admin moderation 흐름 |
| mcp-06 | Chrome MCP — 모바일 drawer 네비게이션 |
| mcp-07 | Chrome MCP — 검색 + 발견 |
| mcp-08 | Chrome MCP — banned 사용자 제한 |
| mcp-09 | Chrome MCP — cross-tab 세션 |
| mcp-10 | Chrome MCP — 결제 redirect (mock, real 결제 skip) |

---

## 3. Chrome MCP Scenario Template

각 scenario markdown 은 다음 구조:

```markdown
# Scenario {N}: {제목}

**대상 환경**: staging.kkaebizigi.com
**Persona**: regular / admin / new / banned
**Device**: mobile / desktop
**예상 소요**: 2~5분
**선행 조건**: (예: test-user-1 로그인된 state)

## Steps

1. `mcp__claude-in-chrome__navigate` → URL
2. `mcp__claude-in-chrome__find` → selector 검증
3. `mcp__claude-in-chrome__form_input` → 폼 입력
4. ... (5~15 steps)

## Acceptance

- [ ] 콘솔 에러 0건 (`read_console_messages`)
- [ ] 4xx-5xx network 0건 (`read_network_requests`)
- [ ] 최종 DOM 에 expected element 존재
- [ ] 스크린샷 baseline 과 diff < 1%

## GIF 보관

`docs/sprint/13-sprint-qa/scenarios/gifs/{scenario-id}.gif` (gif_creator)
```

---

## 4. 7-Layer dataFlowIntegrity Matrix

Sprint 13 종료 시점에 다음 매트릭스 100% green 보장.

| Feature | UI | Client | API | Validation | DB | Response | Client | UI |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Auth | | | | | | | | |
| Post | | | | | | | | |
| Chat | | | | | | | | |
| Profile | | | | | | | | |
| Admin | | | | | | | | |
| Search | | | | | | | | |
| Bookmark | | | | | | | | |
| Subscription | | | | | | | | |

→ 8 feature × 7 layer = 56 cells. `reports/data-flow-matrix.md` 에서 각 cell 별 Playwright spec ID + Chrome MCP scenario 링크.

---

## 5. CI Workflow 설계

```yaml
# .github/workflows/e2e.yml (신규)
name: E2E

on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [staging, main]

jobs:
  playwright:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm playwright install --with-deps chromium
      - name: Wait for Vercel Preview
        uses: patrickedqvist/wait-for-vercel-preview@v1
        id: vercel
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300
      - name: Run E2E
        env:
          E2E_BASE_URL: ${{ steps.vercel.outputs.url }}
          E2E_TEST_USER_EMAIL: ${{ secrets.E2E_TEST_USER_EMAIL }}
          E2E_TEST_USER_PASSWORD: ${{ secrets.E2E_TEST_USER_PASSWORD }}
        run: pnpm test:e2e --reporter=html,json
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: playwright-report, path: e2e/playwright-report }
```

---

## 6. 발견 Bug 처리 워크플로우

```
Playwright fail 발견
   │
   ├──> P0/P1 (회귀 차단 수준): Sprint 13 내부 fix PR (별도 sprint 분기 금지)
   │       │
   │       └──> iterate Phase 에서 fix 후 spec 재실행 → green
   │
   └──> P2/P3 (UX issue / 비기능): `reports/bug-tracker.md` 에 기록 → carry items
```

P0/P1 정의:
- **P0**: data loss / 인증 우회 / XSS / 서비스 다운
- **P1**: 핵심 flow (post 작성, 채팅, 결제) 기능 깨짐
- **P2**: 보조 flow 깨짐 (admin 일부, search 일부)
- **P3**: 시각/카피/UX

---

## 7. 결정 기록

- **ADR-13.2**: Playwright 단일 e2e tool (Cypress 비교 우위 — multi-browser + better debugging)
- **ADR-13.3**: storageState 재사용 — 매 test 마다 Google sign-in flow 반복하면 OAuth rate limit 위험
- **ADR-13.4**: 시각 baseline 은 git lfs 가 아닌 Vercel blob 또는 GitHub artifact 로 보관 (저장소 비대 방지)
- **ADR-13.5**: Chrome MCP scenario 는 markdown spec 으로 명시 — AI agent 가 매 회 동일 흐름 재현 가능
