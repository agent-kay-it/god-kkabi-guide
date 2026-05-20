# Sprint 28 — Plan

> V3 GA Stabilization — 인프라 + 회귀 방지 + coverage.

**작성일**: 2026-05-20

---

## 1. Feature 분할

| ID | 제목 | 우선순위 | 추정 PR |
|---|---|---|---|
| F28-A | Vercel staging auto-deploy GitHub Action | P0 | 1 |
| F28-B | E2E auth-token-helper firebase/auth fix | P0 | 1 |
| F28-C | Structured data visible-content 회귀 방지 테스트 | P0 | 1 |
| F28-D | lib/auth/auth.ts + register.ts coverage | P1 | 1-2 |
| F28-E | Chrome QA 8 페이지 7-Layer 매트릭스 (문서) | P1 | 검증 PR |

---

## 2. F28-A — Vercel staging auto-deploy GitHub Action

### 작업
1. `.github/workflows/staging-alias-sync.yml` 신규 작성
   - on: `push: branches: [staging]`
   - jobs: vercel CLI 설치 → `vercel ls` 로 staging HEAD sha 매칭 deployment 찾기 → `vercel alias set` 실행
   - secrets.VERCEL_TOKEN + VERCEL_TEAM_ID + VERCEL_PROJECT_ID
2. 사용자에게 `VERCEL_TOKEN` GitHub secret 추가 요청 절차 docs 작성
3. 첫 실행 검증 (PR 머지 또는 빈 commit push)

### 폴백 전략
- staging HEAD sha 매칭 deployment 가 없으면 (Vercel dedupe 시) → 최근 1시간 내 가장 최신 READY deployment 로 fallback
- 매칭 실패 시 GitHub Actions error → 운영자 알림

### Deliverable
- `.github/workflows/staging-alias-sync.yml`
- `docs/05-policy/vercel-deploy.md` 신규 (VERCEL_TOKEN 발급 절차 + 회복 절차)

---

## 3. F28-B — E2E auth-token-helper 수정

### 진단

```typescript
// 현재 (broken):
await page.evaluate(async ({ t, projectId }) => {
  const { getAuth, signInWithCustomToken, connectAuthEmulator } =
    await import('firebase/auth');  // ❌ bare specifier, 브라우저 컨텍스트 fail
  ...
}, { t: token, projectId });
```

### 수정 패턴
페이지 로드 후 `page.addInitScript()` 로 firebase SDK 를 brand new client bundle 에서 가져오거나, **next dev 가 이미 firebase/auth 를 번들링하므로 window.firebaseAuth 로 노출**.

옵션 1 (선호): **client-side library import 우회 → API 호출 직접**
- emulator REST API `http://localhost:9099/identity-tool kit-google-...` 로 직접 sign-in
- cookie 만 설정 → page.context().addCookies()
- next-auth JWT cookie 직접 주입

옵션 2 (fallback): **client-side firebase 인스턴스 expose**
- `app/__e2e_login__/page.tsx` (dev only) 에서 window.signInWithToken(token) 노출
- e2e helper 가 그 page 로 이동하여 함수 호출

본 sprint 에서는 **옵션 1** 우선 시도.

### Deliverable
- `e2e/emulator/auth-token-helper.ts` 수정 (page.evaluate dynamic import 제거)
- E2E PR head run 3/3 projects pass 검증

---

## 4. F28-C — Structured data visible-content 회귀 방지 테스트

### 패턴

```typescript
// components/feature/__tests__/visible-content-match.test.ts
import { render } from '@testing-library/react';
import { HOWTO_STEPS } from '@/app/skill/page'; // export 추가
import SkillPage from '@/app/skill/page';

test('/skill HowTo step 의 name + text 가 페이지 visible-text 에 모두 노출', async () => {
  // SSR 시뮬레이션
  const tree = await SkillPage();
  const { container } = render(tree);
  const visible = container.textContent;
  for (const step of HOWTO_STEPS) {
    expect(visible).toContain(step.name);
    expect(visible).toContain(step.text);
  }
});
```

