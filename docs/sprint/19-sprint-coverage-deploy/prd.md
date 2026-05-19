# Sprint 19 PRD — Coverage 35% + Deploy Infrastructure + Master V2

> Sprint 18 carry-forward 8건 처리 + 마스터 V2 의 F3.3 / F3.4 점진.

**작성일**: 2026-05-19 (Sprint 18 archive 직후)
**작성자**: Sprint 18 자동 생성 초안 (사용자 검토 + 보강 필요)
**Trust 권장**: L4 (full-auto)

---

## 1. Sprint 18 Carry-forward Items (8건)

| # | 항목 | Priority |
|---|---|---|
| 1 | Coverage 28.77% → 35%+ (Server Actions mocking) | P0 |
| 2 | CI E2E spec 실 통과 확인 (F18-B fix 효과) | P0 |
| 3 | Lighthouse 측정 인프라 결정 + 5 URLs 분석 | P0 |
| 4 | Visual baseline 첫 capture dispatch + commit | P1 |
| 5 | 시뮬레이터 시너지 32 → 50+ (운영자 게임 메타 검증) | P1 |
| 6 | S3 staging cutover 실측 (사용자 명시 승인 후) | P2 |
| 7 | components/feature/ test 확대 (7 → 15+) | P2 |
| 8 | 시뮬레이터 빌드 prefill UX 개선 | P3 |

---

## 2. Feature 후보 매핑 (F19-A ~ F19-H)

| Feature | Carry | 작업 요약 |
|---|---|---|
| F19-A | #1 | lib/ Server Actions mocking 표준 도입 + 5+ 신규 test 모듈 |
| F19-B | #2 | CI E2E 잔여 spec fail iterate (max 5회) |
| F19-C | #3 | Lighthouse 측정 인프라 결정 (운영자 결정 후 적용) |
| F19-D | #4 | Visual baseline workflow_dispatch 1차 실행 + commit |
| F19-E | #5 | 시뮬레이터 시너지 32 → 50+ (운영자 메타 입력 또는 보수적 자동 보강) |
| F19-F | #7 | components/feature/ 8+ 신규 RTL 테스트 |
| F19-G | #8 | 시뮬레이터 빌드 prefill UX (post/new 와의 연동 강화) |
| F19-H | 마스터 V2 | F3.3 결투장 빌드 트렌드 1차 구현 또는 F3.4 쿠폰 자동 검증 |

**F19-F (S3 cutover 실측)**: 사용자 명시 승인 후 별도 진행 — 본 sprint 내 단순 carry.

---

## 3. DoD 목표 (10)

| # | 기준 |
|---|---|
| DoD-1 | Coverage lines 35%+ 달성 |
| DoD-2 | CI E2E 모든 spec pass (또는 잔여 carry 명시) |
| DoD-3 | Lighthouse 측정 결과 + 분석 보고서 |
| DoD-4 | Visual baseline 1차 capture commit |
| DoD-5 | 시뮬레이터 시너지 50+ 또는 운영자 검증 결과 |
| DoD-6 | components/ test 8+ 신규 |
| DoD-7 | 시뮬레이터 빌드 prefill UX 개선 |
| DoD-8 | 마스터 V2 1+ feature 진척 |
| DoD-9 | Sprint 19 종합 보고서 |
| DoD-10 | Sprint 20 carry items |

---

## 4. KPI 목표

| 메트릭 | Sprint 18 | Sprint 19 Target |
|---|---|---|
| Coverage lines | 28.77% | 35%+ (P0 finally hit) |
| Total tests | 654 | 730+ |
| Test files | 60 | 70+ |
| PR squash merge | 8 | 8 |
| 시뮬레이터 synergy seed | 32 | 50+ |
| 마스터 V2 미착수 | 4 | 3 (-1) |

---

## 5. 위험 + 가정

### 5.1 위험

1. **Coverage 35% 도달**: Sprint 17, 18 연속 미달. Server Actions mocking 의 복잡성이
   본 sprint 에서도 미해결 시 sprint 20 carry.
2. **F19-E 시너지 50+**: 운영자 메타 입력 의존. 운영자 미응답 시 보수적 자동 보강 (50점
   default 의 일관성).
3. **F19-H 마스터 V2 1+ feature**: F3.3/F3.4 모두 데이터 aggregation + chart lib 필요 —
   기존 jinryeong-rate-chart 패턴 재사용 가능.

### 5.2 가정

- F18-B 의 CI E2E fix 가 실제로 작동
- Sprint 18 의 RTL 패턴이 F19-F 에서 확대 적용 가능
- 운영자 응답 시간 < 1주 (F19-C Lighthouse 인프라 결정)

---

## 6. Out of Scope (Sprint 19 비포함)

- ❌ i18n 변경 (Sprint 17 결정 — dormant 유지)
- ❌ 토스 결제 통합 (별도 sprint)
- ❌ Pain NLP / 마스터 V2 F3.5 (Sprint 20+)

---

## 7. Sprint 19 시작 시 사용자 결정 필요 항목

1. F19-C Lighthouse 인프라: Vercel A / staging B / CI D 중 선택
2. F19-E 시뮬레이터 시너지 운영자 메타 입력
3. F19-H 마스터 V2 우선순위: F3.3 (결투장 트렌드) vs F3.4 (쿠폰 검증)

---

## 8. Next Actions

- 본 PRD 사용자 검토 + 보강 후 plan.md 작성
- /sprint start sprint-19-coverage-deploy
