# Sprint 10 — System Design

**Sprint**: `10-sprint-launch`
**상위 문서**: [master-plan.md](./master-plan.md), [prd.md](./prd.md), [plan.md](./plan.md)
**작성일**: 2026-05-16

---

## 1. Architectural Principles (불변 원칙)

### 1.1 Clean Architecture (Ports & Adapters)

```
┌───────────────────────────────────────────────────────────┐
│                     UI Layer (React)                     │
│  app/**/page.tsx, components/feature/**, components/ui/  │
│                                                          │
│  - 직접 Firebase SDK import 금지                         │
│  - Server Action 또는 hook을 통해서만 데이터 접근        │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼  (Server Action / Route Handler)
┌───────────────────────────────────────────────────────────┐
│                Application / Domain Layer                │
│  lib/post/*, lib/chat/*, lib/auth/*, lib/b2b/*           │
│                                                          │
│  - 비즈니스 규칙 + 검증 + 워크플로우                     │
│  - Adapter를 통해서만 Firebase 접근                      │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│             Adapter / Infrastructure Layer               │
│  lib/firebase/*  (client / admin / firestore / rtdb /    │
│                   analytics / storage / claims-retry)    │
│                                                          │
│  - 외부 시스템 (Firebase, Toss, Kakao) 격리             │
│  - SDK / API call의 유일한 진입점                        │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼  (Firebase / Google / Toss API)
                          External Systems
```

**불변 규칙**:
- R1. `lib/firebase/*` 외부에서 `from 'firebase/*'` import 금지 → `scripts/audit-clean-arch.sh`로 자동 검증
- R2. Server-only 모듈은 `import 'server-only'` 첫 줄 (실수로 client 번들 누출 방지)
- R3. Client Component (`'use client'`)에서 Firebase Admin SDK 금지
- R4. 환경변수 접근은 `lib/*/config.ts` 또는 명확한 경계 함수에만
- R5. domain layer는 React/Next.js dependency 0 (테스트 용이성)

### 1.2 코딩 컨벤션 (기존 유지)

- TypeScript strict mode
- `readonly` props/types 우선 (immutability)
- `interface` over `type` (extension 용이)
- 함수: arrow function for callbacks, `function` for named exports
- 파일명: kebab-case
- 컴포넌트: PascalCase
- 클라이언트 컴포넌트 첫 줄 `'use client'`
- Server Action 함수에 `'use server'` (한 파일이 mixed면 별도 분리)

### 1.3 디자인 시스템

#### 디자인 토큰 (Sprint MVP-v2 기준)

```
docs/sprint/03-sprint-mvp-v2/phase-2-design/design-tokens-v2.json
```

22개 토큰 (color / spacing / typography / radius / shadow / motion). `app/globals.css`에 CSS variable로 적용. Tailwind `tailwind.config.ts`에서 `theme.extend.colors`로 매핑.

**위반 금지**:
- `#fff`, `rgb()`, `hsl()` 등 하드코딩 색상 (token 없는 1회용 색상은 token에 추가 후 사용)
- `px` 단위 인라인 (Tailwind scale `p-4`, `gap-2` 사용)
- `rem` 직접 사용 (Tailwind text-*, leading-* 등)

#### 컴포넌트 계층

```
components/
├── ui/              ← shadcn/ui 원본 (수정 최소)
├── magic-ui/        ← Magic UI 효과 컴포넌트
├── feature/         ← 도메인 feature 컴포넌트 (auth, post, chat, etc.)
│   ├── auth/
│   ├── post/        ← Sprint 10 신규: youtube-embed, link-preview
│   ├── chat/        ← Sprint 10 신규: 8~10 컴포넌트
│   └── ...
└── domain/          ← page-wide 도메인 컴포넌트 (header, footer, nav)
```