대상:
- /skill HOWTO_STEPS (5 step) — 1 test
- /class CLASS_FAQ (3 Q&A) — 1 test
- /jinryeong JINRYEONG_FAQ (3 Q&A) — 1 test
- /advanced FAQ_ITEMS (6 Q&A) — 1 test

총 +4 tests.

### Deliverable
- 각 페이지의 schema 데이터를 `export const ...` 로 변경 (export 안 되어 있으면)
- 4 신규 단위 테스트

---

## 5. F28-D — lib/auth/auth.ts + register.ts coverage

### lib/auth/auth.ts (NextAuth wrapper, 0%)
- Sprint 25 config.ts test 패턴 재사용
- `auth()` callback hydrate + `signIn` callback banned 차단 시나리오 검증
- NextAuth 의 `NextAuth(config)` 호출은 vi.mock 으로 stub

### lib/auth/register.ts (Server Action, 8.5KB, 0%)
- 가드 (UNAUTH / VALIDATION_FAILED / ADMIN_NOT_CONFIGURED)
- gameUid unique 검증 (Firestore where 쿼리)
- nickname server-scope unique 검증
- 트랜잭션 (users + servers + munpas + chat_channels)
- claims set + revalidatePath

총 +20+ tests, coverage delta:
- lib/auth: 51.34% → **65%+**
- 전체 Lines: 76.43% → **78%+**

---

## 6. F28-E — Chrome QA 8 페이지 7-Layer 매트릭스

### 검증 대상
| Page | UI → Client → API → DB → API → Client → UI |
|---|---|
| / | VideoGame + Breadcrumb + Website JSON-LD 노출 |
| /skill | HowTo schema + 5 step visible + 코어/액티브/패시브 카드 |
| /class | FAQ schema + 3 Q&A visible + 3 직업 card |
| /jinryeong | FAQ schema + 3 Q&A visible + 11 진령 card |
| /coupon | metadata + 인증 흐름 (로그인 후 제보 폼) |
| /advanced | FAQ schema + 6 Q&A visible + 6 mechanism card |
| /login | Google OAuth button render |
| /me | (auth gate 검증, 307→/login) |

각 페이지에서:
1. view-source `<script id="ld-*">` 존재 확인
2. document.body.innerText 에 schema 콘텐츠 일치 확인
3. metadata title / canonical / og:title 검증
4. (auth required pages) /login redirect 검증

### Deliverable
- `docs/sprint/28-sprint-v3-ga-stabilization/chrome-qa-matrix.md`
- Chrome MCP 검증 결과 8x4 매트릭스

---

## 7. PR 흐름 (사용자 승인 대기 패턴)

| PR | Branch | Feature |
|---|---|---|
| 150 | feature/sprint-28-prd-plan-design | PRD + Plan + Design |
| 151 | feature/sprint-28-a-staging-alias-sync | F28-A GitHub Action |
| 152 | feature/sprint-28-b-e2e-auth-fix | F28-B E2E fix |
| 153 | feature/sprint-28-c-visible-content-tests | F28-C 회귀 방지 |
| 154 | feature/sprint-28-d-auth-coverage | F28-D lib/auth |
| 155 | feature/sprint-28-e-report | F28-E QA + Report |
| 156 | feature/sprint-28-archive | Archive (사용자 명시 승인) |

⚠️ **모든 머지는 사용자가 명시 승인할 때까지 PR 생성만 진행하고 보류**.

---

## 8. 시간 추정

| Phase | 추정 |
|---|---|
| PRD/Plan/Design | 20 min |
| F28-A staging-alias-sync | 30 min |
| F28-B E2E fix | 90 min |
| F28-C 회귀 방지 테스트 | 40 min |
| F28-D lib/auth coverage | 120 min |
| F28-E Chrome QA 매트릭스 | 40 min |
| Iterate + Report | 30 min |
| **총** | **~6 hr** |
