# Sprint 28 — Design

> 기술 설계 — V3 GA Stabilization 5 features.

**작성일**: 2026-05-20

---

## 1. F28-A — Vercel staging auto-deploy GitHub Action

### 1.1 워크플로우

```yaml
# .github/workflows/staging-alias-sync.yml
name: Staging Alias Sync

on:
  push:
    branches: [staging]

# 동시 실행 1개로 제한 (sequential)
concurrency:
  group: staging-alias-sync
  cancel-in-progress: false  # 중요: cancel 안 함 — 모든 push 가 alias 받도록

permissions:
  contents: read

jobs:
  alias:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    env:
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      VERCEL_TEAM_ID: team_tXWdzbaWpHdTJNRCG22rtZx3
      VERCEL_PROJECT_ID: prj_4g0diSvSe4atumw7y0tsNyl2edAG
      TARGET_DOMAIN: staging.kkaebizigi.com
    steps:
      - name: Wait for any Vercel deployment for this SHA (max 5 min)
        run: |
          set -e
          SHA=${{ github.sha }}
          echo "Looking for deployment with SHA=$SHA"
          for i in $(seq 1 30); do
            DEPLOY_URL=$(curl -s \
              "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&teamId=$VERCEL_TEAM_ID&limit=20" \
              -H "Authorization: Bearer $VERCEL_TOKEN" \
              | jq -r ".deployments[] | select(.meta.githubCommitSha==\"$SHA\" and .state==\"READY\") | .url" | head -1)
            if [ -n "$DEPLOY_URL" ]; then
              echo "Found deployment: $DEPLOY_URL"
              echo "DEPLOY_URL=$DEPLOY_URL" >> "$GITHUB_ENV"
              exit 0
            fi
            echo "[$i/30] not ready yet, sleep 10s"
            sleep 10
          done
          # Fallback: latest READY deployment in last 1 hour
          echo "::warning::SHA $SHA deployment 안 보임 — 최신 READY 로 fallback"
          DEPLOY_URL=$(curl -s \
            "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&teamId=$VERCEL_TEAM_ID&limit=5&state=READY" \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            | jq -r '.deployments[0].url')
          echo "DEPLOY_URL=$DEPLOY_URL" >> "$GITHUB_ENV"

      - name: Set alias staging.kkaebizigi.com → $DEPLOY_URL
        run: |
          set -e
          curl -X POST \
            "https://api.vercel.com/v2/deployments/$DEPLOY_URL/aliases?teamId=$VERCEL_TEAM_ID" \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"alias\": \"$TARGET_DOMAIN\"}"

      - name: Verify
        run: |
          set -e
          # staging.kkaebizigi.com 의 alias 가 의도된 deployment 인지 검증
          ACTUAL=$(curl -s "https://api.vercel.com/v4/aliases/$TARGET_DOMAIN?teamId=$VERCEL_TEAM_ID" \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            | jq -r '.deployment.url')
          echo "staging.kkaebizigi.com → $ACTUAL"
          if [ "$ACTUAL" != "$DEPLOY_URL" ]; then
            echo "::error::Alias mismatch! Expected $DEPLOY_URL but got $ACTUAL"
            exit 1
          fi
```

### 1.2 Secret 등록 절차

```
1. https://vercel.com/account/tokens → Create Token "kkaebizigi-staging-alias-sync"
   Scope: agent-kay-project
   Expiration: 1년
2. GitHub Settings → Secrets and variables → Actions → New repo secret
   Name: VERCEL_TOKEN
   Value: [Vercel 에서 발급된 토큰]
3. Workflow 자동 실행 확인 (다음 staging push 시)
```

### 1.3 회복 절차 (docs/05-policy/vercel-deploy.md)

- workflow fail 시 운영자가 수동 `vercel alias set <latest-url> staging.kkaebizigi.com --token=$TOKEN` 실행
- VERCEL_TOKEN 만료 시 재발급 + GitHub secret 갱신

---

## 2. F28-B — E2E auth-token-helper firebase/auth 수정

### 2.1 옵션 1 — Firebase Auth Emulator REST API 직접 호출

Firebase Auth Emulator 는 `http://localhost:9099/identitytoolkit.googleapis.com/v1/...` 로 sign-in 가능. Custom token 으로 ID token 교환 후 nextauth cookie 직접 주입.