**원칙**:
- ui/, magic-ui/는 외부 의존만 (도메인 lib 의존 금지)
- feature/는 lib/* 의존 가능 (Server Action import OK)
- domain/은 feature 컴포넌트 조합

---

## 2. Authentication Flow (v3, Google sign-in 단일)

### 2.1 신규 가입 흐름

```
[Browser] /login 진입
   │
   ↓ "Google로 시작하기" 클릭
   │
[NextAuth] /api/auth/signin/google → Google OAuth consent
   │
   ↓ consent + callback
   │
[NextAuth] /api/auth/callback/google
   ├─ Google id_token + access_token 수신
   ├─ FirestoreAdapter: users / accounts 컬렉션에 저장 (자동)
   └─ JWT 세션 발급 (HttpOnly cookie)
   │
   ↓ jwt 콜백 (lib/auth/auth.ts)
   │
[Server] users/{uid} hydrate
   ├─ 첫 sign-in이면 registered=false, advertisingConsent=false 초기
   └─ session.user에 hydrate 필드 매핑
   │
   ↓ redirect /
   │
[Server Middleware or Layout]
   ├─ session.user.registered === false → redirect /register
   └─ session.user.registered === true → 정상 진입
   │
[Client] (registered=true 시) signInWithCustomToken 호출
   ├─ POST /api/auth/google-bridge
   ├─ Server: NextAuth session 검증 → Firebase Admin createCustomToken(uid, customClaims)
   ├─ Client: Firebase signInWithCustomToken
   └─ Firebase Auth + Firestore + RTDB + Storage 접근 가능
```

### 2.2 기존 가입자 로그인

거의 동일. 다른 점:
- FirestoreAdapter가 `accounts/{providerAccountId}`에서 기존 uid 매칭
- session.user.registered === true → 바로 홈
- signInWithCustomToken은 매 로그인마다 (Firebase 세션은 별도 만료)

### 2.3 Custom Claims (Firebase Auth)

Firebase Auth uid의 token에 다음 claims 동기화:

```typescript
{
  registered: boolean,
  role: 'user' | 'admin' | 'banned',
  serverId?: string,    // 게임 서버 (Sprint 10 신규)
  guildId?: string,     // 길드 (Sprint 10 신규)
  advertisingConsent: boolean
}
```

**Sync 시점**:
- 회원가입 완료 시 (Server Action에서 `admin.auth().setCustomUserClaims(uid, ...)`)
- 사용자 정보 update 시 (운영자 또는 본인)
- 클라이언트는 `getIdToken(true)` (force refresh)로 새 claims 반영

**RTDB rules에서 활용**: `auth.token.serverId == $serverId`로 채널 권한 검증.

### 2.4 logout

```
[Client] Sign Out 버튼 클릭
   ├─ signOut() (Firebase Auth)
   └─ next-auth signOut() (NextAuth)
```

NextAuth만 logout 호출하면 Firebase 세션 남음 → 둘 다 정리.

---

## 3. Firestore Data Model

### 3.1 컬렉션 ERD (12+ 컬렉션)

```
users (Sprint 10 확장)
├── uid (doc ID = Firebase Auth uid)
├── nickname: string
├── email: string (provider 발급)
├── role: 'user' | 'admin' | 'banned'
├── classId: 'warrior' | 'swordsman' | 'medium'
├── serverId?: string                  ← Sprint 10 신규
├── guildId?: string                   ← Sprint 10 신규
├── registered: boolean
├── advertisingConsent: boolean
├── consents: { ageOver14, terms, privacy, advertising: { value, at } }
├── createdAt: Timestamp
└── updatedAt: Timestamp

accounts (NextAuth FirestoreAdapter 자동 관리)
sessions (NextAuth FirestoreAdapter)
verificationTokens (NextAuth FirestoreAdapter)

posts
├── id
├── authorUid: string  → users/{uid}
├── authorNickname: string (denormalize)
├── classId: string
├── title: string (≤ 100자)
├── body: string (markdown, ≤ 10K자)
├── status: 'draft' | 'published' | 'hidden' | 'reported'
├── category: 'build' | 'tip' | 'review' | ...
├── viewCount: number
├── likeCount: number
├── commentCount: number
├── createdAt: Timestamp
└── updatedAt: Timestamp

comments
├── id
├── postId → posts/{id}
├── authorUid → users/{uid}
├── content
├── status
└── createdAt

bookmarks
├── id = `${uid}_${postId}`  (composite key)
├── uid
├── postId
├── createdAt
└── note?

advertising_consents
├── id (uid)
├── value: boolean
└── changedAt: Timestamp

user_claims_retry_queue   ← Sprint V3 CA2-I11
├── id (auto)
├── uid
├── claims: object
├── attempt: number
├── status: 'pending' | 'success' | 'failed'
└── lastTriedAt

reports (Sprint 10 확장)
├── id
├── targetType: 'post' | 'comment' | 'chat'
├── targetId
├── targetContext?: { channelId? }     ← Sprint 10 신규
├── reporterUid
├── reason: string
├── status: 'pending' | 'reviewed' | 'dismissed'
└── createdAt

linkPreviewCache (Sprint 10 신규)
├── id (urlHash, SHA256(url) prefix)
├── url: string
├── title: string
├── description: string
├── image?: string
├── domain: string
├── fetchedAt: Timestamp
└── ttlExpiresAt: Timestamp           ← 7일 후

pinned_messages (Sprint 10 신규, 선택)
├── id
├── channelId
├── messageId (RTDB key)
├── pinnedBy (uid)
└── pinnedAt

(기존 외 추가)
servers (Sprint 10 신규)   ← 게임 서버 메타데이터
├── id
├── name
└── memberCount?

guilds (Sprint 10 신규)    ← 길드 메타데이터
├── id
├── serverId → servers/{id}
├── name
├── leaderUid
├── memberCount
└── createdAt
```

### 3.2 인덱스 (firestore.indexes.json 확장)

| 컬렉션 | 필드 | 정렬 | 용도 |
|---|---|---|---|
| posts | status + category + createdAt DESC | composite | 카테고리별 최신 글 |
| posts | authorUid + createdAt DESC | composite | 내가 쓴 글 |
| comments | postId + createdAt DESC | composite | 글 상세 댓글 |
| bookmarks | uid + createdAt DESC | composite | 내 북마크 |
| reports | status + createdAt DESC | composite | 미처리 신고 |
| linkPreviewCache | ttlExpiresAt | single | TTL 만료 정리 |
| guilds | serverId + memberCount DESC | composite | 서버별 길드 목록 |

### 3.3 Security Rules (요약, 기존 유지 + 확장)

```
match /users/{uid} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == uid;  // 본인만 자기 문서 수정
  // serverId/guildId는 회원가입 폼 또는 운영자 admin이 수정
}

match /posts/{id} {
  allow read: if resource.data.status == 'published'
           || request.auth.token.role == 'admin'
           || request.auth.uid == resource.data.authorUid;
  allow create: if request.auth.token.registered == true
              && request.auth.token.role != 'banned';
  allow update: if request.auth.uid == resource.data.authorUid
              || request.auth.token.role == 'admin';
  // ...
}

// linkPreviewCache는 server-only (Admin SDK만)
match /linkPreviewCache/{urlHash} {
  allow read, write: if false;
}
```

---

## 4. Realtime Database — Chat Topology

### 4.1 데이터 구조

```
chat/
├── messages/
│   ├── global/                              ← 전체 채널
│   │   └── {messageId}/                     ← push key (auto-sorted by createdAt)
│   │       ├── channelId: 'global'
│   │       ├── authorUid
│   │       ├── authorNickname
│   │       ├── authorClassId
│   │       ├── authorRole
│   │       ├── content (≤ 500자)
│   │       ├── imageUrl? (Storage URL)
│   │       ├── linkPreview? : { url, title, description, image, domain }
│   │       ├── createdAt: serverTimestamp
│   │       ├── hidden?: boolean
│   │       ├── keptByOperator?: boolean
│   │       └── deletedByOperator?: boolean
│   │
│   ├── server-{serverId}/                   ← 게임 서버 채널
│   │   └── {messageId}/...
│   │
│   └── guild-{guildId}/                     ← 길드 채널
│       └── {messageId}/...
│
└── presence/ (선택, Sprint 10 후속)
    └── {channelId}/{uid}: lastSeen
```

### 4.2 RTDB Security Rules (확장안)

```json
{
  "rules": {
    "chat": {
      "messages": {
        "$channelId": {
          ".indexOn": ["createdAt"],
          ".read": "auth != null && auth.token.role !== 'banned' && (
            $channelId === 'global' ||
            ($channelId.beginsWith('server-') &&
              $channelId.substring(7) === auth.token.serverId) ||
            ($channelId.beginsWith('guild-') &&
              $channelId.substring(6) === auth.token.guildId)
          )",
          "$messageId": {
            ".write": "auth != null && auth.token.role !== 'banned' && (
              (!data.exists() &&
               auth.token.registered === true &&
               newData.child('authorUid').val() === auth.uid &&
               newData.child('channelId').val() === $channelId &&
               newData.child('content').isString() &&
               newData.child('content').val().length <= 500 &&
               newData.child('createdAt').val() === now &&
               ($channelId === 'global' ||
                ($channelId.beginsWith('server-') &&
                  $channelId.substring(7) === auth.token.serverId) ||
                ($channelId.beginsWith('guild-') &&
                  $channelId.substring(6) === auth.token.guildId))
              ) || auth.token.role === 'admin'
            )",
            ".validate": "newData.hasChildren(['channelId','authorUid','authorNickname','content','createdAt'])",
            "channelId": { ".validate": "newData.val() === $channelId" },
            "authorUid": { ".validate": "newData.val() === auth.uid || auth.token.role === 'admin'" },
            "authorNickname": { ".validate": "newData.isString() && newData.val().length >= 2 && newData.val().length <= 12" },
            "authorClassId": { ".validate": "newData.val() === 'warrior' || newData.val() === 'swordsman' || newData.val() === 'medium'" },
            "authorRole": { ".validate": "newData.val() === 'admin' || newData.val() === 'user'" },
            "content": { ".validate": "newData.isString() && newData.val().length <= 500" },
            "imageUrl": { ".validate": "!newData.exists() || (newData.isString() && newData.val().matches(/^https:\\/\\/firebasestorage\\.googleapis\\.com\\//) )" },
            "linkPreview": {
              "url": { ".validate": "newData.isString() && newData.val().matches(/^https:\\/\\//)" },
              "title": { ".validate": "newData.isString() && newData.val().length <= 200" },
              "description": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 500)" },
              "image": { ".validate": "!newData.exists() || (newData.isString() && newData.val().matches(/^https:\\/\\//))" },
              "domain": { ".validate": "newData.isString() && newData.val().length <= 100" },
              "$other": { ".validate": false }
            },
            "createdAt": { ".validate": "newData.isNumber()" },
            "hidden": { ".validate": "newData.isBoolean()" },
            "keptByOperator": { ".validate": "auth.token.role === 'admin' && newData.isBoolean()" },
            "deletedByOperator": { ".validate": "auth.token.role === 'admin' && newData.isBoolean()" },
            "$other": { ".validate": false }
          }
        }
      }
    }
  }
}
```

**중요**: RTDB rules에서 `$channelId.beginsWith('server-')` + `.substring(7)`는 RTDB rules expression의 표준 기능. 정규식 `.matches()`도 사용 가능하지만 단순 prefix check가 더 명확.

### 4.3 채널 라우팅 흐름

```
[User opens /chat]
   ↓
[ChatLayout SSR]
   ├─ NextAuth session 확인
   ├─ Firestore users/{uid} fetch (serverId, guildId)
   └─ Channels = ['global', 'server-{serverId}', 'guild-{guildId}']
   ↓
[ChannelSidebar render]
   ├─ 3개 채널 nav 표시
   └─ Default active: global (URL: /chat/global)
   ↓
[/chat/[channelId]/page.tsx — Client Component]
   ├─ useChannel(channelId, { limit: 50 })
   │   ├─ getRealtimeDB() (lib/firebase/realtime-db.ts adapter)
   │   ├─ onChildAdded / onChildChanged / onChildRemoved 구독
   │   └─ unmount 시 off() 자동
   ├─ MessageList render (limitToLast 50, infinite scroll up)
   └─ MessageComposer (전송 시 sendChatMessage(channelId, content, imageUrl?))
```

---

## 5. Storage Structure

```
gs://god-kkabi-guide.firebasestorage.app/
├── chat/
│   └── {channelId}/{uid}/{filename}        ← 채팅 이미지 (1MB, jpeg|png|webp)
├── posts/
│   └── {uid}/{filename}                    ← 게시물 이미지 (1MB, jpeg|png|webp)
└── ogPreview/ (선택, Sprint 10 후속)
    └── {urlHash}.webp                      ← OG 이미지 캐싱 (CORS 우회용)
```

### 5.1 Storage Rules (기존 + Sprint 10 확장)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    match /chat/{channelId}/{userId}/{filename} {
      allow read: if request.auth != null && request.auth.token.role != 'banned';
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.auth.token.role != 'banned'
        && request.auth.token.registered == true
        && request.resource.size <= 1 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)')
        // Sprint 10: 채널 권한 검증
        && (channelId == 'global' ||
            (channelId.matches('server-.*') && channelId.substring(7) == request.auth.token.serverId) ||
            (channelId.matches('guild-.*') && channelId.substring(6) == request.auth.token.guildId));
      allow delete: if request.auth != null
        && (request.auth.uid == userId || request.auth.token.role == 'admin');
    }

    match /posts/{userId}/{filename} {
      allow read: if true;  // 공개 (게시물 자체가 public)
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.auth.token.role != 'banned'
        && request.auth.token.registered == true
        && request.resource.size <= 1 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)');
      allow delete: if request.auth != null
        && (request.auth.uid == userId || request.auth.token.role == 'admin');
    }

    // 그 외 모든 경로 차단
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 5.2 CORS 정책 (`infra/cors.json`)

```json
[
  {
    "origin": [
      "https://kkaebizigi.com",
      "https://staging.kkaebizigi.com",
      "https://www.kkaebizigi.com",
      "http://localhost:3000"
    ],
    "method": ["GET", "POST", "PUT", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "X-Requested-With"]
  }
]
```

---

## 6. Posts — YouTube Embed + Link Preview Design

### 6.1 Markdown 처리 파이프라인

```
[Raw markdown]
   ↓ remark()
[mdast]
   ↓ remarkRehype({ allowDangerousHtml: false })
[hast]
   ↓ rehypeSanitize(SAFE_SCHEMA)
[sanitized hast]
   ↓ rehypeAllowedImgDomainsPlugin                  ← 기존 (외부 이미지 차단)
   ↓ rehypeYoutubeEmbedPlugin                       ← 신규 (Sprint 10)
   ↓ rehypeLinkPreviewPlugin                        ← 신규 (Sprint 10)
[enriched hast]
   ↓ rehypeStringify
[Safe HTML 문자열]
   ↓
[Server Component dangerouslySetInnerHTML]
   ↓
[Client: <youtube-embed videoId="..."> custom element → React Component]
[Client: <link-preview url="..."> custom element → React Component]
```

### 6.2 rehypeYoutubeEmbedPlugin

```typescript
// 패턴: <p><a href="https://youtu.be/{id}">https://youtu.be/{id}</a></p>
// 또는: <p><a href="https://www.youtube.com/watch?v={id}">...</a></p>
// → <youtube-embed videoId="{id}"></youtube-embed>

function rehypeYoutubeEmbedPlugin() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'p') return;
      if (node.children.length !== 1) return;
      const child = node.children[0];
      if (child.type !== 'element' || child.tagName !== 'a') return;
      
      const href = child.properties?.href;
      if (typeof href !== 'string') return;
      
      const videoId = extractYoutubeId(href);
      if (!videoId) return;
      
      // 텍스트 = 링크 URL과 동일해야 (사용자가 단순 URL 붙여넣기)
      const linkText = child.children[0];
      if (linkText?.type !== 'text' || linkText.value.trim() !== href) return;
      
      // <youtube-embed videoId="{id}"> 로 교체
      if (parent && typeof index === 'number') {
        parent.children[index] = {
          type: 'element',
          tagName: 'youtube-embed',
          properties: { videoId },
          children: [],
        };
      }
    });
  };
}

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.endsWith('youtube.com')) {
      // /watch?v=ID
      if (u.pathname === '/watch') return u.searchParams.get('v');
      // /shorts/ID
      if (u.pathname.startsWith('/shorts/')) return u.pathname.slice(8);
    }
  } catch { /* invalid URL */ }
  return null;
}
```

**sanitize 통과**: `SAFE_SCHEMA.tagNames`에 `youtube-embed` 추가 + `attributes`에 `[videoId]` 추가.

### 6.3 rehypeLinkPreviewPlugin

YouTube와 동일 패턴. URL이 YouTube가 아니면서 단독 줄이면 `<link-preview url="...">` 변환.

### 6.4 YouTube Embed Component (`components/feature/post/youtube-embed.tsx`)

```tsx
'use client';
import { useState } from 'react';

