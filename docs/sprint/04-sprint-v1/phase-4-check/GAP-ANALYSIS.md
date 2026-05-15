# Sprint V1 Gap Analysis (Phase 4 Check)

> **분석 시점**: 2026-05-15
> **기준 commit**: 66f126f (P3 Do)
> **분석 도구**: bkit:gap-detector (v2.1.14)
> **사용자 요구**: "꼼꼼하고 완벽하게 클린아키텍처, 품질, 성능, 코딩컨벤션, 디자인시스템 신경써서 완성도 높게"

---

## Overall Match Rate: **84.2%** ⚠️ (90% Quality Gate 미달 — P5 Act iterate 필수)

### Category Scores (v2.1.1 가중 공식)

| Axis | Score | Status | 가중치 |
|------|------:|:------:|------:|
| Structural Match | 98% | ✅ | 10% |
| Functional Depth | 82% | ⚠️ | 20% |
| API Contract | 90% | ✅ | 20% |
| Intent Match | 75% | ⚠️ | 25% |
| Behavioral Completeness | 88% | ✅ | 15% |
| UX Fidelity | 80% | ⚠️ | 10% |
| **Weighted Overall** | **84.2%** | ⚠️ | 100% |

Formula: `0.10×98 + 0.20×82 + 0.20×90 + 0.25×75 + 0.15×88 + 0.10×80`

---

## 🔴 Critical Findings (production 차단 / 설계 의도 파괴)

### C1. AdSense는 production에서 영구히 표시되지 않음 — `advertisingConsent`이 JWT로 전파되지 않음

- **Design**: `design.md §5.1` + `phase-2-design/adsense-strategy.md §3.1` — 4-condition AND gate, condition 4는 `session.user.advertisingConsent === true`
- **Implementation**:
  - `app/layout.tsx:153` — `const advertisingConsent = Boolean(session?.user?.advertisingConsent)` (읽기 정상)
  - `lib/auth/config.ts:135-155` jwt 콜백 — **`token.advertisingConsent`을 절대 쓰지 않음**
  - `lib/auth/config.ts:178-180` session 콜백 — `token.advertisingConsent`을 읽지만 값이 항상 undefined
  - `lib/auth/register.ts:162` — `consent.advertising`을 Firestore `users` 문서에 쓰지만 JWT로 다시 읽어들이는 경로가 없음
- **Impact**: `showAds = isProduction && publisher && !isAdmin && advertisingConsent` 식이 영구적으로 false → 전체 AdSense 파이프라인 (Sticky + script loader) 이 production에서 dead code. M11 게이트 실패.
- **Fix**: `jwt()` 콜백을 보강하여 Firestore `users/{uid}/consent.advertising`을 fetch (또는 registerUser 반환 경로에 포함), `token.advertisingConsent = ...` 할당. 사인인 시점에 register form의 `advertising` 필드도 매핑.
- **우선순위**: P0 (Critical, ~1h)

### C2. 인피드 AdSense 슬롯 컴포넌트는 존재하나 마운트되지 않음

- **Design**: `design.md §5.2` + `adsense-strategy.md §1` — "Sticky 하단 + **인피드 1건 (게시물 리스트 5번째)**"
- **Implementation**: `components/feature/ad-slot-infeed.tsx`는 완전히 구현됨. `app/post/page.tsx`는 `items.map(...)`을 렌더하지만 `AdSlotInfeed`에 대한 참조가 **0건**. Grep으로 본인 파일 + 설계 문서만 매칭됨.
- **Impact**: 설계된 monetization surface의 50%가 결손. C1이 해결되어도 Sticky만 표시됨.
- **Fix**: `app/post/page.tsx`의 `items.map` 4번/5번 항목 사이에 `<AdSlotInfeed publisher={...} slot={NEXT_PUBLIC_ADSENSE_SLOT_INFEED} />`을 동일 `showAds` 가드 뒤에 삽입.
- **우선순위**: P0 (Critical, ~30m)

### C3. `wiki_card_click` GA4 STUB이 활성화되지 않음 — `WikiCardTracker` 고아 컴포넌트

- **Design**: `design.md §7` + `plan.md §P3.A.2` + `MASTER-PLAN §1 item 2` — "GA4 STUB 2개 활성화: `login` + `wiki_card_click`"
- **Implementation**: `components/feature/wiki-card-tracker.tsx`는 완전히 구현됨 (Clean Arch wrapper 패턴 정확). `app/**/*.tsx` 전수 grep에서 **사용 0건** — `app/class/page.tsx`, `app/jinryeong/page.tsx`, `app/skill/page.tsx`, `app/equipment/page.tsx`, `app/content/page.tsx`, `app/munpa/page.tsx` 모두 `WikiCardTracker`를 import하거나 wrap하지 않음.
- **Impact**: P3.A가 주장한 2건 GA4 STUB 활성화 중 1건 미달성. Sprint V1 input #2 50%만 충족 (`login`만 `auth-buttons.tsx` redirect param + `LoginSuccessTracker`로 작동).
- **Fix**: 각 `app/class|jinryeong|skill|equipment|content|munpa/page.tsx`에서 렌더되는 `*-card.tsx`를 `<WikiCardTracker category="..." targetId={item.id}>...</WikiCardTracker>`로 래핑.
- **우선순위**: P0 (Critical, ~1h)

