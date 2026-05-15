# Firestore 스키마 v2 (12 컬렉션 + 보안 규칙)

> 출처: `design.md` §5 + 운영자 결정 G2 (Hybrid backend)
> 작성일: 2026-05-15
> Sprint: god-kkabi-guide-sprint-mvp-v2 Phase 2 보강

---

## 1. 컬렉션 활성/비활성 매트릭스

| 컬렉션 | MVP | V1 | V2 | 비고 |
|--------|-----|-----|-----|------|
| `users` | ✅ | ✅ | ✅ | Auth 핵심 — 등록 폼 + 본인 데이터 |
| `servers` | ✅ | ✅ | ✅ | 서버 마스터 (S+숫자) |
| `munpas` | ✅ | ✅ | ✅ | 문파 마스터 |
| `chat_channels` | ✅ | ✅ | ✅ | 채널 메타 (메시지는 Realtime DB) |
| `chat_reports` | ✅ | ✅ | ✅ | 신고 기록 (모더레이션) |
| `bookmarks` | ✅ | ✅ | ✅ | 사용자 북마크 |
| `wiki_classes` | ✅ | ✅ | ✅ | 3 직업 |
| `wiki_jinryeong` | ✅ | ✅ | ✅ | 11 진령 |
| `wiki_equipments` | ✅ | ✅ | ✅ | 장비 30+ |
| `wiki_skills` | ✅ | ✅ | ✅ | 스킬 15+ |
| `wiki_contents` | ✅ | ✅ | ✅ | 콘텐츠/이벤트 20+ |
| `tips` | ✅ | ✅ | ✅ | 운영자 + 사용자 작성 |
| `coupons` (재사용) | ✅ | ✅ | ✅ | v1 유지 |
| `events` (GA4 backup) | ✅ | ✅ | ✅ | v1 유지 |
| `moderation_logs` | ✅ | ✅ | ✅ | 운영자 액션 audit log (30일 보존) |
| `user_posts` | ⏳ | ✅ | ✅ | V1 게시판 활성 |
| `tier_votes`, `pain_topics` | ⏳ | ✅ | ✅ | V1+ 활성 |

---

## 2. 컬렉션 상세 스펙

### 2.1 `users`