interface YoutubeEmbedProps {
  videoId: string;
}

export function YoutubeEmbed({ videoId }: YoutubeEmbedProps) {
  const [activated, setActivated] = useState(false);
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
      {activated ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button
          onClick={() => setActivated(true)}
          className="relative h-full w-full group"
          aria-label="YouTube 영상 재생"
        >
          <img src={thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition">
            <PlayIcon className="h-16 w-16 text-white" />
          </span>
        </button>
      )}
    </div>
  );
}
```

**디자인 토큰 적용**: `rounded-lg`, `bg-muted` (Tailwind theme via design tokens).

### 6.5 Link Preview Component

Server Component 우선 (SSR 시 OG fetch + render — 첫 페인트에 카드 표시):

```tsx
// components/feature/post/link-preview.tsx
import { fetchOgPreview } from '@/lib/post/og-preview';

interface LinkPreviewProps {
  url: string;
}

export async function LinkPreview({ url }: LinkPreviewProps) {
  const preview = await fetchOgPreview(url);
  
  if (!preview) {
    return <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="text-link underline">{url}</a>;
  }
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent transition no-underline"
    >
      {preview.image && (
        <img src={preview.image} alt="" className="h-20 w-20 rounded object-cover flex-shrink-0" loading="lazy" />
      )}
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{preview.domain}</p>
        <h3 className="text-base font-semibold line-clamp-2">{preview.title}</h3>
        {preview.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{preview.description}</p>
        )}
      </div>
    </a>
  );
}
```

### 6.6 OG Fetch Adapter (`lib/post/og-preview.ts`)

```typescript
import 'server-only';
import crypto from 'node:crypto';
import { getAdminFirestore } from '@/lib/firebase/admin';

