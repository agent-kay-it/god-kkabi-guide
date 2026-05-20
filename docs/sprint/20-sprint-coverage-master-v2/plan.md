# Sprint 20 Plan — Feature 별 작업 분해

> Sprint 20 PRD 의 8 features 를 feature 별로 분해.

**작성일**: 2026-05-20
**의존**: prd.md

---

## F20-A — Coverage 42.54% → 50%+ (P0)

### Scope
lib/ Server Action 잔여 4 모듈의 단위 테스트:
- `lib/post/actions.ts` (620 lines, 최대) — 가장 큰 모듈, 가장 높은 coverage 효과
- `lib/subscription/actions.ts` (244 lines)
- `lib/b2b/actions.ts`
- `lib/moderation/actions.ts`

### 패턴
Sprint 19 의 `lib/__tests__/server-actions-mock.ts` helper 재사용.
각 모듈당 15-30 tests 추정 → 총 60-100 신규 tests.

### 예상 coverage 효과
- post: 620 lines × 100% = 6.2% 절대 증가
- subscription: 244 lines × 100% = 2.4%
- b2b/moderation: 200 lines × 100% = 2.0%
→ 누계 +10.6 pt 추정 → 42.54% + 10.6 = 53% 추정 (50% target 달성 가능)

### 산출물
- 4 신규 test 파일
- 1 PR

---

## F20-B — CI E2E 실 spec 결과 확인 (P0)

### Scope
1. Public 전환 후 첫 staging push 의 e2e.yml 결과 분석
2. fail spec 발견 시 root cause 분석
3. iterate (max 3 cycles per spec)

### 가능한 fail 시나리오 (Sprint 14-18 의 carry 가설)
- Firebase emulator startup race condition
- webServer race condition
- visual regression (snapshot 없음 → 첫 실행 시 baseline 자동 생성)

### 산출물
- 1-2 PR (fail spec 별 fix or 명시 carry)

---

## F20-C — Lighthouse 실 측정 분석 (P0)

### Scope
1. F19-C 의 lighthouse.yml (CI self-contained) 첫 run 결과 확인
2. 5 URLs × 3 runs 의 score 분석
3. assert preset 의 warn/error 결과 정리
4. 분석 보고서 `docs/sprint/20-*/lighthouse-analysis.md` 작성

### 분석 항목
- Performance score (target ≥80)
- Accessibility score (**error if <90**)
- LCP / FCP / CLS / TBT
- Budget 위반 (script ≤400KB / image ≤1500KB)
- 페이지별 최저 score 항목 + 개선 방향

### 산출물
- 분석 보고서 1건
- 즉시 개선 가능한 항목 fix (선택) 1 PR

---

## F20-D — Visual baseline 실 capture (P1)

### Scope
1. PR 에 `visual-baseline` 라벨 부착
2. F19-D 의 workflow_dispatch (label trigger) 발화
3. 25 paths × 3 projects = 75 snapshots 자동 생성
4. workflow 가 자동 생성한 rebaseline PR review + merge

### 검증 항목
- 모든 25 paths 의 첫 baseline 생성
- 의도되지 않은 차이 없음 (첫 baseline 이므로 모두 신규)
- 각 project 별 viewport 차이 정확

### 산출물
- baseline 75 snapshots commit (workflow 자동 PR)

---

## F20-E — 시뮬레이터 시너지 51 → 80+ (P2)

### Scope
- 29+ 신규 조합 추가 (Warrior +5 / Swordsman +5 / Medium +5 / Balanced +8 / 미할당 +6)
- 기존 51 score 변경 X (회귀 보호)
- 단위 테스트 확장 (80+ assertion + 직업 분포)

### 산출물
- `lib/simulator/synergy-matrix.ts` 확장
- `lib/simulator/synergy-matrix.test.ts` 확장
- 1 PR

---

## F20-F — components/feature/ test 확대 (P2)

### Scope
8+ 신규 feature 컴포넌트 RTL 테스트:
- post-card.tsx (PostCard 메인 list 카드)
- chat-bubble.tsx (채팅 메시지)
- simulator-canvas.tsx (시뮬레이터 메인)
- back-to-top.tsx (스크롤 버튼)
- comment-form.tsx (댓글 입력)
- url-preview.tsx (Sprint 17 작업)
- 기타 후보

### 산출물
- 5-8 신규 test 파일
- 1 PR

---

## F20-G — F3.4 cron worker (마스터 V2)

### Scope
- 신규 `.github/workflows/coupon-auto-validate-cron.yml`
- schedule: `0 */6 * * *` (6시간 마다)
- workflow_dispatch (수동 trigger 도 지원)
- 내부 작업: `runCouponAutoValidation` Server Action 호출하는 CLI 스크립트
- `scripts/run-coupon-auto-validate.mjs` 신규

### TOS 안전성
- 실 게임 쿠폰 호출 X
- admin 토큰으로만 실행 (Firebase admin SDK)
- dry-run mode 지원 (실 mutation 없이 결정만)

### 산출물
- workflow + 스크립트
- 1 PR

---

## F20-H — F3.5 진령 추천 알고리즘 1차 (마스터 V2)

### Scope
신규 `lib/simulator/recommend.ts`:
```typescript
export interface RecommendationInput {
  readonly ownedJinryeong: readonly WikiJinryeongId[];
  readonly classId?: ClassId;
}

export interface RecommendationResult {
  readonly synergies: readonly RankedSynergy[]; // top 3
  readonly missingForS: readonly WikiJinryeongId[]; // S tier 도달 위해 더 필요한 진령
}

export function recommendBuilds(input: RecommendationInput): RecommendationResult;
```

### 알고리즘
- 보유 진령 3개 이상이면: 모든 C(n,3) 조합 → getSynergy → score desc top 3
- 보유 2개 이하: top 3 S tier 시너지 추천 + 부족 진령 명시
- classId 필터 (optional): recommendedClass 일치하는 것만 우선

### 산출물
- `lib/simulator/recommend.ts` (pure function)
- `lib/simulator/recommend.test.ts` (15+ tests)
- 1 PR

---

## 작업 순서 (의존성 고려)

1. F20-A (P0, 가장 큰 effort)
2. F20-E (P2, 독립)
3. F20-H (마스터 V2, F20-A 의 mocking 패턴 무관)
4. F20-F (P2, RTL 패턴 재사용)
5. F20-G (마스터 V2, F19-H 의 runCouponAutoValidation 의존)
6. F20-C (P0, F19-C 결과 분석)
7. F20-B (P0, CI 실 결과 확인)
8. F20-D (P1, workflow trigger)
9. Iterate
10. QA
11. Report
12. Archive (사용자 승인 대기)
