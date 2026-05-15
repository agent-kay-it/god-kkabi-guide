# Firestore Schema V1 Extension

> **Sprint V1** — 신규 4 + 사전 1 = 17 컬렉션 (v2 12 + V1 5)
> **출처**: design.md §2

---

## 1. 신규 컬렉션 5

### 1.1 `posts/{postId}` — top-level

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | ✓ | doc.id |
| authorUid | string | ✓ | NextAuth uid |
| authorNickname | string | ✓ | denormalized |
| authorClassId | 'warrior' \| 'swordsman' \| 'medium' | — | denormalized |
| category | 'build' \| 'guide' \| 'review' | ✓ | |
| title | string | ✓ | 4-60자 |
| body | string | ✓ | 30-5000자, Markdown lite |
| bodyExcerpt | string | ✓ | 첫 150자 (리스트용) |
| tags | string[] | ✓ | 0-5개 |
| imageUrls | string[] | ✓ | 0-3개, Firebase Storage 화이트리스트 |
| status | 'published' \| 'pending_edit' \| 'hidden_auto' \| 'deleted' | ✓ | 기본 'published' |
| pendingEdit | Partial<PostDoc> | — | 24h 후 수정 시 운영자 큐 |
| viewCount | number | ✓ | 기본 0, 디바운스 |
| likeCount | number | ✓ | denormalize |
| commentCount | number | ✓ | denormalize |
| reportedCount | number | ✓ | denormalize, 5 누적 hidden_auto |
| createdAt | Timestamp | ✓ | serverTimestamp |
| updatedAt | Timestamp | ✓ | serverTimestamp |

Indexes:
- `(category asc, createdAt desc)` — 카테고리 리스트
- `(category asc, likeCount desc)` — 인기 정렬
- `(authorUid asc, createdAt desc)` — 본인 글 목록
- `(status asc, createdAt desc)` — 모더레이션 큐
- `(tags array-contains, createdAt desc)` — 태그 필터

### 1.2 `posts/{postId}/comments/{commentId}` — subcollection

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | ✓ | doc.id |
| postId | string | ✓ | parent post id |
| authorUid | string | ✓ | |
| authorNickname | string | ✓ | |
| body | string | ✓ | 1-500자 |
| parentCommentId | string \| null | ✓ | null = top-level / non-null = depth-2 답글 |
| likeCount | number | ✓ | denormalize |
| reportedCount | number | ✓ | denormalize, 5 누적 hidden |
| hidden | boolean | ✓ | 자동 hidden |
| keptByOperator | boolean | ✓ | 운영자 우회 |
| createdAt | Timestamp | ✓ | |
| updatedAt | Timestamp | ✓ | |

Collection-group index:
- `(postId asc, createdAt asc)` — 게시물 상세 페이지

### 1.3 `posts/{postId}/reactions/{uid}` + `comments/{commentId}/reactions/{uid}`

| Field | Type | Required | Note |
|---|---|---|---|
| uid | string | ✓ | doc.id = uid (deterministic) |
| type | 'like' | ✓ | future: 다른 reactions 추가 가능 |
| createdAt | Timestamp | ✓ | |

### 1.4 `penalties/{penaltyId}`

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | ✓ | doc.id |
| targetUid | string | ✓ | 페널티 대상 |
| level | 'warning' \| 'ban_7d' \| 'ban_permanent' | ✓ | |
| reason | 'auto_threshold' \| 'manual_admin' | ✓ | |
| appliedBy | 'system' \| string | ✓ | string = adminUid |
| appliedAt | Timestamp | ✓ | |
| expiresAt | Timestamp | — | ban_7d만 필수 |
| reportedCountAtTime | number | ✓ | 발동 시점 snapshot |
| revokedBy | string | — | adminUid (recovery 시) |
| revokedAt | Timestamp | — | |

Index:
- `(targetUid asc, appliedAt desc)` — 사용자 페널티 이력

### 1.5 `moderation_dictionaries/{dictId}`

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | ✓ | |
| category | 'badword' \| 'spam_keyword' \| 'whitelisted' | ✓ | |
| pattern | string | ✓ | 단어 또는 정규식 |
| isRegex | boolean | ✓ | true = pattern을 RegExp로 컴파일 |
| severity | 'mask' \| 'block' | ✓ | mask=마스킹 / block=메시지 전체 거부 |
| active | boolean | ✓ | false 시 적용 안 함 |
| createdBy | string | ✓ | adminUid |
| createdAt | Timestamp | ✓ | |

Index:
- `(category asc, active asc)` — 클라이언트 다운로드용

---

## 2. 기존 컬렉션 확장

### 2.1 `users` 추가 field

| Field | Type | Default |
|---|---|---|
| postCount | number | 0 |
| bannedUntil | Timestamp | — |
| consent.advertising | boolean | false |
| reportedTotal | number | 0 (v2 기존) — 페널티 트리거 |

### 2.2 `moderation_logs` action 확장

추가 action:
- `auto_penalty_warning`
- `auto_penalty_7d`
- `auto_penalty_permanent`
- `post_delete_by_admin`
- `comment_delete_by_admin`
- `penalty_revoked`

---

## 3. 보안 규칙 (firestore.rules 확장)

### Helper 추가

```js
function isRegisteredUnbanned() {
  return isAuth()
    && request.auth.token.registered == true
    && request.auth.token.role != 'banned';
}

function isOwner(uid) {
  return isAuth() && request.auth.uid == uid;
}
```

### posts + comments + reactions

(design.md §8 참조)

### penalties — Server Action 전용

```js
match /penalties/{penaltyId} {
  allow read: if isAdmin();
  allow create: if false;  // Admin SDK only
  allow update: if isAdmin();
  allow delete: if false;
}
```

### moderation_dictionaries

```js
match /moderation_dictionaries/{dictId} {
  allow read: if isAuth();  // 클라이언트 마스킹용
  allow write: if isAdmin();
}
```

---

## 4. denormalize 패턴 일관성

- `users.postCount` ← createPost / deletePost 트랜잭션
- `users.reportedTotal` ← report 시 increment
- `users.bookmarkCount` ← v2 P5에서 이미 도입
- `posts.likeCount` ← toggleReaction (post) 트랜잭션
- `posts.commentCount` ← createComment / deleteComment 트랜잭션
- `posts.reportedCount` ← report 시 increment (5 누적 hidden_auto)
- `comments.likeCount` ← toggleReaction (comment)
- `comments.reportedCount` ← (5 누적 hidden)

---

## 5. 총 컬렉션 카운트

- v2 12: users / servers / munpas / chat_channels / chat_reports / chat_report_counts / bookmarks / moderation_logs / wiki_classes / wiki_jinryeong / wiki_skills / wiki_contents / wiki_equipment / wiki_munpa_guides / wiki_tips (15 — wiki 7 + 8 기능)
- V1 신규 5: posts / posts/comments / posts/reactions (top-level은 posts만) / penalties / moderation_dictionaries

**top-level 컬렉션 = 17개** (v2 15 wiki_* 분리 카운트 + V1 신규 2 top + 3 subcollection).
