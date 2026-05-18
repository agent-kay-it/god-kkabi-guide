/**
 * Smoke test — Sprint 13 / F13-A 인프라 검증.
 *
 * 본 test 는 단 하나의 검증 목표:
 * "Playwright config + error tracker + storageState-free fixture 가 정상 mount 되는가"
 *
 * 인증 불필요 (anonymousPage 사용) 으로 storageState 없이 통과 가능.
 * F13-B 부터는 인증 필요 spec 들이 추가됨.
 */
import { test, expect } from '../fixtures/test-users';
import { attachErrorTracker } from '../fixtures/chrome-mcp-helpers';

test.describe('smoke (F13-A 인프라 검증)', () => {
  test('홈 페이지 진입 + 콘솔 에러 0 + 4xx-5xx 0', async ({ anonymousPage: page }) => {
    const tracker = attachErrorTracker(page);

    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);

    // 페이지 로드 안정화
    await page.waitForLoadState('networkidle', { timeout: 30_000 });

    // 핵심 element 존재 확인 — 홈 페이지에 여러 <header> 가 있을 수 있으므로 first().
    await expect(page.locator('header').first()).toBeVisible();

    // 콘솔 에러 0 (third-party noise 가능성 — allowlist 는 helper 에 정의)
    expect(tracker.consoleErrors, `Console errors: ${JSON.stringify(tracker.consoleErrors, null, 2)}`).toEqual([]);

    // 4xx-5xx 0 (allowlist 통과 제외)
    expect(tracker.networkErrors, `Network errors: ${JSON.stringify(tracker.networkErrors, null, 2)}`).toEqual([]);

    tracker.detach();
  });

  test('robots.txt 응답 200 + Content-Type text/plain', async ({ anonymousPage: page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('text/plain');
  });

  test('sitemap.xml 응답 200 + Content-Type xml', async ({ anonymousPage: page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('xml');
  });
});
