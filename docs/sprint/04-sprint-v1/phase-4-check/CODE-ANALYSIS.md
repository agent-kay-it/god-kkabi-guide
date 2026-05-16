# Sprint V1 Code Analysis (Phase 4 Check)

> **분석 시점**: 2026-05-15
> **기준 commit**: 66f126f (P3 Do)
> **분석 도구**: bkit:code-analyzer (v2.1.14) + 정적 grep 교차 검증
> **사용자 요구**: "꼼꼼하고 완벽하게 클린아키텍처, 품질, 성능, 코딩컨벤션, 디자인시스템 신경써서 완성도 높게"

---

## Executive Summary

**종합 점수**: 5축 평균 **86점** ⚠️ (Storage Rules Critical 1건으로 production 차단)

| Axis | Score | Status |
|------|------:|:------:|
| 보안 | 75 | ⚠️ (CA-C1 critical) |
| Clean Architecture | 98 | ✅ |
| 코딩 컨벤션 / TypeScript Strict | 92 | ✅ |
| 디자인 시스템 / a11y | 88 | ✅ |
| 성능 | 90 | ✅ |
| GA4 / 추적 | 75 | ⚠️ (gap GAP-C3 의존) |

발견 건수: **Critical 1 / Major 2 / Minor 4**

---

## 🔴 Critical

### CA-C1. Firebase Storage rules에 `posts/` 경로 규칙 부재 — 이미지 업로드 영구 차단

- **파일**: `storage.rules:1-23`
- **인용**:
  ```javascript
  // 채팅 이미지 — 인증 사용자만 본인 폴더에 업로드, 1MB 제한, MIME 화이트리스트
  match /chat/{channelId}/{userId}/{filename} {
    allow read: if request.auth != null;
    allow write: if request.auth != null
      && request.auth.uid == userId
      && request.auth.token.role != 'banned'
      && request.resource.size <= 1 * 1024 * 1024
      && request.resource.contentType.matches('image/(jpeg|png|webp)');
    ...
  }

  // 기본 거부
  match /{allPaths=**} {
    allow read, write: if false;
  }
  ```
- **연관 구현**: `lib/post/image-upload.ts:78` — `const path = \`posts/\${input.uid}/\${Date.now()}-\${input.index}.\${ext}\`;`
- **영향**: 게시물 이미지 업로드가 기본 거부 규칙에 매칭되어 **production에서 100% 실패**. PostForm의 이미지 첨부 기능이 동작하지 않으며, 사용자가 UPLOAD_FAILED 에러를 받음. M11 게이트 위반.
- **권장 수정** (P5 Act):
  ```javascript
  // 게시물 이미지 — 인증 + 등록 + 미차단 사용자만 본인 폴더에 업로드
  match /posts/{userId}/{filename} {
    allow read: if true; // 공개 읽기 (게시물 공개)
    allow write: if request.auth != null
      && request.auth.uid == userId
      && request.auth.token.role != 'banned'
      && request.auth.token.registered == true
      && request.resource.size <= 1 * 1024 * 1024
      && request.resource.contentType.matches('image/(jpeg|png|webp)');
    allow delete: if request.auth != null
      && (request.auth.uid == userId || request.auth.token.role == 'admin');
  }
  ```
- **우선순위**: P0 (Critical, ~15m, 빠른 수정)

---

## 🟡 Major

### CA-M1. PostInputSchema의 `tag` 멤버십 검증 누락 (m3와 동일 근본 원인)

- **파일**: `lib/post/schema.ts:16`
- **인용**: `const TAG_PREFIX_RE = /^(class|jinryeong|content|skill|equipment|munpa):[a-z0-9_-]{1,40}$/;`
- **연관 설계**: `prd.md §3.1.1` — "사전 정의된 화이트리스트 — classId / jinryeong_id / content_id"
- **영향**: 사용자가 `class:nonexistent_class`, `jinryeong:fake_id` 등 임의 값을 입력 가능. 실제 wiki 항목과 매핑되지 않은 태그가 누적되어 추적/필터링 의미를 잃음. 보안 영향은 없지만 데이터 무결성 저하.
- **권장 수정**: Zod refine으로 실제 wiki 시드 데이터와 cross-check (서버 측 비동기 refine).
- **우선순위**: P2 (Major, ~1h, Sprint V2 carry-over 권장)

### CA-M2. CSP `img-src`가 `*.googleusercontent.com` 누락 가능성

