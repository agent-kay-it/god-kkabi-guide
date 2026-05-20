# Sprint 21 PRD — Coverage 65%+ + Master V2 완성 + Chrome QA

> Sprint 21 — Sprint 20 carry 10 + 마스터 V2 6/7 → 7/7 + Chrome 기반 전체 페이지 QA.

**작성일**: 2026-05-20
**Sprint**: 21 (sprint-21-coverage-master-v2-qa)
**Trust Level**: L4 (Full-Auto)
**Archive 게이트**: 사용자 (kay@popupstudio.ai) 명시적 승인

---

## 1. Sprint Goal

1. **Sprint 20 carry 처리 + 마스터 V2 7/7 도달** (V3 GA 진입 준비)
2. **Chrome 기반 7-Layer dataFlowIntegrity QA** — 모든 페이지/기능/UI 구성요소를 실 브라우저에서 검증

---

## 2. 배경

### 2.1 Sprint 20 종료 시점
- Coverage 53.27% / Tests 1045 / 마스터 V2 4/7 → 6/7
- 8 PR 머지 / DoD 6 pass + 1 pass-as-fix + 3 blocked-queue = 10/10
- Public 전환 + 브랜치 보호 인프라 안정화

### 2.2 Sprint 21 의 의의
- **마스터 V2 6/7 → 7/7**: F3.5 UI 통합 + F3.6 닉네임 변경 → V3 (Production GA) 진입 가능
- **Chrome 기반 QA**: Sprint 14-20 의 static gap-detector + RTL + unit test 위에 **실 브라우저 E2E** 검증 추가. 7-Layer dataFlowIntegrity (UI → Client → API → Validation → DB → Response → Client → UI) 7 hop 추적.
- **Coverage 65%+**: lib/firebase + lib/wiki helper 단위 테스트로 +12 pt 가속

---

## 3. Sprint Features (7건)

### 3.1 P0 — Carry + 가속

| ID | Feature | 출처 |
|---|---|---|
| F21-A | Coverage 53.27% → 65%+ (lib/firebase + lib/wiki + lib/post helper) | Sprint 20 carry #4 |
| F21-F | CI E2E / Lighthouse / Visual baseline 실 결과 분석 | Sprint 20 carry #1, #2, #3 |

### 3.2 P1 — 콘텐츠 보강

| ID | Feature | 출처 |
|---|---|---|
| F21-B | 시뮬레이터 시너지 80 → 120+ (40+ 신규 조합) | Sprint 20 carry #8 |
| F21-C | components/feature/ test 5 → 15+ (10+ 신규) | Sprint 20 carry #9 |

### 3.3 마스터 V2 완성

| ID | Feature | 출처 |
|---|---|---|
| F21-D | F3.5 진령 추천 UI 통합 (시뮬레이터 페이지) | Sprint 20 carry (마스터 V2) |
| F21-E | F3.6 닉네임 변경 안내 + Server Action | Sprint 20 carry (마스터 V2) |

### 3.4 보류 (Sprint 22+ carry)

- S3 staging cutover 실측 (사용자 명시 승인 게이트)
- F3.4 cron 실 실행 모니터링 (GitHub Secrets 등록 후)

---

## 4. Definition of Done (DoD)

| # | Gate | Target |
|---|---|---|
| DoD-1 | Coverage lines 65%+ | 65% |
| DoD-2 | 시뮬레이터 시너지 120+ | 120 |
| DoD-3 | components/feature/ test 15+ | 15 |
| DoD-4 | F3.5 UI 통합 + 단위 테스트 | exists |
| DoD-5 | F3.6 닉네임 변경 안내 + Server Action + 테스트 | exists |
| DoD-6 | CI E2E 실 결과 분석 보고서 | exists |
| DoD-7 | Lighthouse 5 URLs score 분석 보고서 | exists |
| DoD-8 | Chrome 7-Layer QA — 5+ 핵심 페이지 검증 보고서 | 5+ |
| DoD-9 | 마스터 V2 7/7 완성 | 7/7 |
| DoD-10 | Sprint 22 carry items | 명세 |

---

## 5. Chrome QA — 7-Layer dataFlowIntegrity

### 5.1 대상 페이지 (5+ 핵심)
| URL | 목적 | hop 추적 |
|---|---|---|
| `/` | 홈 — 진령/시뮬레이터/콘텐츠 진입 | UI → static gen → UI |
| `/post` | 게시판 list | UI → Server Component → Firestore → SSR → UI |
| `/post/{id}` | 게시물 상세 | UI → Server Action (incrementView) → DB → UI |
| `/simulator` | 빌드 시뮬레이터 | UI → toggle → getSynergy → recordSimulatorRun → DB → UI |
| `/me` | 마이페이지 (로그인 필요) | UI → auth() → Firestore users → UI |
| `/coupon` | 쿠폰 목록 | UI → listCoupons → Firestore → UI |
| `/jinryeong` | 진령 백과 | UI → wiki data → UI |

### 5.2 검증 항목 (각 페이지)
1. **HTTP status 200**
2. **JS 콘솔 error 0**
3. **네트워크 요청 모두 2xx/3xx**
4. **핵심 UI 구성요소 렌더링 (h1, main, footer)**
5. **인터랙션 동작 (클릭/입력/네비게이션)**
6. **데이터 흐름 무결성** (UI 데이터가 server response 와 일치)

### 5.3 도구
- `claude-in-chrome` MCP — navigate / get_page_text / read_console_messages / read_network_requests / find / form_input

---

## 6. KPI

```json
{
  "tokenBudget": 3500000,
  "phaseTimeoutHours": 360,
  "minMatchRate": 90,
  "expectedPRs": 9,
  "expectedNewTests": 200,
  "targetCoverageLines": 65,
  "chromeQAPagesValidated": 7,
  "masterV2Progress": "6/7 → 7/7"
}
```

---

## 7. 가정 / 제약 / 위험

### 7.1 가정
- CI queue 적체 해소 (Public 전환 후 시간 경과 → runner 가용성 회복)
- Firebase emulator + dev server 로 Chrome QA 가능
- F3.5 추천 알고리즘 (lib/simulator/recommend.ts) 의 UI 통합 시 추가 회귀 위험 없음

### 7.2 제약
- Trust L4 + Archive 사용자 게이트
- AWS tag = kkaebizigi (모든 새 리소스)
- tene 정책 엄수 (CLAUDE.md)
- Chrome MCP 사용 시 dialog 트리거 금지 (응답 차단)
- Chrome MCP 사용 전 ToolSearch 로 load 필수

### 7.3 위험
- Chrome QA 의 페이지별 fail 시 root cause 분석 길어질 수 있음 (max 3 spec 별)
- F21-A 의 lib/firebase mocking 이 복잡할 수 있음 (admin SDK 직접 호출 다수)
- Coverage 65% target 미달 시 Sprint 22 carry

---

## 8. Phase 계획

| Phase | 산출물 |
|---|---|
| PRD/Plan/Design | 본 문서 + plan.md + design.md + state JSON |
| Do | 7 features × ~9 PR squash |
| Iterate | typecheck/lint/test 0 fail |
| QA | Chrome 7-Layer QA + qa-summary.md |
| Report | report.md + Sprint 22 carry |
| Archive | 사용자 승인 후 진행 |
