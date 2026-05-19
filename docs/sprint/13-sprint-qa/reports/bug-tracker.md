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
**Status**: **FIXED** (2026-05-18, hotfix PR — `next.config.ts` CSP `script-src` 에 `https://vercel.live` 추가)

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
**Status**: **FIXED** (2026-05-18, hotfix PR — `next.config.ts` CSP `connect-src` 에 `https://firebaseinstallations.googleapis.com` + `https://vercel.live` + `wss://*.pusher.com` 추가)

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

## P3 — Discovered during F13-H Chrome MCP scenarios (2026-05-18)

### BUG-13-003: `/me/profile` 에 UID 평문 노출

**Severity**: P3 (시각 / 카피 / UX — Sprint 14 carry)
**Discovered by**: `scenarios/05-me-profile-desktop.md`
**Status**: **CARRY-FORWARD** (Sprint 14)

**증상**: `/me/profile` 페이지에서 Firebase UID (`183334138`) 가 본인에게 가시됨.

**영향**:
- 본인에게만 노출되므로 운영 risk 는 낮음 (다른 사용자에게 노출되지 않음)
- 디버그 목적 노출일 가능성 → 정책 재검토 필요
- GDPR / 개인정보 관점에선 UID 는 식별자 카테고리

**Fix 방향**:
- UI 에서 UID 표시를 제거 (운영 모드)
- 디버그 노출이 필요하면 `NEXT_PUBLIC_DEBUG_PROFILE=true` 환경변수 게이트

---

## Sprint 13 Bug 통계 (final after F13-H)

| Phase | P0 | P1 | P2 | P3 | 누계 |
|---|--:|--:|--:|--:|--:|
| F13-A (Infrastructure) | 0 | **2** (FIXED PR #28) | 0 | 0 | 2 |
| F13-B (Auth) | 0 | 0 | 0 | 0 | 0 |
| F13-C (Post) | 0 | 0 | 0 | 0 | 0 |
| F13-D (Chat) | 0 | 0 | 0 | 0 | 0 |
| F13-E (Profile) | 0 | 0 | 0 | **1** (CARRY) | 1 |
| F13-F (Admin) | 0 | 0 | 0 | 0 | 0 |
| F13-G (Search) | 0 | 0 | 0 | 0 | 0 |
| F13-H (a11y + MCP) | 0 | 0 | 0 | 0 | 0 |
| **합계** | **0** | **2 (FIXED)** | **0** | **1 (CARRY)** | **3** |

**Sprint 13 신규 P0/P1**: 0건 (F13-A 2건은 Sprint 12 CSP hotfix 로 즉시 해결)
**Sprint 14 carry items**: 1건 (BUG-13-003 P3)

---

## Carry items (Sprint 14 진입)

- **CSP fix (BUG-13-001 + BUG-13-002)** → ✅ Sprint 13 내 PR #28 로 해결 완료
- **BUG-13-003 (P3)** → Sprint 14 carry — `/me/profile` UID 가시성 정책 재검토
- **F13-B~G 실 시나리오 수행 (Playwright spec 60건)** → Sprint 14 carry — Firebase 단일 prod
  정책상 자동 OAuth 위험 → 대안: prod-cutover 시점에 실 사용자 세션 기반 검증 (본 F13-H
  방식 확장) 또는 Firebase emulator 분리 후 자동화
- **F13-H-4 시각 baseline 100 screenshot** → Sprint 14 carry — Chrome MCP gif_creator 기반
  baseline 캡처는 별도 인프라 필요
- **F13-H-1~3 axe-core a11y 자동 검사** → Sprint 14 carry — Playwright spec 종속 (위와 같음)