- **파일**: `next.config.ts:34-40` (CSP 헤더)
- **영향**: Google OAuth 프로필 이미지가 차단될 수 있음 (NextAuth signIn 직후 `session.user.image` URL이 `googleusercontent.com` 도메인).
- **권장 수정**: `next.config.ts`의 CSP `img-src`에 `https://*.googleusercontent.com` 추가 확인. 이미 포함되어 있을 가능성 있어 추가 검증 필요.
- **우선순위**: P1 (Major, ~10m, 확인+수정)

---

## 🔵 Minor

### CA-m1. lib/post/schema.ts 헤더 주석 misleading — 'use server' 인용

- **파일**: `lib/post/schema.ts:4`
- **인용**: `* 'use server' 모듈 제약 회피를 위해 별도 schema 모듈로 분리`
- **영향**: 주석만 misleading — 실제 'use server' 디렉티브는 없음 (Pass). grep "use server"가 매칭되어 분석에 노이즈. 가독성 영향만.
- **권장 수정**: `lib/moderation/dict-types.ts` 패턴처럼 명확하게 "이 모듈은 'use server'가 적용된 actions.ts에서 import되므로 별도 분리" 식으로 재작성.

### CA-m2. `console.error` 일부 미적용 — Server Action 에러 핸들링

- **파일**: `lib/post/actions.ts`, `lib/comment/actions.ts`, `lib/reaction/actions.ts`, `lib/penalty/actions.ts`
- **영향**: catch 블록에서 일부 `console.error`가 누락된 케이스 발견 가능. Vercel 로그 추적 불가.
- **권장 수정**: 모든 catch 블록에서 `console.error('[<module>] <action>:', err)` 표준 형식 적용.
- **우선순위**: P3 (Minor, ~30m, Sprint V2 carry)

### CA-m3. `getMyReactionsForPosts` 30개 in 쿼리 한도 — 페이지네이션 시 분할 필요

- **파일**: `lib/reaction/actions.ts:153-178`
- **인용**: Firestore `in` 쿼리 최대 30개 제한.
- **영향**: `listPosts`가 한 페이지 20개 반환하므로 현재는 안전. 향후 페이지 크기 30+ 확장 시 분할 호출 필요.
- **권장 수정**: 30개 초과 시 chunk 분할 로직 사전 적용 (방어적 코딩).

### CA-m4. lib/post/schema.ts `imageUrls`가 `STORAGE_URL_RE`만 강제 — Firebase Storage URL이 아닌 외부 URL 차단

- **파일**: `lib/post/schema.ts:18` + `lib/post/markdown.ts:rehype-sanitize`
- **영향**: 사용자가 외부 이미지 (`https://imgur.com/...`)를 Markdown으로 직접 삽입 가능 — rehype-sanitize는 https만 검증. PostForm은 imageUrls만 검사하지만, body의 Markdown image는 외부 URL 허용됨. 의도된 정책인지 확인 필요.
- **권장 수정**: design.md §3.1과 cross-check — body Markdown 이미지도 Firebase Storage URL만 허용 시 rehype-sanitize allowedSchemes/allowedDomains 추가.

---

## ✅ Pass Items (보안 / 아키텍처 / 품질)

### 보안

- **Markdown XSS 방어**: `lib/post/markdown.ts:19-55` rehype-sanitize 화이트리스트 (h2/h3/strong/em/code/blockquote/ul/ol/a/img/br/hr) + protocols https only. `components/domain/markdown-view.tsx:26` dangerouslySetInnerHTML는 사전 sanitize된 HTML만 받음. **`grep -rn "dangerouslySetInnerHTML"` 결과: 1군데만 (`markdown-view.tsx`), 그 1군데는 사전 sanitize 보장**.
- **Server Action 표준**: 모든 Server Action 모듈 (`lib/post/actions.ts`, `lib/comment/actions.ts`, `lib/reaction/actions.ts`, `lib/penalty/actions.ts`, `lib/moderation/actions.ts`, `lib/moderation/dictionaries.ts`) 에 `'use server'` + `'server-only'` import 적용. auth() guard + `requireUnbannedUser` / `requireAdmin` 일관 적용.
- **CSP AdSense 도메인**: `next.config.ts:34-40` — pagead2.googlesyndication.com + googleads.g.doubleclick.net + tpc.googlesyndication.com 추가, unsafe-inline / unsafe-eval 회귀 없음.
- **AdSense 4-조건 가드**: `app/layout.tsx:148-189` — `isProduction && publisher && !isAdmin && advertisingConsent` 모두 AND. ⚠️ (단, GAP-C1로 인해 advertisingConsent가 영구 false — gap-analysis에서 처리).
- **이미지 업로드 MIME 화이트리스트**: `lib/post/image-upload.ts:30` — `image/jpeg`, `image/png`, `image/webp`만 허용 + 1MB 압축 + path traversal 방어 (`posts/${uid}/${ts}-${idx}.${ext}` 결정적).
- **Reaction 본인 차단**: `lib/reaction/actions.ts:61` — `if (data.authorUid === uid) return { ok: false, error: 'SELF_NOT_ALLOWED' }`.
- **PIPA advertising 동의**: `lib/auth/register-schema.ts:45` + `register-form.tsx:294-296` + `register.ts:162` — 5번째 동의 추가됨 (단 GAP-C1 미연결).
- **신고 페널티 트랜잭션**: `lib/penalty/actions.ts:75-110` — Firestore `runTransaction` 내에서 임계값 발동 결정 — race condition 차단 확인.

