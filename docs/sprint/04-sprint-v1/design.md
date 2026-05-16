# Design — Sprint V1 통합 기술 설계

> **갓깨비 키우기 비공식 팬 가이드 — Sprint V1 기술 설계**
> **출처**: MASTER-PLAN.md + prd.md + plan.md
> **상세 분서**: phase-2-design/{firestore-schema-v1.md, moderation-policy.md, adsense-strategy.md, pretendard-subset.md}

---

## §1. 아키텍처 변경

Sprint v2 4-레이어 (ui / motion / domain / feature) 유지. V1 추가 도메인:

- `components/domain/post-card.tsx` / `post-meta.tsx` / `comment-thread.tsx` / `markdown-view.tsx` / `penalty-badge.tsx`
- `components/feature/post-form.tsx` / `comment-form.tsx` / `comment-item.tsx` / `like-button.tsx` / `post-report-dialog.tsx` / `login-success-tracker.tsx` / `admin-penalty-table.tsx` / `wiki-card-tracker.tsx`

**lib/ 신규 4 서브디렉토리**:
- `lib/post/{actions,markdown,image-upload}.ts`
- `lib/comment/actions.ts`
- `lib/reaction/actions.ts`
- `lib/penalty/actions.ts`
- `lib/moderation/dictionaries.ts` (기존 moderation/ 확장)

**도메인 일방향 유지**: domain 컴포넌트는 feature import 금지 (P5 v2 slot prop 패턴 계승).

---

## §2. 데이터 모델

상세: [phase-2-design/firestore-schema-v1.md](./phase-2-design/firestore-schema-v1.md)

### §2.1 신규 컬렉션 4 + 사전 컬렉션 1 = 17 총 (v2 12 + V1 5)

#### `posts/{postId}` (top-level)

