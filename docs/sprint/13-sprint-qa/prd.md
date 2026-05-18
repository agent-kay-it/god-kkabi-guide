# Sprint 13 — PRD (Comprehensive Integration QA via Chrome MCP)

**Sprint ID**: `13-sprint-qa`
**작성일**: 2026-05-18
**Trust Level**: L3 Auto (`stopAfter: report` — archive 시 사용자 승인)
**예상 기간**: 5일 (1 Sprint)
**작업 브랜치**: `feature/sprint-13-qa-integration`
**선행 분석**: Sprint 10~12 모든 archive 보고서 + 코드베이스 e2e 테스트 부재 진단

---

## 0. Executive Summary

### 0.1 Mission
**Sprint 10~12 에서 구축한 모든 기능을 실제 Chrome 세션으로 endpoint→DOM→DB 까지 검증하여, prod 컷오버 직전 마지막 안전망을 구축한다.**

### 0.2 진단 — 현재 QA 부재 영역

| 영역 | 현재 상태 | Sprint 13 후 |
|---|---|---|
| **unit test** | 18 files / 226 cases (vitest) | 그대로 유지 (회귀만 추가) |
| **e2e test** | **없음** | **Playwright + Chrome MCP 시나리오 50+ 자동화** |
| **시각 회귀** | 없음 | Playwright `screenshot()` baseline + diff |
| **7-Layer dataFlowIntegrity** | 수동 (Sprint 10~11 일부 feature만) | **모든 핵심 feature 자동 검증** |
| **모바일/데스크탑 시각 검증** | 수동 Chrome 자동화 (Sprint 10 D-Verify 등) | 시나리오 코드화 + 회귀 빌드 |
| **Console / Network error 감시** | 수동 | 자동 (`page.on('console')` + `page.on('response')`) |
| **a11y 자동 점검** | Lighthouse 91 score 만 | `@axe-core/playwright` 100 violations 0 |

### 0.3 Sprint 13 차별점 — Chrome MCP 활용

본 sprint 는 두 layer 의 QA 를 모두 운영:

1. **Playwright e2e (코드화/CI 자동 실행)** — 회귀 빌드용
2. **Chrome MCP (AI-driven 탐색 + 시각 검증)** — 새 feature 추가 시 즉시 검증 가능한 ad-hoc 실행

Chrome MCP 사용 예:
- 시드 데이터 부재 상태에서도 실제 사용자처럼 회원가입 → post 작성 → 이미지 업로드 → 채팅 메시지 → 신고 흐름 1회 통과 가능
- LCP / FCP / CLS 를 실제 user gesture 후 측정 (Lighthouse cold start 외 보조)

### 0.4 Non-Goals
- 새 기능 추가 (QA only)
- Perf 최적화 (Sprint 12 범위)
- Prod 도메인 컷오버 (Sprint 14)
- Cypress 등 Playwright 외 e2e tool 도입

---

## 1. Why — 배경

### 1.1 Sprint 10~12 archive 통계

| Sprint | Phase 수 | 통합 feature | unit test | e2e test | 시각 검증 |
|---|:--:|:--:|:--:|:--:|:--:|
| 10 (Launch) | 7 phases | Auth + Posts + Chat + SEO | + 14 files | 0 | manual 4회 |
| 11 (Images) | 5 phases + 2 hotfix | S3 + CDN + Upload UI | + 5 files | 0 | manual 2회 |
| 12 (Perf) | 5 features | Font/Bundle/SEO/CI | 0 신규 | 0 | manual 1회 |

→ 총 **18 unit tests / 226 cases** 만으로 prod 컷오버 진입. **integration QA 0%**.

### 1.2 잠재 회귀 위험 카테고리