```typescript
interface UserDoc {
  // Auth
  uid: string;                  // Firebase Auth uid (= 문서 ID)
  email: string;
  displayName?: string;
  photoURL?: string;
  authProvider: 'google' | 'kakao';

  // 등록 폼
  serverId: string;             // /^S\d{1,4}$/
  gameUid: string;              // 게임 UID (변경 불가, unique)
  munpa: string;                // 최대 30자
  nickname: string;             // 최대 12자, server scope unique
  classId: 'warrior' | 'swordsman' | 'medium';

  // 역할/상태
  role: 'user' | 'admin';
  banned: boolean;
  banUntil?: Timestamp;
  banReason?: string;

  // 통계 (denormalized)
  bookmarkIds: string[];        // 최대 200
  reportedTotal: number;        // 누적 신고 받은 수 (V1+)
  warningCount: number;         // 경고 누적 (V1+)

  // 동의 (PIPA)
  consent: {
    age14plus: boolean;
    chatPublic: boolean;
    unofficial: boolean;
    operator24h: boolean;
    analytics: boolean;
    consentedAt: Timestamp;
  };

  // 메타
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

**인덱스**:
- `serverId` (asc) — 서버별 사용자
- `serverId` + `munpa` (composite) — 문파별 사용자
- `gameUid` (asc, unique 검증)
- `nickname` (server scope unique, app 검증)
- `banned` + `role` — admin 필터

**보안 규칙**:
```javascript
match /users/{userId} {
  allow read: if request.auth.uid == userId
    || request.auth.token.admin == true;
  allow create: if request.auth.uid == userId
    && request.resource.data.role == 'user'
    && request.resource.data.banned == false
    && request.resource.data.consent.age14plus == true;
  allow update: if request.auth.uid == userId
    && request.resource.data.gameUid == resource.data.gameUid  // gameUid 변경 불가
    && request.resource.data.role == resource.data.role        // role 본인 변경 불가
    && request.resource.data.banned == resource.data.banned;   // banned 본인 변경 불가
  allow update: if request.auth.token.admin == true;          // admin은 모두 가능
  allow delete: if false;                                      // V1+ 탈퇴 기능
}
```

### 2.2 `servers`

```typescript
interface ServerDoc {
  id: string;                  // 'S785' (PK)
  userCount: number;
  munpaCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**보안 규칙**: `read: true` / `write: admin only` — Server Action에서 자동 upsert.

### 2.3 `munpas`

```typescript
interface MunpaDoc {
  id: string;                  // `{serverId}_{munpaName}` (PK)
  serverId: string;
  name: string;
  memberCount: number;
  description?: string;        // V1+ 문파 소개
  leaderUid?: string;          // V1+ 길마
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**인덱스**: `serverId` + `memberCount` (desc) — 서버별 인기 문파

**보안 규칙**: `read: true` / `write: admin only`

### 2.4 `chat_channels`

```typescript
interface ChatChannelDoc {
  id: string;                  // 'global' | 'server:S785' | 'munpa:S785:천상천하'
  type: 'global' | 'server' | 'munpa';
  serverId?: string;           // type=server/munpa
  munpaName?: string;          // type=munpa
  memberCount: number;         // denormalized
  lastMessageAt?: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
}
```

**보안 규칙**:
```javascript
match /chat_channels/{channelId} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}
```

> 채널 자동 생성은 Server Action `/api/auth/register`에서 처리 (사용자 등록 시 server/munpa upsert + 채널 upsert).

### 2.5 `chat_reports`

```typescript
interface ChatReportDoc {
  id: string;                  // 자동 ID
  messageId: string;           // Realtime DB chat/messages/{channelId}/{msgId}
  channelId: string;
  reporterUid: string;
  reportedUid: string;
  reason: 'spam' | 'abusive' | 'nsfw' | 'off_topic';
  message_snapshot: string;    // 메시지 텍스트 캐시 (메시지 삭제돼도 검토 가능)
  imageUrl?: string;
  resolved: 'pending' | 'deleted' | 'kept_by_operator' | 'auto_hidden';
  resolvedBy?: string;         // admin uid
  resolvedAt?: Timestamp;
  createdAt: Timestamp;
}
```

**인덱스**:
- `messageId` (asc) — 메시지별 신고 카운트
- `resolved` + `createdAt` (desc) — 운영자 큐
- `reportedUid` + `createdAt` (desc) — 사용자별 신고 누적

**보안 규칙**:
```javascript
match /chat_reports/{reportId} {
  allow read: if request.auth.token.admin == true;
  allow create: if request.auth != null
    && request.resource.data.reporterUid == request.auth.uid
    && request.resource.data.reporterUid != request.resource.data.reportedUid; // 자기 신고 차단
  allow update: if request.auth.token.admin == true;
  allow delete: if false;
}
```

### 2.6 `bookmarks`

```typescript
interface BookmarkDoc {
  id: string;                  // `{uid}_{targetType}_{targetId}` (composite unique)
  uid: string;
  targetType: 'wiki' | 'tip' | 'user_post';
  targetSubType?: string;      // 'class' | 'jinryeong' | 'equipment' | 'skill' | 'content'
  targetId: string;
  title: string;               // denormalized
  thumbnailUrl?: string;
  createdAt: Timestamp;
}
```

**인덱스**: `uid` + `createdAt` (desc), `uid` + `targetType` (composite)

**보안 규칙**:
```javascript
match /bookmarks/{bookmarkId} {
  allow read: if request.auth.uid == resource.data.uid;
  allow create: if request.auth.uid == request.resource.data.uid
    && bookmarkId == request.auth.uid + '_' + request.resource.data.targetType + '_' + request.resource.data.targetId;
  allow delete: if request.auth.uid == resource.data.uid;
  allow update: if false;
}
```

### 2.7 `wiki_classes`

```typescript
interface WikiClassDoc {
  id: 'warrior' | 'swordsman' | 'medium';  // PK
  nameKo: string;              // "전사 (도깨비)"
  emoji?: string;              // 호환성 — 신규 디자인은 SVG/icon 우선
  tagline: string;             // "탱딜 · 근접 물리"
  heroBannerKey: string;       // 'banner-korean-carry' 등
  strengths: string[];
  weaknesses: string[];
  recommendedJinryeongIds: string[];
  recommendedSkillIds: string[];
  recommendedEquipmentSlugs: string[];
  stats: {
    survival: number;          // 1-10
    pveDps: number;
    pvpRating: number;
    autoEfficiency: number;
  };
  metaUsage: {
    pvpTop50: number;          // 0-1 (예: 0.68)
    bossDungeon: number;
    autoFarming: number;
  };
  operatorComment: string;
  sources: { label: string; url: string }[];
  lastVerifiedAt: Timestamp;
  updatedAt: Timestamp;
}
```

**보안 규칙**: `read: true` / `write: admin only`

### 2.8 `wiki_jinryeong`

```typescript
interface WikiJinryeongDoc {
  id: string;                  // 'eumyeong_gwi' 등 11종
  nameKo: string;
  nameAlt?: string;            // V1+ 다국어
  faction?: 'shin' | 'yo' | 'in';  // 신/요/인 진영 (catalog 모티프)
  rarity: 'SSR' | 'SR' | 'R';
  tier: 0 | 1 | 2;
  recommendedClass: ('warrior' | 'swordsman' | 'medium')[];
  coreSkillName: string;
  coreSkillEffect: string;
  fullDescription: string;
  recommendedCombos: {
    title: string;
    jinryeongIds: [string, string, string];
    description: string;
  }[];
  iconKey?: string;            // 'catalog-jinryeong-ssr' crop hint
  metaUsage?: {
    pvp: number;
    pve: number;
  };
  operatorComment?: string;
  lastVerifiedAt: Timestamp;
  updatedAt: Timestamp;
}
```

**인덱스**: `tier` (asc) + `rarity` (asc)

### 2.9 `wiki_equipments`

```typescript
interface WikiEquipmentDoc {
  id: string;                  // 자동 ID
  slug: string;                // URL slug (unique)
  category: 'weapon' | 'armor' | 'accessory' | 'soul_stone' | 'material' | 'consumable';
  subCategory?: string;        // 'sword' | 'staff' | 'helmet' | 'ring' 등
  nameKo: string;
  nameAlt?: string;            // V1+ 영문
  grade: 'normal' | 'rare' | 'epic' | 'legendary' | 'mythic';
  baseStats: {
    name: string;              // 'attack' | 'defense' | 'hp' | 'critical' 등
    value: string;
  }[];
  refinementLevels: {          // 제련 단계별 효과
    level: number;             // +1 ~ +20
    effects: string[];
    successRate?: number;      // 강화 확률
  }[];
  acquisition: string;         // "결투장 시즌 보상 / 던전 N층 / 패키지 구매" 등
  recommendedClass?: ('warrior' | 'swordsman' | 'medium')[];
  iconKey?: string;
  operatorTip?: string;
  lastVerifiedAt: Timestamp;
  updatedAt: Timestamp;
}
```

**인덱스**: `category` + `grade` (composite, desc), `slug` (unique)

### 2.10 `wiki_skills`

```typescript
interface WikiSkillDoc {
  id: string;
  slug: string;
  nameKo: string;              // '신검일섬', '월광난무' 등
  classId: 'warrior' | 'swordsman' | 'medium' | 'all';
  type: 'core' | 'active' | 'passive';
  effect: string;
  effectByLevel?: { level: number; description: string }[];
  cooldownSeconds?: number;
  damageFormula?: string;      // 'ATK × 250%'
  synergies: {
    targetId: string;
    targetType: 'jinryeong' | 'equipment' | 'skill';
    description: string;
  }[];
  iconKey?: string;            // 'skills-list-swordsman' crop
  operatorTip?: string;
  lastVerifiedAt: Timestamp;
  updatedAt: Timestamp;
}
```

**인덱스**: `classId` + `type` (composite)

### 2.11 `wiki_contents`

```typescript
interface WikiContentDoc {
  id: string;
  slug: string;
  type: 'main_dungeon' | 'infinite_dungeon' | 'bigyeong' | 'boss_dungeon' | 'pvp' | 'event' | 'collab';
  nameKo: string;
  description: string;
  recommendedClass?: string[];
  recommendedJinryeongIds?: string[];
  recommendedBuildTags?: string[];  // BuildTag enum 11
  rewards?: string[];
  schedule?: { start: Timestamp; end?: Timestamp };
  thumbnailKey?: string;            // 'banner-baekgwi' 등
  operatorTip?: string;
  lastVerifiedAt: Timestamp;
  updatedAt: Timestamp;
}
```

**인덱스**: `type` + `updatedAt` (desc)

### 2.12 `tips`

```typescript
interface TipDoc {
  id: string;
  category: 'general' | 'beginner' | 'advanced' | 'pvp' | 'economy';
  title: string;
  content: string;             // markdown 또는 plaintext (500자 권장)
  authorUid: string;           // 'operator' 또는 사용자 uid
  authorNickname?: string;     // denormalized
  isOfficial: boolean;         // 운영자 작성 여부
  bookmarkCount: number;       // denormalized
  reportedCount: number;
  isDeleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**인덱스**: `category` + `createdAt` (desc), `isOfficial` + `createdAt` (desc)

**보안 규칙**:
```javascript
match /tips/{tipId} {
  allow read: if !resource.data.isDeleted || request.auth.token.admin == true;
  allow create: if request.auth != null
    && request.resource.data.authorUid == request.auth.uid
    && request.resource.data.content.size() <= 1500
    && request.resource.data.reportedCount == 0;
  allow update: if (request.auth.uid == resource.data.authorUid
    && request.resource.data.authorUid == resource.data.authorUid // author 변경 불가
    && request.resource.data.isOfficial == resource.data.isOfficial)  // isOfficial 사용자 변경 불가
    || request.auth.token.admin == true;
  allow delete: if request.auth.token.admin == true;
}
```

### 2.13 `moderation_logs`

```typescript
interface ModerationLogDoc {
  id: string;
  operatorUid: string;
  action: 'kept' | 'deleted' | 'reset_count' | 'banned_user' | 'warned_user';
  targetType: 'chat_message' | 'tip' | 'user_post' | 'user';
  targetId: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
  expiresAt: Timestamp;        // 30일 보존
}
```

**인덱스**: `operatorUid` + `createdAt` (desc), `targetId` (asc)

**보안 규칙**:
```javascript
match /moderation_logs/{logId} {
  allow read: if request.auth.token.admin == true;
  allow create: if request.auth.token.admin == true;
  allow update, delete: if false;  // immutable audit
}
```

### 2.14 `coupons` (v1 재사용)

v1 design.md §5.2 동일.

### 2.15 `events` (GA4 backup, v1 재사용)

v1 design.md §5.3 + v2 신규 이벤트 3개 추가 (sign_in_success, user_register_complete, tip_create).

---

## 3. Composite Index 정의 (`firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "serverId", "order": "ASCENDING" },
        { "fieldPath": "munpa", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "munpas",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "serverId", "order": "ASCENDING" },
        { "fieldPath": "memberCount", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "chat_reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "resolved", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bookmarks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bookmarks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "targetType", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "wiki_jinryeong",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tier", "order": "ASCENDING" },
        { "fieldPath": "rarity", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "wiki_equipments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "grade", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "wiki_skills",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "classId", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "wiki_contents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 4. Realtime Database 스키마 (채팅 전용)

### 4.1 트리 구조

```
{
  "chat": {
    "messages": {
      "global": {
        "msg_001": { ... },
        "msg_002": { ... }
      },
      "server:S785": { ... },
      "munpa:S785:천상천하": { ... }
    },
    "presence": {
      "global": {
        "{uid}": { "online": true, "lastSeen": timestamp }
      }
    }
  }
}
```

### 4.2 메시지 스키마

```typescript
interface RealtimeChatMessage {
  uid: string;
  nickname: string;            // denormalized
  classId: 'warrior' | 'swordsman' | 'medium';
  serverId: string;            // 채널 검증용
  text: string;                // 최대 500자
  imageUrl?: string;           // Firebase Storage URL (1MB)
  mentions?: string[];         // V1+ @멘션
  createdAt: number;           // Unix timestamp (Realtime DB는 Date X)
  reportedCount: number;
  isDeleted: boolean;
}
```

### 4.3 보안 규칙 (`database.rules.json`)

```json
{
  "rules": {
    "chat": {
      "messages": {
        "$channelId": {
          ".read": "auth != null",
          ".indexOn": ["createdAt"],
          "$messageId": {
            ".write": "auth != null && (
              (!data.exists() && newData.child('uid').val() == auth.uid)
              || (data.exists() && data.child('uid').val() == auth.uid)
              || root.child('admins').child(auth.uid).exists()
            )",
            ".validate": "
              newData.hasChildren(['uid', 'nickname', 'classId', 'serverId', 'text', 'createdAt', 'reportedCount', 'isDeleted'])
              && newData.child('text').isString()
              && newData.child('text').val().length <= 500
              && newData.child('text').val().length > 0
              && newData.child('createdAt').isNumber()
              && newData.child('reportedCount').isNumber()
              && newData.child('isDeleted').isBoolean()
            "
          }
        }
      },
      "presence": {
        "$channelId": {
          "$uid": {
            ".read": "auth != null",
            ".write": "auth.uid == $uid"
          }
        }
      }
    },
    "admins": {
      "$uid": {
        ".read": false,
        ".write": false
      }
    }
  }
}
```

> `admins` 노드는 운영자 콘솔에서 수동 추가. Cloud Function으로 Firebase Auth custom claim과 동기화 가능.

---

## 5. 시드 데이터 작성 책임 (Operator vs AI)

| 컬렉션 | 시드 수 | 작성자 | 예상 시간 |
|--------|--------|--------|---------|
| `wiki_classes` | 3 | 운영자 + AI 보강 | 6h |
| `wiki_jinryeong` | 11 | 운영자 (게임 데이터) | 6h |
| `wiki_equipments` | 30 | 운영자 (게임 데이터) | 8h |
| `wiki_skills` | 15 | 운영자 (게임 데이터) | 5h |
| `wiki_contents` | 20 | 운영자 (게임 데이터) | 5h |
| `tips` (운영자) | 20 | 운영자 (12주 노하우) | 4h |
| `coupons` | 6 (재사용) | (v1 기존) | — |
| `chat_channels` | (global 1) | 자동 (Server Action) | 0 |
| `servers`, `munpas` | (자동 upsert) | 자동 (사용자 등록 시) | 0 |
| **합계** | **~85 entity** | | **34h** |

---

## 6. 마이그레이션 / 시드 도구

### 6.1 운영자 시드 도구 (`/admin/seed`)
- MVP는 Firestore Console + 수기 JSON 입력
- V1+ admin UI에서 위키 entity CRUD 직접 가능

### 6.2 자동 시드 스크립트 (선택)
```bash
# scripts/seed-wiki.ts
pnpm tsx scripts/seed-wiki.ts --collection=wiki_classes --file=./seeds/classes.json
```
운영자가 작성한 JSON을 Firestore에 일괄 업로드.

---

## 7. 데이터 일관성 + denormalization 전략

| 필드 | 출처 | 갱신 시점 |
|------|------|---------|
| `users.bookmarkIds` | bookmarks 컬렉션 | bookmark 추가/제거 시 array union/remove |
| `users.warningCount` | moderation_logs | 운영자 액션 시 increment |
| `chat_channels.lastMessageAt` | Realtime DB | Server Action에서 메시지 전송 시 Firestore 갱신 |
| `tips.bookmarkCount` | bookmarks | 북마크 추가/제거 시 increment/decrement |
| `chat_messages.nickname/classId` (RT DB) | users | 사용자 메시지 전송 시 latest 캐싱 |
| `servers.userCount` | users | 사용자 등록 시 increment |
| `servers.munpaCount` | munpas | 문파 신규 등록 시 increment |
| `munpas.memberCount` | users | 사용자 문파 변경 시 ±1 |

**Cloud Function 활용** (V1+):
- `onCreate(users)` → `servers.userCount++`, `munpas.memberCount++`
- `onDelete(users)` → counters 감소

**MVP**: Server Action에서 트랜잭션으로 처리.

---

> **다음 산출물**: `auth-flow.md`, `design-tokens-v2.json`, `component-inventory-v2.md`
