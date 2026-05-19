/**
 * Sprint 14 / F14-B-4 — banned 사용자 차단 흐름.
 *
 * banned role 사용자는 로그인 자체는 가능하지만 게이트 페이지로 redirect 되거나
 * 핵심 기능 (post 작성 / chat 전송) 이 차단되어야 한다.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';

test.describe('Auth — Banned user gate', () => {
  test('banned 사용자가 로그인하면 차단 안내가 표시된다', async ({ page }) => {
    await loginAs(page, 'banned');
    await page.goto('/');

    // banned 안내 page or 일반 페이지에서 차단 배너 — 본 spec 은 두 케이스 모두 허용
    // (서비스 정책에 따라 변경 가능)
    const url = page.url();
    const body = await page.content();
    const isBlocked =
      /banned|차단|정지|제한/i.test(body) || /banned|suspended/i.test(url);

    expect(isBlocked).toBe(true);
  });

  test('banned 사용자가 /post/new 접근 시 차단된다', async ({ page }) => {
    await loginAs(page, 'banned');
    await page.goto('/post/new');

    // /post/new 페이지가 banned 분기 또는 redirect
    // 어느 쪽이든 form 의 제출 버튼은 비활성 or 폼 자체 미노출
    const submitBtn = page.getByRole('button', { name: /게시|제출|등록/ });
    const visible = await submitBtn.isVisible().catch(() => false);
    const url = page.url();
    expect(visible === false || /banned|login/.test(url)).toBe(true);
  });
});
