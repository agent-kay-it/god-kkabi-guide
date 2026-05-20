# Sprint 22 Design — V3 GA 준비

> Sprint 22 PRD + Plan 의 구현 표준.

---

## 1. F22-A — lib/etl + insights + nlp mocking

### 1.1 lib/nlp/
pure function — Firestore 의존 X. 단위 테스트 100% 가능.

### 1.2 lib/etl/
Wiki seed converter. external API (Notion / Sheet) mock 필요.

### 1.3 lib/insights/
분석 helper. Firestore aggregation mock.

### 1.4 fallback 모듈
시간 부족 시 우선순위:
1. lib/nlp (가장 쉬움)
2. lib/post/markdown.ts 잔여 line
3. lib/post/og-parser.ts 잔여
4. lib/storage/ 잔여

→ 65% target 도달 시 stop.

---

## 2. F22-B — feature RTL 패턴

Sprint 19/20/21 동일 (jsdom + cleanup + vi.mock).

10+ 신규 후보 (plan.md §F22-B 참조).

---

## 3. F22-C — 시너지 165 전체

### 3.1 145 미사용 조합 추출
```typescript
// listAllSynergies() 의 comboId set 추출
// C(11,3) = 165 - 120 = 45 미사용 후보
```

### 3.2 신규 조합 작성
- score 50-65 범위 (대부분 미할당)
- description + note
- comboId alpha-sorted unique

### 3.3 회귀 보호
- 기존 120 score 변경 X (9 sprint 연속)
- 신규 회귀 테스트 1+ (전체 165 검증)

---

## 4. F22-D — F3.5/F3.6 UI 통합

### 4.1 F3.5 — Firestore users.ownedJinryeong source

```typescript
// /simulator/page.tsx
const session = await auth();
const owned: readonly WikiJinryeongId[] = session?.user?.id && hasAdminCredentials()
  ? await getUserOwnedJinryeong(session.user.id) // 신규 helper
  : [];
const recommendation = recommendBuilds({
  ownedJinryeong: owned,
  ...(session?.user?.classId ? { classId: session.user.classId } : {}),
});
```

### 4.2 신규 helper `lib/auth/user-owned.ts`
```typescript
export async function getUserOwnedJinryeong(uid: string): Promise<readonly WikiJinryeongId[]>;
```

### 4.3 F3.6 — NicknameChangeForm

```tsx
// components/feature/nickname-change-form.tsx
'use client';
export interface NicknameChangeFormProps {
  readonly currentNickname: string;
  readonly canChangeNow: boolean;
  readonly cooldownRemainingMs?: number;
}
```

useTransition + changeNickname Server Action.

### 4.4 /me 페이지 통합
새 섹션 "닉네임" — 현재 표시 + form.

---

## 5. F22-E — CI 결과 분석

### 5.1 e2e.yml 결과 수집
```bash
gh run list --workflow=e2e.yml --branch=staging --limit 5
gh run view <id> --log-failed
```

### 5.2 lighthouse.yml 결과
- temporary-public-storage URL 추출
- 5 URLs × 3 runs × 8 메트릭 매트릭스

### 5.3 visual-baseline workflow
- PR 에 `visual-baseline` 라벨 부착 → 자동 capture
- 첫 75 snapshots commit 검증

---

## 6. Chrome QA Authenticated 시도

### 6.1 한계
Google OAuth 자동화는 GCP 인증 흐름 + reCAPTCHA 로 자동화 어려움.

### 6.2 대안
- emulator 모드 + E2E auth bypass (NEXT_PUBLIC_E2E_MODE) — 로컬 dev server 필요
- 또는: 익명 흐름 강화 (스킬/이벤트/콘텐츠 페이지 추가 검증)

### 6.3 권장
- staging 의 익명 흐름 5+ 페이지 검증 (Sprint 21 의 4 → +1)
- Authenticated 는 Sprint 23 (V3) 에서 정식 dev server + emulator 통합으로 진행

---

## 7. V3 GA Readiness 평가 보고서

### 7.1 체크리스트 (PRD §6)
10 항목 × 가중치 합 100%.

### 7.2 평가
- 80%+ → V3 GA 진입 결정
- 70-80% → Sprint 23 추가 폴리시 후 진입
- <70% → 잔여 항목 Sprint 23 carry + V3 진입 보류

### 7.3 산출물
`docs/sprint/22-sprint-v3-ga-prep/reports/v3-ga-readiness.md`

---

## 8. 공통 규칙

- typecheck / lint / vitest 0 fail
- file-based commit message
- branch: `feature/sprint-22-{a~e}-{slug}`
- merge: squash --admin
- 회귀 보호 9 sprint 연속 유지
