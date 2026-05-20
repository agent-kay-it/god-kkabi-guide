# Sprint 20 Design — 기술 구현 가이드

> Sprint 20 PRD + Plan 의 feature 구현 표준.

**작성일**: 2026-05-20
**의존**: prd.md, plan.md

---

## 1. F20-A — Server Actions mocking 확장

### 1.1 재사용 패턴 (Sprint 19 helper)
```typescript
import { vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { increment: vi.fn(...), serverTimestamp: vi.fn(...) },
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));

// per-test:
beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});
```

### 1.2 모듈별 테스트 시나리오

#### lib/post/actions.ts
- createPost / updatePost / deletePost / listPosts / getPost
- 인증 가드 (UNAUTHENTICATED / NOT_REGISTERED / BANNED / FORBIDDEN)
- validation (PostInputSchema Zod)
- 이미지 첨부 (imageUrls)
- 작성 24h 내 수정 정책
- soft delete (deletedByOperator)
- admin moderation
- 페이지네이션
- 검색 (Sprint 17 site search 통합)

추정 30+ tests.

#### lib/subscription/actions.ts
- subscribe / unsubscribe / handleWebhook (Toss payment)
- toss-client mock (HTTP 호출 차단)
- 멤버십 상태 전이

추정 20+ tests.

#### lib/b2b/actions.ts
- B2B 광고 신청 / 승인 / 거절
- admin 권한 검증

추정 15+ tests.

#### lib/moderation/actions.ts
- ban / unban / warning / hide / restore
- audit log 자동 기록

추정 20+ tests.

### 1.3 격리 / 회귀 보호
- 각 모듈별 별도 파일 (`*.test.ts`)
- 기존 Sprint 19 의 5 Server Actions 100% 커버리지 유지

---

## 2. F20-B — CI E2E 실 결과 분석 패턴

### 2.1 첫 staging push 의 e2e.yml 결과 확인
```bash
gh run list --workflow=e2e.yml --branch=staging --limit 3 --json conclusion,databaseId,createdAt
```

### 2.2 fail 시 분석 절차
1. `gh run view <ID> --log-failed | head -200`
2. fail spec 분류:
   - flaky (retry 후 pass) → 무시
   - structural (모든 retry fail) → root cause 분석
3. root cause 패턴:
   - Firebase emulator 시작 race → wait 시간 증가
   - selector 의 OS/font dependent → screenshot threshold 완화
   - localhost timeout → polling 시간 증가

### 2.3 iterate 정책
- 1 spec 별 max 3 시도
- 3회 후 명시 carry (Sprint 21)

---

## 3. F20-C — Lighthouse 분석 표준

### 3.1 결과 다운로드
```bash
gh run view <ID> --log | grep "report:" | head -5
```

### 3.2 분석 차원
| URL | Performance | A11y | Best | SEO | LCP | FCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| / | ? | ? | ? | ? | ? | ? | ? | ? |
| /post | ? | ? | ? | ? | ? | ? | ? | ? |
| /chat | ? | ? | ? | ? | ? | ? | ? | ? |
| /me | ? | ? | ? | ? | ? | ? | ? | ? |
| /search | ? | ? | ? | ? | ? | ? | ? | ? |

### 3.3 즉시 개선 가능 항목
- 이미지 최적화 (next/image priority)
- 폰트 swap (next/font display)
- TBT > 300ms 시 dynamic import
- accessibility error (label/aria) → 즉시 fix

### 3.4 분석 보고서 위치
`docs/sprint/20-sprint-coverage-master-v2/reports/lighthouse-analysis.md`

---

## 4. F20-D — Visual baseline 75 snapshot

### 4.1 절차
1. 임의 PR 에 `visual-baseline` label 부착 (gh CLI)
2. workflow 자동 실행 → snapshot 75개 생성
3. workflow 가 자동 PR 생성 (`chore(visual): rebaseline — Auto baseline capture`)
4. PR review + merge (admin bypass 가능)

### 4.2 review checklist
- 25 paths × 3 projects = 75 PNG 모두 생성 확인
- 각 페이지의 시각 차이 = 의도된 디자인
- chromium-desktop (1440×900) / chromium-mobile (Pixel 7) / webkit-mobile (iPhone 14) 일관

### 4.3 첫 baseline 의 특수성
- 모든 snapshot 이 "신규" 로 표시됨 (diff X)
- 향후 PR 에서는 본 baseline 기준으로 1% threshold 비교
- 의도된 UI 변경 시 다시 label 트리거

---

## 5. F20-E — 시너지 80+ 분포 목표

### 5.1 현재 (51)
```
warrior:    8
swordsman: 10
medium:    12
balanced:  15
미할당:     6
─────────────────
합계:      51
```

### 5.2 목표 (80+)
```
warrior:   13 (+5)
swordsman: 15 (+5)
medium:    17 (+5)
balanced:  23 (+8)
미할당:    12 (+6)
─────────────────
합계:      80
```