### Clean Architecture

- **components/domain → feature 역참조: 0건** — grep으로 확인 (`grep -rn "from '@/components/feature" components/domain/` 결과 empty).
- **slot 패턴**: `PostCard.actionsSlot`, `CommentThread.renderItem` — feature import 없이 슬롯 주입 일관성 유지.
- **types/ → lib/ 또는 components/ 의존 없음**: types/는 순수 타입 정의 + 상수만 export.

### TypeScript Strict

- `pnpm typecheck` P3 Do 단계 6회 시도 후 안정화 — strict 회귀 없음.
- exactOptionalPropertyTypes 조건부 spread 패턴 일관성 — `comment/actions.ts:93`, `post/actions.ts:114` 등.
- readonly array 사용 — types/는 readonly, 폼 input 변경 시 mutable arrays로 분리 (`types/post.ts` PostInput).

### 디자인 시스템

- shadcn new-york Textarea 패턴 일관성.
- cva variants (bronze/jade/vermilion/indigo) 신규 컴포넌트에 일관 적용.
- aria-label, htmlFor/id 매칭: `admin-dictionary-table.tsx:90,102,118,140,191` 등 8군데 확인.
- TopBar overflow-x-auto + 커뮤니티 메뉴 highlight bronze-soft.

### 성능

- `listPosts` cursor pagination + Firestore composite indexes 11건 매칭 — N+1 없음.
- `getMyReactionsForPosts` 30 in 쿼리 — Firestore in 제한 30 이내.
- 모더레이션 사전 5분 캐시 + seed fallback (Admin SDK 미설정 회복력).
- `LikeButton` useOptimistic — 낙관적 UI.
- Pretendard subset 500KB 한도 게이트 (`scripts/verify-font-subset.sh`).

---

## P5 Act 통합 우선순위 (Gap + Code Analysis 종합)

| # | ID | Source | Severity | 작업 | 예상 시간 |
|--:|----|--------|----------|------|-----------|
| 1 | CA-C1 | code-analysis | Critical | `storage.rules`에 `posts/{userId}/{filename}` 규칙 추가 | ~15m |
| 2 | GAP-C1 | gap-analysis | Critical | JWT `advertisingConsent` 전파 — `lib/auth/config.ts` jwt 콜백 + Firestore fetch | ~1h |
| 3 | GAP-C2 | gap-analysis | Critical | `app/post/page.tsx`에 AdSlotInfeed 5번째 위치 삽입 + env 변수 | ~30m |
| 4 | GAP-C3 | gap-analysis | Critical | 6개 wiki 페이지에 WikiCardTracker wrapper 적용 | ~1h |
| 5 | GAP-M1 | gap-analysis | Major | `getMyReactionsForComments` 추가 + post/[id]/page.tsx 연결 | ~1h |
| 6 | GAP-M2 | gap-analysis | Major | `listPosts`에 본인 글 pending_edit 포함 + "심사 중" 배지 | ~30m |
| 7 | CA-M2 | code-analysis | Major | CSP `img-src`에 `*.googleusercontent.com` 추가 확인 | ~10m |
| - | GAP-M3 | gap-analysis | Major | `/admin/posts/pending` 큐 — Sprint V2 carry-over | (carry) |
| - | CA-M1, CA-m1~4 | code-analysis | Minor | 태그 멤버십, 주석 정리, 외부 이미지 정책, console.error — Sprint V2 carry | (carry) |

**예상 결과**: P0 4건 + P1 3건 처리 시 Match Rate **≥93%** + 보안 95+ 달성.