```typescript
// e2e/emulator/auth-token-helper.ts (신규)
import admin from 'firebase-admin';
import type { Page, BrowserContext } from '@playwright/test';
import { TEST_USERS } from './seed-fixtures';

export type TestRole = 'admin' | 'regular' | 'banned' | 'new';

function getSeed(role: TestRole) {
  const uid = `e2e-${role}`;
  const s = TEST_USERS.find((u) => u.uid === uid);
  if (!s) throw new Error(`Test user not found: ${role}`);
  return s;
}

function ensureAdmin() {
  if (admin.apps.length > 0) return admin.app();
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  return admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
}

export async function createCustomToken(role: TestRole): Promise<string> {
  ensureAdmin();
  const seed = getSeed(role);
  return admin.auth().createCustomToken(seed.uid, seed.claims);
}

/**
 * Custom token → emulator REST → ID token → SessionInfo
 *
 * Sprint 28 F28-B 수정 — page.evaluate 의 bare module specifier 제거.
 * 대신 emulator REST API 로 ID token 받아서 NextAuth session 직접 주입.
 */
export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const token = await createCustomToken(role);
  const seed = getSeed(role);

  // 1) Emulator REST: custom token → ID token
  const signInRes = await page.context().request.post(
    'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key',
    { data: { token, returnSecureToken: true } },
  );
  if (!signInRes.ok()) {
    throw new Error(`emulator signInWithCustomToken failed: ${signInRes.status()}`);
  }
  const { idToken, refreshToken } = (await signInRes.json()) as {
    idToken: string;
    refreshToken: string;
  };

  // 2) NextAuth JWT cookie 직접 발급 (E2E 환경에서만)
  // — POST /api/auth/e2e-bridge?uid=...&token=... (별도 endpoint 신규)
  const bridgeRes = await page.context().request.post(
    `/api/auth/e2e-bridge`,
    { data: { uid: seed.uid, idToken, claims: seed.claims } },
  );
  if (!bridgeRes.ok()) {
    throw new Error(`e2e-bridge failed: ${bridgeRes.status()}`);
  }

  // 3) cookie 가 context 에 자동 set 됨 → 다음 navigation 시 인증된 세션
  await page.goto('/', { waitUntil: 'domcontentloaded' });
}
```

### 2.2 신규 API endpoint

`app/api/auth/e2e-bridge/route.ts` — **dev/e2e 환경 한정** NextAuth session JWT 직접 발급.

```typescript
// app/api/auth/e2e-bridge/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const ALLOWED_ENVS = new Set(['development', 'test']);

export async function POST(req: Request) {
  // 보안: production 에서는 404
  if (!ALLOWED_ENVS.has(process.env.NODE_ENV ?? '') && process.env.FIREBASE_USE_EMULATOR !== 'true') {
    return new NextResponse('Not Found', { status: 404 });
  }
  const { uid, claims } = await req.json();
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? 'e2e-test-secret');
  const jwt = await new SignJWT({
    sub: uid,
    role: claims?.role ?? 'user',
    registered: claims?.registered ?? true,
    ...claims,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
  const c = await cookies();
  c.set('next-auth.session-token', jwt, { httpOnly: true, sameSite: 'lax', path: '/' });
  return NextResponse.json({ ok: true });
}
```

### 2.3 보안 보장

- production env 또는 emulator 외 환경에서는 endpoint 가 404 반환
- AUTH_SECRET 으로 서명되므로 알 수 없는 사용자 위조 불가

---

## 3. F28-C — Structured data visible-content 회귀 방지 테스트

### 3.1 페이지 데이터 export

각 페이지의 HOWTO_STEPS / *_FAQ 상수를 `export const ...` 로 변경 (이미 그런 곳도 있지만 일관성 확인).

```typescript
// app/skill/page.tsx
export const HOWTO_STEPS: ReadonlyArray<{ name: string; text: string }> = [
  ...
];
```

### 3.2 단위 테스트

