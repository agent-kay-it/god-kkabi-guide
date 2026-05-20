# Sprint 26 — Design

> 기술 설계 — V3 GA Readiness 4 features.

**작성일**: 2026-05-20

---

## 1. F26-A — Sentry 실 통합

### 1.1 패키지

```bash
pnpm add @sentry/nextjs
```

### 1.2 Next.js 16 + App Router 권장 패턴

`@sentry/nextjs` v8+ 는 Next.js 16 (App Router) 와 `instrumentation.ts` 통합 사용 권장:

```
/instrumentation.ts                  (Next.js 16 instrumentation hook)
/sentry.client.config.ts             (Browser SDK init)
/sentry.server.config.ts             (Node SDK init)
/sentry.edge.config.ts               (Edge runtime SDK init)
```

### 1.3 sentry.client.config.ts

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Sprint 24 slo-policy: P95 1500ms / 5xx 0.5%
  tracesSampleRate: 0.1,  // 10% transactions
  replaysSessionSampleRate: 0.0,  // disabled for cost
  replaysOnErrorSampleRate: 1.0,  // 100% on error
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
  integrations: [Sentry.replayIntegration()],
});
```

### 1.4 sentry.server.config.ts / sentry.edge.config.ts

server: tracesSampleRate 0.1, debug false in prod
edge: tracesSampleRate 0.1

### 1.5 instrumentation.ts

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
```

### 1.6 환경변수 (tene)

- `NEXT_PUBLIC_SENTRY_DSN` — browser+server 공통, 공개 가능
- `SENTRY_AUTH_TOKEN` — source map upload용 (CI only)
- `SENTRY_ORG`, `SENTRY_PROJECT`

### 1.7 SLO 연동

`lib/observability/slo.ts` SLO_THRESHOLDS:
- AVAILABILITY 99.5% → Sentry uptime monitor
- P95 1500ms → Sentry performance
- ERROR_RATE_5XX 0.5% → Sentry error count

별도 알람 정책은 Sprint 27 — Sprint 26은 통합만.

---

## 2. F26-B — 운영자 입력 UI (users.ownedJinryeong)

### 2.1 컴포넌트 구조

```
components/feature/owned-jinryeong-picker.tsx
  ├ Props: { initialOwned: string[] }
  ├ State: Set<string> (선택된 진령 uid)
  ├ UI: 11종 카드 그리드 + 체크박스
  ├ Action: updateOwnedJinryeong(uids[])
  └ Toast: 성공/실패
```

### 2.2 Server Action

```typescript
// lib/auth/update-owned-jinryeong.ts
'use server';
import 'server-only';
import { z } from 'zod';

const Schema = z.object({
  uids: z.array(z.string().regex(/^[a-z_]+$/)).max(20),
});

export async function updateOwnedJinryeong(
  input: { uids: string[] }
): Promise<{ ok: true } | { ok: false; error: string }> {
  // 1. NextAuth session 확인 (auth())
  // 2. registered 확인
  // 3. Zod parse
  // 4. Firestore users/{uid}.ownedJinryeong set + updatedAt
  // 5. revalidatePath('/me'), revalidatePath('/simulator')
}
```

### 2.3 Firestore Schema

```
users/{uid} 문서에 추가:
  ownedJinryeong: string[]  // 진령 uid 배열
  ownedJinryeongUpdatedAt: number  // ms timestamp
```

### 2.4 /me 통합

```tsx
// app/me/page.tsx (기존 import 추가)
import { OwnedJinryeongPicker } from '@/components/feature/owned-jinryeong-picker';

// JSX 추가
<section>
  <h2>보유 진령</h2>
  <p>보유한 진령을 등록하면 추천 빌드가 더 정확해집니다.</p>
  <OwnedJinryeongPicker initialOwned={ownedJinryeong} />
</section>
```

### 2.5 데이터 흐름 (7-Layer QA target)

```
[1 UI] 사용자가 진령 카드 클릭
[2 Client] OwnedJinryeongPicker → Set 토글
[3 API] Server Action updateOwnedJinryeong 호출
[4 DB] Firestore users/{uid}.ownedJinryeong update
[5 Response] { ok: true }
[6 Client] revalidatePath('/me') + Toast.success
[7 UI] 다음 페이지 로드 시 변경 반영
```

---

## 3. F26-C — Coverage 73%+

### 3.1 우선순위 모듈

1. **lib/auth/register-schema.ts** (이미 100% — 추가 X)
2. **lib/auth/auth.ts** — 0% (NextAuth wrapper, mock 필요)
3. **lib/auth/register.ts** — 0% Server Action (Firestore mock 필요)
4. **lib/post/markdown.ts** (현 ~68%)
5. **lib/post/og-preview.ts** — extract case 추가

### 3.2 전략

- Sprint 25 admin.test.ts 의 패턴 재사용 (firebase-admin/* mock)
- Server Action 통합 테스트: `lib/__tests__/server-actions-mock.ts` builder 활용

---

## 4. F26-D — admin/* Chrome QA

### 4.1 QA 대상

| Page | URL | Auth | 검증 항목 |
|---|---|---|---|
| Dashboard | /admin | admin only | 200 OK + 통계 카드 렌더 |
| Posts pending | /admin/posts/pending | admin | 승인 대기 목록 |
| Coupons | /admin/coupons | admin | 쿠폰 CRUD |
| Dictionaries | /admin/dictionaries | admin | NLP 사전 |
| Penalties | /admin/penalties | admin | 사용자 정지 이력 |
| B2B Clients | /admin/b2b/clients | admin | 발급 폼 |
| External signals | /admin/external-signals | admin | 외부 신호 |

### 4.2 검증 방법

- agent-kay-it 계정으로 staging 로그인 (이미 admin role 보유)
- Chrome MCP 로 각 URL fetch + status code + 본문 내 admin 식별 키워드 확인
- 미인증 사용자 시 /me로 redirect 인지 확인 (이건 다음 sprint stretch)

### 4.3 Deliverable

- `docs/sprint/26-sprint-v3-ga-readiness/admin-qa-summary.md`

---

## 5. 의존성 / 위험

| 항목 | 위험도 | 대응 |
|---|---|---|
| @sentry/nextjs Next 16 호환 | Medium | 공식 docs 확인 + Sprint 26 내 fallback |
| Firestore users 컬렉션 schema | Low | 기존 read 경로 (Sprint 23 user-owned.ts) 호환 보장 |
| admin Chrome 로그인 | Low | agent-kay-it 이미 admin role |

---

## 6. 통합 테스트

전체 Sprint 26 완료 시:
- typecheck/lint/test 0 fail
- Coverage 73%+
- Sentry test event Sentry dashboard 에 수신
- /me 진령 토글 → /simulator 추천 변동 확인
- 7+ admin 페이지 Chrome QA 통과