export interface OgPreviewResult {
  url: string;
  title: string;
  description?: string;
  image?: string;
  domain: string;
}

const FETCH_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;  // 7일

export async function fetchOgPreview(url: string): Promise<OgPreviewResult | null> {
  // 1. URL 검증 + SSRF 방어
  let target: URL;
  try { target = new URL(url); }
  catch { return null; }
  if (target.protocol !== 'https:') return null;
  if (await isPrivateIp(target.hostname)) return null;
  
  // 2. 캐시 hit?
  const urlHash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 32);
  const db = getAdminFirestore();
  const cacheRef = db.collection('linkPreviewCache').doc(urlHash);
  const cached = await cacheRef.get();
  if (cached.exists) {
    const data = cached.data()!;
    if (data.ttlExpiresAt.toMillis() > Date.now()) {
      return { url: data.url, title: data.title, description: data.description, image: data.image, domain: data.domain };
    }
  }
  
  // 3. fetch + parse
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'kkaebizigi-link-preview/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const html = await res.text();
    const parsed = parseOgFromHtml(html, target.hostname);
    if (!parsed) return null;
    
    // 4. 캐시 저장
    await cacheRef.set({
      ...parsed,
      url,
      fetchedAt: new Date(),
      ttlExpiresAt: new Date(Date.now() + CACHE_TTL_MS),
    });
    return parsed;
  } catch {
    return null;
  }
}