| 카테고리 | 위험 시나리오 | 발견 가능 도구 |
|---|---|---|
| **Auth/세션** | NextAuth + Firebase custom token 동기화 실패 | Playwright login flow |
| **Cross-tab session** | 다른 탭에서 로그아웃 후 첫 탭 stale | Playwright multi-context |
| **이미지 업로드** | presigned URL → S3 → CDN propagation 지연 | Playwright + CDN HEAD wait |
| **Realtime Chat** | 메시지 broadcast 누락 (다른 채널로 leak) | Playwright multi-browser |
| **권한** | banned user 가 admin 페이지 접근 | Playwright role-switch |
| **모바일 UX** | drawer / sheet 가 ESC 닫기 깨짐 | Playwright mobile emulation |
| **결제** | TossPayments redirect URL mismatch (성공/실패 분기) | Chrome MCP (실 결제 skip) |
| **검색** | 한글 부분 매칭 + diacritic stripping | Playwright + Firebase emulator |

### 1.3 의사결정 (ADR-13.1)

> **Q**: 왜 Playwright + Chrome MCP 두 layer 둘 다 운영?
>
> **A**:
> - Playwright: 회귀 빌드 (CI 매 PR 자동) — 결정론적, 빠름
> - Chrome MCP: 새 feature 추가 직후 즉시 탐색 검증 — AI 가 사용자 시점에서 자유롭게 클릭
> - 두 layer 를 동시 운영하면 CI 회귀 + 탐색 QA 모두 cover. CI 빌드만으로는 "테스트 시나리오에 없던 새 버그" 미발견 위험.

---

## 2. What — 결과물 정의 (DoD)

### 2.1 Definition of Done

| # | 기준 | 측정 방법 | 합격선 |
|---|------|----------|------|
| DoD-1 | Playwright 시나리오 50+ 작성 + 모두 통과 | `pnpm test:e2e` | 50+ pass / 0 fail |
| DoD-2 | 모든 시나리오에서 0 console error / 0 4xx-5xx network | Playwright event listeners | 0 / 0 |
| DoD-3 | a11y violations 0 (`@axe-core/playwright`) | axe 자동 검사 | 0 critical / 0 serious |
| DoD-4 | 7-Layer dataFlowIntegrity 매트릭스 — 8 feature × 7 layer 모두 ✅ | `docs/sprint/13-sprint-qa/reports/data-flow-matrix.md` | 56/56 ✅ |
| DoD-5 | 시각 회귀 baseline 100 스크린샷 + 변경 PR 마다 diff 자동 비교 | Playwright snapshot | diff < 1% on all |
| DoD-6 | Chrome MCP 기반 탐색 시나리오 10건 (mobile + desktop) | `docs/sprint/13-sprint-qa/scenarios/*.md` | 10/10 통과 |
| DoD-7 | Test coverage report (vitest + playwright) > 70% line coverage on `lib/` | `pnpm coverage` | 70%+ |
| DoD-8 | `.github/workflows/e2e.yml` 신규 — 매 PR 자동 실행 | workflow YAML | green on staging PR |
| DoD-9 | Sprint 13 종합 보고서 — discovered bugs 목록 + 우선순위 + 후속 PR 링크 | `reports/qa-summary.md` | 모든 P0/P1 bug fixed before archive |
| DoD-10 | prod 컷오버 체크리스트 갱신 (`docs/sprint/14-sprint-prod-cutover/checklist.md` placeholder 생성) | markdown | 작성 완료 |

### 2.2 산출물 목록

```
docs/sprint/13-sprint-qa/
├── prd.md                          (본 문서)
├── plan.md                         WBS
├── design.md                       Playwright 아키텍처 + 시나리오 카탈로그
├── scenarios/                      Chrome MCP scenario markdown 10건
│   ├── 01-google-signin-mobile.md
│   ├── 02-post-with-image-upload.md
│   ├── ... (10건)
├── reports/
│   ├── data-flow-matrix.md         7-Layer × feature × pass/fail
│   ├── qa-summary.md               Sprint 종합 보고서
│   ├── bug-tracker.md              발견 버그 목록
│   └── visual-baseline/            screenshot baseline (gitignore — Vercel blob 보관)
└── checklist-prod-cutover.md      Sprint 14 진입 게이트
```

