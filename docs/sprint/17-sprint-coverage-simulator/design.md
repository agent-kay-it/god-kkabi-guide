# Sprint 17 Design — 기술 구현 가이드

> Sprint 17 PRD + Plan 의 feature 구현 시 따라야 할 기술적 표준 / 패턴.

**작성일**: 2026-05-19
**의존**: prd.md, plan.md

---

## 1. RTL (React Testing Library) 도입 — F17-B 대비

### 1.1 의존성 확인

```bash
# 이미 설치되어 있는지 점검
pnpm list @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

미설치 시:

```bash
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 1.2 vitest 설정 — jsdom 환경 + globals

`vitest.config.ts` (또는 vite.config.ts 의 test 항목):

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['lib/**/*.ts', 'components/**/*.tsx', 'hooks/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.d.ts'],
    },
  },
});
```

`vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### 1.3 컴포넌트 테스트 패턴

```typescript
// components/feature/build-tag.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BuildTag } from './build-tag';

describe('<BuildTag>', () => {
  it('variant 에 따라 className 적용', () => {
    render(<BuildTag variant="meta" label="갓검객" />);
    const tag = screen.getByText('갓검객');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveAttribute('data-variant', 'meta');
  });

  it('role + name 으로 접근 가능 (a11y)', () => {
    render(<BuildTag variant="default" label="원거리" />);
    expect(screen.getByRole('status')).toHaveTextContent('원거리');
  });
});
```

### 1.4 file-name convention

| 종류 | 위치 | 예 |
|---|---|---|
| lib unit test | lib/{module}/{file}.test.ts | lib/auth/role-helpers.test.ts |
| component unit test | components/{path}/{file}.test.tsx | components/feature/build-tag.test.tsx |
| hook test | hooks/{file}.test.ts | hooks/use-bookmark.test.ts |
| integration test | lib/{module}/__tests__/{file}.test.ts | lib/seo/__tests__/json-ld-integration.test.ts |

---

## 2. F17-A — lib 모듈 mock 패턴

### 2.1 Firestore mock (lib/wiki/queries.ts 등)

```typescript
import { vi } from 'vitest';

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [
      { id: 'doc-1', data: () => ({ name: '검객', class: 'kemo' }) },
    ],
    size: 1,
  })),
}));
```

### 2.2 Window mock (lib/firebase/analytics-events.ts)

```typescript
beforeEach(() => {
  (window as { gtag?: unknown }).gtag = vi.fn();
});

afterEach(() => {
  delete (window as { gtag?: unknown }).gtag;
});
```

### 2.3 localStorage mock (이미 Sprint 16 F16-B 에서 검증됨)

vitest 의 jsdom 환경은 localStorage 자동 제공.

---

## 3. F17-C — CI emulator dynamic run 절차

### 3.1 트리거

```bash
gh workflow run e2e-emulator.yml --ref staging
```

### 3.2 결과 회수

```bash
gh run list --workflow=e2e-emulator.yml --limit 1
gh run view <run-id> --log-failed > /tmp/e2e-failures.log
```

### 3.3 실패 spec 회수 패턴

각 실패 spec 별:
1. trace.zip 다운로드: `gh run download <run-id>`
2. `pnpm playwright show-trace <trace.zip>` 로 로컬 재현
3. fix → re-run

### 3.4 iterate 한도

- Max 5회 (Sprint 16 도 동일)
- 도달 시 잔여 spec carry → Sprint 18

---

## 4. F17-D — 빌드 시뮬레이터 점검 기준

### 4.1 점검 체크리스트

| 항목 | 기준 |
|---|---|
| 모바일 320px 너비 | UI 깨짐 없음 |
| 진령 11종 모두 선택 가능 | 누락 없음 |
| 클래스 4종 모두 호환 | 누락 없음 |
| synergy 결과 시각화 | 가독성 (텍스트 / 색상) |
| 페이지 LCP | < 2.5s (Lighthouse) |
| keyboard navigation | tab 으로 모든 상호작용 가능 |

### 4.2 보고서 구조

```markdown
# 빌드 시뮬레이터 점검 보고서

## 1. 현재 UX
- 스크린샷
- 사용자 flow

## 2. 점검 결과
- pass / fail 항목

## 3. 개선 백로그 (Sprint 18+)
- 우선순위별 정렬
```

