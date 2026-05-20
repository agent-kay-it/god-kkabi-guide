# Sprint 21 Design — 기술 구현 가이드

> Sprint 21 PRD + Plan 의 features 구현 표준.

**작성일**: 2026-05-20
**의존**: prd.md, plan.md

---

## 1. F21-A — lib/firebase + lib/wiki helper mocking

### 1.1 lib/firebase/claims-retry-queue.ts
- `setUserClaimsWithRetry(uid, claims)` 의 retry 로직 검증
- mocks: `firebase-admin/auth` (admin.auth().setCustomUserClaims)
- 시나리오: 1차 성공 / 1차 실패 후 retry queue / 영구 fail

### 1.2 lib/firebase/client-config.ts
- emulator 모드 + production 모드 분기
- mocks: firebase/app + firebase/auth + firebase/firestore

### 1.3 lib/wiki/*-adapter.ts (5 모듈)
- jinryeong / class / skill / equipment / munpa adapter
- 패턴: getFirestore() mock → 각 collection get() → 변환 함수 검증

### 1.4 lib/wiki/valid-ids-cache.ts
- 5분 cache + invalidation
- vi.useFakeTimers() 로 시간 조작

### 1.5 lib/observability/audit-log.ts (기존 test 보강)
- audit log 작성 시나리오 확장

---

## 2. F21-B — synergy 120+ 분포

### 2.1 165 중 73% (120) 분포 목표
```
warrior:   18 (Sprint 20 13 + 5)
swordsman: 20 (15 + 5)
medium:    23 (17 + 6)
balanced:  35 (Sprint 20 의 balanced 22 → +13)
미할당:    24 (12 + 12)
─────────────────
합계:     120
```

### 2.2 회귀 보호
- 기존 80 score 변경 X (8 sprint 연속 보호 패턴)
- 신규 40 조합 score 50-92 범위

### 2.3 미사용 조합 생성 절차
```typescript
// listAllSynergies() 의 comboId set 추출
// 165 - 80 = 85 미사용 후보에서 40 선택
// 직업 분포 보정 (warrior 18 등 정확히 맞춤)
```

---

## 3. F21-C — components/feature/ RTL 패턴

### 3.1 우선순위 컴포넌트 (10 신규)

| 컴포넌트 | 의존 mock |
|---|---|
| post-card.tsx | next/link (이미 mock), Date.toLocaleString |
| comment-thread.tsx | lib/reaction/actions + lib/comment/actions |
| chat-message.tsx | rtdb 데이터, next/image |
| chat-input.tsx | useTransition + Server Action |
| post-form.tsx | useForm + zodResolver + Server Action |
| comment-form.tsx | createComment Server Action |
| subscription-cancel-button | cancelSubscription Server Action |
| ad-slot-infeed.tsx | window.adsbygoogle |
| adsense-script.tsx | next/script |
| structured-data.tsx | next/head 또는 JSON-LD inline |

### 3.2 패턴 (Sprint 19/20 와 동일)
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
afterEach(() => cleanup());
```

---

## 4. F21-D — RecommendationCard 통합

### 4.1 컴포넌트 시그니처
```tsx
// components/feature/recommendation-card.tsx
'use client';

import type { RankedSynergy, RecommendationResult } from '@/lib/simulator/recommend';

export interface RecommendationCardProps {
  readonly result: RecommendationResult;
  readonly classId?: ClassId;
}

export function RecommendationCard({ result, classId }: RecommendationCardProps): React.JSX.Element;
```

### 4.2 표시 항목
- top-3 시너지 (rank + score + tier badge)
- matchesClass 시 "{classId} 적합" 배지
- 보유하지 않은 진령 (missingFromOwned) 표시
- hasEnoughJinryeong=false 시 "보유 진령 추가 후 더 정확한 추천 가능" 메시지

### 4.3 /simulator/page.tsx 통합
- Server Component 에서 `recommendBuilds()` 호출
- 보유 진령 source:
  - 로그인 사용자: Firestore users.ownedJinryeong (Sprint 22+ 의 새 필드)
  - 익명: 빈 배열 (top-3 global S tier 추천)
- session.user.classId 전달

### 4.4 단위 테스트 6+
- 빈 result / hasEnoughJinryeong=false / top-3 표시 / missing 표시 / matchesClass badge

---

## 5. F21-E — 닉네임 변경 정책

### 5.1 정책 (docs/05-policy/nickname-change-policy.md)
- **변경 빈도**: 30일 1회
- **validation**: 2-12자, `^[가-힣a-zA-Z0-9_]+$`
- **중복 검증**: Firestore users 컬렉션에서 nickname unique
- **이력**: `nickname_history` 컬렉션 (이전 닉네임 + 변경 시각)
- **금지어**: 운영자 차원 별도 필터 (Sprint 22+ carry)

### 5.2 Server Action 시그니처
```typescript
// lib/auth/change-nickname.ts
'use server';

export interface ChangeNicknameInput {
  readonly newNickname: string;
}

