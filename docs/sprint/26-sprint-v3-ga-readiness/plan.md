# Sprint 26 — Plan

> V3 GA Readiness 본 단계 — 4 features F26-A..D 순차 진행.

**작성일**: 2026-05-20

---

## 1. Feature 분할

| ID | 제목 | 우선순위 | 추정 작업량 |
|---|---|---|---|
| F26-A | Sentry 실 통합 | P0 | ~3 PR |
| F26-B | 운영자 입력 UI (users.ownedJinryeong) | P0 | ~2 PR |
| F26-C | Coverage 73%+ | P1 | ~2 PR |
| F26-D | admin/* Chrome QA | P1 | ~1 PR |

---

## 2. F26-A — Sentry 실 통합

### Scope

1. `pnpm add @sentry/nextjs` (또는 npm)
2. `sentry.client.config.ts` + `sentry.server.config.ts` + `sentry.edge.config.ts` 작성
3. `tene set SENTRY_DSN <value>` (secret 주입)
4. `sentry.client.config.ts` — `dsn`, `tracesSampleRate`, `replaysSessionSampleRate` 설정 (Sprint 24 slo-policy 와 정합)
5. Next.js 16 호환성 확인 — `instrumentation.ts` API 사용 (App Router 권장)
6. `lib/observability/slo.ts` 의 thresholds 연동 (optional)

### 테스트

- `lib/sentry/` (이미 존재) — 이미 24 tests pass
- 신규 통합 테스트: `instrumentation.test.ts` (mocked Sentry init)

### Deliverables

- `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts`
- `instrumentation.ts` (Next.js 16 App Router)
- `docs/05-policy/slo-policy.md` 업데이트 (실통합 evidence)

---

## 3. F26-B — 운영자 입력 UI

### Scope

1. `components/feature/owned-jinryeong-picker.tsx` — 진령 11종 그리드 + 체크박스 + Server Action
2. `lib/auth/update-owned-jinryeong.ts` — Zod + Firestore `users/{uid}.ownedJinryeong` 업데이트 Server Action
3. `app/me/page.tsx` 통합 — 기존 `getUserOwnedJinryeong()` 함수 위에 picker UI 추가
4. `lib/auth/user-owned.ts` — 기존 read-side 변경 없음 (이미 Sprint 23에서 구현)

### 테스트

- `lib/auth/update-owned-jinryeong.test.ts` — 권한 / Zod / Firestore set
- `components/feature/owned-jinryeong-picker.test.tsx` — 11종 토글 UI

### Deliverables

- `OwnedJinryeongPicker` component
- `updateOwnedJinryeong` server action
- `/me` 페이지에 picker section 추가

---

## 4. F26-C — Coverage 73%+

### Scope

대상 모듈 (우선순위 순):

1. `lib/auth/register-schema.ts` 외 lib/auth 추가 unit test — 현재 18.97%
2. `lib/post/markdown.ts` 추가 case — 현재 68.29%
3. `lib/b2b/actions.ts` 통합 테스트 보강 — 현재 19.31%

### 테스트

- 신규 30+ tests target
- 회귀 0 (Coverage 가 떨어지지 않음)

---

## 5. F26-D — admin/* Chrome QA

### Scope

- staging 환경에서 agent-kay-it 계정으로 admin 로그인
- 5+ admin 페이지 view-source + 인증 우회 확인 (admin only)
- 페이지: /admin (dashboard), /admin/posts/pending, /admin/coupons, /admin/dictionaries, /admin/penalties, /admin/b2b/clients, /admin/external-signals

### Deliverables

- `docs/sprint/26-sprint-v3-ga-readiness/admin-qa-summary.md`

---

## 6. PR 흐름 예상

| PR | Branch | Feature |
|---|---|---|
| 137 | feature/sprint-26-prd-plan-design | PRD + Plan + Design |
| 138 | feature/sprint-26-a-sentry-integration | F26-A Sentry |
| 139 | feature/sprint-26-b-owned-jinryeong-ui | F26-B 진령 picker |
| 140 | feature/sprint-26-c-coverage-73 | F26-C Coverage |
| 141 | feature/sprint-26-d-admin-chrome-qa | F26-D admin Chrome QA |
| 142 | feature/sprint-26-report | Report |
| 143 | feature/sprint-26-archive | Archive (사용자 명시 승인) |

---

## 7. 시간 추정

| Phase | 추정 |
|---|---|
| PRD/Plan/Design | 30 min |
| F26-A Sentry | 60 min |
| F26-B 진령 UI | 60 min |
| F26-C Coverage | 60 min |
| F26-D admin QA | 30 min |
| Iterate + Report + Archive | 30 min |
| **총** | **~4.5 hr** |