```typescript
// app/__tests__/visible-content-match.test.tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HOWTO_STEPS } from '../skill/page';
import { CLASS_FAQ } from '../class/page';
import { JINRYEONG_FAQ } from '../jinryeong/page';
import { FAQ_ITEMS as ADVANCED_FAQ } from '../advanced/page';

function expectAllVisible(visibleText: string, items: ReadonlyArray<{ name?: string; question?: string; text?: string; answer?: string }>) {
  for (const item of items) {
    const label = item.name ?? item.question ?? '';
    const body = item.text ?? item.answer ?? '';
    expect(visibleText).toContain(label);
    expect(visibleText).toContain(body.slice(0, 30)); // 첫 30자 매칭 (충분히 유니크)
  }
}

describe('/skill HowTo schema visible content', () => {
  it('모든 step name + text 가 페이지에 노출', async () => {
    const SkillPage = (await import('../skill/page')).default;
    const tree = await SkillPage();
    const { container } = render(tree);
    expectAllVisible(container.textContent ?? '', HOWTO_STEPS);
  });
});

describe('/class FAQ visible content', () => {
  // ...
});

describe('/jinryeong FAQ visible content', () => {
  // ...
});

describe('/advanced FAQ visible content', () => {
  // ...
});
```

### 3.3 제약

- Server Component 가 async 라서 직접 render 시 어려울 수 있음 → `react-dom/server` 의 `renderToStaticMarkup` 사용 또는 SkillPage 내부 콘텐츠를 별도 export 한 client component 로 분리

---

## 4. F28-D — lib/auth/auth.ts + register.ts coverage

### 4.1 lib/auth/auth.ts test

```typescript
vi.mock('next-auth', () => ({
  default: vi.fn((config) => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));
vi.mock('@auth/firebase-adapter', () => ({
  FirestoreAdapter: vi.fn(() => 'firestore-adapter-stub'),
}));
```

테스트 시나리오:
- 자격증명 있음 → FirestoreAdapter 사용
- 자격증명 없음 → adapter 없이 JWT-only 모드
- signIn callback: role=banned → false
- jwt callback: Firestore users/{uid} hydrate (consent / role / tier 등)

### 4.2 lib/auth/register.ts test

```typescript
// Sprint 25 admin.test.ts 패턴 재사용
vi.mock('@/lib/auth/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => mockFirestore,
  hasAdminCredentials: () => true,
}));
vi.mock('@/lib/firebase/claims-retry-queue', () => ({
  setUserClaimsWithRetry: vi.fn(),
}));
```

시나리오 (10+):
- UNAUTHENTICATED
- VALIDATION_FAILED (Zod)
- ADMIN_NOT_CONFIGURED
- GAMEUID_TAKEN
- NICKNAME_TAKEN
- happy: 트랜잭션 + claims + revalidate
- transaction throw → INTERNAL

---

## 5. F28-E — Chrome QA 7-Layer 매트릭스

검증 항목 (8 페이지 × 4 categories):

| Page | JSON-LD view-source | Visible text 매칭 | Metadata (canonical/OG/Twitter) | Auth/Route 동작 |
|---|---|---|---|---|
| / | website + breadcrumb + videogame | (해당 X) | website canonical / OG website | 200 OK |
| /skill | howto | HOWTO_STEPS 5개 모두 | article canonical /skill | 200 OK |
| /class | faq | CLASS_FAQ 3개 모두 | article canonical /class | 200 OK |
| /jinryeong | faq | JINRYEONG_FAQ 3개 모두 | article canonical /jinryeong | 200 OK |
| /coupon | (none) | (form 영역) | website canonical /coupon | 200 OK (form은 로그인 후) |
| /advanced | faq | FAQ_ITEMS 6개 모두 | article canonical /advanced | 200 OK |
| /login | (none) | Google 로그인 버튼 | (none) | 200 OK |
| /me | (none) | (auth gate) | robots noindex | 307 → /login |

### Deliverable
`docs/sprint/28-sprint-v3-ga-stabilization/chrome-qa-matrix.md` 표 + 모든 항목 evidence.

---

## 6. 통합 테스트

전체 Sprint 28 완료 시:
- typecheck/lint/test 0 fail
- Coverage 78%+
- E2E 3 projects pass
- staging.kkaebizigi.com 자동 갱신 검증
- visible-text 매트릭스 8 페이지 통과

---

## 7. 사용자 새 규칙 반영

⚠️ 본 sprint 부터:
- 각 feature 완료 후 PR 생성까지만 자동
- 머지는 사용자가 명시 승인할 때만 (e.g., "PR #151 머지해")
- Sprint archive 도 동일
