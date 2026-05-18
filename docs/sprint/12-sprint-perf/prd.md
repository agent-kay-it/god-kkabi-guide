# Sprint 12 — PRD (Performance & Production Readiness)

**Sprint ID**: `12-sprint-perf`
**작성일**: 2026-05-18
**Trust Level**: L3 Auto (`stopAfter: report` — archive 시 사용자 승인)
**예상 기간**: 4일 (1 Sprint)
**작업 브랜치**: `feature/sprint-12-perf-prod`
**선행 분석**: `docs/sprint/11-sprint-images/lighthouse/README.md` + 코드베이스 perf 진단 결과

---

## 0. Executive Summary

Sprint 11 archive 시점에 측정한 staging Lighthouse 결과는 다음과 같다:

| 카테고리 | Desktop | Mobile | 상태 |
|---------|--------:|-------:|:----:|
| Performance | 76 | **75** | ⚠️ 회귀 |
| Accessibility | 91 | 91 | ✅ |
| Best Practices | 92 | 92 | ✅ |
| SEO | **69** | **69** | ⚠️ staging artifact |
| CLS | 0 | 0 | ✅ Phase E next/image 효과 |

### Sprint 12 미션
1. **모바일 LCP 16s → < 4s** (Sprint 10 baseline 회복 + next/image 효과 검증)
2. **SEO 90+ 달성을 위한 prod 컷오버 전제 정비** (robots:index 전환 안전망)
3. **Lighthouse CI gate 도입** — 회귀 자동 차단 (CI 시 80+ enforce, 매주 90+ 목표)
4. **번들/스크립트 다이어트** — Unused JS 680ms 절감 + 3rd-party defer
5. **이미지 후속 검증** — 실제 이미지 포함 `/post/[id]` 에서 next/image LCP 효과 직접 측정

### Non-Goals
- 새 기능 추가 (UI/UX 변경 금지 — perf-only)
- 데이터 모델 변경
- 운영 도메인 prod 컷오버 (별도 결정 게이트 후, Sprint 14에서)
- E2E 테스트 인프라 구축 (Sprint 13 범위)

---

## 1. Why — 배경 & 진단

### 1.1 모바일 LCP 16s 근거

`docs/sprint/11-sprint-images/lighthouse/home-mobile.report.json` 분석:
- `largest-contentful-paint`: score=0 (numericValue=16015ms)
- `largest-contentful-paint-element.details.items`: **undefined** — Lighthouse 가 LCP element 자체를 식별하지 못함
- 유일한 weight-bearing opportunity: `unused-javascript` — **680ms 절감 여지**
- `render-blocking-resources`: 없음 (font preload 이미 정상)
- `total-blocking-time`: 10ms (CPU bound 아님)

### 1.2 LCP element 식별 실패 = 무엇을 의미하는가

LCP element 가 식별되지 않는다는 것은:
- Hero/HeroBackdrop/HeroAppBlock 같은 결정적 image candidate 가 **viewport 도달 전 화면을 못 채움**
- 모바일 4G emulation 에서 hero `<Image priority>` 의 fetch 완료 자체가 16s 이내 못 잡힌 가능성
- 또는 critical CSS 가 늦게 평가되어 첫 paint 자체가 늦음

### 1.3 코드베이스 진단 — 의심 항목

| 항목 | 현재 상태 | Sprint 12 액션 후보 |
|---|---|---|
| Pretendard Variable font | weight: '45 920' (전 범위 preload) | Subset + weight 좁히기 (400/700 only) |
| AdSense `<Script>` | 모든 page 로드 시 즉시 fetch | `strategy="lazyOnload"` + first-content 후 |
| Sentry SDK client bundle | 모든 page 자동 init | `import()` lazy / production sample rate 조정 |
| Vercel Speed Insights | client bundle 포함 | route group 별 conditional |
| GA/GTM 스크립트 | layout.tsx 무조건 | NEXT_PUBLIC_GA_ID 환경 게이트는 있으나 dev/staging/prod 분리 미흡 |
| `<Image src="/images/wiki/hero-...">` | priority=true 정상 | preload hint 추가 검토 |
| Server response time | 19ms (양호) | n/a |
| `unused-javascript` | 680ms | Next.js bundle analyzer 진단 후 dynamic import 분리 |

