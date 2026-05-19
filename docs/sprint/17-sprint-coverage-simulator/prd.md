# Sprint 17 PRD — Coverage + Component Tests + Dynamic CI + Simulator Polish

> Sprint 16 carry-forward 6건 (i18n 2건 제외) + 신규 features 처리 sprint.
> 게임 (갓깨비 키우기) 한국 스토어 전용 — 다국어 대응 불필요 확정 (2026-05-19 사용자 결정).

**작성일**: 2026-05-19
**작성자**: Sprint 16 자동 생성 + 2026-05-19 사용자 결정 반영 (i18n 제거)
**Trust Level**: L4 (full-auto)
**Sprint ID**: sprint-17-coverage-simulator

---

## 1. 사용자 결정 반영 (2026-05-19)

### 1.1 다국어 대응 제거 결정

**근거**: 갓깨비 게임이 Google Play / iOS App Store 모두 **한국 스토어 전용** 으로
서비스되어 ja/en locale 사용자 진입 가능성 낮음. i18n 인프라 (next-intl ^4.12.0,
i18n/{config,request}.ts, messages/{ko,ja,en}.json) 는 **dormant 유지**.

### 1.2 Sprint 16 carry items 재배치

| Sprint 16 Carry | 처리 |
|---|---|
| Coverage 20.62% → 35%+ (P0) | ✅ F17-A 로 진행 |
| CI emulator dynamic run (P0) | ✅ F17-C 로 진행 |
| ~~i18n Option B 부분 적용 (P1)~~ | ❌ **제거** (한국 전용 게임) |
| Visual baseline 첫 capture (P1) | ✅ F17-E 로 진행 |
| Lighthouse perf 점수 측정 (P2) | ✅ F17-F 로 진행 |
| S3 staging cutover (P2) | ✅ F17-G 로 진행 (dry-run only) |
| ~~GA4 locale_switch 측정 (P3)~~ | ❌ **제거** (i18n 종속) |
| lib/ test 패턴 component/ 로 확대 (P3) | ✅ F17-B 로 진행 (P0 승격) |

### 1.3 신규 feature

| ID | 항목 | 근거 |
|---|---|---|
| F17-D | 빌드 시뮬레이터 점검 + synergy 확장 | 마스터 plan §2 F3.1 우선순위 P0 미완료 |
| F17-H | lib/storage/upload-*-image.ts unit test | Sprint 16 coverage 측정 시 0% 발견 |

---

## 2. Sprint 17 Feature Matrix (8 features)

| ID | Title | Priority | Type | 예상 PR | 의존성 |
|---|---|---|---|---|---|
| F17-A | lib/ unit test 확대 part 3 (5+ 모듈) | P0 | 품질 | 1 | (없음) |
| F17-B | components/feature/ unit test 도입 (RTL + jsdom, 5+ 컴포넌트) | P0 | 품질 | 1 | (없음) |
| F17-C | CI emulator dynamic run 첫 실행 + iterate | P0 | 검증 | 1 | F17-A |
| F17-D | 빌드 시뮬레이터 점검 + synergy 확장 | P1 | 기능 | 1 | (없음) |
| F17-E | Visual baseline workflow_dispatch 트리거 + diff 검증 | P1 | 검증 | 1 | (없음) |
| F17-F | Lighthouse perf 실측 + 5 URLs 분석 | P2 | 측정 | 1 | (없음) |
| F17-G | S3 staging cutover dry-run script + 시뮬 결과 | P2 | 안전 | 1 | (없음) |
| F17-H | lib/storage/upload-*-image.ts unit test (0% → 80%+) | P3 | 품질 | 1 | (없음) |

**총 예상 PR**: 8 squash merge + 1 (QA/Report) + 1 (Archive) = 10 PR

---

## 3. DoD (10 항목)

| # | Gate | Target |
|---|---|---|
| DoD-1 | Coverage lines 20.62% → 35%+ | 35%+ |
| DoD-2 | 신규 unit test 파일 15+ | 15+ 파일 |
| DoD-3 | 신규 tests 100+ | 100+ tests |
| DoD-4 | components/feature/ RTL 패턴 도입 | 5+ 컴포넌트 |
| DoD-5 | CI emulator dynamic run 첫 결과 | 모든 spec pass 또는 iterate 5회 이내 해소 |
| DoD-6 | 빌드 시뮬레이터 점검 + 보고서 | UX 감사 보고서 작성 |
| DoD-7 | Visual baseline 1차 capture | 결과 저장 (디렉토리 비어있지 않음) |
| DoD-8 | Lighthouse perf 실측 | 5 URLs × 3 measurement |
| DoD-9 | S3 cutover dry-run | 시뮬 결과 + 자동화 script |
| DoD-10 | Sprint 17 종합 보고서 + Sprint 18 carry | 8 carry items 명세 |

---

## 4. KPI 목표

| 메트릭 | Sprint 16 | Sprint 17 Target |
|---|---|---|
| Coverage lines | 20.62% | 35%+ (+14.4 pt) |
| Coverage branches | 90.15% | 90%+ 유지 |
| Coverage functions | 92.68% | 90%+ 유지 |
| Total tests | 366 | 470+ (+104) |
| Test files | 34 | 49+ (+15) |
| PR squash merge | 8 | 8 + 2 (QA/Archive) |
| 빌드 시뮬레이터 UX | 기존 | 점검 완료 + 개선 백로그 |

---

## 5. 위험 + 가정

### 5.1 위험

1. **CI emulator dynamic run 첫 실행** 에서 spec fail 다수 가능 — iterate 5회 이내 차단 필요
2. **components/feature/ RTL 도입** 시 jsdom 환경 호환성 이슈 가능 — fallback 패턴 준비
3. **빌드 시뮬레이터 점검** 에서 critical UX 결함 발견 시 sprint 범위 확장 가능
4. **Lighthouse perf** 측정 결과 미달 (< 0.8) 시 별도 sprint 분리 필요
5. **S3 cutover dry-run** 의 시뮬레이션이 실 환경과 불일치 가능 — 실 cutover 는 사용자 명시 승인 후 별도 진행

### 5.2 가정

- Sprint 16 의 wait-helper 적용으로 auth specs flake 차단됨
- Sprint 16 의 lib/seo/json-ld 통합 refactor 가 회귀 없음
- Vercel staging 환경이 Sprint 17 시작 시 정상 동작
- pnpm test:coverage 가 vitest 3 + @vitest/coverage-v8 3 pinning 으로 안정

---

## 6. Out of Scope (Sprint 17 비포함)

- ❌ i18n 코드 변경 (한국 전용 게임으로 결정됨)
- ❌ S3 실 cutover (dry-run 만, 실 cutover 는 별도 사용자 승인 sprint)
- ❌ 토스 결제 통합 (별도 sprint 필요)
- ❌ 빌드 시뮬레이터 신규 feature 추가 (본 sprint 는 점검만)
- ❌ 마스터 V2 의 Pain NLP / 차트 / 결투장 트렌드 (Sprint 18+)

---

## 7. 다음 단계

- ✅ 본 PRD 작성 완료
- ⏭️ plan.md 작성 — feature 별 task breakdown
- ⏭️ design.md 작성 — 기술 구현 가이드
- ⏭️ state JSON 생성: .bkit/state/sprints/sprint-17-coverage-simulator.json
- ⏭️ /sprint start sprint-17-coverage-simulator
