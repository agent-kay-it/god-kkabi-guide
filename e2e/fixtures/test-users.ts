/**
 * E2E Test Users — Sprint 13 / F13-A-3.
 * 출처: docs/sprint/13-sprint-qa/design.md §1.3
 *
 * **Firebase 단일 prod 프로젝트 (god-kkabi-guide) 환경 제약**:
 *  - staging / prod 데이터가 동일 Firestore + RTDB + Auth 인스턴스 공유
 *  - test user 가 실 user 영역에 노출되지 않도록 `e2e_*` prefix 규약 (display 자동 필터)
 *  - 자동화된 Google OAuth flow 는 보안 정책 위반 위험 → 사전 생성된 storageState 재사용
 *
 * 전략:
 *  - 4개 role test user 를 사전에 수동 생성 후 storageState (cookies + localStorage) 저장
 *  - globalSetup 은 storageState 파일 존재 여부 검증만 (재로그인 시도 X)
 *  - storageState 만료 시 사용자가 수동 재로그인 (Sprint 13 외 운영 절차로 분리)
 *
 * storageState 파일 위치:
 *  - e2e/.storage/{role}.json (gitignore)
 *  - 생성: `pnpm test:e2e:setup` (별도 script — F13-A-7 에서 정의)
 */
import {
  test as base,
  type Page,
  type Browser,
  type BrowserContext,
} from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Playwright 는 CJS 컨텍스트로 실행 — __dirname 직접 사용 (import.meta.url 미사용).
export const STORAGE_DIR = resolve(__dirname, '../.storage');

/**
 * Test user role. 실 Firebase Auth 사용자.
 * 모든 nickname 은 `e2e_` prefix — 실 사용자 화면 노출 차단 (Sprint 13 cleanup 절차).
 */
export type TestUserRole = 'admin' | 'regular' | 'banned' | 'new';

export interface TestUserSpec {
  readonly role: TestUserRole;
  readonly nickname: string;
  readonly serverId?: string;
  /** Firebase Auth custom claims */
  readonly claims: {
    readonly role: 'admin' | 'user' | 'banned';
    readonly registered: boolean;
  };
}

export const TEST_USERS: Readonly<Record<TestUserRole, TestUserSpec>> = {
  admin: {
    role: 'admin',
    nickname: 'e2e_admin',
    serverId: 'e2e-server',
    claims: { role: 'admin', registered: true },
  },
  regular: {
    role: 'regular',
    nickname: 'e2e_regular',
    serverId: 'e2e-server',
    claims: { role: 'user', registered: true },
  },
  banned: {
    role: 'banned',
    nickname: 'e2e_banned',
    serverId: 'e2e-server',
    claims: { role: 'banned', registered: true },
  },
  new: {
    role: 'new',
    nickname: 'e2e_new',
    serverId: 'e2e-server',
    // 등록 전 — registered false
    claims: { role: 'user', registered: false },
  },
};

export function getStoragePath(role: TestUserRole): string {
  return resolve(STORAGE_DIR, `${role}.json`);
}

export function hasStorageState(role: TestUserRole): boolean {
  return existsSync(getStoragePath(role));
}

/**
 * Playwright fixture — role 별 인증된 page 반환.
 * storageState 파일이 없으면 throw → 사용자에게 setup 안내.
 */
export const test = base.extend<{
  adminPage: Page;
  regularPage: Page;
  bannedPage: Page;
  newPage: Page;
  /** 미인증 (incognito) — 회원가입 / 첫 진입 시나리오 */
  anonymousPage: Page;
}>({
  adminPage: async ({ browser }, use) => {
    const ctx = await contextForRole(browser, 'admin');
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
  regularPage: async ({ browser }, use) => {
    const ctx = await contextForRole(browser, 'regular');
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
  bannedPage: async ({ browser }, use) => {
    const ctx = await contextForRole(browser, 'banned');
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
  newPage: async ({ browser }, use) => {
    const ctx = await contextForRole(browser, 'new');
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
  anonymousPage: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});

async function contextForRole(
  browser: Browser,
  role: TestUserRole,
): Promise<BrowserContext> {
  const path = getStoragePath(role);
  if (!existsSync(path)) {
    throw new Error(
      `Test user storageState missing for role "${role}".\n` +
        `Expected: ${path}\n` +
        `Run: pnpm test:e2e:setup (또는 사용자가 수동 sign-in 후 e2e/scripts/save-storage-state.mjs)`,
    );
  }
  return browser.newContext({ storageState: path });
}

export const expect = base.expect;
