# Firestore 보안 규칙 v1 (MVP)

> 작성일: 2026-05-15 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/02-sprint-mvp/design.md` §5 Firestore 스키마 + §5.2 / §5.3 보안 규칙
> 적용 대상: Firebase 프로젝트 `god-kkabi-guide` (Spark Plan)
> 규칙 파일 위치: `firestore.rules` (프로젝트 루트)

---

## 1. 보안 원칙 (MVP v1)

| 원칙 | 내용 |
|------|------|
| **Public Read** | `coupons` 컬렉션은 누구나 읽기 가능 (익명 사용자 포함) |
| **Admin Write Only** | 모든 write 작업은 Firebase Admin Custom Claim `admin == true` 보유자만 |
| **Anonymous Event Write** | `events` 컬렉션은 create만 허용, update/delete 불가 (immutable) |
| **V1+ 비활성 컬렉션 차단** | `users`, `builds`(UGC), `tier_votes`, `pain_topics`는 MVP에서 외부 접근 차단 |

---

## 2. firestore.rules 전체 (v1.0)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─────────────────────────────────────────────
    // 헬퍼 함수
    // ─────────────────────────────────────────────

    /** Firebase Admin Custom Claim 검증 */
    function isAdmin() {
      return request.auth != null
          && request.auth.token.admin == true;
    }

    /** 요청 데이터 크기 제한 (이벤트 write 남용 방지) */
    function isReasonableSize() {
      return request.resource.data.keys().size() < 20;
    }

    /** 유효한 GA4 이벤트 이름인지 검증 */
    function isValidEventName() {
      return request.resource.data.event_name in [
        'coupon_copy',
        'class_diagnose_complete',
        'meta_build_view'
      ];
    }

    // ─────────────────────────────────────────────
    // coupons 컬렉션 (MVP 활성)
    // ─────────────────────────────────────────────
    // - 공개 read (쿠폰 체커 페이지 / Firestore ISR 캐싱)
    // - write는 admin만 (운영자 직접 Firestore 콘솔 또는 Admin SDK)
    // ─────────────────────────────────────────────
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ─────────────────────────────────────────────
    // events 컬렉션 (MVP 활성 — GA4 핵심 3개 이벤트 Firestore 백업)
    // ─────────────────────────────────────────────
    // - read는 admin만 (대시보드 분석용)
    // - create는 누구나 (익명 write) — 단, 이벤트 이름 검증 + 크기 제한
    // - update / delete는 불가 (immutable 이벤트 로그)
    // ─────────────────────────────────────────────
    match /events/{eventId} {
      allow read: if isAdmin();
      allow create: if isReasonableSize()
                    && isValidEventName()
                    && request.resource.data.timestamp is timestamp
                    && request.resource.data.page is string;
      allow update: if false;
      allow delete: if false;
    }

    // ─────────────────────────────────────────────
    // builds 컬렉션 (MVP 부분활성 — admin-seed 1건만)
    // ─────────────────────────────────────────────
    // - is_public == true인 빌드는 공개 read
    // - write는 admin만 (MVP에서는 운영자 수기 빌드 1건)
    // - V1 UGC 활성화 시: authenticated user create 허용으로 확장
    // ─────────────────────────────────────────────
    match /builds/{buildId} {
      allow read: if resource.data.is_public == true
                  || isAdmin();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // ─────────────────────────────────────────────
    // users 컬렉션 (V1+ 활성 예정 — MVP는 완전 차단)
    // ─────────────────────────────────────────────
    match /users/{userId} {
      allow read: if isAdmin();
      allow write: if false;
      // V1 활성화 시:
      // allow read: if request.auth != null && request.auth.uid == userId;
      // allow create: if request.auth != null && request.auth.uid == userId;
      // allow update: if request.auth != null && request.auth.uid == userId;
    }

    // ─────────────────────────────────────────────
    // tier_votes 컬렉션 (V1+ 활성 예정 — MVP는 완전 차단)
    // ─────────────────────────────────────────────
    match /tier_votes/{voteId} {
      allow read: if isAdmin();
      allow write: if false;
    }

    // ─────────────────────────────────────────────
    // pain_topics 컬렉션 (V2+ 활성 예정 — MVP는 완전 차단)
    // ─────────────────────────────────────────────
    match /pain_topics/{topicId} {
      allow read: if isAdmin();
      allow write: if false;
    }

    // ─────────────────────────────────────────────
    // 미정의 컬렉션 전체 차단 (화이트리스트 방식)
    // ─────────────────────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 3. 보안 규칙 상세 해설

### 3.1 isAdmin() 함수

Firebase Admin SDK를 사용해 운영자 계정에 Custom Claim `admin: true`를 부여해야 한다. 이 Claim은 JWT 토큰에 포함되어 보안 규칙에서 `request.auth.token.admin`으로 접근 가능하다.

```bash
# Firebase Admin SDK로 custom claim 부여 (V1+ 시점, MVP는 Firestore 콘솔 직접 편집)
# Node.js 스크립트 예시 (lib/scripts/set-admin-claim.ts)
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const auth = getAuth();
await auth.setCustomUserClaims('운영자_uid', { admin: true });
```

> **MVP 단계**: Firebase Admin SDK가 없으므로 Firestore 콘솔(https://console.firebase.google.com)에서 운영자가 직접 데이터를 입력한다. `coupons` 컬렉션 초기 데이터 10건은 Phase 3 do.D T-060에서 콘솔 직접 입력.

### 3.2 events 컬렉션 create 규칙 상세

```javascript
allow create: if isReasonableSize()        // 필드 수 < 20 (남용 방지)
              && isValidEventName()        // 허용 이벤트 이름 3개만
              && request.resource.data.timestamp is timestamp  // 타임스탬프 타입 검증
              && request.resource.data.page is string;         // page 필드 필수