async function isPrivateIp(hostname: string): Promise<boolean> {
  // DNS lookup + IP 검증
  // 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x, ::1, fc00::, fe80::
  // 구현 생략 (Node 'dns' module 사용)
}

function parseOgFromHtml(html: string, hostnameFallback: string): Omit<OgPreviewResult, 'url'> | null {
  // og:title / og:description / og:image / <title> fallback
  // node-html-parser 또는 정규식 (작은 dependency)
  // ...
}
```

**보안 critical**: `isPrivateIp` 정확히 구현. DNS rebinding 방어 — fetch 직전 한 번 더 IP 검증.

---

## 7. Chat — UI Component Design

### 7.1 컴포넌트 tree

```
ChatLayout (server component, SSR)
├── ChannelSidebar (client, fetches user channels)
│   ├── ChannelLink × N (active 상태 highlight)
│   └── (mobile) Sheet drawer 패턴
│
└── ChannelView (server component, slug = channelId)
    ├── ChannelHeader (channel name, member count, settings)
    ├── MessageList (client, virtualized)
    │   ├── LoadOlderButton (top)
    │   └── MessageItem × N
    │       ├── Avatar + nickname + role badge
    │       ├── Content (text or image or link-preview)
    │       └── ContextMenuTrigger (right-click / long-press)
    │           └── ReportDialog
    │
    └── MessageComposer (client)
        ├── TextArea (auto-resize)
        ├── ImageAttachButton
        │   └── ImageUploadPreview
        └── SendButton
