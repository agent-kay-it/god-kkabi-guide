# Sprint 18 PRD — Coverage 35% + CI Validation + Simulator Enhancement

> Sprint 17 carry-forward 8건 처리 + 마스터 plan V2 의 simulator feature 강화.

**작성일**: 2026-05-19 (Sprint 17 archive 직후)
**작성자**: Sprint 17 자동 생성 초안 (사용자 검토 + 보강 필요)
**Trust 권장**: L4 (full-auto)

---

## 1. Sprint 17 Carry-forward Items (8건)

| # | 항목 | Priority | 비고 |
|---|---|---|---|
| 1 | Coverage 25.13% → 35%+ | P0 | vitest config 확장 + lib/ 5+ 신규 |
| 2 | CI E2E dynamic run 첫 green 확인 | P0 | F17-C UI fix 효과 검증 |
| 3 | Visual baseline 첫 capture dispatch + commit | P0 | F17-E workflow 재등록 효과 |
| 4 | Lighthouse 실측 결과 분석 | P1 | F17-F 의 5 URLs × 4 categories |
| 5 | 빌드 시뮬레이터 시너지 매트릭스 11 → 30+ | P1 | F17-D audit 후속 (운영자 입력 필요) |
| 6 | 빌드 시뮬레이터 a11y 보강 | P1 | F17-D audit 후속 |
| 7 | S3 staging cutover 실측 | P2 | F17-G dry-run script 활용 (사용자 승인) |
| 8 | components/ test 확대 + coverage scope 확장 | P3 | F17-B 패턴 확대 |

---

## 2. Feature 후보 매핑 (F18-A ~ F18-H)

| Feature | Carry | 작업 요약 |
|---|---|---|
| F18-A | #1 | vitest config 의 coverage include 확장 + lib/ 5+ 신규 모듈 unit test |
| F18-B | #2 + #3 | CI E2E + Visual baseline 첫 실 실행 + 결과 회수 + iterate |
| F18-C | #4 | Lighthouse 5 URLs 분석 + 개선 백로그 (< 0.9 항목 식별) |
| F18-D | #5 | 시뮬레이터 시너지 매트릭스 11 → 30+ (운영자 게임 메타 입력) |
| F18-E | #6 | 시뮬레이터 a11y 보강 (aria-pressed / keyboard navigation) |
| F18-F | #7 | S3 staging cutover 실측 (사용자 명시 승인 후) |
| F18-G | #8 | components/feature/ 5+ 신규 RTL 테스트 |
| F18-H | 마스터 V2 | 진령 채용률 차트 (F3.2) — 마스터 V2 P0 미착수 |

---

## 3. DoD 목표

| # | 기준 |
|---|---|
| DoD-1 | Coverage lines 35%+ 달성 |
| DoD-2 | CI E2E dynamic run 모든 spec pass 또는 iterate 5회 이내 해소 |
| DoD-3 | Visual baseline 1차 capture + e2e/visual/baselines/ commit |
| DoD-4 | Lighthouse 5 URLs perf 점수 기록 + 개선 항목 |
| DoD-5 | 시뮬레이터 시너지 30+ seed 추가 |
| DoD-6 | 시뮬레이터 aria-pressed + keyboard navigation 도입 |
| DoD-7 | S3 cutover dry-run 실측 결과 (사용자 승인 후) |
| DoD-8 | components/ test 5+ 신규 |
| DoD-9 | 진령 채용률 차트 (F3.2) 1차 구현 |
| DoD-10 | Sprint 18 종합 보고서 + Sprint 19 carry |

---

## 4. KPI 목표

| 메트릭 | Sprint 17 | Sprint 18 Target |
|---|---|---|
| Coverage lines | 25.13% | 35%+ |
| Total tests | 489 | 580+ |
| Test files | 47 | 57+ |
| PR squash merge | 7 | 8 |
| 시뮬레이터 시너지 seed | 11 | 30+ |
| 마스터 V2 미착수 feature | 5 | 4 (F3.2 해소) |

---

## 5. 위험 + 가정

### 5.1 위험

1. **F17-C UI fix 효과 미달**: 첫 dispatch 후 emulator 가 여전히 fail 가능 — 추가 root cause 분석 필요
2. **시뮬레이터 시너지 30+ seed**: 운영자 (kay@popupstudio.ai) 의 게임 메타 입력 의존 — 입력 없으면 fallback 50점 만 표시
3. **components/ coverage scope 확장**: vitest config 변경 시 기존 test 회귀 가능
4. **마스터 V2 F3.2 차트**: chart library 선정 + 데이터 aggregation 신규 — 별도 sprint 필요할 수도

### 5.2 가정

- Sprint 17 의 CI fix 가 효과적 (F17-C/E)
- staging URL 이 안정 (Lighthouse / Visual baseline 측정 가능)
- Sprint 17 의 RTL 패턴이 확대 적용 가능

---

## 6. Out of Scope (Sprint 18 비포함)

- ❌ i18n 코드 변경 (Sprint 17 결정 — dormant 유지)
- ❌ 토스 결제 통합 (별도 sprint)
- ❌ 마스터 V2 F3.5 Pain NLP / F3.3 결투장 빌드 트렌드 (Sprint 19+)

---

## 7. Sprint 18 시작 시 사용자 결정 필요 항목

1. F18-D 의 시뮬레이터 시너지 30+ seed — 운영자 게임 메타 직접 입력
2. F18-F 의 S3 cutover 실측 — 별도 명시 승인 필요
3. F18-H 의 진령 채용률 차트 — 본 sprint 범위 또는 별도 sprint

---

## 8. Next Actions

- 본 PRD 사용자 검토 + 보강 후 plan.md 작성
- plan.md 후 design.md 작성
- 본 sprint 의 state JSON 생성
- /sprint start sprint-18-coverage-ci-validation
