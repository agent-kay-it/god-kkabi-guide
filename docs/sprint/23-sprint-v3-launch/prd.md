# Sprint 23 PRD — V3 Launch (운영 안정화 + 마스터 V2 마무리)

> Sprint 23 — **V3 (Production GA) 의 첫 sprint**. 운영 안정화 + 성장 전환의 시작점.

**작성일**: 2026-05-20
**Sprint**: 23 (sprint-23-v3-launch)
**Trust Level**: L4 (Full-Auto)
**Archive 게이트**: 사용자 명시 승인

---

## 1. Sprint Goal

1. **V3 운영 안정화 시작**: SLO 모니터링 + Sentry + SEO 최적화
2. **마스터 V2 UI 마무리**: F3.5 owned source + NicknameChangeForm /me 통합
3. **Sprint 22 carry 처리**: CI 결과 + feature RTL 15+ + Coverage 70%+

---

## 2. 배경

### 2.1 V2 종료 → V3 진입 (Sprint 22 archive 시점)
- V3 readiness 81.5%
- 마스터 V2 7/7 완성
- 9 sprint 누계 Coverage +40.9 pt, Tests +145.6%, 시너지 16.5x

### 2.2 V3 의 의의
V2 가 "초기 기능 완성"이라면 V3 는 "운영 안정화 + 성장 전환":
- **운영**: SLO / Sentry / 에러 대시보드 / 알람 임계값
- **성장**: SEO / structured data / sitemap / 사용자 retention
- **콘텐츠 정교화**: 시뮬레이터 placeholder 45 메타 검증 (운영자)
- **마스터 V3 도입**: F4.* — 운영 / 분석 도메인

---

## 3. Sprint Features (6건)

### 3.1 P0 — 마스터 V2 UI 마무리 + V3 신규 운영

| ID | Feature | 카테고리 |
|---|---|---|
| F23-A | NicknameChangeForm /me 통합 + F3.5 owned source | 마스터 V2 carry |
| F23-B | SLO 모니터링 + Sentry 통합 | V3 신규 |
| F23-E | Coverage 66.03% → 70%+ (lib/auth + lib/storage 잔여) | P0 |

### 3.2 P1 — V3 성장 전환

| ID | Feature | 카테고리 |
|---|---|---|
| F23-C | SEO 최적화 + structured data 강화 | V3 신규 |
| F23-D | components/feature/ test 7 → 15+ | Sprint 22 carry |

### 3.3 P0 — Sprint 22 carry

| ID | Feature | 출처 |
|---|---|---|
| F23-F | CI E2E + Lighthouse 실 결과 분석 | Sprint 22 carry |

### 3.4 보류 (Sprint 24+ V3 carry)

- F3.4 cron 실 실행 모니터링 (Secrets 등록 후)
- 시뮬레이터 placeholder 45 메타 검증 (운영자 입력)
- S3 cutover (사용자 명시 승인)
- 마스터 V3 F4.* 신규 feature (Sprint 24+)

---

## 4. Definition of Done (DoD)

| # | Gate | Target |
|---|---|---|
| DoD-1 | F3.5 로그인 owned 진령 source 통합 | exists + 테스트 |
| DoD-2 | NicknameChangeForm /me 페이지 통합 | exists |
| DoD-3 | Sentry 통합 (server + client) + 첫 에러 캡처 검증 | exists |
| DoD-4 | SEO 강화 (메타 / sitemap / structured data) | 5+ 페이지 |
| DoD-5 | components/feature/ test 15+ | 15+ |
| DoD-6 | Coverage lines 70%+ | 70% |
| DoD-7 | CI E2E 실 결과 분석 보고서 | exists |
| DoD-8 | Chrome QA 추가 페이지 + 새 기능 검증 | 8+ unique pages |
| DoD-9 | Sprint 23 종합 보고서 | qa-summary + report |
| DoD-10 | Sprint 24 carry items | 명세 |

---

## 5. KPI

```json
{
  "tokenBudget": 3500000,
  "phaseTimeoutHours": 360,
  "minMatchRate": 90,
  "expectedPRs": 8,
  "expectedNewTests": 100,
  "targetCoverageLines": 70,
  "v3LaunchMilestones": ["Sentry", "SEO", "V2-UI-complete"]
}
```

---

## 6. 가정 / 제약 / 위험

### 6.1 가정
- Sentry 무료 tier (Developer Plan) 충분 (5K events/month)
- Firestore `users.ownedJinryeong` 필드 신규 추가 — admin 콘솔로 사용자 입력 받음

### 6.2 제약
- Trust L4 + Archive 사용자 게이트
- tene 정책 엄수 (Sentry DSN secret 으로 관리)
- AWS tag = kkaebizigi

### 6.3 위험
- Sentry 자동 통합의 회귀 위험 (React Compiler + Next.js 16 호환성)
- SEO 변경의 검색 인덱스 영향 (단기 ranking 변동 가능)
- /me 페이지에 NicknameChangeForm 추가 시 layout 회귀

---

## 7. Phase 계획

| Phase | 산출물 |
|---|---|
| PRD/Plan/Design | 본 문서 + plan + design + state JSON |
| Do | 6 features × ~7 PR squash |
| Iterate | 0 fail |
| QA | Chrome 페이지 추가 + 새 기능 (Sentry / SEO / NicknameForm) 검증 |
| Report | report.md + Sprint 24 carry + V3 진척 평가 |
| Archive | 사용자 승인 후 |