```

### 7.2 MessageItem variants

```typescript
type MessageVariant =
  | { type: 'text'; content: string }
  | { type: 'image'; imageUrl: string; alt?: string }
  | { type: 'link'; url: string }
  | { type: 'pinned'; messageId: string; pinnedBy: string }
  | { type: 'deleted'; deletedBy: 'self' | 'operator' };

function MessageItem({ message }: { message: ChatMessage }) {
  const variant = resolveVariant(message);
  // ...
}
```

### 7.3 useChannel hook 확장

이미 `lib/chat/use-channel.ts` 존재 + `channelId` 인자 받음 → 그대로 활용. 단 channelId 패턴 검증 추가:

```typescript
function validateChannelId(channelId: string): boolean {
  return channelId === 'global'
      || /^server-[a-zA-Z0-9_-]+$/.test(channelId)
      || /^guild-[a-zA-Z0-9_-]+$/.test(channelId);
}
```

### 7.4 채널 접근 권한 검증 (client + server 이중)

```typescript
// lib/chat/channel-permission.ts
export function canAccessChannel(channelId: string, user: User): boolean {
  if (user.role === 'banned') return false;
  if (channelId === 'global') return true;
  if (channelId.startsWith('server-')) {
    return channelId.substring(7) === user.serverId;
  }
  if (channelId.startsWith('guild-')) {
    return channelId.substring(6) === user.guildId;
  }
  return false;
}
```

서버 측 (page.tsx에서 SSR 검증) + 클라이언트 측 (UI 비활성화) + RTDB rules (최종 진실) **3중 방어**.

---

## 8. Domain Cutover — Configuration

### 8.1 Vercel 환경변수 매트릭스

| Key | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://kkaebizigi.com` | `https://staging.kkaebizigi.com` | `http://localhost:3000` |
| `AUTH_URL` | `https://kkaebizigi.com` | `https://staging.kkaebizigi.com` | `http://localhost:3000` |
| `AUTH_SECRET` | (production secret) | (preview secret, 별개) | (dev secret) |
| `AUTH_GOOGLE_ID` | (Google OAuth client ID) | (동일 또는 별개 client) | (동일) |
| `AUTH_GOOGLE_SECRET` | (Google OAuth client secret) | (동일) | (동일) |
| `NEXT_PUBLIC_FIREBASE_*` (7개) | (Firebase Web SDK) | (동일) | (동일) |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | `https://god-kkabi-guide-default-rtdb.asia-southeast1.firebasedatabase.app` | (동일) | (동일) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | (base64) | (동일) | (동일) |
| `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` | (production token) | (없음) | (없음) |

