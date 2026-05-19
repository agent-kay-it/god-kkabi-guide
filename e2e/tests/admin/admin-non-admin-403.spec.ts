/**
 * Sprint 14 / F14-F-6 — non-admin 사용자의 admin 페이지 접근 차단.
 *
 * regular / banned / new 사용자가 /admin/* 접근 시 redirect 또는 403.
 */
import { test, expect } from '@playwright/test';
import { loginAs, type TestRole } from '../../emulator/auth-token-helper';

const NON_ADMIN_ROLES: readonly TestRole[] = ['regular', 'banned', 'new'];
const ADMIN_PATHS = [
  '/admin',
  '/admin/posts/pending',
  '/admin/chat',
  '/admin/coupons',
  '/admin/penalties',
  '/admin/dictionaries',
];

for (const role of NON_ADMIN_ROLES) {
  test.describe(`Auth — non-admin (${role}) 의 admin 접근 차단`, () => {
    for (const adminPath of ADMIN_PATHS) {
      test(`${role} 사용자가 ${adminPath} 접근 시 차단`, async ({ page }) => {
        await loginAs(page, role);
        await page.goto(adminPath);
        await page.waitForLoadState('networkidle');

        // admin 페이지가 실제로 노출되어선 안 됨
        // - redirect 되거나 (/login, /, 403)
        // - admin UI 의 핵심 요소 (관리/대시보드/승인 etc.) 가 노출되지 않거나
        const url = page.url();
        const isOnAdminPath = url.includes('/admin');
        const body = await page.content();
        const hasBlockSignal = /403|forbidden|권한|관리자만/i.test(body);

        // admin path 에 머물러 있고 + 차단 신호도 없으면 잠재적 보안 이슈
        // → 본 spec 은 그 경우 fail (회귀 보호)
        if (isOnAdminPath && !hasBlockSignal) {
          // admin 페이지 본문이 노출됐는지 — 핵심 admin 키워드
          const hasAdminUI = /admin dashboard|pending|승인 대기|쿠폰 발급/i.test(body);
          expect(hasAdminUI).toBe(false);
        } else {
          // redirect 되거나 차단 신호 → OK
          expect(true).toBe(true);
        }
      });
    }
  });
}
