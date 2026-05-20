# Sprint 22 Plan — Feature 별 작업 분해

> Sprint 22 PRD 의 5 features 분해.

---

## F22-A — Coverage 57.88% → 65%+ (P0)

### Scope
미커버 helper:
- `lib/etl/` (Wiki ETL converter)
- `lib/insights/` (분석 helper)
- `lib/nlp/` (한국어 정규화 / unicodeSegment)
- `lib/firebase/firestore.ts`
- `lib/firebase/realtime-db.ts`
- `lib/post/markdown.ts` 잔여
- `lib/post/og-parser.ts` 잔여
- `lib/storage/` 잔여

추정: 100+ 신규 tests. +8 pt coverage.

### 패턴
- pure function 우선 (lib/nlp 같은 client-safe)
- server-only 모듈은 admin SDK mock

---

## F22-B — components/feature/ 6 → 15+

### 우선 컴포넌트 (10+ 신규)

| 컴포넌트 | mock 의존 |
|---|---|
| post-card.tsx | next/link |
| comment-thread.tsx | listComments / lib/reaction |
| chat-message.tsx | next/image |
| chat-input.tsx | lib/chat |
| post-form.tsx | useForm + Server Action |
| comment-form.tsx | createComment |
| subscription-cancel-button | cancelSubscription |
| ad-slot-infeed.tsx | window.adsbygoogle |
| adsense-script.tsx | next/script |
| structured-data.tsx | JSON-LD |

추정: 80+ 신규 tests.

---

## F22-C — 시너지 120 → 165 (전체)

165 - 120 = 45 신규 조합. 11 진령의 전체 C(11,3) 조합 커버.

### 분포 (165)
- warrior: 20
- swordsman: 22
- medium: 25
- balanced: 40
- 미할당: 58
- 합계: 165

기존 120 score 변경 X (9 sprint 연속 회귀 보호).

---

## F22-D — F3.5 / F3.6 UI 마무리

### F3.5 — 로그인 사용자 보유 진령 source 통합
- Firestore `users.ownedJinryeong` 필드 추가 (admin 콘솔로 입력)
- /simulator page: 로그인 사용자의 보유 진령 fetch → recommendBuilds 호출
- 단위 테스트 5+

### F3.6 — /me 페이지 닉네임 변경 폼
- 신규 `components/feature/nickname-change-form.tsx`
  - 현재 닉네임 + 변경 입력 + 30일 cooldown 안내
  - submit → changeNickname Server Action 호출 + 토스트
- /me 페이지 통합
- 정책 문서 `docs/05-policy/nickname-change-policy.md`
- 단위 테스트 8+

---

## F22-E — CI 실 결과 분석

### Scope
1. Sprint 21 이후 staging push 의 e2e.yml 결과 수집
2. lighthouse.yml 의 첫 성공 run 결과 분석
3. visual-baseline workflow trigger (라벨 부착 시도)

### 보고서
- `reports/ci-e2e-analysis.md` (PASS/FAIL 매트릭스)
- `reports/lighthouse-analysis.md` (score 매트릭스)
- `reports/visual-baseline-status.md`

---

## Chrome QA (Sprint 21 패턴 확장)

QA phase 에서:
1. 익명 흐름 (Sprint 21 동일 4 페이지 재검증)
2. 인증 흐름 시도 — Google OAuth 자동화 가능한 범위만
3. Server Action 흐름 (좋아요 / 북마크 / 댓글 작성 — 가능하면)

---

## 작업 순서

1. F22-A (가장 큰 effort, 가장 큰 카운터)
2. F22-C (시너지 165, 독립)
3. F22-D (UI 마무리, F22-A 의 mocking 패턴 무관)
4. F22-B (RTL 패턴 재사용)
5. F22-E (CI 결과 — sprint 진행 중 백그라운드)
6. Iterate / QA (Chrome) / Report / Archive
