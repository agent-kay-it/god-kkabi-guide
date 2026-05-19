# Sprint 15 — Plan (Feature × Phase Breakdown)

> 10 features × 10 PRs. 각 PR 은 squash merge.

---

## 1. Feature Map

| ID | Feature | Priority | 의존 | PR |
|---|---|--:|---|---|
| F15-A | Spec selector 견고화 + retries 강화 | P0 | F14-B~G | 1 |
| F15-B | a11y 사전 fix (홈/post/chat) | P0 | F14-H | 1 |
| F15-C | Visual baseline 안정화 + 첫 capture 가이드 | P0 | F14-I | 1 |
| F15-D | Webkit-mobile CI matrix 활성화 | P1 | F14-A | 1 |
| F15-E | Coverage 측정 (vitest + c8) | P1 | F14-A | 1 |
| F15-F | Storage emulator + 실 업로드 e2e | P1 | F14-A, F14-E | 1 |
| F15-G | i18n 라우팅 정책 문서화 | P3 | — | 1 |
| F15-H | Lighthouse e2e CI 통합 | P2 | Sprint 12 | 1 |
| F15-I | lib/ 핵심 unit test (5+ 모듈) | P2 | F15-E | 1 |
| F15-J | CI 실패 PR comment 강화 | P2 | F14-A | 1 |

**총 10 PR**.

---

## 2. Phase Schedule

| Phase | 일자 | 산출물 |
|---|---|---|
| PRD | 05-19 | `prd.md` |
| Plan | 05-19 | 본 문서 |
| Design | 05-19 | `design.md` |
| Do | 05-19 ~ 05-30 | 10 PR |
| Iterate | 05-30 ~ 06-01 | P0/P1 fix cycle ≤5 |
| QA | 06-01 | `reports/qa-summary.md` + matrix |
| Report | 06-01 ~ 06-02 | `report.md` |
| Archive | 06-02 | state JSON → archived |

---

## 3. F15-A — Spec selector 견고화 + retries 강화

### 3.1 Tasks
- [F15-A-1] selector audit — `getByLabel` / `getByRole` / `data-testid` 우선순위 통일
- [F15-A-2] flaky 패턴 사전 fix — `networkidle` 후 추가 `waitForFunction` 적용
- [F15-A-3] playwright.config.ts — retries CI 3 → 5 (transient 보호)
- [F15-A-4] `e2e/fixtures/wait-helpers.ts` — `waitForUserLoaded(page)` 등 공통

### 3.2 DoD
- 모든 spec 의 selector 가 stable convention 따름
- CI fail 시 trace + video 자동 캡처 (이미 적용)

---

## 4. F15-B — a11y 사전 fix

### 4.1 Tasks
- [F15-B-1] /search 페이지의 search input 에 aria-label 추가
- [F15-B-2] 헤더 햄버거 버튼 aria-expanded / aria-controls
- [F15-B-3] /chat 메시지 영역 role="log" + aria-live="polite"
- [F15-B-4] 이미지 alt 텍스트 일괄 검증 (next/image)
- [F15-B-5] color contrast 검증 (text-soft / text-mute)

### 4.2 DoD
- axe-core critical/serious 0 (홈/post/chat) — Sprint 14 의 spec 으로 검증

---

## 5. F15-C — Visual baseline 안정화

### 5.1 Tasks
- [F15-C-1] `e2e/visual/regression.spec.ts` 의 stabilization 강화
  - font-display swap 대기
  - RSC streaming 완료 대기
  - `prefers-reduced-motion` 강제 설정
- [F15-C-2] Visual baseline 생성 가이드 (e2e/visual/README.md 갱신)
- [F15-C-3] `.github/workflows/visual.yml` — baseline 변경 PR 자동 comment

### 5.2 DoD
- 안정화 후 동일 commit 2회 실행 시 diff 0
- baseline 갱신 시 PR comment 가 변경 path 명시

---

## 6. F15-D — Webkit-mobile CI matrix

### 6.1 Tasks
- [F15-D-1] `.github/workflows/e2e.yml` matrix 에 webkit-mobile 추가
- [F15-D-2] webkit playwright install dep (`pnpm playwright install webkit`)
- [F15-D-3] webkit 의 known issue 분기 (Firebase emulator long-polling)
- [F15-D-4] webkit-mobile project 시드 spec 활성화 (smoke + a11y)