### 4.3 Out of scope

본 sprint 는 **점검 + 미세 수정** 만. 신규 feature 추가는 Sprint 18+.

---

## 5. F17-E — Visual baseline workflow_dispatch

### 5.1 트리거

```bash
gh workflow run visual-baseline.yml --ref staging
```

### 5.2 결과 회수 + commit

```bash
# artifact 다운로드
gh run download <run-id> --name visual-baselines

# e2e/visual/baselines/ 에 commit
git add e2e/visual/baselines/
git commit -m "feat(F17-E): visual baseline 1차 capture 적용"
```

### 5.3 회귀 검증

같은 workflow 를 다시 실행 → diff 0 이어야 함.

---

## 6. F17-F — Lighthouse perf 측정

### 6.1 도구

```bash
pnpm dlx lighthouse https://staging.kkaebizigi.com/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path=./lighthouse-result.json
```

5 URLs × 3 measurement (variance 차단) — Lighthouse CI 권장.

### 6.2 보고서

```markdown
| URL | perf | a11y | best | seo |
|---|---|---|---|---|
| / | 0.92 | 0.98 | 0.95 | 1.00 |
| /jinryeong | ... |
```

< 0.9 항목 → Sprint 18 P1 carry.

---

## 7. F17-G — S3 cutover dry-run

### 7.1 script 구조

```javascript
// scripts/s3-cutover-dryrun.mjs
#!/usr/bin/env node

/**
 * S3 cutover dry-run — Sprint 17 / F17-G
 * 실 mutation 없이 IAM/CORS/Lifecycle/CloudFront 점검만.
 */

import { S3Client, GetBucketCorsCommand, GetBucketLifecycleConfigurationCommand, GetBucketTaggingCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, GetDistributionCommand } from '@aws-sdk/client-cloudfront';

const REQUIRED_BUCKETS = ['posts', 'chat', 'profiles'];
const REQUIRED_TAG = { Key: 'project', Value: 'kkaebizigi' };

// ... 점검 로직
```

### 7.2 검증 항목

- [ ] tene 의 staging env 에 AWS_* 시크릿 존재
- [ ] 각 bucket 의 CORS rule 일치
- [ ] 각 bucket 의 Lifecycle rule 정책 일치
- [ ] 각 bucket 의 kkaebizigi tag 부착
- [ ] CloudFront distribution Deployed 상태
- [ ] 모든 점검 결과 JSON 출력

### 7.3 보안 규칙

- AWS_SECRET_ACCESS_KEY 절대 stdout 출력 X
- 결과 JSON 에서 시크릿 마스킹
- tene run -- 으로만 실행

---

## 8. F17-H — lib/storage/upload-*-image.ts unit test

### 8.1 mock 패턴

```typescript
import { vi } from 'vitest';

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(() => ({
    on: vi.fn(),
    snapshot: { ref: {} },
  })),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/test.jpg')),
}));

vi.mock('@/lib/storage/upload-rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ allowed: true })),
}));
```

### 8.2 테스트 시나리오

| 시나리오 | assertion |
|---|---|
| 정상 upload | URL 반환 + rate limit 호출 |
| ContentType 미지원 | error 발생 |
| size > 1MB | error 발생 |
| rate limit 초과 | error 발생 |
| Firebase storage error | error propagate |

---

## 9. 공통 규칙

### 9.1 typecheck / lint

- 모든 PR 머지 전 `pnpm typecheck && pnpm lint` 통과
- 0 errors / 0 warnings

### 9.2 commit message

- 형식: `feat(F17-X): {description}` 또는 `docs(F17-X)`, `test(F17-X)`
- file-based heredoc 사용 (bkit ENH-310 hook 회피)

### 9.3 PR 명명

- branch: `feature/sprint-17-{a~h}-{slug}`
- title: `feat(F17-X): {description}`
- base: `staging`

### 9.4 squash merge

- `gh pr merge {num} --squash --delete-branch`
- merge 후 `git checkout staging && git pull origin staging`

---

## 10. 검증 명령 모음

```bash
# typecheck
pnpm typecheck

# lint
pnpm lint

# 단위 테스트
pnpm test

# coverage
pnpm test:coverage

# e2e (로컬 emulator)
pnpm test:e2e:emulator

# Lighthouse (수동)
pnpm dlx lighthouse {url}
```