### 1.4 SEO 69 — 진실

| 진단 | 사실 여부 |
|---|---|
| "per-page metadata 미흡" (Sprint 11 carry items 가설) | ❌ 거짓 — 46/48 page 에 metadata 정의됨 |
| 진짜 원인 | `robots: { index: false, follow: false }` 가 staging 도메인에서 의도적으로 차단 |
| Lighthouse SEO 실패 audit | `is-crawlable` 단 1개 (== robots noindex) |
| Prod 영향 | `kkaebizigi.com` 컷오버 시 `index: true` 로 전환만 하면 90+ 자연 도달 예상 |

### 1.5 결정 기록 (ADR-12.1) — robots:index 전환 전제

> **Q**: 왜 SEO 90+ 를 Sprint 12 에서 직접 못 잡고 "전제 정비"라 부르는가?
>
> **A**:
> - `kkaebizigi.com` (prod) 가 아직 출시 캠페인 전 단계 — SNS/유튜브/오프라인 알림 채널이 준비되지 않은 상태에서 Google indexing 활성화 시 빈 사이트가 색인됨
> - SEO 90+ 측정은 prod 출시 직전 마지막 게이트로 둘 가치가 있음
> - Sprint 12 는 **인덱싱 전환 즉시 90+ 도달 가능한 상태** 를 만드는 것에 집중 (구조화 데이터, sitemap, canonical, OG image 검증)

### 1.6 Sprint 11 carry 항목 reframe

| 원본 carry | 진실 | Sprint 12 대응 |
|---|---|---|
| "SEO 69 → 90+ — per-page meta 동적 생성" | per-page meta 이미 있음. staging artifact. | robots:index 전환 시 자연 회복 — 구조화 데이터/OG/canonical 보강만 |
| "실제 이미지 포함 `/post/[id]` 재측정" | 실제 post 콘텐츠가 거의 없음 (staging 시드 데이터 부재) | 시드 post + 이미지 5개 자동 업로드 → Lighthouse 측정 |
| (신규) 모바일 LCP 16s | Sprint 11 측정 시점에 발견 | **Sprint 12 최대 미션** |
| (신규) Lighthouse 회귀 가드 부재 | 매 sprint 종료마다 수동 측정 | Vercel Speed Insights → Lighthouse CI 게이트 |

---

## 2. What — 결과물 정의 (DoD)

### 2.1 Definition of Done

| # | 기준 | 측정 방법 | 합격선 |
|---|------|----------|------|
| DoD-1 | Mobile LCP < 4s on `/` (cold) | lighthouse@13 mobile 5회 평균 | < 4000ms |
| DoD-2 | Mobile Performance >= 85 on `/` | 동일 | >= 85 |
| DoD-3 | Desktop Performance >= 90 on `/` | 동일 | >= 90 |
| DoD-4 | Real-post `/post/[id]` (이미지 3+) Mobile LCP < 3s | Sprint 12 시드 post | < 3000ms |
| DoD-5 | Unused JS savings < 300ms | lighthouse opportunities | < 300ms |
| DoD-6 | CLS 유지 == 0 | 모든 측정 | == 0 |
| DoD-7 | A11y / BP 회귀 없음 | 모든 측정 | >= 91 / >= 92 |
| DoD-8 | Lighthouse CI script 가 PR 마다 측정 + 80 미달 시 fail | `.github/workflows/lighthouse.yml` | exit 1 on < 80 |
| DoD-9 | robots:index 전환 토글 환경변수화 + 단일 PR 로 전환 가능 | `NEXT_PUBLIC_ROBOTS_INDEX=true` 단일 deploy | 토글 검증 OK |
| DoD-10 | sitemap.xml + structured data 검증 (Rich Results Test 통과) | manual + `validator/rich-results` | 통과 |

### 2.2 산출물 목록