```ts
interface PostDoc {
  id: string;
  authorUid: string;
  authorNickname: string;
  authorClassId?: 'warrior' | 'swordsman' | 'medium';
  category: 'build' | 'guide' | 'review';
  title: string;          // 4-60자
  body: string;           // 30-5000자, Markdown lite
  bodyExcerpt: string;    // 본문 첫 150자 (리스트용)
  tags: string[];         // 0-5개
  imageUrls: string[];    // 0-3개
  status: 'published' | 'pending_edit' | 'hidden_auto' | 'deleted';
  pendingEdit?: Partial<PostDoc>;  // 24h 후 수정 시 운영자 큐
  viewCount: number;
  likeCount: number;
  commentCount: number;
  reportedCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `posts/{postId}/comments/{commentId}`

```ts
interface CommentDoc {
  id: string;
  postId: string;
  authorUid: string;
  authorNickname: string;
  body: string;           // 1-500자
  parentCommentId: string | null;  // null=top-level, non-null=답글 (depth 2)
  likeCount: number;
  reportedCount: number;
  hidden: boolean;        // 자동 hidden (신고 5건 누적)
  keptByOperator: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `posts/{postId}/reactions/{uid}` + `comments/{commentId}/reactions/{uid}` (subcollection)

```ts
interface ReactionDoc {
  uid: string;
  type: 'like';
  createdAt: Timestamp;
}
```

#### `penalties/{penaltyId}`

```ts
interface PenaltyDoc {
  id: string;
  targetUid: string;
  level: 'warning' | 'ban_7d' | 'ban_permanent';
  reason: 'auto_threshold' | 'manual_admin';
  appliedBy: 'system' | string;  // string = adminUid
  appliedAt: Timestamp;
  expiresAt?: Timestamp;
  reportedCountAtTime: number;
  revokedBy?: string;
  revokedAt?: Timestamp;
}
```

#### `moderation_dictionaries/{dictId}`

```ts
interface ModerationDictDoc {
  id: string;
  category: 'badword' | 'spam_keyword' | 'whitelisted';
  pattern: string;        // 단어 또는 정규식 패턴
  isRegex: boolean;
  severity: 'mask' | 'block';
  active: boolean;
  createdBy: string;      // adminUid
  createdAt: Timestamp;
}
```

### §2.2 기존 컬렉션 확장

- `users`: `postCount` (number) + `bannedUntil` (Timestamp) + `consent.advertising` (boolean) 추가
- `moderation_logs`: action에 `auto_penalty_warning` / `auto_penalty_7d` / `auto_penalty_permanent` / `post_delete_by_admin` / `comment_delete_by_admin` 추가

### §2.3 신규 indexes (composite 5+건)

- `posts`: `(category asc, createdAt desc)` / `(category asc, likeCount desc)` / `(authorUid asc, createdAt desc)` / `(status asc, createdAt desc)`
- `comments`: collection-group index `(postId asc, createdAt asc)`
- `penalties`: `(targetUid asc, appliedAt desc)`

---

## §3. Server Actions (신규 6 + 모더레이션 확장)

### §3.1 lib/post/actions.ts

```ts
'use server';
import 'server-only';

export async function createPost(input: PostInput): Promise<PostResult>;
export async function updatePost(id: string, input: PostInput): Promise<PostResult>;
export async function deletePost(id: string): Promise<PostResult>;
export async function listPosts(filter: PostFilter, cursor?: string): Promise<PostListResult>;
export async function getPost(id: string, viewer?: { uid?: string }): Promise<PostDoc | null>;
```

검증:
- Zod schema (`lib/post/schema.ts`)
- 권한: `await auth()` + `session.user.registered === true` + `role !== 'banned'`
- 24h 수정 정책: `Date.now() - createdAt.toMillis() < 24*60*60_000`
- Markdown sanitize: `markdown.ts` → rehype-sanitize whitelist

### §3.2 lib/comment/actions.ts

```ts
export async function createComment(postId: string, input: CommentInput): Promise<CommentResult>;
export async function deleteComment(postId: string, commentId: string): Promise<CommentResult>;
export async function updateComment(postId: string, commentId: string, body: string): Promise<CommentResult>;  // 5min only
```

depth 2 강제: parentCommentId의 부모를 조회하여 `null`이 아니면 reject (`error: 'DEPTH_EXCEEDED'`).

### §3.3 lib/reaction/actions.ts

```ts
export async function toggleReaction(
  targetType: 'post' | 'comment',
  targetId: string,
  postId?: string  // comment의 경우 필수
): Promise<ReactionResult>;
```

본인 차단:
```ts
if (target.authorUid === uid) return { ok: false, error: 'SELF_REACTION' };
```

### §3.4 lib/penalty/actions.ts

```ts
export async function recordReport(targetType, targetUid): Promise<{ newTotal: number; penaltyApplied: PenaltyLevel | null }>;
export async function applyAutoPenalty(uid: string, reportedTotal: number): Promise<PenaltyLevel | null>;
export async function recoverFromPenalty(uid: string, reason: string): Promise<void>;  // admin only
```

자동 페널티 룰:
```ts
const PENALTY_THRESHOLDS = {
  warning: 5,
  ban_7d: 10,
  ban_permanent: 20,
} as const;

function determinePenalty(total: number): PenaltyLevel | null {
  if (total >= 20) return 'ban_permanent';
  if (total >= 10) return 'ban_7d';
  if (total >= 5) return 'warning';
  return null;
}
```

상세: [phase-2-design/moderation-policy.md](./phase-2-design/moderation-policy.md)

---

## §4. Markdown Lite Renderer

상세 화이트리스트:

```ts
// lib/post/markdown.ts
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

const schema = {
  ...defaultSchema,
  tagNames: ['h2', 'h3', 'p', 'strong', 'em', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'br', 'hr'],
  attributes: {
    a: ['href', 'rel', 'target'],
    img: ['src', 'alt'],
    code: ['className'],
  },
  protocols: { href: ['https'], src: ['https'] },
};

export async function renderMarkdown(body: string): Promise<string> {
  const file = await remark()
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(body);
  return String(file);
}
```

**보안 critical**: XSS 이중 방어:
1. Server-side sanitize (위)
2. 렌더 시 `<MarkdownView html={sanitized} />` — `dangerouslySetInnerHTML`이지만 사전 sanitize 보장

---

## §5. AdSense 통합

상세: [phase-2-design/adsense-strategy.md](./phase-2-design/adsense-strategy.md)

### §5.1 동의 게이트

- `users.consent.advertising` (boolean) — PIPA 5번째 동의 항목
- 미동의 시 AdSense 스크립트 미로드 (스크립트는 사용자 동의 후 lazy)

### §5.2 컴포넌트 구조

```tsx
// app/post/page.tsx (Server)
<>
  <PostList posts={posts.slice(0, 5)} />
  {advertisingConsent ? <AdSlotInfeed /> : null}
  <PostList posts={posts.slice(5)} />
</>

// app/layout.tsx — Sticky 하단
{advertisingConsent && !isAdmin ? <AdSlotSticky /> : null}
```

### §5.3 정책 가드

```ts
// components/feature/adsense-script.tsx
'use client';
export function AdSenseScript({ consent }: { consent: boolean }) {
  if (!consent) return null;
  if (process.env.NODE_ENV !== 'production') return null;
  return <Script src={`https://pagead2.googlesyndication.com/.../adsbygoogle.js?client=${publisher}`} />;
}
```

---

## §6. Pretendard Subset

상세: [phase-2-design/pretendard-subset.md](./phase-2-design/pretendard-subset.md)

운영자가 1회 빌드 후 `public/fonts/PretendardVariable.woff2` 교체. 코드 변경 없음 (파일명 유지).

검증: Lighthouse Mobile lab Performance 75 → 85+ 게이트.

---

## §7. GA4 추가 6 이벤트

기존 17 + V1 신규 6 = **23 이벤트**:

| 이벤트 | 트리거 |
|---|---|
| `post_create` | createPost 성공 |
| `post_view` | getPost 디바운스 후 |
| `post_like` | toggleReaction (post) ON |
| `comment_create` | createComment 성공 |
| `comment_like` | toggleReaction (comment) ON |
| `penalty_applied` | applyAutoPenalty 트리거 시 (system 발화 X — admin view 트래커) |

STUB 해제: `login` + `wiki_card_click` 활성화.

---

## §8. Firestore Rules 확장

신규 컬렉션 4 + 사전 컬렉션 1 rules:

```js
// posts
match /posts/{postId} {
  allow read: if true;  // 게시물은 공개
  allow create: if isRegisteredUnbanned()
    && request.resource.data.authorUid == request.auth.uid
    && request.resource.data.title.size() >= 4 && request.resource.data.title.size() <= 60
    && request.resource.data.body.size() >= 30 && request.resource.data.body.size() <= 5000;
  allow update: if isOwner(resource.data.authorUid) || isAdmin();
  allow delete: if isOwner(resource.data.authorUid) || isAdmin();

  match /comments/{commentId} {
    allow read: if true;
    allow create: if isRegisteredUnbanned()
      && request.resource.data.authorUid == request.auth.uid
      && request.resource.data.body.size() <= 500;
    allow update: if isOwner(resource.data.authorUid)
      && (request.time.toMillis() - resource.data.createdAt.toMillis() < 5 * 60 * 1000);
    allow delete: if isOwner(resource.data.authorUid) || isAdmin();

    match /reactions/{uid} {
      allow read: if isAuth();
      allow create, delete: if isRegisteredUnbanned() && request.auth.uid == uid;
    }
  }

  match /reactions/{uid} {
    allow read: if isAuth();
    allow create, delete: if isRegisteredUnbanned() && request.auth.uid == uid;
  }
}

// penalties
match /penalties/{penaltyId} {
  allow read: if isAdmin();
  allow create: if false;  // Server Action에서만 (admin SDK)
  allow update: if isAdmin();
  allow delete: if false;
}

// moderation_dictionaries
match /moderation_dictionaries/{dictId} {
  allow read: if isAuth();  // 마스킹 클라이언트 적용에 필요
  allow write: if isAdmin();
}
```

---

## §9. 운영자 콘솔 확장

- `/admin/penalties` 페이지 (신규): 자동 페널티 audit + 수동 우회 + recovery
- `/admin/dictionaries` 페이지 (신규): 금칙어/스팸 키워드 CRUD
- `/admin` 기존: 채팅 신고 + 정지 사용자 + 게시물/댓글 신고 통합

---

## §10. 결정

> Sprint V1 design.md 완료. **다음**: phase-2-design 4 문서 작성 (firestore-schema-v1 / moderation-policy / adsense-strategy / pretendard-subset).
