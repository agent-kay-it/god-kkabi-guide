# Sprint 15 — Design (Technical Implementation Guide)

> 10 PR 의 구현 가이드. Architecture / Config / Convention 정의.

---

## 1. F15-A — Spec selector convention

### 1.1 우선순위

```
1. getByRole({ name }) — 가장 견고 (a11y 부합)
2. getByLabel — form 입력
3. getByText (only when stable, exact: false)
4. getByTestId('...') — 마지막 fallback
```

### 1.2 wait-helpers.ts

```typescript
// e2e/fixtures/wait-helpers.ts
import type { Page } from '@playwright/test';

/** Firebase Auth currentUser 로딩 완료 대기 */
export async function waitForUserLoaded(page: Page, timeoutMs = 10_000): Promise<void> {
  await page.waitForFunction(
    async () => {
      const { getAuth } = await import('firebase/auth');
      return !!getAuth().currentUser;
    },
    { timeout: timeoutMs },
  );
}

/** Firestore listener attach 후 데이터 도착 대기 */
export async function waitForFirestoreData(
  page: Page,
  collection: string,
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForFunction(
    async (coll) => {
      try {
        const { getFirestore, collection: collRef, getDocs } = await import(
          'firebase/firestore'
        );
        const snap = await getDocs(collRef(getFirestore(), coll));
        return snap.size >= 0;
      } catch {
        return false;
      }
    },
    collection,
    { timeout: timeoutMs },
  );
}
```

### 1.3 retries 정책

`playwright.config.ts`:
```typescript
retries: IS_CI ? 5 : 0  // Sprint 14 의 3 → 5 (transient 강화)
```

---

## 2. F15-B — a11y 사전 fix 가이드

### 2.1 검색 input aria-label

```tsx
// app/search/_components/search-form.tsx
<input
  type="search"
  aria-label="사이트 검색"
  placeholder="키워드 입력..."
/>
```

### 2.2 헤더 햄버거 버튼

```tsx
<button
  type="button"
  aria-label="메뉴 열기"
  aria-expanded={isOpen}
  aria-controls="mobile-drawer"
  onClick={toggle}
>
  <MenuIcon />
</button>
```

### 2.3 채팅 메시지 영역

```tsx
<ol role="log" aria-live="polite" aria-relevant="additions">
  {messages.map(...)}
</ol>
```

### 2.4 color contrast

Tailwind tokens 검토 — `text-text-soft`, `text-text-mute` 의 contrast ratio
확인 + 필요 시 darken.

---

## 3. F15-C — Visual baseline stabilization

### 3.1 강화된 stabilize()

```typescript
async function stabilize(page: Page): Promise<void> {
  // 1) animation + transition 0s
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
      [class*="vercel-toolbar"] { display: none !important; }
    `,
  });
  // 2) prefers-reduced-motion 강제
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // 3) font-display: swap 의 swap 완료 대기
  await page.evaluate(() => document.fonts.ready);
  // 4) RSC streaming 완료
  await page.waitForLoadState('networkidle');
  // 5) lazy 이미지 로드 (intersection 트리거)
  await page.evaluate(() =>
    new Promise<void>((r) => setTimeout(r, 500))
  );
}
```

---

## 4. F15-D — Webkit-mobile CI matrix

```yaml
# .github/workflows/e2e.yml (matrix 확장)
strategy:
  matrix:
    project: [chromium-desktop, chromium-mobile, webkit-mobile]

steps:
  - run: pnpm playwright install --with-deps ${{ matrix.project == 'webkit-mobile' && 'webkit' || 'chromium' }}
```

webkit 의 Firebase RTDB long-polling 제약 — emulator URL 의 wss / xhr-streaming
모두 정상 동작 확인.

---

## 5. F15-E — Coverage (vitest + c8)

### 5.1 vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts', 'lib/**/__tests__/**'],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        // Sprint 15 baseline → Sprint 16 강화 (70%)
        lines: 50,
        branches: 40,
        functions: 50,
      },
    },
  },
});
```

### 5.2 package.json scripts

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 6. F15-F — Storage emulator 실 업로드

```typescript
// e2e/tests/profile/profile-storage-upload.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';

test('Storage emulator 에 이미지 업로드 → downloadURL 발급', async ({ page }) => {
  await loginAs(page, 'regular');

  const result = await page.evaluate(async () => {
    const { getStorage, ref, uploadString, getDownloadURL } = await import(
      'firebase/storage'
    );
    const storage = getStorage();
    const storageRef = ref(storage, `profile/e2e-regular-test.txt`);
    await uploadString(storageRef, 'hello sprint 15');
    return await getDownloadURL(storageRef);
  });

  expect(result).toMatch(/^http:\/\/localhost:9199\/v0\/b\/demo-/);
});
```

---

## 7. F15-G — i18n 라우팅 정책

`docs/03-design/i18n-routing-policy.md`:
- 현재: ko-KR 단일 (next.config.ts 의 i18n 미설정)
- 향후: `/[locale]/` prefix routing (next-intl 도입 검토)
- 도메인 분할 옵션: `kkaebizigi.com` / `en.kkaebizigi.com`
- Sprint 16+ 에서 실제 번역 콘텐츠 작성

---

## 8. F15-H — Lighthouse e2e

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["https://${VERCEL_PREVIEW_URL}/"],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

---

## 9. F15-I — lib/ unit test 패턴

각 test 파일:
- `describe()` per function
- happy path + edge cases + error cases
- mock 은 vi.fn() 사용

예시 (`lib/auth/profile-schema.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import { ProfileEditSchema } from './profile-schema';

describe('ProfileEditSchema', () => {
  it('valid input → success', () => {
    const result = ProfileEditSchema.safeParse({
      serverId: 'S785',
      munpa: '무명',
      nickname: '무명랑',
      classId: 'swordsman',
    });
    expect(result.success).toBe(true);
  });

  it('invalid classId → fail', () => {
    const result = ProfileEditSchema.safeParse({
      serverId: 'S785',
      munpa: '무명',
      nickname: '무명랑',
      classId: 'invalid' as 'warrior',
    });
    expect(result.success).toBe(false);
  });
});
```

---

## 10. F15-J — PR comment 강화

```yaml
- name: Comment failure with trace link
  if: failure()
  uses: marocchino/sticky-pull-request-comment@v2
  with:
    header: e2e-${{ matrix.project }}-trace
    message: |
      ### E2E Failure — `${{ matrix.project }}`

      Trace: ${{ steps.upload-trace.outputs.artifact-url }}
      Screenshots: ${{ steps.upload-screenshots.outputs.artifact-url }}

      Click "Details" above to view trace in Playwright Trace Viewer.
```

---

## 11. Risk Mitigation Matrix

| Risk | 대응 위치 | 효과 |
|---|---|---|
| webkit Firebase 미호환 | F15-D 의 sub-task 검증 | 사전 차단 |
| vitest build 시간 증가 | F15-E 의 별도 CI job | impact 0 |
| Storage emulator presigned URL | F15-F 의 직접 putObject | 우회 |
| Lighthouse LCP 초과 | F15-H 의 assert preset 조정 | 가변 |
| a11y fix 의 visual 회귀 | F15-B + F15-C 동시 진행 | baseline 갱신 |
