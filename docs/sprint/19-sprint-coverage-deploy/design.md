# Sprint 19 Design — 기술 구현 가이드

> Sprint 19 PRD + Plan 의 feature 구현 표준.

**작성일**: 2026-05-19
**의존**: prd.md, plan.md

---

## 1. F19-A — Server Actions mocking 표준

### 1.1 표준 mock 패턴

각 Server Action 의 test 파일 상단:

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. firebase-admin mock
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
      })),
    })),
    runTransaction: vi.fn(),
  })),
  hasAdminCredentials: vi.fn(() => true),
}));

// 2. auth mock
vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(),
}));

// 3. next/cache mock
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// 4. firebase-admin/firestore mock (FieldValue)
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    increment: vi.fn((n: number) => ({ __fv: 'increment', n })),
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
    arrayUnion: vi.fn((...items: unknown[]) => ({ __fv: 'arrayUnion', items })),
    arrayRemove: vi.fn((...items: unknown[]) => ({ __fv: 'arrayRemove', items })),
    delete: vi.fn(() => ({ __fv: 'delete' })),
  },
  Timestamp: {
    now: vi.fn(() => ({ toMillis: () => Date.now() })),
    fromMillis: vi.fn((ms: number) => ({ toMillis: () => ms })),
  },
}));

import { actionUnderTest } from './actions';
```

### 1.2 Test 시나리오 표준

각 Server Action 의 검증:
1. **Unauthenticated**: auth() returns null → error/error code
2. **Banned/unregistered**: auth() returns banned user → error
3. **Happy path**: 정상 입력 → DB 호출 + revalidatePath
4. **Validation error**: 입력 검증 실패 → error
5. **DB error**: Firestore throws → error wrap

### 1.3 격리

- 각 test 는 `beforeEach(() => vi.clearAllMocks())` 로 격리
- Firestore mock 의 nested behavior 는 per-test 설정

---

## 2. F19-C — Lighthouse CI self-contained 패턴

### 2.1 workflow 구조

```yaml
name: Lighthouse CI
on:
  pull_request:
    types: [opened, synchronize, ready_for_review]
  workflow_dispatch: {}

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - Checkout
      - Setup pnpm + Node
      - Install deps
      - Build (next build, dummy env)
      - Start (next start &)
      - Wait for localhost:3000
      - Run lhci autorun (URLs)
      - Upload artifact
      - Comment PR
```

### 2.2 dummy env (build 통과용)

```yaml
env:
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: dummy
  NEXT_PUBLIC_FIREBASE_API_KEY: dummy
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: dummy.firebaseapp.com
  # ... 등 빌드 통과 필수 env
```

### 2.3 lhci config 갱신

`lighthouserc.json` 의 url 패턴이 staging 이 아닌 localhost 로 — workflow 내 build 후.

---

## 3. F19-E — synergy 50+ 작성 기준

### 3.1 현재 분포 (32)

```
warrior:    5 (총 6, 기존 1 + 신규 5)
swordsman:  7 (총 7, 기존 2 + 신규 5)
medium:     8 (총 8, 기존 3 + 신규 5)
balanced:  11 (총 11, 기존 4 + 신규 7)
미할당:     0 (기존 X + 신규 X)
```

### 3.2 50+ 목표 분포

```
warrior:    8 (+2)
swordsman: 10 (+3)
medium:    12 (+4)
balanced:  15 (+4)
미할당:     6 (+6)
─────────────────
합계:      51
```

### 3.3 작성 원칙

- 기존 32 score 유지 (변경 X)
- 신규 19 조합의 score 50-95 범위
- 직업 추천 명확화 또는 의도된 미할당 (score 50-65)
- description + note 필수

---

## 4. F19-F — components/ test 확대

### 4.1 패턴 (Sprint 17/18 와 동일)

```tsx
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

### 4.2 우선순위 컴포넌트

| 컴포넌트 | 이유 |
|---|---|
| components/ui/card | shadcn 기본 |
| components/ui/dialog | radix-ui wrapper |
| components/ui/input | form 기본 |
| components/ui/textarea | post form 의존성 |
| components/ui/tooltip | radix |
| components/domain/class-card | 핵심 도메인 카드 |
| components/domain/tier-stack | tier 시각화 |
| components/feature/build-tag | F16-B 의 lib/wiki/build-tag 와 짝 |

---

## 5. F19-G — 시뮬레이터 prefill UX

### 5.1 현재 흐름

```
<SimulatorCanvas> "빌드로 저장" 클릭
   → /post/new?prefill=simulator&combo=A,B,C&class=warrior&score=95&tier=S
```

### 5.2 개선 사항

1. `combo` 의 진령 ID 검증 (invalid → fallback to /post/new)
2. post form 에 시뮬레이션 컨텍스트 표시 (자동 tag + 시너지 정보)
3. URL 파라미터 schema 표준화 (lib/simulator/prefill-url.ts)

### 5.3 신규 모듈

`lib/simulator/prefill-url.ts`:
```typescript
export interface SimulatorPrefillParams {
  readonly combo: readonly string[];
  readonly class?: string;
  readonly score?: number;
  readonly tier?: 'S' | 'A' | 'B' | 'C';
}

export function buildPrefillUrl(params: SimulatorPrefillParams): string { ... }
export function parsePrefillUrl(search: URLSearchParams): SimulatorPrefillParams | null { ... }
```

단위 테스트 동반.

---

## 6. F19-H — 쿠폰 자동 검증 정책

### 6.1 정책

```typescript
export type CouponValidationDecision =
  | { type: 'auto_disable'; reason: 'majority_downvote' | 'expired' | 'stale_pending' }
  | { type: 'auto_enable'; reason: 'majority_upvote' }
  | { type: 'noop'; reason: 'insufficient_votes' | 'within_grace_period' };

export function decideCouponValidation(input: {
  votesUp: number;
  votesDown: number;
  status: 'pending' | 'verified' | 'disabled';
  createdAtMs: number;
  expiresAtMs?: number;
  nowMs: number;
}): CouponValidationDecision;
```

### 6.2 임계값

- majority_downvote: votesDown > votesUp * 2 AND votesDown >= 5
- majority_upvote: votesUp >= 3 AND votesUp > votesDown * 2
- stale_pending: status='pending' AND (now - createdAt) > 24h
- expired: expiresAt < now
- grace_period: (now - createdAt) < 1h (vote 누적 시간)

### 6.3 단위 테스트

각 분기 검증 + edge case (votes 0 / undefined expiresAt 등).

---

## 7. 공통 규칙

- typecheck / lint 0 errors
- file-based commit message (heredoc 회피)
- branch: `feature/sprint-19-{a~h}-{slug}`
- title: `feat(F19-X): {description}`
- base: `staging`