### 5.3 작성 원칙
- 기존 51 score 변경 X
- 신규 29 조합의 score 50-92 범위
- comboId 중복 없음 (alpha-sorted unique 검증)
- description + note (S tier)

---

## 6. F20-F — components/feature/ RTL 패턴

### 6.1 우선순위 컴포넌트
| 컴포넌트 | 이유 |
|---|---|
| `components/feature/post-card.tsx` | 메인 list 핵심 |
| `components/feature/chat-bubble.tsx` | 채팅 시각화 |
| `components/feature/post-form.tsx` | 글 작성 메인 |
| `components/feature/comment-form.tsx` | 댓글 입력 |
| `components/feature/comment-thread.tsx` | 댓글 트리 |
| `components/feature/back-to-top.tsx` | 이미 hook test 있음, 컴포넌트 RTL |
| `components/feature/like-button.tsx` | 인터랙션 (server action mock) |
| `components/feature/bookmark-button.tsx` | 동일 |

### 6.2 mock 패턴 (Server Action 사용 컴포넌트)
```tsx
vi.mock('@/lib/reaction/actions', () => ({
  toggleReaction: vi.fn(() => Promise.resolve({ ok: true, isLiked: true, likeCount: 1 })),
}));
```

### 6.3 5+ 신규 파일 (Sprint 19 F19-F 패턴)

---

## 7. F20-G — F3.4 cron worker

### 7.1 workflow 구조
```yaml
name: Coupon Auto Validation
on:
  schedule:
    - cron: '0 */6 * * *'  # 6시간 마다
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'dry-run (실 mutation 없이 결정만)'
        default: 'false'

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - Checkout
      - Setup pnpm + Node
      - Install deps
      - Run: scripts/run-coupon-auto-validate.mjs
        env:
          FIREBASE_ADMIN_PROJECT_ID: ...
          FIREBASE_ADMIN_CLIENT_EMAIL: ...
          FIREBASE_ADMIN_PRIVATE_KEY: ...
```

### 7.2 CLI 스크립트 (`scripts/run-coupon-auto-validate.mjs`)
```javascript
import admin from 'firebase-admin';
import { decideCouponValidation, decisionToCouponUpdate } from '../lib/coupon/auto-validate.js';

// admin SDK init from env
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

// pending 쿠폰 fetch + batch decision + update
const db = admin.firestore();
const pending = await db.collection('coupons').where('status', '==', 'pending').limit(200).get();
// ... (lib/coupon/actions.ts 의 runCouponAutoValidation 패턴 직접 구현)

if (process.argv.includes('--dry-run')) {
  console.log({ scanned, autoEnabled, autoDisabled, noop });
  process.exit(0);
}
```

### 7.3 검증
- workflow_dispatch dry-run: 실 Firestore 없이 동작 확인
- schedule (6h): 첫 실행 결과 log 확인

---

## 8. F20-H — F3.5 진령 추천 알고리즘

### 8.1 함수 시그니처
```typescript
// lib/simulator/recommend.ts
export interface RecommendationInput {
  readonly ownedJinryeong: readonly WikiJinryeongId[];
  readonly classId?: ClassId;
}

export interface RankedSynergy {
  readonly synergy: JinryeongSynergyDef;
  readonly rank: number; // 1, 2, 3
  readonly missingFromOwned: readonly WikiJinryeongId[]; // 보유하지 않은 진령
}

export interface RecommendationResult {
  readonly synergies: readonly RankedSynergy[];
  readonly hasEnoughJinryeong: boolean; // 보유 진령 3개+ 여부
}

export function recommendBuilds(input: RecommendationInput): RecommendationResult;
```

### 8.2 알고리즘
1. 보유 진령 < 3 → 전체 S tier 시너지에서 top 3 추천 (모두 missing)
2. 보유 진령 ≥ 3:
   - 보유한 진령 중 C(n,3) 조합 생성
   - 각 조합의 getSynergy() 호출
   - score desc 정렬, classId 필터 (optional, soft — 동률 시 우선)
   - top 3 반환
3. missingFromOwned: 시너지의 jinryeongIds 중 ownedJinryeong 에 없는 것

### 8.3 단위 테스트 시나리오 (15+)
- ownedJinryeong 0개 → top 3 S tier
- ownedJinryeong 2개 → top 3 S tier + missing 명시
- ownedJinryeong 3개 (정확히) → C(3,3)=1 조합 반환
- ownedJinryeong 6개 → C(6,3)=20 조합 → top 3
- classId 필터 적용 시 우선 정렬
- 빈 input 처리
- 중복 진령 ID 처리 (set 변환)

---

## 9. 공통 규칙

- typecheck / lint 0 errors
- vitest 전체 pass
- file-based commit message (heredoc 회피)
- branch: `feature/sprint-20-{a~h}-{slug}`
- title: `feat(F20-X): {description}`
- base: `staging`
- merge: squash (admin bypass 가능, CODEOWNERS 승인 시 정상 머지)
