# Sprint 17 PRD — Coverage Expansion + i18n Option B + Dynamic CI

> Sprint 16 carry-forward 8건 + 신규 features 처리 sprint.
> Coverage 20.62% → 35%+ + i18n Option B 부분 적용 + CI dynamic run 실 측정.

**작성일**: 2026-05-19 (Sprint 16 archive 직후)
**작성자**: Sprint 16 자동 생성 초안 (사용자 검토 + 보강 필요)
**Trust 권장**: L4 (full-auto)

---

## 1. Sprint 16 Carry-forward Items (8건)

| # | 항목 | Priority | 비고 |
|---|---|---|---|
| 1 | Coverage 20.62% → 35%+ (lib/ 5+ 신규 모듈) | P0 | Sprint 16 부분 달성분 이월 |
| 2 | CI emulator dynamic run (Sprint 14/15 specs) | P0 | wait-helper 적용 후 첫 실 측정 |
| 3 | i18n Option B 부분 적용 (LocaleSwitcher 활성화 + /me /premium /post/new t() 화) | P1 | F16-F 의사결정 후속 |
| 4 | Visual baseline 첫 capture 실제 실행 (workflow_dispatch) | P1 | F16-E 자동화 후속 |
| 5 | Lighthouse perf 점수 측정 (현재 가정값) | P2 | 실 측정 데이터 수집 |
| 6 | S3 staging cutover 실제 진행 (사용자 승인 후) | P2 | F16-G 체크리스트 적용 |
| 7 | GA4 locale_switch event 측정 데이터 수집 | P3 | i18n Option B 후 수집 |
| 8 | lib/ test 패턴 component/ 로 확대 | P3 | component coverage 0% → 시작 |

---

## 2. Feature 후보 매핑 (F17-A ~ F17-H)

| Feature | Carry | 작업 요약 |
|---|---|---|
| F17-A | #1 | lib/wiki/* (queries / skill / class / setting) + lib/post/* + lib/sentry/sentry-context 등 신규 unit test 5+ 모듈 |
| F17-B | #1 | lib/storage/upload-{chat,post,profile}-image.ts unit test (현재 0%) |
| F17-C | #2 | CI emulator workflow 첫 dynamic run + fail spec iterate |
| F17-D | #3 | next.config.ts createNextIntlPlugin 적용 + NextIntlClientProvider + /me 텍스트 t() 화 |
| F17-E | #4 + #5 | Lighthouse + Visual baseline workflow_dispatch 첫 실행 + 결과 분석 |
| F17-F | #6 | S3 staging cutover 사전 검증 (사용자 명시적 승인 게이트) |
| F17-G | #7 | GA4 locale_switch event 발화 + dashboard 확인 |
| F17-H | #8 | components/feature/ 의 핵심 컴포넌트 5+ 의 unit test (RTL + jsdom) |

---

## 3. DoD 목표

| # | 기준 |
|---|---|
| DoD-1 | Coverage lines 35%+ 달성 |
| DoD-2 | 신규 unit test 10+ 파일 |
| DoD-3 | CI emulator dynamic run 첫 결과 + fail spec 0 |
| DoD-4 | i18n Option B /me 페이지 t() 화 완료 |
| DoD-5 | LocaleSwitcher TopBar 활성화 |
| DoD-6 | Visual baseline 1차 capture 저장 + diff 워크플로 검증 |
| DoD-7 | Lighthouse perf 실 측정값 기록 |
| DoD-8 | S3 cutover 사전 검증 완료 (실 cutover 는 사용자 승인) |
| DoD-9 | Sprint 17 종합 보고서 |
| DoD-10 | Sprint 18 carry items 명시 |

---

## 4. KPI 목표

| 메트릭 | Sprint 16 | Sprint 17 Target |
|---|---|---|
| Coverage lines | 20.62% | 35%+ |
| Total tests | 366 | 450+ |
| Test files | 34 | 44+ |
| PR squash merge | 8 | 8 |
| i18n locale 활성화 | 0 | 1+ page (/me) |

---

## 5. 위험 및 가정

### 5.1 위험

- **CI emulator dynamic run 의 첫 실 측정** 에서 다수 spec fail 가능 — iterate 5회 이내 해소 필요
- **i18n Option B 부분 적용** 이 기존 사용자 UX 미세 변경 — locale-switcher cookie 미설정 시 ko 유지
- **Coverage 35% 달성** 이 lib/ 외 component/ 도 일부 필요 — 새 패턴 도입

### 5.2 가정

- Sprint 16 의 wait-helper 적용으로 auth specs flake 차단
- next-intl ^4.12.0 의 plugin/middleware 정책이 Next.js 16 과 호환
- AWS staging S3 + CloudFront 가 이미 IAM/CORS/Lifecycle 정책 완비

---

## 6. Sprint 17 시작 시 사용자 결정 필요 항목

1. F17-D 의 i18n Option B 실 적용 — 시작 전 사용자 확인
2. F17-F 의 S3 cutover — 본 sprint 에서는 사전 검증만, 실 cutover 는 별도 승인
3. F17-H 의 component test 패턴 (RTL + jsdom) — 신규 패턴이므로 사용자 검토

---

## 7. Next Actions

- 본 PRD 사용자 검토 + 보강 후 plan.md 작성
- plan.md 후 design.md 작성
- 본 sprint 의 state JSON 생성: .bkit/state/sprints/sprint-17-coverage-i18n.json
- /sprint start sprint-17-coverage-i18n 으로 do phase 진입

---

## 8. 본 PRD 의 자동 생성 메타

- Sprint 16 archive 직후 자동 생성 초안
- 사용자 검토 + 보강 후 정식 sprint kick-off
- carry-forward items 와 신규 feature 의 균형 조정 필요