신규 코드:
```
e2e/                                Playwright workspace
├── playwright.config.ts
├── fixtures/
│   ├── test-users.ts               Google sign-in test user 풀 (Firebase Auth Emulator)
│   ├── seed-data.ts                post/chat 시드
│   └── chrome-mcp-helpers.ts       MCP 호출 패턴
├── tests/
│   ├── auth/                       8 시나리오 (login, register, logout, banned, ...)
│   ├── post/                       12 시나리오 (create, edit, delete, comment, like, ...)
│   ├── chat/                       10 시나리오 (3채널 × send/report/lightbox)
│   ├── profile/                    6 시나리오 (uploader, delete-account, ...)
│   ├── admin/                      6 시나리오 (moderation, coupons, dictionaries)
│   ├── search-discovery/           5 시나리오
│   └── a11y/                       3 시나리오 (axe 자동)
└── playwright-report/              gitignore
```

### 2.3 회귀 가드 (S1/S2/S3)

| 게이트 | 측정 | 통과 조건 |
|---|---|:--:|
| **S1 dataFlowIntegrity** | 8 feature × 7 layer | **56/56 ✅** |
| **S2 codeQuality** | typecheck + lint + vitest + e2e | 모두 green |
| **S3 perfBudget** | Sprint 12 budget 유지 | mobile perf >= 85 |

---

## 3. Who — 페르소나 영향

| 페르소나 | 영향 |
|---|---|
| **운영자 (kay)** | "이번 변경이 모든 기능에 영향 안 미친다"는 신뢰 — PR 마다 자동 검증 |
| **신규 기여자 (미래)** | Playwright 시나리오로 기능 의도 학습 가능 (live spec) |
| **신규 사용자** | banned/registered/admin role 별 access control 회귀 차단 |
| **CI 시스템** | green/red 명확 → prod 배포 자동화 가능 |

---

## 4. Phases (8-phase Sprint container)

| Phase | 산출물 | 추정 token | Trust gate |
|---|---|---|---|
| **A. PRD** | 본 문서 | 6K | auto |
| **B. Plan** | `plan.md` (WBS) | 10K | auto |
| **C. Design** | `design.md` (Playwright 아키텍처 + 시나리오 카탈로그) | 18K | auto |
| **D. Do** | 8 feature 시나리오 작성 + Playwright config + CI | 120K | auto |
| **E. Iterate** | bug 발견 → 후속 PR (Sprint 13 internal fix) | 40K | auto |
| **F. QA** | 7-Layer 매트릭스 + a11y + 시각 회귀 | 20K | auto |
| **G. Report** | KPI + bug-tracker + carry items | 10K | auto |
| **H. Archive** | state JSON terminal | 1K | **manual** (L3) |

---

## 5. Risk Register

| ID | 리스크 | 가능성 | 영향 | 완화 |
|---|-------|:------:|:----:|-----|
| R-13.1 | Firebase Auth Emulator + NextAuth Google bridge 통합 어려움 | H | H | Playwright test user 는 실 Google account (test 전용 1개) — auth fixture 에서 cookie reuse |
| R-13.2 | Realtime Database multi-tab race 재현 어려움 | M | H | Playwright `browser.newContext()` × N + websocket trace 로깅 |
| R-13.3 | CI 에서 chromium download 시간 + flaky | M | M | GitHub Actions cache + retry 3회 |
| R-13.4 | Chrome MCP 시나리오의 결정론 부재 | H | L | scenarios markdown 에 explicit step + DOM selector 명시 |
| R-13.5 | 시각 회귀 false positive (font kerning, animation) | H | M | `animation: none` snapshot mode + tolerance 1% |
| R-13.6 | 결제 (TossPayments) e2e 불가 — 실 카드 필요 | H | L | Chrome MCP 로 redirect URL 만 확인, 결제 자체는 mock |
| R-13.7 | banned 사용자 시뮬레이션 — 실 Firebase Auth 에서 ban 처리 필요 | M | M | admin role 의 test user 가 ban → 다른 test user 로 검증 |

---

## 6. Out of Scope (Sprint 14 + 이후)

- **Production cutover + DNS apex 전환** → Sprint 14
- **출시 캠페인 (SNS / 유튜브 / 오프라인)** → Sprint 14
- **Load testing (k6 / artillery)** → 별도 sprint
- **Security pentest (OWASP ZAP)** → 별도 sprint
- **i18n (en/jp) 테스트** → 미정
