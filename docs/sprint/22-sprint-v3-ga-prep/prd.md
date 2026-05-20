# Sprint 22 PRD — V3 GA 진입 준비

> Sprint 22 — Sprint 21 carry 처리 + V3 (Production GA) 진입 직전 폴리시.

**작성일**: 2026-05-20
**Sprint**: 22 (sprint-22-v3-ga-prep)
**Trust Level**: L4 (Full-Auto)
**Archive 게이트**: 사용자 명시 승인

---

## 1. Sprint Goal

**V3 (Production GA) 진입 준비 완료**:
1. Coverage 65%+ 도달
2. 마스터 V2 UI 폴리시 (F3.5/F3.6 UI 마무리)
3. 시뮬레이터 시너지 165 전체 커버리지
4. Chrome QA Authenticated 흐름 검증
5. CI E2E + Lighthouse 실 결과 분석

---

## 2. 배경

### 2.1 Sprint 14-21 누계 (8 sprint)
- Coverage 25.13% → 57.88% (+32.75 pt)
- Tests 489 → 1119 (+128.8%)
- 시너지 10 → 120 (12x)
- 마스터 V2 0/7 → **7/7 완성**
- 인프라: Public + 브랜치 보호 + CODEOWNERS + Chrome QA

### 2.2 Sprint 22 의 의의
V3 GA (Production General Availability) 진입 전 마지막 sprint.

핵심 결정:
- **V3 진입 시점**: Sprint 22 종료 후
- **V3 작업**: 운영 안정화 + 성장 전환 (SLO 모니터링 / A/B 테스트 / 신규 사용자 인입 캠페인)
- **Sprint 23+** 은 V3 sprint 시작

---

## 3. Sprint Features (5건)

### 3.1 P0 — Coverage 가속 + 실 검증

| ID | Feature | 출처 |
|---|---|---|
| F22-A | Coverage 57.88% → 65%+ (lib/etl + insights + nlp) | Sprint 21 carry P0 |
| F22-E | CI E2E + Lighthouse 실 결과 분석 보고서 | Sprint 21 carry P0 |

### 3.2 P1 — 폴리시

| ID | Feature | 출처 |
|---|---|---|
| F22-B | components/feature/ test 6 → 15+ (10 신규 RTL) | Sprint 21 carry P1 |
| F22-C | 시뮬레이터 시너지 120 → 165 (전체 — 45 신규) | Sprint 21 carry P2 |

### 3.3 마스터 V2 UI 마무리

| ID | Feature | 출처 |
|---|---|---|
| F22-D | F3.5 로그인 source 통합 + F3.6 /me 닉네임 변경 폼 UI | Sprint 21 carry 마스터 V2 |

### 3.4 보류 (Sprint 23+ V3 carry)

- S3 staging cutover 실측 (사용자 명시 승인 게이트)
- F3.4 cron 실 실행 모니터링 (Secrets 등록 후)
- GA collect 503 root cause

---

## 4. Definition of Done (DoD)

| # | Gate | Target |
|---|---|---|
| DoD-1 | Coverage lines 65%+ | 65% |
| DoD-2 | components/feature/ test 15+ | 15 |
| DoD-3 | 시뮬레이터 시너지 165 (전체) | 165 |
| DoD-4 | F3.5 로그인 source 통합 | exists |
| DoD-5 | F3.6 /me 닉네임 변경 UI 통합 | exists |
| DoD-6 | CI E2E 실 결과 분석 보고서 | exists |
| DoD-7 | Lighthouse 5 URLs score 분석 | exists |
| DoD-8 | Chrome QA 전체 페이지 + Authenticated 흐름 (가능한 범위) | exists |
| DoD-9 | V3 GA readiness 평가 보고서 | exists |
| DoD-10 | Sprint 23 (V3 시작) carry items | 명세 |

---

## 5. KPI

```json
{
  "tokenBudget": 3500000,
  "phaseTimeoutHours": 360,
  "minMatchRate": 90,
  "expectedPRs": 8,
  "expectedNewTests": 150,
  "targetCoverageLines": 65,
  "v3ReadinessTarget": "GA-ready"
}
```

---

## 6. V3 GA Readiness 평가 항목

Sprint 22 종료 시 본 항목 점수 80%+ 이면 V3 GA 진입 결정.

| # | Readiness 항목 | 가중치 |
|---|---|---|
| 1 | Coverage 65%+ | 10% |
| 2 | typecheck / lint / vitest 0 fail | 10% |
| 3 | CI E2E 실 결과 분석 | 15% |
| 4 | Lighthouse 5 URLs 측정 | 10% |
| 5 | Visual baseline capture (인프라) | 5% |
| 6 | 마스터 V2 7/7 + UI 완성 | 15% |
| 7 | Chrome QA 익명 + Authenticated | 15% |
| 8 | 시뮬레이터 시너지 165 전체 | 10% |
| 9 | Public + 브랜치 보호 + CODEOWNERS | 5% |
| 10 | Sprint 22 종합 보고서 | 5% |

---

## 7. 가정 / 제약 / 위험

### 7.1 가정
- Sprint 22 종료 시점의 staging 이 V3 GA 직전 production-ready 상태
- 마스터 V2 7/7 완성 = V3 진입 sufficient

### 7.2 제약
- Trust L4 + Archive 사용자 게이트
- AWS tag = kkaebizigi
- tene 정책 엄수

### 7.3 위험
- lib/etl/insights/nlp mocking 복잡도 — Sprint 21 미달의 사유
- 시너지 165 = 45 신규 조합 작성에 시간 소요
- F22-D (UI 통합) 의 회귀 위험 — Chrome QA 로 mitigation

---

## 8. Phase 계획

| Phase | 산출물 |
|---|---|
| PRD/Plan/Design | 본 문서 + plan + design + state JSON |
| Do | 5 features × ~7 PR squash |
| Iterate | 0 fail |
| QA | Chrome 익명 + Authenticated + 매트릭스 + qa-summary |
| Report | V3 readiness 평가 + report |
| Archive | 사용자 승인 후 |