1. `docs/sprint/12-sprint-perf/prd.md` (본 문서)
2. `docs/sprint/12-sprint-perf/plan.md`
3. `docs/sprint/12-sprint-perf/design.md`
4. `docs/sprint/12-sprint-perf/reports/` — phase 별 진단 리포트 + lighthouse json
5. `.github/workflows/lighthouse.yml` (신규)
6. `scripts/lighthouse-ci.sh` (수정) — CI mode 옵션 추가
7. `scripts/seed-staging-posts.mjs` (신규) — 이미지 포함 post 5개 자동 생성
8. PR 4건 (Phase A~D 각 1건) + 종합 PR 1건

### 2.3 회귀 가드 (S1/S2/S3)

| 게이트 | 측정 | 통과 조건 |
|---|---|---|
| **S1 dataFlowIntegrity** | 모든 페이지 7-Layer hop 무결성 (UI→Client→API→DB→Response) | 100% (Sprint 13 이관 — 본 Sprint 는 perf 만) |
| **S2 codeQuality** | typecheck + lint + vitest | 226+ passed / 0 err |
| **S3 perfBudget** | Lighthouse mobile perf >= 85 / desktop >= 90 | enforced via CI |

---

## 3. Who — 페르소나 영향

| 페르소나 | 영향 |
|---|---|
| **모바일 신규 방문자** | 첫 인터랙션까지 16s → < 4s — 이탈률 감소 추정 30%+ |
| **운영자 (kay)** | Sprint 종료마다 수동 Lighthouse 실행 부담 → CI 자동화 |
| **검색 엔진 (prod 컷오버 후)** | 구조화 데이터 + canonical + sitemap 정합성 → 색인 안정 |
| **PR 리뷰어 (미래 협업자)** | Lighthouse CI fail 시 자동 차단 → perf 회귀 무방어 PR 차단 |

---

## 4. Phases (8-phase Sprint container)

| Phase | 산출물 | 추정 token | Trust gate |
|---|---|---|---|
| **A. PRD** | 본 문서 | 5K | auto |
| **B. Plan** | `plan.md` (WBS) | 8K | auto |
| **C. Design** | `design.md` (perf 진단 + 액션 매트릭스) | 12K | auto |
| **D. Do** | 5개 task 구현 (font, scripts, bundle, sitemap, robots) | 80K | auto |
| **E. Iterate** | matchRate 90+ 도달까지 반복 (≤5 cycles) | 30K | auto |
| **F. QA** | Lighthouse 5회 측정 평균 + Speed Insights 비교 | 20K | auto |
| **G. Report** | KPI 표 + 회귀 점검 + carry items | 8K | auto |
| **H. Archive** | state JSON terminal | 1K | **manual** (L3) |

---

## 5. Risk Register

| ID | 리스크 | 가능성 | 영향 | 완화 |
|---|-------|:------:|:----:|-----|
| R-12.1 | font 변경으로 한글 렌더 깨짐 | M | H | weight 좁히기는 fallback chain 유지 + 모바일 Chrome 시각 검증 |
| R-12.2 | AdSense lazy 로드로 매출 영향 | L | M | 측정만 (현재 매출 0원 단계) |
| R-12.3 | Sentry lazy init으로 client error 누락 | M | H | error boundary 에서 명시적 capture + sample rate 보존 |
| R-12.4 | LH CI 가 매번 fail 하여 PR 막힘 | M | M | 첫 시드 baseline 후 점진 강화 (50 → 70 → 80) |
| R-12.5 | Speed Insights 데이터 부족 (DAU < 10) | H | L | Lighthouse 측정으로 대체 (sample size 5+) |

---

## 6. Out of Scope (Sprint 13 + 이후)

- **E2E + 시각 회귀 테스트** → Sprint 13
- **Playwright/Cypress 설치** → Sprint 13
- **Chrome MCP 기반 7-Layer integration verification** → Sprint 13
- **Prod 도메인 컷오버 + robots:index 활성화 + 출시 캠페인** → Sprint 14
- **PWA / Offline cache** → 미정
- **i18n (en/jp)** → 미정