---

## 🟡 Major Findings

### M1. 댓글 "liked" 초기 상태 하드코딩 false

- **Design**: `design.md §3.3` + `prd.md §3.3` — 사용자별 reaction 상태 영속화
- **Implementation**: `app/post/[id]/page.tsx:130` — `liked={false /* V1 MVP — 댓글 좋아요 초기상태는 미적용 */}` (인지된 TODO)
- **Impact**: 로그인한 사용자가 이전에 좋아요한 댓글이 페이지 리로드 시 un-liked로 표시. 토글은 작동 (서버측 정확) 하지만 UX 초기 상태가 잘못됨. Intent/UX 갭 카운트.
- **Fix**: `getMyReactionsForComments(postId, commentIds)`를 `getMyReactionsForPosts` 대응으로 추가, `listComments` 출력에 와이어업.
- **우선순위**: P1 (Major, ~1h)

### M2. `pending_edit` 게시물이 public + 본인 리스트에서 사라짐

- **Design**: `design.md §2.1` — `status: 'pending_edit'`은 published와 hidden_auto 사이의 distinct visible state, `pendingEdit` 페이로드가 운영자 승인을 대기
- **Implementation**: `lib/post/actions.ts:333` `listPosts`가 `where('status', '==', 'published')`로 필터링. 24h 이후 수정하면 status가 `pending_edit`로 전환 → 게시물이 `/post`와 `/me/posts`에서 모두 사라짐. 본인도 자신의 pending 콘텐츠를 볼 수 없음.
- **Impact**: 사용자가 24h 이후 수정 제출 후 게시물이 피드백 없이 사라짐. Behavioral 갭.
- **Fix**: `listPosts`에서 `filter.authorUid`가 viewer와 일치하면 `status in ('published','pending_edit')` 허용. `/me/posts`에 "심사 중" 배지 추가.
- **우선순위**: P1 (Major, ~30m)

### M3. `pendingEdit` 페이로드를 승인할 admin UI가 없음

- **Design**: `prd.md §3.1.3` — "본인 수정 (24h 후): 운영자 승인 큐". `design.md §9`는 `/admin/penalties` + `/admin/dictionaries`만 나열, pendingEdit 큐 페이지는 없음.
- **Implementation**: `updatePost`는 `pendingEdit: {...}`를 올바르게 씀, 그러나 `/admin/posts/pending` 페이지나 approve/reject Server Action이 없음.
- **Impact**: pendingEdit 페이로드가 운영자 워크플로 없이 누적. 설계 완성도 갭 (엄밀히 P3 deliverable는 아니지만 F-1.3 "운영자 승인 큐"와 모순).
- **Fix**: `/admin/posts/pending/page.tsx` + `approvePendingEdit(postId)` / `rejectPendingEdit(postId)` Server Actions 추가.
- **우선순위**: P2 (Major, ~2h, Sprint V2로 carry-over 가능)

---

## 🔵 Minor Findings

### m1. `firestore.rules`가 `pending_edit` 게시물 업데이트 시 body 크기 재검증 안 함

- `firestore.rules:101` `allow update: if isOwner(...) || isAdmin()` — update 경로에서 길이 재체크 없음. Server Action은 Zod로 강제하지만, 클라이언트가 Admin SDK 키 유출 등을 통해 우회하면 방어 다층화 부족.
- **Severity**: Low (Server Action만이 진입 경로)

### m2. `posts` 인덱스가 `/me/posts` 표시에서 `status` 필터 때문에 본인 글 일부 미표시

- `listPosts` for `/me/posts`가 `where('status', '==', 'published')`를 추가 → 사용자가 자신의 pending/hidden 게시물을 못 봄. M2와 동일 근본 원인.

### m3. `tag` 화이트리스트 정규식이 너무 관대함

- `lib/post/schema.ts:16` — `^(class|jinryeong|content|skill|equipment|munpa):[a-z0-9_-]{1,40}$`이 prefix 뒤 모든 값을 매칭. `prd.md §3.1.1`은 "사전 정의된 화이트리스트 — classId / jinryeong_id / content_id"라고 명시. 구현은 형태만 강제, 멤버십 검증 안 함. 사용자가 `class:nonexistent`를 제출 가능.
- **Severity**: Low (외관 — 보안 영향 없음)

### m4. 댓글 소프트 삭제가 `body: '[삭제된 댓글]'` 로 데이터 변이

