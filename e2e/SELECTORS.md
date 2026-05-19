# Playwright Selector Convention — Sprint 15 / F15-A

> 모든 spec 의 selector 안정성 확보를 위한 표준 가이드.

## 1. 우선순위

```
1순위 — getByRole({ name }) ······· a11y 부합, 가장 견고
2순위 — getByLabel ················· form input 전용
3순위 — getByText (exact: false) ··· 본문 텍스트 매칭 (한국어 OK)
4순위 — getByTestId ················ 마지막 fallback (data-testid 부여 필요)
```

CSS / XPath 는 금지. nth-child / class selector 는 변경에 취약.

## 2. 한국어 라벨 처리

```typescript
// 권장
await page.getByRole('button', { name: '게시' }).click();

// 허용 (정규식으로 유연성)
await page.getByRole('button', { name: /게시|등록|submit/i }).click();

// 금지
await page.locator('.btn-primary').click();
await page.locator('button:nth-child(3)').click();
```

## 3. 비동기 대기 패턴

```typescript
import { waitForUserLoaded, waitForHydration } from '../../fixtures/wait-helpers';

test('인증된 사용자 검증', async ({ page }) => {
  await loginAs(page, 'regular');
  await waitForUserLoaded(page);  // firebase.auth().currentUser 준비
  await page.goto('/me');
  await waitForHydration(page);   // RSC streaming + hydration 완료
  // ... assertions
});
```

## 4. expect.poll vs waitFor

```typescript
// 권장 — assertion 의 자동 retry
await expect.poll(async () => {
  const snap = await admin.firestore().collection('posts').doc(id).get();
  return snap.data()?.likeCount;
}, { timeout: 5_000 }).toBe(1);

// 허용 — DOM
await expect(page.getByText('성공')).toBeVisible({ timeout: 10_000 });
```

## 5. afterEach / afterAll cleanup

```typescript
import { cleanupTestPosts } from '../../fixtures/test-post-helpers';

test.afterAll(async () => {
  await cleanupTestPosts();
});
```

## 6. 모바일 viewport 분기

```typescript
test('모바일 드로어', async ({ page, viewport }) => {
  if ((viewport?.width ?? 0) >= 768) {
    test.skip(); // desktop 에선 적용 안 함
  }
  // ...
});
```

## 7. emulator 모드 검증

emulator 모드는 다음 env 가 모두 true 여야 함:
- `E2E_USE_EMULATOR`
- `NEXT_PUBLIC_FIREBASE_USE_EMULATOR`
- `FIREBASE_USE_EMULATOR`
- `NEXT_PUBLIC_E2E_MODE`

`./scripts/test-e2e.sh --use-emulator` 가 자동 주입.

## 8. flake 디버그 절차

1. `pnpm playwright test --grep "<spec name>" --headed` — 시각적 확인
2. `pnpm playwright test --grep "<spec>" --debug` — step 별 break
3. trace 확인: `npx playwright show-trace e2e/test-results/.../trace.zip`
4. video 확인: `e2e/test-results/.../video.webm`

## 9. CI 실패 시

- PR 의 sticky comment 에서 `playwright-report-{project}` artifact 다운로드
- `playwright-test-results-{project}` 에서 trace.zip + video 회수
- `npx playwright show-report e2e/playwright-report` 로 로컬 재현

## 10. Sprint 16 / F16-H — wait-helper 표준 (auth specs)

`e2e/tests/auth/*.spec.ts` 8 파일에 `loginAs(page, ...)` 직후
`waitForUserLoaded(page)` 호출 일괄 적용 완료 (Sprint 16 / F16-H).

**근거**: Sprint 14 의 CI 첫 run 에서 일부 spec 이 `currentUser` race 로 인해
간헐 flake — 표준 pattern 적용으로 차단.

**검증 명령**:

```bash
# 모든 auth spec 의 loginAs 다음에 waitForUserLoaded 가 있는지 확인
grep -c "waitForUserLoaded" e2e/tests/auth/*.spec.ts
# 모두 1 (import) + N (사용 횟수) 이어야 함
```

**향후 신규 spec 작성 시**: import 와 첫 호출 모두 잊지 말 것.
