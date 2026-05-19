# Sprint 19 Plan — Feature 별 Task Breakdown

> Sprint 19 PRD 의 8 features 를 PR / task 단위로 분해.

**작성일**: 2026-05-19
**의존**: prd.md
**Trust Level**: L4 (full-auto)

---

## F19-A — Coverage 28.77% → 35%+ (Server Actions mocking)

**목적**: Sprint 17/18 연속 미달의 35% target finally hit.

**Step 1**: Server Actions mocking 표준 도입
- Pattern: `vi.mock('@/lib/firebase/admin', ...)` + `vi.mock('@/lib/auth/auth', ...)`
- 표준 helper: `e2e/__mocks__/firebase-admin.ts` 또는 inline mock
- next/cache, server-only stub 등 wrapper 모두 mock

**Step 2**: 5+ Server Actions 단위 테스트
- 후보: lib/reaction/actions, lib/bookmark/actions, lib/comment/actions,
  lib/penalty/actions, lib/coupon/actions
- 각 함수의 auth path + happy path + error path 검증

**Step 3**: vitest config threshold 갱신 (28% → 30%)

**예상**: 5+ 파일 / 60+ tests / 1 PR

---

## F19-B — CI E2E spec 잔여 fail iterate

**목적**: F18-B fix 후 실 spec 통과 검증 + 잔여 spec fix.

**Step 1**: 최근 E2E run 결과 분석 (실 spec 실패 목록)

**Step 2**: 실패 spec 별 root cause 분석
- timing flake → wait-helper 적용
- selector outdated → selector 갱신
- emulator seed 의존 → seed 검증

**Step 3**: fix iterate (max 5회)

**예상**: spec 별 PR 또는 통합 1 PR

---

## F19-C — Lighthouse 측정 인프라

**목적**: Sprint 18 의 Vercel 미설정 issue 해결.

**Step 1**: 분석 — 현재 lighthouserc.json + workflow 의 구조

**Step 2**: 옵션 D 선택 (CI self-contained, 본 sprint 의 가정)
- workflow 내에서 next build + next start 후 Lighthouse 측정
- Vercel deployment 의존 X

**Step 3**: workflow 갱신 + 결과 회수

**예상**: workflow 파일 1 + 결과 보고서 / 1 PR

---

## F19-D — Visual baseline 첫 capture

**목적**: F18-B 의 workflow fix 후 첫 실 실행.

**Step 1**: gh workflow run 트리거

**Step 2**: 결과 artifact 회수

**Step 3**: e2e/visual/snapshots/ commit (baseline 저장)

**Step 4**: 회귀 검증 (동일 workflow 재실행 → diff 0)

**예상**: baselines + 보고서 / 1 PR

---

## F19-E — 시뮬레이터 시너지 32 → 50+

**목적**: F18-D 의 32 seed 를 50+ 로 확대.

**Step 1**: 부족 영역 식별 (현재 분포 분석)
- warrior: 5 신규 + 기존 1 = 6 → 8 (2 추가)
- swordsman: 5 신규 + 기존 2 = 7 → 10 (3 추가)
- medium: 5 신규 + 기존 3 = 8 → 12 (4 추가)
- balanced: 7 신규 + 기존 4 = 11 → 15 (4 추가)
- 비할당 (recommendedClass 없음): 추가 6

**Step 2**: 18+ 신규 seed 작성 (게임 메타 기반)

**Step 3**: 회귀 테스트 + 신규 검증

**중요**: 운영자 메타 입력 의존 — 운영자 미응답 시 보수적 자동 보강.

**예상**: 1 PR / 추가 18+ seed

---

## F19-F — components/ test 확대 (7 → 15+)

**목적**: Sprint 17/18 의 RTL 패턴 확대.

**대상 (8+ 신규)**:
- components/ui/{card, dialog, input, label, textarea, tooltip}
- components/domain/{class-card, tier-stack}
- components/feature/{recently-viewed-list, build-tag}

**Step 1**: 8 컴포넌트 선정 + RTL 테스트 작성

**Step 2**: 회귀 검증 + 표준 패턴 유지

**예상**: 8+ 파일 / 60+ tests / 1 PR

---

## F19-G — 시뮬레이터 빌드 prefill UX 개선

**목적**: F18-D/E 후속 — 시뮬레이션 결과 → /post/new 로 자연스러운 연동.

**Step 1**: 현재 prefill URL 패턴 분석
- `/post/new?prefill=simulator&combo=...`

**Step 2**: 개선:
- query string 의 combo 가 invalid 시 graceful fallback
- post form 에 시뮬레이션 컨텍스트 표시 (자동 tag 부착)
- 시뮬레이션 시너지 점수 + tier 자동 포함

**Step 3**: 단위 테스트

**예상**: 2-3 파일 변경 + 테스트 / 1 PR

---

## F19-H — 마스터 V2 F3.4 쿠폰 자동 검증 1차 구현

**목적**: 마스터 §2 F3.4 (V2 P1) 의 1차 구현.

**현재 상태**:
- coupon Server Action 존재 (lib/coupon/actions)
- 운영자 등록 + 사용자 vote up/down 시스템

**Step 1**: 자동 검증 정책 정의
- 다수 vote down 시 운영자 알림
- 만료일 자동 expire (계정)
- 등록 후 24h 이내 검증 안 되면 pending

**Step 2**: lib/coupon/auto-validate.ts 신규 함수
- pure function (Firestore 의존성 분리)
- decideValidation(votes, expiresAtMs, createdAtMs, nowMs): ValidationDecision

**Step 3**: 단위 테스트

**Step 4**: 향후 cron trigger 통합 (Sprint 20+ carry)

**예상**: 1 모듈 + 테스트 / 1 PR

---

## 전체 일정

```
Phase 1: plan (본 문서) — done
Phase 2: design — 다음
Phase 3: do — F19-A ~ F19-H 순차
Phase 4: iterate — typecheck/lint/test 0
Phase 5: qa — DoD 10항 검증
Phase 6: report — KPI snapshot + Sprint 20 carry
Phase 7: archived — 사용자 승인 후
```