- `lib/comment/actions.ts:232`가 삭제 시 원본 body 덮어씀. `CommentDoc` 설계는 이를 명시하지 않음. 감사 등급 접근이라면 `bodyAtDelete` 스냅샷 보존이 정석. 현재 비가역.
- **Severity**: Low (UX 양호, 감사가 약간 약화)

### m5. Pretendard subset 자산 미검증

- `public/fonts/PretendardVariable.woff2`가 `app/layout.tsx:27`에서 참조됨. P3.A.1 운영자 게이트가 수동 `pyftsubset` 덮어쓰기 요구. `scripts/verify-font-subset.sh` 존재하지만 검증 미실행. 코드 범위 외.
- **Severity**: 문서화된 운영자 게이트, 코드 결함 아님

---

## ✅ Pass Items

| 항목 | 증거 |
|------|------|
| POST_LIMITS title 4-60, body 30-5000, tags 5, images 3 | `types/post.ts:125-131`, `firestore.rules:96-99`, `lib/post/schema.ts:21-39` 모두 일치 |
| COMMENT_LIMITS 1-500, edit 5min, autoHide 5 | `types/comment.ts:50-55`, `lib/comment/actions.ts:187`, `firestore.rules:108-110` 일치 |
| PENALTY_THRESHOLDS 5/10/20 단조 증가 | `types/penalty.ts:50-65`, `lib/penalty/actions.ts:65-95` 일치 |
| Depth-2 댓글 강제 | `lib/comment/actions.ts:117-122` — parent의 parentCommentId non-null이면 DEPTH_EXCEEDED |
| 본인 좋아요/신고 차단 | `lib/reaction/actions.ts:61`, `lib/post/actions.ts:482` |
| Markdown XSS 방어 | `lib/post/markdown.ts:19-55` — rehype-sanitize 화이트리스트 + protocols https only + dangerouslySetInnerHTML 사전 sanitize |
| Server Action 표준 | `'use server' + 'server-only' + await auth() + requireUnbannedUser/requireAdmin` — 8개 액션 파일 모두 |
| 17 컬렉션 Firestore rules + 18 composite indexes | `firestore.rules:89-157`, `firestore.indexes.json` 일치 |
| GA4 23 active events + 6 V1 신규 + login/wiki_card_click STUB 해제 (정의) | `types/ga4.ts:7-39`, params `:50-167` 일치 (단 wiki_card_click 사용처 누락 — C3) |
| PIPA 5번째 동의 추가 | `lib/auth/register-schema.ts:45`, `register-form.tsx:294-296`, `register.ts:162` (단 JWT 전파 누락 — C1) |
| AdSense CSP 도메인 화이트리스트 | `next.config.ts:34-40` — googlesyndication / doubleclick / tpc 포함 |
| Domain 컴포넌트 5건 slot 패턴 | `post-card.tsx` actionsSlot, `comment-thread.tsx` renderItem — feature import 없음 |
| `recordReport` 통합 트리거 | `lib/chat/report-action.ts:117`, `lib/post/actions.ts:548` 모두 호출 |
| 카카오 OAuth 게이트 문서 + Pretendard 게이트 + AdSense 게이트 | `phase-3-do/P3.A/P3.D/P3.E-OPERATOR-GATES.md` 3건 모두 존재 |
| TopBar `/post` 메뉴 추가 | `top-bar.tsx:27` |
| ads.txt 게시 | `public/ads.txt` 존재 |

---

## P5 Act 자동 수정 우선순위

| # | ID | Severity | 작업 | 예상 시간 |
|--:|----|----------|------|-----------|
| 1 | C1 | Critical | JWT advertisingConsent 전파 — `lib/auth/config.ts` jwt 콜백 + Firestore fetch | ~1h |
| 2 | C2 | Critical | `app/post/page.tsx`에 AdSlotInfeed 5번째 위치 삽입 + env 변수 | ~30m |
| 3 | C3 | Critical | 6개 wiki 페이지에 WikiCardTracker wrapper 적용 | ~1h |
| 4 | M1 | Major | `getMyReactionsForComments` 추가 + post/[id]/page.tsx 연결 | ~1h |
| 5 | M2 | Major | `listPosts`에 본인 글 pending_edit 포함 + `/me/posts`에 "심사 중" 배지 | ~30m |
| - | M3 | Major | `/admin/posts/pending` 큐 — Sprint V2로 carry-over 권장 | (carry) |

**예상 결과**: P0 3건 + P1 2건 처리 시 Match Rate **≥92%** 달성 (90% Quality Gate 통과).

---

## 핵심 파일 참조

- `lib/auth/config.ts:135-180` — C1 root cause
- `app/layout.tsx:147-189` — AdSense 가드 (read-only 측면은 정상)
- `app/post/page.tsx` — C2 patch site
- `components/feature/wiki-card-tracker.tsx` — C3 orphan
- `app/post/[id]/page.tsx:130` — M1 hardcode
- `lib/post/actions.ts:333-345` — M2 status filter
