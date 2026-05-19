# Sprint 16 — Plan (Feature × Phase Breakdown)

> 8 features × 8 PRs. squash merge.

---

## 1. Feature Map

| ID | Feature | Priority | 의존 | PR |
|---|---|--:|---|---|
| F16-A | lib/ unit test part 1 (5+ 모듈) | P0 | Sprint 15 F15-I | 1 |
| F16-B | lib/ unit test part 2 (5+ 모듈) | P0 | F16-A | 1 |
| F16-C | escapeJsonLd refactor — component → lib | P2 | Sprint 15 F15-I | 1 |
| F16-D | Lighthouse / a11y best-practices warn fix | P1 | Sprint 15 F15-H | 1 |
| F16-E | Visual baseline 첫 capture 자동화 가이드 | P1 | Sprint 15 F15-C | 1 |
| F16-F | i18n Option C (next-intl) PoC | P3 | Sprint 15 F15-G | 1 |
| F16-G | S3 staging cutover 체크리스트 | P3 | Sprint 12 | 1 |
| F16-H | CI emulator selector tuning + wait-helper | P0 | Sprint 15 F15-A | 1 |

**총 8 PR**.

---

## 2. Phase Schedule

| Phase | 일자 |
|---|---|
| PRD | 05-19 |
| Plan | 05-19 |
| Design | 05-19 |
| Do | 05-19 ~ 05-30 |
| Iterate | 05-30 ~ 06-01 |
| QA | 06-01 |
| Report | 06-01 ~ 06-02 |
| Archive | 06-02 |

---

## 3. F16-A — lib/ unit test part 1

### 3.1 Targets (0% coverage 모듈 우선)
- lib/sentry/config.ts — getSentryConfig 분기 (dev/staging/prod)
- lib/search/site-search-index.ts — buildSearchIndex (정적 데이터 변환)
- lib/reaction/actions.ts — like/unlike 로직 (Server Action 의 pure 부분)
- lib/simulator/synergy-matrix.ts — 직업+진령 시너지 계산
- lib/subscription/guards.ts — 구독 권한 게이트

### 3.2 DoD
- 5+ test file, 50+ test case
- coverage lines 12.79% → 20%+ (단계적 강화)

---

## 4. F16-B — lib/ unit test part 2

### 4.1 Targets
- lib/wiki/build-tag.ts — 위키 tag 생성
- lib/storage/upload-* (presigned URL adapter)
- lib/auth/auth.ts (config 가능한 부분만)
- lib/chat/sanitize 또는 message-validation
- lib/post/* 미테스트 모듈

### 4.2 DoD
- 5+ test file 추가
- coverage lines 20%+ → 35%+ (목표)

---

## 5. F16-C — escapeJsonLd refactor

### 5.1 Tasks
- components/feature/structured-data.tsx — `escapeJsonLd` 함수 제거 + `lib/seo/json-ld` import
- 회귀 spec (기존 escape 동작 동일 확인)

### 5.2 DoD
- 중복 코드 제거
- 기존 component 동작 동일

---

## 6. F16-D — Lighthouse / a11y warn fix

### 6.1 Tasks (실측 의존 — Sprint 15 의 lighthouserc 결과)
- best-practices warn 항목 사전 정리:
  - `<meta name="theme-color">` 검토
  - `console.error` deprecated API 확인
  - `image-aspect-ratio` 일치 확인
- a11y 추가 fix:
  - color-contrast 검증
  - landmark-one-main 확인 (`<main>` 단일 검증)
  - heading-order

### 6.2 DoD
- Lighthouse best-practices > 0.9 사전 보장
- a11y 0 violation 유지

---

## 7. F16-E — Visual baseline capture 자동화

### 7.1 Tasks
- `e2e/visual/README.md` 갱신 — CI 첫 run 시 baseline 자동 생성 + commit 흐름
- `.github/workflows/visual-baseline-update.yml` — 의도된 UI 변경 시 baseline 갱신 PR 자동
- baseline missing 시 fail-soft 정책

### 7.2 DoD
- baseline 첫 capture 의 명확한 절차
- rebaseline PR 생성 자동화

---

## 8. F16-F — i18n Option C (next-intl) PoC

### 8.1 Tasks
- `pnpm add next-intl` (PoC dep)
- `i18n/ko.json` + `i18n/en.json` (UI 라벨 일부)
- `components/i18n-provider.tsx` (PoC wrapper)
- 1 page (`/terms`) 의 라벨 i18n 적용 (PoC)

### 8.2 DoD
- next-intl import 성공
- /terms 의 일부 라벨 ko/en 전환 가능
- Sprint 17+ 의 전체 라우팅 확장 결정 입력

---

## 9. F16-G — S3 staging cutover 체크리스트

### 9.1 Tasks
- `docs/sprint/16-sprint-coverage-cutover/reports/s3-cutover-checklist.md`:
  - emulator → staging S3 cutover 사전 점검
  - presigned URL TTL / CORS / 정책 확인
  - CloudFront cache invalidation 절차
  - rollback 절차

### 9.2 DoD
- 체크리스트 작성 완료
- 실제 cutover 는 prod 배포 시점 (별도 sprint)

---

## 10. F16-H — CI emulator selector tuning

### 10.1 Tasks
- 53 spec 의 selector 의 wait-helpers 적용 — `waitForUserLoaded` / `waitForHydration` 활용
- F15-A 의 SELECTORS.md 준수 일관성 audit
- flaky 사전 patterns 사전 제거

### 10.2 DoD
- 모든 spec 의 wait 패턴 일관
- spec selector audit 통과

---

## 11. Iterate / QA / Report / Archive

| Phase | 작업 |
|---|---|
| Iterate | matchRate < 90% 시 ≤5 cycle 내 fix |
| QA | coverage 35%+ 도달 + lighthouse pass 검증 |
| Report | KPI / lessons / Sprint 17 carry |
| Archive | 사용자 승인 후 |
