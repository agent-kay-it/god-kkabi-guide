# Sprint 20 PRD — Coverage 50%+ + 인프라 실 검증 + Master V2 가속

> Sprint 20 — Sprint 19 carry-forward 9 항목 처리 + 마스터 V2 가속.

**작성일**: 2026-05-20
**Sprint**: 20 (sprint-20-coverage-master-v2)
**Trust Level**: L4 (Full-Auto)
**Archive 게이트**: 사용자 (kay@popupstudio.ai) 명시적 승인 후 진행

---

## 1. Sprint Goal

Sprint 19 carry-forward 9 항목 처리 + 마스터 V2 진척 4/7 → 6/7.

**근거**: Sprint 19 QA `qa-summary.md` §5 (9 항목 + 마스터 V2 2건) + Sprint 19 archive 직후 인프라 정비 (Public + 브랜치 보호) 효과.

---

## 2. 배경

### 2.1 Sprint 19 종료 시점 상태

- Coverage lines **42.54%** (Sprint 18 28.77% → +13.77 pt, 3.78x 가속)
- Tests **889** (+235)
- 마스터 V2 진척 **4/7** (F3.3 + F3.4 + F3.6 + F3.7)
- DoD: 8 pass + 2 pass-as-fix + 1 blocked-external = 10/10
- GitHub Actions billing 외부 이슈 → **Public 전환으로 해결됨 (Sprint 19 후속)**

### 2.2 Sprint 20 의 의의

- Public 전환 직후 첫 sprint → CI 실 결과 검증 가능 (Sprint 14-19 의 누적 가설 확정)
- Coverage 50%+ 달성 시 6 sprint 연속 +13 pt 가속 후 안정 구간 진입
- 마스터 V2 6/7 도달 시 V3 (Production GA) 진입 임박

---

## 3. Sprint Features (8건)

### 3.1 P0 — Carry 처리 + 회귀 검증

| ID | Feature | 출처 |
|---|---|---|
| F20-A | Coverage 42.54% → 50%+ (lib/ Server Action 잔여 4 모듈) | Sprint 19 carry #2 |
| F20-B | CI E2E 실 spec 결과 확인 + 잔여 fail iterate | Sprint 19 carry #1 (billing unblock) |
| F20-C | Lighthouse 실 측정 결과 분석 + 첫 baseline | Sprint 19 carry #3 |

### 3.2 P1 — 인프라 마무리

| ID | Feature | 출처 |
|---|---|---|
| F20-D | Visual baseline 실 capture 실행 + 75 snapshot commit | Sprint 19 carry #4 |

### 3.3 P2 — 콘텐츠 보강

| ID | Feature | 출처 |
|---|---|---|
| F20-E | 시뮬레이터 시너지 51 → 80+ (29+ 신규 조합) | Sprint 19 carry #5 |
| F20-F | components/feature/ test 확대 (post-card / chat-bubble / simulator-canvas 등 RTL) | Sprint 19 carry #6 |

### 3.4 마스터 V2 가속

| ID | Feature | 출처 |
|---|---|---|
| F20-G | F3.4 쿠폰 자동 검증 cron worker (GitHub Actions cron) | Sprint 19 carry #8 |
| F20-H | F3.5 진령 추천 알고리즘 1차 (pure function + 단위 테스트) | Sprint 19 carry #9 |

### 3.5 보류 (Sprint 21+ carry)

- S3 staging cutover 실측 (P2) — 사용자 명시 승인 게이트 유지

---

## 4. Definition of Done (DoD)

| # | Gate | Target |
|---|---|---|
| DoD-1 | Coverage lines 50%+ | 50% |
| DoD-2 | CI E2E 모든 spec pass 또는 잔여 carry 명시 | 모든 pass or 명시 carry |
| DoD-3 | Lighthouse 5 URLs 실 측정 + score 분석 보고서 | 5 measured |
| DoD-4 | Visual baseline 1차 commit (75 snapshots) | 1+ baseline |
| DoD-5 | 시뮬레이터 시너지 80+ 또는 보수 보강 | 80 |
| DoD-6 | components/feature/ test 5+ 신규 | 5+ |
| DoD-7 | F3.4 cron worker 동작 검증 | exists + dry-run |
| DoD-8 | F3.5 진령 추천 1차 + 단위 테스트 | exists + tests |
| DoD-9 | Sprint 20 종합 보고서 | qa-summary.md + report.md |
| DoD-10 | Sprint 21 carry items | 명세 |

---

## 5. KPI

```json
{
  "tokenBudget": 3000000,
  "phaseTimeoutHours": 240,
  "minMatchRate": 90,
  "expectedPRs": 9,
  "expectedNewTests": 150,
  "targetCoverageLines": 50,
  "masterV2Progress": "4/7 → 6/7"
}
```

---

## 6. 가정 / 제약 / 위험

### 6.1 가정
- Public 전환으로 GitHub Actions 무제한 사용 가능
- CI E2E 실 결과는 Sprint 14-18 의 누적 fix 효과를 가시화할 것
- Server Actions mocking 표준 (Sprint 19 helper) 의 재사용성

### 6.2 제약
- Trust L4 — Archive 만 사용자 게이트
- Heredoc 금지 (bkit ENH-310 hook) → file-based commit msg 유지
- AWS 리소스 tag = kkaebizigi (모든 새 리소스)
- tene secret 정책 엄수 (CLAUDE.md)

### 6.3 위험
- CI E2E 실 fail 다수 가능 → iterate 사이클 길어질 수 있음 (max 5 iterations / Sprint)
- Lighthouse 실 score 가 Performance 80 미만 → assert fail (warn 이지만 PR 빨간불)
- Visual baseline 75 snapshot 의 첫 review 가 시각 변화 검증 필요 (PR 머지 시 careful review)

---

## 7. Phase 계획

| Phase | 예상 작업 | 트리거 |
|---|---|---|
| PRD | 본 문서 + plan.md + design.md + state JSON | 본 commit |
| Plan | feature 별 task breakdown | 본 sprint |
| Design | 기술 패턴 (mocking 확장 + Lighthouse 분석 + 추천 알고리즘) | 본 sprint |
| Do | 8 features (각 1 PR squash merged) | 9 PRs 추정 |
| Iterate | typecheck/lint/test 0 fail | max 5 cycles |
| QA | DoD 10 검증 + qa-summary.md | 1 PR |
| Report | report.md + Sprint 21 carry | report 포함 |
| Archive | 사용자 명시 승인 후 archive | 1 PR |