```

**허용 이벤트 이름 3개** (design.md §5.3 비용 절감 전략 일치):
- `coupon_copy` — 쿠폰 클릭 복사
- `class_diagnose_complete` — 직업 진단 완료
- `meta_build_view` — 메타 빌드 페이지 진입

나머지 9개 GA4 이벤트는 GA4만 기록 (Firestore 백업 없음).

### 3.3 builds 공개 read 조건

```javascript
allow read: if resource.data.is_public == true || isAdmin();
```

- `is_public == true`인 빌드만 외부 공개
- MVP admin-seed 빌드 1건은 `is_public: true`로 설정
- V1 UGC 빌드는 기본 `is_public: false` → 운영자 검수 후 true로 변경

---

## 4. Firestore 인덱스 정의 (firestore.indexes.json)

```json
{
  "indexes": [
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status",      "order": "ASCENDING"  },
        { "fieldPath": "expires_at",  "order": "ASCENDING"  }
      ]
    },
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status",             "order": "ASCENDING" },
        { "fieldPath": "last_verified_at",   "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "event_name", "order": "ASCENDING"  },
        { "fieldPath": "timestamp",  "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "page",      "order": "ASCENDING"  },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "referrer_source", "order": "ASCENDING"  },
        { "fieldPath": "timestamp",       "order": "DESCENDING" }
      ]
    },
    {
      "_comment": "builds 인덱스 — MVP는 admin-seed 1건만 (인덱스 없이 동작), V1 UGC 활성 시 필요",
      "collectionGroup": "builds",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tags",        "arrayConfig": "CONTAINS" },
        { "fieldPath": "likes_count", "order": "DESCENDING"     }
      ]
    },
    {
      "collectionGroup": "builds",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "class",      "order": "ASCENDING"     },
        { "fieldPath": "tags",       "arrayConfig": "CONTAINS" },
        { "fieldPath": "created_at", "order": "DESCENDING"    }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 5. 배포 방법

### 5.1 Firebase CLI 배포 (V1+ CI/CD)

```bash
# firebase.json (프로젝트 루트)
# {
#   "firestore": {
#     "rules": "firestore.rules",
#     "indexes": "firestore.indexes.json"
#   }
# }

# 배포 (운영자 Firebase 로그인 후)
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# 또는 동시 배포
firebase deploy --only firestore
```

### 5.2 MVP 단계 (콘솔 직접 배포)

V1+ CI/CD 도입 전 MVP 단계에서는 Firebase 콘솔에서 직접 붙여넣기:
```
Firebase 콘솔 → Firestore Database → Rules 탭 → 위 규칙 붙여넣기 → 게시
```

---

## 6. V1+ 규칙 확장 계획

| V1 변경사항 | 규칙 변경 |
|-----------|---------|
| Firebase Auth 도입 (Google/Kakao) | `users/{userId}` — `request.auth.uid == userId` 조건으로 자기 데이터 CRUD 허용 |
| UGC 빌드 작성 (인증 사용자) | `builds/{buildId}` create — `request.auth != null` 조건 추가 |
| 빌드 좋아요/북마크 | `builds/{buildId}` update — `likes_count`/`bookmarks_count` 필드 increment 허용 (제한적 update) |
| Pain Topics raw 수집 | `pain_topics/{topicId}` create — 인증 사용자만 허용 + 동의 필드 검증 |

```javascript
// V1 builds 확장 예시 (참고용)
match /builds/{buildId} {
  allow read: if resource.data.is_public == true || isAdmin();
  allow create: if request.auth != null
                && request.resource.data.uid == request.auth.uid
                && request.resource.data.is_public == false;  // 기본 비공개
  allow update: if isAdmin()
                || (request.auth != null
                    && resource.data.uid == request.auth.uid
                    && !('is_public' in request.resource.data.diff(resource.data).affectedKeys()));
  allow delete: if isAdmin();
}
```

---

## 7. 보안 규칙 테스트 (V1+ 도입)

Firebase Emulator Suite로 보안 규칙을 자동 테스트한다.

```typescript
// firestore.rules.test.ts (V1+ 시점 추가)
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

const testEnv = await initializeTestEnvironment({
  projectId: 'god-kkabi-guide',
  firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
});

// 공개 read 테스트
test('쿠폰 공개 read — 익명 사용자도 가능', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(db.collection('coupons').get());
});

// admin write 테스트
test('쿠폰 write — 비admin 차단', async () => {
  const db = testEnv.authenticatedContext('user123').firestore();
  await assertFails(
    db.collection('coupons').doc('test').set({ code: 'HACK' }),
  );
});

// events create 테스트
test('events create — 유효한 이벤트 이름만 허용', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(
    db.collection('events').add({
      event_name: 'coupon_copy',
      page: '/coupon',
      timestamp: new Date(),
    }),
  );
  await assertFails(
    db.collection('events').add({
      event_name: 'invalid_event',  // 허용되지 않은 이벤트 이름
      page: '/coupon',
      timestamp: new Date(),
    }),
  );
});
```

---

> **Status**: v1.0 — Phase 3 do.D T-060 쿠폰 초기 데이터 시드 전에 Firebase 콘솔에 배포 필요.
> **연관 문서**: `design.md` §5 Firestore 스키마, `plan.md` T-017 (Phase 2 design 산출물)
> **운영자 직접 배포 필요**: Firebase 콘솔 로그인 → Firestore Rules 탭 → 붙여넣기 → 게시
