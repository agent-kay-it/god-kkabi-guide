# Sprint 18 Plan — Feature 별 Task Breakdown

> Sprint 18 PRD 의 8 features 를 PR / task 단위로 분해.

**작성일**: 2026-05-19
**의존**: prd.md
**Trust Level**: L4 (full-auto)

---

## F18-A — Coverage 25.13% → 35%+ (vitest config 확장 + lib/ 5+ 신규)

**목적**: Sprint 17 의 25.13% baseline 을 35%+ 로 끌어올림.

**Step 1**: vitest.config.ts 의 coverage include scope 확장
- 현재: `lib/**/*.ts` + `hooks/**/*.ts`
- 확장: + `components/**/*.tsx` (Sprint 17 의 RTL 테스트가 측정에 반영)

**Step 2**: lib/ 5+ 신규 unit test 모듈 추가
- lib/chat/channel-resolver — 이미 test 있음 → skip
- lib/chat/rate-limit-policy — 이미 test 있음 → skip
- lib/auth/profile-schema — 이미 test 있음 → skip
- 후보 (0% coverage):
  - lib/chat/types — pure type module
  - lib/post/og-parser — pure HTML parser (이미 test 있음 → skip)
  - lib/post/markdown-render — 이미 test 있음
  - lib/post/markdown — pure remark/rehype pipeline (의존성 多, 통합 테스트)
  - lib/penalty/* — 신규 도메인
  - lib/comment/* — 신규 도메인
  - lib/bookmark/* — 신규 도메인
  - lib/reaction/actions — Server Action

**Step 3**: thresholds 조정 (25% baseline → 30% target — 보수)

**예상**: 5+ 파일 / 50+ tests / 1 PR

---

## F18-B — CI E2E + Visual baseline 실 실행 (playwright webServer fix)

**목적**: F17-C UI fix 후 emulator 가 정상 시작했으나 dev server 미기동 발견.
실 spec 통과 확인 + 잔여 fail iterate.

**Step 1**: playwright.config.ts 의 webServer 조건 fix (이미 적용)

**Step 2**: 본 PR 의 E2E workflow 첫 실 통과 검증

**Step 3**: Visual baseline workflow_dispatch 1차 실행
- `gh workflow run "Visual Baseline Update" -f reason="Sprint 18 / F18-B 첫 capture"`
- 결과 회수 + e2e/visual/baselines/ commit

**Step 4**: iterate (max 5회)

**예상**: workflow fix + 결과 보고서 / 1 PR

---

## F18-C — Lighthouse 5 URLs 분석

**목적**: 최근 PR 머지 누적된 Lighthouse 결과 회수 + < 0.9 항목 식별.

**Step 1**: 최근 Lighthouse CI runs 회수 (`gh run list --workflow="Lighthouse CI"`)

**Step 2**: 5 URLs 의 perf / a11y / best-practices / seo 점수 추출

**Step 3**: < 0.9 항목 분석 (어디서 점수 낙오)

**Step 4**: 분석 보고서 + Sprint 19 carry

**예상**: 분석 보고서 / 1 PR

---

## F18-D — 빌드 시뮬레이터 시너지 매트릭스 30+ 보강

**목적**: F17-D audit 의 P0 — 현재 11 seed → 30+ 로 확대.

**Step 1**: 11 진령 × 11 × 11 / 3! = 165 조합 중 30 우선순위 선정
- PvP 빌드 (warrior recommendedClass): 8 조합
- PvE 자동사냥 (swordsman): 8 조합
- 힐러 (medium): 8 조합
- 균형 빌드 (mixed): 6 조합

**Step 2**: 각 조합의 synergyScore + tier + recommendedClass + description + note 작성

**Step 3**: lib/simulator/synergy-matrix.ts 의 SEED 배열 확장

**Step 4**: 회귀 검증 — 기존 11 seed 의 score 유지 + 기존 unit test 12 tests pass

**중요**: 운영자 (kay@popupstudio.ai) 의 게임 메타 직접 입력은 별도 sprint 의
검증 단계로 — 본 sprint 는 합리적 메타 기반 seed 작성.

**예상**: 30+ seed / 1 PR

---

## F18-E — 빌드 시뮬레이터 a11y 보강

**목적**: F17-D audit 의 P0 — aria-pressed + keyboard navigation.

**Step 1**: components/feature/simulator-canvas.tsx 의 진령 카드에 `aria-pressed` 추가
- 선택 상태 명시 (true / false)
- aria-label 보강 (현재 자체 텍스트로 식별 가능하나 강화)

**Step 2**: keyboard navigation 검증
- tabIndex 적절 부여
- Space / Enter 토글 지원

**Step 3**: 결과 영역의 aria-live=polite (3 선택 시 자동 announce)

**Step 4**: 회귀 검증 — 기존 click 동작 유지

**예상**: 1-2 파일 변경 / 1 PR

---

## F18-F — S3 staging cutover 실측 사전 작업

**목적**: F17-G dry-run script 의 CI integration + 사용자 승인 대기.

**Step 1**: scripts/s3-cutover-dryrun.mjs 의 CI workflow 통합 (.github/workflows/s3-health.yml)
- 주간 스케줄 (cron) 또는 workflow_dispatch
- exit code 별 분기 처리

**Step 2**: 실 cutover 는 사용자 명시 승인 필요 — 본 sprint 미진행

**예상**: 1 workflow / 1 PR

---

## F18-G — components/ 5+ 신규 RTL 테스트

**목적**: F17-B 패턴 확대 — 5+ 신규 컴포넌트.

**대상 후보**:
- components/ui/button.tsx
- components/ui/alert.tsx
- components/ui/tooltip.tsx (radix-ui wrapper)
- components/domain/tip-card.tsx
- components/domain/note (이미 test 있음 → skip)
- components/domain/munpa-card.tsx
- components/domain/penalty-badge (이미 test 있음 → skip)
- components/domain/class-card.tsx

**Step 1**: 5 컴포넌트 선정 (위 후보 중)

**Step 2**: 각각 RTL + jsdom 테스트 작성 (Sprint 17 의 패턴 재사용)

**Step 3**: typecheck / lint / test 0 errors

**예상**: 5+ 파일 / 30+ tests / 1 PR

---

## F18-H — 진령 채용률 차트 (마스터 V2 F3.2) 1차 구현

**목적**: 마스터 plan §2 F3.2 (V2 P0) 의 첫 구현.

**Step 1**: 데이터 소스 확인 — lib/insights/jinryeong-rate.ts (이미 존재) + jinryeong_stats Firestore collection

**Step 2**: chart library 선정
- recharts (이미 페이지에서 사용?)
- chart.js
- 또는 SVG 직접 작성 (의존성 0)

**Step 3**: /insights/jinryeong 페이지 또는 components/feature/jinryeong-rate-chart.tsx 의 실제 차트 구현 (현재 placeholder 가능)

**Step 4**: 단위 테스트 추가

**중요**: 신규 chart library 추가 시 bundle size 영향 점검.

**예상**: 1-2 파일 / 1 PR

---

## 전체 일정

```
Phase 1: plan (본 문서) — done
Phase 2: design — 다음
Phase 3: do — F18-A ~ F18-H 순차
Phase 4: iterate — typecheck/lint/test 0
Phase 5: qa — DoD 10항 검증
Phase 6: report — KPI snapshot + lessons + Sprint 19 carry
Phase 7: archived — 사용자 승인 후
```

---

## 의존성 그래프

```
F18-A (coverage) ──┐
                   ├─→ vitest config 확장 후 F17-B RTL 테스트가 반영됨
F18-G (components) ─┘

F18-B (CI fix) — independent, 본 PR 머지 후 자동 측정
F18-C (Lighthouse) — F18-B 이후 측정 결과 확보
F18-D (synergy 30+) — independent
F18-E (a11y) — independent
F18-F (S3 cutover) — independent
F18-H (차트) — independent
```

F18-B / D / E / F / H 모두 독립 — sequential 또는 parallel 가능.
F18-A 는 vitest config 변경으로 coverage scope 가 영향 받으므로 먼저 진행.
F18-C 는 F18-B 의 fix 효과를 기다림.
