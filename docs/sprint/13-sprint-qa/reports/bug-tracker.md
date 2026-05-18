# Sprint 13 — Bug Tracker

> 본 문서는 Sprint 13 e2e + a11y + MCP 시나리오 실행 도중 발견된 버그를 추적합니다.
> P0/P1 은 Sprint 13 내부 fix PR 로 해결 (별도 sprint 분기 금지).
> P2/P3 은 Sprint 14 carry items.

**우선순위 정의**:
- **P0** — data loss / 인증 우회 / XSS / 서비스 다운
- **P1** — 핵심 flow (post 작성, 채팅, 결제) 기능 깨짐 OR runtime error 다수
- **P2** — 보조 flow 깨짐 (admin 일부, search 일부)
- **P3** — 시각 / 카피 / UX

---

## P1 — Discovered during F13-A smoke test (2026-05-18)

### BUG-13-001: CSP `script-src` 가 Vercel Live Feedback 스크립트 차단

**Severity**: P1 (Vercel preview 환경 console error 다수)
**Discovered by**: smoke.spec.ts `홈 페이지 진입 + 콘솔 에러 0 + 4xx-5xx 0`
**Status**: TRIAGED — Iterate Phase 에서 fix PR

**증상**:
```
Loading the script 'https://vercel.live/_next-live/feedback/feedback.js' violates the
following Content Security Policy directive: "script-src 'self' 'unsafe-inline' 'unsafe-eval'
https://www.googletagmanager.com https://pagead2.googlesyndication.com
https://googleads.g.doubleclick.net https://tpc.googlesyndication.com".
```

**영향**: Vercel preview deploy 시점 자동 주입되는 feedback 위젯 로드 실패. 운영 영향
크지 않지만 console error 누적 → DevTools UX 저하 + sentry alert noise.

**Fix 방향** (`next.config.ts`):
- preview 환경에서만 `script-src` 에 `https://vercel.live` 추가
- 또는 모든 환경에 추가 (production 영향 평가 후)

---

### BUG-13-002: CSP `connect-src` 가 Firebase Installations API 차단

**Severity**: P1 (Firebase Analytics + Push 기능 잠재 영향)
**Discovered by**: smoke.spec.ts 동일
**Status**: TRIAGED — Iterate Phase 에서 fix PR

**증상**:
```
Connecting to 'https://firebaseinstallations.googleapis.com/v1/projects/god-kkabi-guide/installations'
violates the following Content Security Policy directive: "connect-src 'self'
https://firestore.googleapis.com https://*.firebaseio.com https://*.firebasedatabase.app
https://www.google-analytics.com https://firebase.googleapis.com
https://identitytoolkit.googleapis.com https://securetoken.googleapis.com ...".
```

**영향**:
- Firebase Analytics 의 instance ID 등록 실패 → user 분석 누락
- Firebase Cloud Messaging 사용 시 push 등록 차단
- 본 sprint 시점 FCM 미사용이라 critical 영향은 없으나 향후 알림 기능 확장 시 즉시 차단

**Fix 방향** (`next.config.ts`):
- `connect-src` 에 `https://firebaseinstallations.googleapis.com` 추가
- 또는 `https://*.googleapis.com` 와일드카드 (보안 trade-off — 다른 Google API 도 허용)

---

## Sprint 13 Bug 통계 (running)

| Phase | P0 | P1 | P2 | P3 | 누계 |
|---|--:|--:|--:|--:|--:|
| F13-A (Infrastructure) | 0 | **2** | 0 | 0 | 2 |
| F13-B (Auth) | — | — | — | — | — |
| F13-C (Post) | — | — | — | — | — |
| F13-D (Chat) | — | — | — | — | — |
| F13-E (Profile) | — | — | — | — | — |
| F13-F (Admin) | — | — | — | — | — |
| F13-G (Search) | — | — | — | — | — |
| F13-H (a11y + MCP) | — | — | — | — | — |

---

## Carry items

- **CSP fix (BUG-13-001 + BUG-13-002)** → `next.config.ts` 갱신 단일 PR (Iterate Phase 진입 시 즉시 처리)
- **Sprint 13 운영 절차**: e2e fail 시 본 bug-tracker.md 갱신 → severity triage → P0/P1 은 즉시 fix PR