### 8.2 next.config.ts 변경

- `images.remotePatterns`:
  - 추가: `lh3.googleusercontent.com` (Google 프로필 이미지)
  - 추가: `i.ytimg.com` (YouTube 썸네일)
  - 추가: `firebasestorage.googleapis.com` (이미 있을 수 있음)
  - 제거: `kakaocdn.net` 등 Kakao 도메인
- `headers()`:
  - CSP: `frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com`
  - CSP: `img-src 'self' data: https://lh3.googleusercontent.com https://i.ytimg.com https://firebasestorage.googleapis.com https:` (또는 다른 안전 정책)
  - CSP: `connect-src 'self' https://*.firebasedatabase.app https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com`

---

## 9. Observability

### 9.1 Sentry

- `@sentry/nextjs` 설치
- Sentry DSN env var: `NEXT_PUBLIC_SENTRY_DSN`
- production-only 활성화 (`SENTRY_ENVIRONMENT=production` 또는 `preview`)
- 5xx 알림: Slack/email 통합
- Source map 업로드 (Vercel build hook)

### 9.2 Analytics

- Firebase Analytics (`getAnalytics`) — 클라이언트 SDK
- GA4 이벤트 17개 (기존 `lib/analytics/*` 유지) + 신규 이벤트:
  - `chat_message_sent`
  - `chat_channel_changed`
  - `youtube_embed_play`
  - `link_preview_clicked`
  - `register_completed`