### 6.2 DoD
- CI matrix 3 project (desktop + chromium-mobile + webkit-mobile)
- webkit-mobile smoke spec green

---

## 7. F15-E — Coverage 측정 (vitest + c8)

### 7.1 Tasks
- [F15-E-1] `pnpm add -D vitest @vitest/coverage-v8`
- [F15-E-2] `vitest.config.ts` — lib/ 만 측정, exclude node_modules / next-env
- [F15-E-3] `lib/seo/__tests__/robots-config.test.ts` (Sprint 12 기존 활용)
- [F15-E-4] `package.json` — `test:unit` + `coverage` scripts
- [F15-E-5] `.github/workflows/coverage.yml` — coverage 측정 + Codecov / artifact

### 7.2 DoD
- lib/ coverage 측정 가능
- 첫 측정 baseline 기록 (Sprint 16 에서 70% 도달)

---

## 8. F15-F — Storage emulator + 실 업로드 e2e

### 8.1 Tasks
- [F15-F-1] `e2e/tests/profile/profile-storage-upload.spec.ts` — emulator storage 의
  putObject + downloadURL 검증
- [F15-F-2] `e2e/fixtures/test-storage-helpers.ts` — `uploadTestFile` / `cleanupStorage`
- [F15-F-3] `firebase.json` storage rules emulator 와 호환

### 8.2 DoD
- Storage emulator putObject → downloadURL → page 이미지 노출 검증
- afterAll 에서 emulator storage cleanup

---

## 9. F15-G — i18n 라우팅 정책 문서화

### 9.1 Tasks
- [F15-G-1] `docs/03-design/i18n-routing-policy.md` 작성
- [F15-G-2] 현재 ko-KR 단일 정책 명문화
- [F15-G-3] 향후 en/ja 확장 시 라우팅 전략 (`/[locale]/` vs subdomain)
- [F15-G-4] `next.config.ts` 의 i18n 설정 검토

### 9.2 DoD
- 정책 문서 작성 완료, 실제 구현은 carry-forward

---

## 10. F15-H — Lighthouse e2e CI 통합

### 10.1 Tasks
- [F15-H-1] `pnpm add -D @lhci/cli` (Sprint 12 scripts/lighthouse-ci.sh 대체)
- [F15-H-2] `lighthouserc.json` — preset desktop + mobile, assert budget
- [F15-H-3] `.github/workflows/lighthouse.yml` 갱신 — @lhci 사용
- [F15-H-4] PR comment 봇 (성능 trend chart)

### 10.2 DoD
- Vercel preview URL 자동 측정
- PR comment 에 Performance / a11y / BP / SEO 점수

---

## 11. F15-I — lib/ 핵심 unit test

### 11.1 Tasks
- [F15-I-1] `lib/auth/profile-schema.test.ts` (Zod schema)
- [F15-I-2] `lib/seo/structured-data.test.ts` (JSON-LD 생성)
- [F15-I-3] `lib/firebase/__tests__/client.test.ts` (emulator wire 분기)
- [F15-I-4] `lib/chat/sanitize.test.ts` (XSS 차단)
- [F15-I-5] `lib/search/korean-tokenizer.test.ts` (한글 자모)

### 11.2 DoD
- 5+ unit test 파일, 50+ test case
- lib/ coverage > 50% (Sprint 15 baseline)

---

## 12. F15-J — CI PR comment 강화

### 12.1 Tasks
- [F15-J-1] `.github/workflows/e2e.yml` — fail 시 trace.zip 링크 + screenshot 인라인
- [F15-J-2] visual diff 발생 시 baseline vs current 인라인 비교 PR comment
- [F15-J-3] sticky comment 정책 (matrix 별 header)

### 12.2 DoD
- PR fail 시 click 1회로 trace.zip 다운로드 가능
- visual diff 발생 시 PR 에서 즉시 시각 확인

---

## 13. Iterate / QA / Report / Archive

| Phase | 작업 |
|---|---|
| Iterate | matchRate < 90% 시 ≤5 cycle 내 fix |
| QA | data-flow-matrix 갱신 + coverage / Lighthouse / a11y / visual 합산 |
| Report | KPI / lessons / Sprint 16 carry |
| Archive | 사용자 승인 후 state JSON → archived |
