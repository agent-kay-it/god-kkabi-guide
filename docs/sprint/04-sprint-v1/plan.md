# Plan — Sprint V1

> **출처**: MASTER-PLAN.md + prd.md
> **P3 Do sub-phase 분해 (P3.A~E) + 산출물 명세**

---

## P3.A — Pretendard subset + GA4 STUB + types (4-6시간)

### A.1 Pretendard subset 가이드 + 적용

- 운영자 게이트 문서: `docs/sprint/04-sprint-v1/phase-3-do/P3.A-OPERATOR-GATES.md`
  - pyftsubset 설치 + 실행 명령 + 검증 (브라우저 콘솔)
- `public/fonts/PretendardVariable.woff2` 덮어쓰기 (운영자 작업)
- `app/layout.tsx`: `localFont` src 변경 없음 (파일명 유지)
- 검증: 빌드 후 woff2 크기 ≤ 500KB 자동 체크 스크립트

### A.2 GA4 STUB 활성화

- 신규: `components/feature/login-success-tracker.tsx` (use client)
  - useSearchParams로 `?login=success` 감지 → `logEvent('login', { method })` 1회 발화
  - app/page.tsx 또는 app/layout.tsx에 mount
- 변경: `lib/auth/config.ts` signIn callback → redirect URL에 `?login=success&method=google|kakao` 부착
- 위키 카드: `components/domain/*-card.tsx`에 `onClick` prop 추가 (선택적)
- consumer: `app/{class,jinryeong,skill,equipment,content,munpa}/page.tsx`에 wiki_card_click 트래커 주입 (Server Component → Client Component 명확 분리)

### A.3 types/post + comment + reaction + penalty

- `types/post.ts`: PostDoc / PostCategory / PostStatus / PostInput / PostListItem / PostFilter / PostSort
- `types/comment.ts`: CommentDoc / CommentInput
- `types/reaction.ts`: ReactionType / ReactionDoc
- `types/penalty.ts`: PenaltyLevel / PenaltyDoc + 페널티 정책 상수
- types/ga4.ts 확장: post_create / post_like / comment_create / comment_like / post_view / post_report

---

## P3.B — Server Actions + 페널티 자동화 + 모더레이션 사전 외부화 (8-10시간)

### B.1 lib/post/

- `actions.ts`:
  - `createPost(input)`: Zod 검증 + Markdown sanitize + 트랜잭션 (posts.add + users.postCount++ + GA4)
  - `updatePost(id, input)`: 24h 이내 본인 수정 / 이후 운영자 큐 (pendingEdit field)
  - `deletePost(id)`: 본인 또는 admin + audit
  - `listPosts(filter)`: cursor pagination + filter (category/class/sort)
  - `getPost(id)`: viewCount 디바운스 (Firestore + IP+date hash)
- `markdown.ts`: rehype-sanitize 화이트리스트 (h2/h3/strong/em/code/blockquote/ul/ol/a/img) — XSS 방어
- `image-upload.ts`: chat과 동일 패턴 (1MB 압축 + Storage path posts/{postId}/{uid}/{idx}.ext)

### B.2 lib/comment/

- `actions.ts`:
  - `createComment(postId, input)`: depth 2 강제 + 500자 + denormalize commentCount
  - `updateComment(id, input)`: 5분 내 본인만
  - `deleteComment(id)`: 본인 또는 admin
  - `listComments(postId)`: 부모-자식 정렬

### B.3 lib/reaction/

- `actions.ts`:
  - `toggleReaction(targetType, targetId)`: idempotent (uid deterministic) + 본인 차단 + denormalize likeCount
  - `getMyReactions(targetIds)`: 초기 표시용

### B.4 lib/penalty/

- `actions.ts`:
  - `recordReport(targetType, targetUid)`: reportedTotal++ + 페널티 트리거 check
  - `applyAutoPenalty(uid, reportedTotal)`: 5/10/20 임계값 기반 자동 처리 + audit
  - `recoverFromPenalty(uid, reason)`: admin이 신고 false positive 결정 시 reportedTotal--

### B.5 lib/moderation/ 확장

- `dictionaries.ts`: Firestore `moderation_dictionaries` CRUD
- 기존 `lib/chat/masking.ts`: Firestore 사전 + seed fallback 패턴 (wiki adapter와 동일)

---

## P3.C — UI 페이지 + 컴포넌트 (10-12시간)

### C.1 페이지 5건