### 9.3 Logging

- Vercel built-in logging
- 구조화 JSON 로그: `lib/logging/log.ts` (있다면 활용, 없으면 신규)
- requestId 헤더 propagation (`x-request-id`)

---

## 10. Performance Budget

| 페이지 | TTFB | FCP | LCP | TTI | JS bundle (gzip) |
|---|---|---|---|---|---|
| `/` (홈) | ≤ 200ms | ≤ 1.0s | ≤ 1.8s | ≤ 2.5s | ≤ 150KB |
| `/post` (목록) | ≤ 300ms | ≤ 1.2s | ≤ 2.0s | ≤ 3.0s | ≤ 180KB |
| `/post/[id]` (상세) | ≤ 300ms | ≤ 1.2s | ≤ 2.5s (YouTube 임베드 lazy) | ≤ 3.0s | ≤ 200KB |
| `/chat/[channelId]` | ≤ 400ms | ≤ 1.5s | ≤ 2.5s | ≤ 3.5s | ≤ 250KB (RTDB SDK) |
| `/login` | ≤ 200ms | ≤ 1.0s | ≤ 1.5s | ≤ 2.0s | ≤ 130KB |

**최적화**:
- next/image + WebP
- 폰트 preload + font-display: swap
- RTDB SDK는 chat 페이지에서만 (dynamic import)
- Firebase SDK tree-shake (modular SDK)
- Sprint V5 P5 P performance fix 흐름 유지

---

## 11. Mobile Responsive Strategy

Tailwind breakpoints:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

| 페이지 | 모바일 (< 768px) | 데스크탑 (≥ 768px) |
|---|---|---|
| Chat | Sheet drawer로 채널 sidebar, 메시지 영역 full-width | 좌측 sidebar + 메시지 영역 grid |
| Post 작성 | 단일 column, 미리보기 토글 버튼 | 좌측 작성 / 우측 미리보기 split |
| 게시글 상세 | 단일 column, YouTube 16:9 | 단일 column 중앙 + max-width |
| Header nav | hamburger menu | 가로 nav |

**모든 viewport에서 디자인 토큰 동일** — spacing scale만 mobile에서 조금 더 컴팩트 (`gap-2 md:gap-4`).

---

## 12. Test Strategy (L1~L5)

| 레벨 | 범위 | 도구 | Sprint 10 신규 |
|---|---|---|---|
| L1 unit | 순수 함수 (lib/post/markdown, lib/post/og-preview, lib/chat/channel-resolver) | vitest | YouTube ID 파서, OG 캐시, channel resolver |
| L2 integration | Server Action + Firebase emulator | vitest + firebase-tools emulator | google-bridge 흐름, RTDB rules |
| L3 component | UI 컴포넌트 (YoutubeEmbed, LinkPreview, MessageComposer 등) | vitest + @testing-library/react | 신규 컴포넌트 12+ |
| L4 e2e | Browser 자동화 (Playwright) | @playwright/test | 로그인 + 게시글 + 채팅 시나리오 |
| L5 사용자 시나리오 | 수동 또는 사용자 테스트 | 수동 | 출시 직전 |

---

## 13. Deployment Pipeline

```
[Developer]
   ↓ git push origin feature/X
[Vercel] preview deployment (webhook)
   ↓ PR (staging ← feature/X)
[Review + CI]
   ↓ merge to staging
[Vercel] staging.kkaebizigi.com 자동 배포
   ↓ staging 수동 검증 (E2E + UI 확인)
[PR] (main ← staging)
   ↓ approval
[Vercel] kkaebizigi.com 자동 prod 배포
   ↓ post-deploy
[Verification] dig + curl + Lighthouse + Sentry 알림 정상 동작
```

---

## 14. 변경 이력

| 일자 | 변경 | 작성자 |
|---|---|---|
| 2026-05-16 | Design 초안 — Clean Arch + Auth flow v3 + Firestore ERD + RTDB 채널 토폴로지 + Storage + Post enrichment + Chat UI tree | Claude + kay |
