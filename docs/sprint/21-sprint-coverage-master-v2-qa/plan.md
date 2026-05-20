# Sprint 21 Plan — Feature 별 작업 분해

> Sprint 21 PRD 의 7 features + Chrome QA 분해.

**작성일**: 2026-05-20
**의존**: prd.md

---

## F21-A — Coverage 53.27% → 65%+ (P0)

### Scope
lib/ 모듈 중 미커버 helper 단위 테스트:
- `lib/firebase/client-config.ts` (~50 lines)
- `lib/firebase/claims-retry-queue.ts` (~100 lines)
- `lib/wiki/*-adapter.ts` (5 adapter 모듈, ~150 lines each)
- `lib/wiki/valid-ids-cache.ts`
- `lib/post/markdown.ts` + `lib/post/og-parser.ts` helper
- `lib/observability/*` helper
- 시뮬레이터/Coupon/Penalty 의 미커버 사이드 helper

### 추정
- 12+ 신규 test 파일
- 100+ 신규 tests
- +12 pt coverage (53.27 → 65)

### 패턴
- Sprint 19 의 `lib/__tests__/server-actions-mock.ts` helper 재사용
- adapter 는 외부 API mock 으로 pure function 같이 검증

---

## F21-B — 시뮬레이터 시너지 80 → 120+ (P1)

### Scope
40+ 신규 조합 추가. 165 중 73% 커버리지 목표.

### 분포 목표
```
warrior:   18 (+5)
swordsman: 20 (+5)
medium:    23 (+6)
balanced:  35 (+12)
미할당:    24 (+12)
─────────────────
합계:      120
```

### 산출물
- synergy-matrix.ts 확장
- 5+ 신규 회귀 테스트
- 1 PR

---

## F21-C — components/feature/ test 5 → 15+ (P1)

### Scope
10+ 신규 RTL 테스트:
- post-card (메인 list 카드)
- comment-thread (댓글 트리)
- chat-message (채팅 메시지)
- chat-input (채팅 입력)
- post-form (글 작성 폼)
- comment-form (댓글 입력)
- subscription-cancel-button
- ad-slot-infeed
- adsense-script
- structured-data

### 패턴
- F19-F / F20-F 패턴 (jsdom + cleanup + vi.mock)
- Server Action 사용 컴포넌트는 mock

### 산출물
- 10 신규 test 파일
- 80+ tests
- 1 PR

---

## F21-D — F3.5 진령 추천 UI 통합 (마스터 V2)

### Scope
시뮬레이터 페이지의 `<SimulatorCanvas>` 옆에 RecommendationCard 추가:

1. **클라이언트 컴포넌트** `components/feature/recommendation-card.tsx`
   - props: `RecommendationResult` (lib/simulator/recommend.ts)
   - 표시: top-3 시너지 + missing 진령 + matchesClass 플래그
2. **server 호출 점**: `/simulator/page.tsx` 가 보유 진령 (cookie/RTDB) 읽어 recommendBuilds 호출
3. **단위 테스트** 6+ (RecommendationCard 렌더 + missing 표시 + classId match badge)

### 산출물
- 신규 컴포넌트 + 테스트
- /simulator 페이지 통합
- 1 PR

---

## F21-E — F3.6 닉네임 변경 안내 (마스터 V2)

### Scope
**현재**: 닉네임 변경 정책 미문서화 (CLAUDE.md 검색해도 정보 없음).

**Sprint 21 추가**:
1. **정책 문서** `docs/05-policy/nickname-change-policy.md`
   - 변경 빈도: 30일 1회
   - validation: 2-12자, 한글/영문/숫자/언더스코어
   - 중복 검증: Firestore unique constraint 유지
2. **Server Action** `lib/auth/change-nickname.ts`
   - changeNickname(newNickname) → ChangeNicknameResult
   - 30일 cooldown 검증
   - users.nickname update + claim 재발급
3. **UI** `/me` 페이지 안내 + 변경 폼
4. **단위 테스트** 10+

### 산출물
- 정책 문서 + Server Action + UI + 테스트
- 1 PR

---

## F21-F — CI 실 결과 분석 (P0)

### Scope
1. Sprint 20 의 queue 적체 해소 확인
2. E2E / Lighthouse / Visual baseline 첫 성공 run 결과 수집
3. 분석 보고서 작성:
   - `docs/sprint/21-*/reports/ci-e2e-analysis.md`
   - `docs/sprint/21-*/reports/lighthouse-analysis.md`
   - `docs/sprint/21-*/reports/visual-baseline-status.md`
4. 발견 이슈는 fix iterate (max 3 spec)

### 산출물
- 3 분석 보고서
- 0-2 fix PR

---

## Chrome QA — 7-Layer dataFlowIntegrity

### Scope
QA phase 에서 진행. 자세한 절차는 design.md §5 참조.

7 핵심 페이지 × 6 검증 항목 = 42 체크포인트.

### 산출물
- `docs/sprint/21-*/reports/chrome-qa-result.md` (체크포인트 결과 매트릭스)

---

## 작업 순서 (의존성)

1. **F21-A** (가장 큰 effort, P0)
2. **F21-B** (P1, 독립)
3. **F21-D** (마스터 V2, F20-H recommend 의존, UI 통합)
4. **F21-E** (마스터 V2, Server Action 신규)
5. **F21-C** (P1, RTL 패턴 재사용 + F21-D 의 신규 컴포넌트 포함 가능)
6. **F21-F** (P0, CI 결과 수집 — sprint 진행 중 백그라운드)
7. **Iterate** — 0 fail 확인
8. **QA** — Chrome 7-Layer 검증
9. **Report** — 종합
10. **Archive** — 사용자 승인 후