| 페이지 | Server/Client | 역할 |
|---|---|---|
| `app/post/page.tsx` | Server | 게시물 리스트 (카테고리 탭 + 정렬 + 페이지네이션 + 인피드 광고) |
| `app/post/[id]/page.tsx` | Server | 게시물 상세 + 댓글 + 좋아요 + 신고 (Sticky 광고) |
| `app/post/new/page.tsx` | Client (auth required) | 게시물 작성 폼 (Markdown lite + 이미지 첨부) |
| `app/me/posts/page.tsx` | Server | 본인 작성 게시물 목록 + 수정/삭제 |
| `app/admin/penalties/page.tsx` | Server (admin) | 자동 페널티 audit + 수동 우회 |

### C.2 도메인 컴포넌트 (5건)

- `components/domain/post-card.tsx` — 게시물 카드 (리스트용)
- `components/domain/post-meta.tsx` — 카테고리/작성자/시간/뷰/좋아요/댓글 메타
- `components/domain/comment-thread.tsx` — 2-depth 댓글 트리
- `components/domain/markdown-view.tsx` — sanitize 마크다운 렌더
- `components/domain/penalty-badge.tsx` — 페널티 단계 (warning / banned 7d / banned permanent)

### C.3 feature 컴포넌트 (8건)

- `components/feature/post-form.tsx` — react-hook-form + zod + 마크다운 입력 + 이미지 첨부 (3개)
- `components/feature/comment-form.tsx` — 500자 입력 + 답글 모드
- `components/feature/comment-item.tsx` — 댓글 1건 + 좋아요/신고/수정
- `components/feature/like-button.tsx` — Optimistic UI (북마크 버튼과 패턴 동일)
- `components/feature/post-report-dialog.tsx` — 게시물/댓글 신고 다이얼로그
- `components/feature/login-success-tracker.tsx` — GA4 login 발화
- `components/feature/admin-penalty-table.tsx` — 페널티 큐 + 수동 우회
- `components/feature/wiki-card-tracker.tsx` — wiki_card_click 발화 wrapper

### C.4 TopBar nav 확장

- "커뮤니티" 메뉴 추가 (`/post`) — 7 → 8 메뉴 또는 햄버거 변환 검토 (mobile)

---

## P3.D — AdSense 통합 (3-4시간)

### D.1 PIPA 동의 5번째 항목

- `lib/auth/register-schema.ts`: `advertising` 필드 추가
- `components/feature/register-form.tsx`: ConsentCheckbox 5번째 추가
- 기존 사용자 migration: `/me/consent` 페이지에서 advertising 동의 추가 입력 (선택)

### D.2 AdSense 컴포넌트

- `components/feature/adsense-script.tsx`: ads.google.com 스크립트 lazy load + 사용자 동의 체크
- `components/feature/ad-slot-sticky.tsx`: 하단 고정 320x50 (mobile) / 728x90 (desktop)
- `components/feature/ad-slot-infeed.tsx`: 게시물 리스트 5번째 슬롯

### D.3 운영자 게이트 문서

- `phase-3-do/P3.D-OPERATOR-GATES.md`:
  - AdSense 가입 단계
  - ads.txt 게시
  - 광고 단위 ID (publisher + slot) 발급 후 Vercel env 추가 (`NEXT_PUBLIC_ADSENSE_PUBLISHER` + `NEXT_PUBLIC_ADSENSE_SLOT_STICKY` + `NEXT_PUBLIC_ADSENSE_SLOT_INFEED`)

---

## P3.E — 카카오 OAuth 본격 게이트 (2시간)

- `phase-3-do/P3.E-OPERATOR-GATES.md`:
  - Kakao Developers 비즈니스 앱 전환 단계
  - 사업자 정보 입력
  - 동의 항목 변경 (이메일 + 닉네임 필수)
  - Vercel env 업데이트 (KAKAO_REST_API_KEY가 새 값으로 변경)
  - 검증: Chrome MCP로 Kakao 로그인 → 등록 → /me 진입 확인

---

## P4-P8 — Check/Act/QA/Report/Archive

기존 Sprint v2 패턴 동일 — Gap analysis + Code analysis + Lighthouse Mobile real-world (Pretendard subset 효과) + WCAG + E2E 5 신규 시나리오 (S6 게시물 작성, S7 댓글, S8 좋아요, S9 페널티 자동, S10 AdSense 광고 동의) + GA4 신규 6 이벤트 + 7-Layer.

---

## 결정

> Plan 문서 완료. **다음**: P2 Design (firestore-schema-v1 + moderation-policy + adsense-strategy + pretendard-subset 4 문서).