export type ChangeNicknameResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'ADMIN_NOT_CONFIGURED'
        | 'VALIDATION_FAILED'
        | 'COOLDOWN'
        | 'DUPLICATE'
        | 'INTERNAL';
      message?: string;
      cooldownRemainingMs?: number;
    };

export async function changeNickname(input: ChangeNicknameInput): Promise<ChangeNicknameResult>;
```

### 5.3 UI (/me 페이지)
- 현재 닉네임 표시 + 변경 폼 + 30일 cooldown 안내
- 폼 submit 시 changeNickname 호출 → 토스트
- 변경 후 session refresh (signIn() 또는 router.refresh())

### 5.4 단위 테스트 10+
- guard 4종 / validation 3종 / cooldown / duplicate / happy / nickname_history 기록

---

## 6. F21-F — CI 분석 절차

### 6.1 E2E
```bash
gh run list --workflow=e2e.yml --branch=staging --limit 3 --json conclusion,databaseId
gh run view <ID> --log | grep -E "PASS|FAIL|Error"
```
- pass/fail count 정리 (per project)
- 의미 있는 fail spec → root cause + carry

### 6.2 Lighthouse
```bash
gh run view <latest-lighthouse-success-ID> --log | grep -A 5 "report:"
```
- temporary-public-storage URL 에서 5 URLs × 3 runs 분석
- Performance / A11y / Best / SEO / LCP / FCP / CLS / TBT 표

### 6.3 Visual baseline
- F20-D 의 라벨 트리거 → 첫 capture PR 확인
- 75 snapshots commit 검증

### 6.4 산출물
- `reports/ci-e2e-analysis.md` (PASS/FAIL 매트릭스)
- `reports/lighthouse-analysis.md` (score 매트릭스)
- `reports/visual-baseline-status.md` (capture 상태)

---

## 7. Chrome QA — 7-Layer dataFlowIntegrity 세부 절차

### 7.1 사전 조건
1. `pnpm dev` (또는 `tene run -- pnpm dev`) 백그라운드 실행
2. localhost:3000 ready 대기
3. Firebase emulator 시작 (auth + firestore + storage + rtdb)
4. Chrome MCP tool load:
   ```
   ToolSearch select:mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__read_network_requests,mcp__claude-in-chrome__find,mcp__claude-in-chrome__form_input,mcp__claude-in-chrome__tabs_context_mcp
   ```

### 7.2 페이지별 검증 시나리오

#### `/` (홈)
- navigate
- HTTP 200 + console 0 error
- h1 / hero / main / footer 렌더링
- 진령/시뮬레이터 link 클릭 → navigate 확인

#### `/post` (게시판)
- navigate
- 게시물 list (server component) 표시
- 정렬 토글 (latest/popular/hot)
- 페이지네이션 cursor

#### `/post/{id}` (게시물 상세)
- navigate to seed post (e.g., `/post/e2e-seed-post-001`)
- 본문 + 댓글 트리 + 좋아요 button
- view count increment 확인 (network: revalidatePath)

#### `/simulator`
- navigate
- 진령 3개 토글 (chiwoo + hangah + hong_gildong)
- "시너지 보기" → result S tier 95
- "결과 기록" (로그인 필요) → 익명 흐름 확인
- "빌드로 저장" → /post/new prefill 검증
- F21-D 의 RecommendationCard 렌더링

#### `/me` (로그인 필요)
- 로그인 안 된 상태 → redirect /login 확인
- (로그인 자동화는 별도 — emulator 모드에서만 가능)

#### `/coupon`
- 검증된 쿠폰 list
- voteCoupon 클릭 (canVote=false 시 안내)

#### `/jinryeong`
- 진령 11 표시
- 각 진령 카드 클릭 → 상세 페이지

### 7.3 데이터 흐름 무결성 검증
각 페이지에서:
1. **L1 UI**: 표시되는 데이터 추출 (get_page_text)
2. **L2 Client**: console.log 또는 stored prop 추출 (read_console_messages with pattern)
3. **L3 API**: network requests 의 server endpoint 호출 (read_network_requests)
4. **L4 Validation**: Zod parse 통과 여부 (Server Action mocked validate)
5. **L5 DB**: Firestore emulator 의 실 read/write (별도 확인)
6. **L6 Response**: API 응답 데이터
7. **L7 UI ↔ Server**: 1번과 6번이 의미적으로 일치

### 7.4 결과 매트릭스
```
| Page         | L1 | L2 | L3 | L4 | L5 | L6 | L7 | Notes |
|--------------|----|----|----|----|----|----|----|-------|
| /            |  ✓ |  ✓ |  ✓ | n/a| n/a|  ✓ |  ✓ |       |
| /post        |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |       |
...
```

---

## 8. 공통 규칙

- typecheck / lint / vitest 0 fail
- file-based commit message (heredoc 회피)
- branch: `feature/sprint-21-{a~f}-{slug}`
- base: `staging`
- merge: squash --admin (CODEOWNERS bypass)
- Chrome MCP 사용 전 ToolSearch load 필수
- Chrome MCP 사용 후 tab close (다음 페이지로 이동 시 새 tab 또는 navigate 재사용)
