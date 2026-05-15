# Phase 6 QA Report — Sprint MVP v2

> **생성일**: 2026-05-16
> **단계**: P6 QA (PDCA — 정적 E2E + GA4 + 7-Layer dataFlowIntegrity)
> **트러스트 레벨**: L4 Aggressive (자동)
> **운영자 게이트 제약**: RTDB/Storage 활성화 + role=admin claim 부여 + Vercel env 14건 + 도메인 G4 미완 → 라이브 E2E 보류, **정적 검증** + production deploy 후 재검증 게이트로 이관

---

## 0. Executive Summary

| 검증 | 결과 |
|---|---|
| **GA4 17 이벤트 인벤토리** | 12 정의 → **17 정의 + 11 활성** (8 v2 신규 + 5 v1 활성) |
| **7-Layer dataFlowIntegrity** | 4 feature (Auth / Chat / Bookmark / Wiki) 모두 7-hop 통합 검증 PASS |
| **E2E 5 시나리오 정적** | S1-S5 코드 경로 추적 + 보안 가드 + 트랜잭션 무결성 검증 PASS |
| **운영자 게이트 라이브 E2E** | P8 archive 전 production deploy 후 재실행 (게이트 명시) |

---

## 1. GA4 17 이벤트 인벤토리 — P6.1

### 1.1 PRD 명세 vs 구현 매트릭스

| # | 이벤트 | 카테고리 | PRD | types/ga4.ts | 호출부 | 상태 |
|---|---|---|---|---|---|---|
| 1 | `page_view` | v1 자동 | ✅ | ✅ | Firebase Analytics 자동 | ✅ ACTIVE |
| 2 | `coupon_copy` | v1 (v2 폐기) | ✅ | ✅ (호환) | — | ℹ️ STUB (v2 폐기 호환) |
| 3 | `class_diagnose_complete` | v1 carry-over | ✅ | ✅ | `components/feature/class-quiz.tsx:230` | ✅ ACTIVE |
| 4 | `meta_build_view` | v1 carry-over | ✅ | ✅ | (V1 빌드 페이지에서 활성) | ℹ️ STUB |
| 5 | `jinryeong_card_click` | v1 carry-over | ✅ | ✅ | (정적 페이지 — V1 활성) | ℹ️ STUB |
| 6 | `tier_view` | v1 carry-over | ✅ | ✅ | (V1 활성) | ℹ️ STUB |
| 7 | `external_link_click` | v1 carry-over | ✅ | ✅ | `components/feature/external-link.tsx:26` | ✅ ACTIVE |
| 8 | `scroll_depth_75` | v1 carry-over | ✅ | ✅ | `components/feature/page-engagement-tracker.tsx:46` | ✅ ACTIVE |
| 9 | `dwell_60` | v1 carry-over | ✅ | ✅ | `components/feature/page-engagement-tracker.tsx:70` | ✅ ACTIVE |
| **10** | **`login`** | **v2 신규** | ✅ | ✅ (P6.1 추가) | (V1 NextAuth callback page 트래커 추가 예정) | ⚠️ STUB |
| **11** | **`register_complete`** | **v2 신규** | ✅ | ✅ (P6.1 추가) | `components/feature/register-form.tsx:93` | ✅ ACTIVE |
| **12** | **`chat_send`** | **v2 신규** | ✅ | ✅ (P6.1 추가) | `components/feature/chat-input.tsx:handleSubmit` | ✅ ACTIVE |
| **13** | **`chat_image_upload`** | **v2 신규** | ✅ | ✅ (P6.1 추가) | `components/feature/chat-input.tsx:handleFile` | ✅ ACTIVE |
| **14** | **`chat_report`** | **v2 신규** | ✅ | ✅ (P6.1 추가) | `components/feature/chat-report-dialog.tsx:handleSubmit` | ✅ ACTIVE |
| **15** | **`bookmark_add`** | **v2 신규** | ✅ | ✅ (P6.1 추가) | `components/feature/bookmark-button.tsx:handleClick` | ✅ ACTIVE |
| **16** | **`bookmark_remove`** | **v2 신규** | ✅ | ✅ (P6.1 추가) | `components/feature/bookmark-button.tsx:handleClick` | ✅ ACTIVE |
| **17** | **`wiki_card_click`** | **v2 신규** | ✅ | ✅ (P6.1 추가) | (V1 위키 카드 hover/click 트래커 추가 예정) | ⚠️ STUB |
| 18 | `build_create` | V1+ stub | — | ✅ | (V1) | ℹ️ STUB |
| 19 | `build_like` | V1+ stub | — | ✅ | (V1) | ℹ️ STUB |
| 20 | `signup` | v1 호환 | — | ✅ | (v1 호환, v2부터 register_complete 사용) | ℹ️ STUB |

### 1.2 종합

- **목표 17 이벤트**: ✅ types/ga4.ts에 전부 정의 (v1 9 + v2 8)
- **현재 활성 11개** (v1 carry-over 5 + v2 신규 6):
  - v1 active: page_view / class_diagnose_complete / external_link_click / scroll_depth_75 / dwell_60
  - v2 active: register_complete / chat_send / chat_image_upload / chat_report / bookmark_add / bookmark_remove
- **STUB 2개** (V1 게이트 진입 시 활성):
  - `login` (NextAuth signIn 후 client-side 발화 — V1 활성화 가이드 명시)
  - `wiki_card_click` (위키 카드 hover/click 트래커 — V1 활성화 가이드 명시)

### 1.3 GA4 primitive 제약 처리

`logEvent(params)` 시그너처가 `Record<string, string | number | boolean | null>` 제약. 배열 파라미터(`chat_report.reasons`)는 **comma-join 문자열**로 직렬화:
```ts
void logEvent('chat_report', {
  channel_kind: channelKindOf(channelId),
  reasons: Array.from(reasons).join(','), // ReportReason[] → "spam,abusive"
  auto_hidden: result.autoHidden,
});
```

---

## 2. 7-Layer dataFlowIntegrity 매트릭스 — P6.2

> 각 feature의 데이터가 7 hop (UI → Client → API → Validation → DB → Response → Client → UI)을 통과하는 무결성 검증.

### 2.1 Auth Feature — 등록 폼 → users/servers/munpas 4-table 트랜잭션

| Hop | 위치 | 가드 / 변환 |
|---|---|---|
| 1. UI Form | `components/feature/register-form.tsx` | react-hook-form + zodResolver |
| 2. Client Validation | `lib/auth/register-schema.ts` | Zod `RegisterFormSchema` 5필드 + PIPA 4 동의 |
| 3. Server Action API | `lib/auth/register.ts:registerUser` | `'use server'` + `'server-only'` + `auth()` 세션 가드 |
| 4. Server Validation | `register.ts:53` | `safeParse` 재검증 (client tampering 방어) |
| 5. DB Transaction | `register.ts:111-233` | `db.runTransaction`: READS 5건 병렬 → unique 검증 → WRITES 5건 (users/servers/munpas/server-channel/munpa-channel) + `FieldValue.increment` |
| 6. Custom Claims | `register.ts:236` | `setUserClaims(uid, { role: 'user', registered: true })` |
| 7. Response → UI | `register-form.tsx:93` | `result.ok` → `router.push('/')` + `router.refresh()` + `logEvent('register_complete')` |

**일관성**: ✅ PASS — `ALREADY_REGISTERED` throw → catch에서 `{ ok: true }` 우회 (멱등 처리).

### 2.2 Chat Feature — 메시지 전송 → RTDB → 구독자 실시간 수신

| Hop | 위치 | 가드 / 변환 |
|---|---|---|
| 1. UI Input | `components/feature/chat-input.tsx` | 500자 제한 + 이미지 첨부 (1MB 자동 압축) |
| 2. Client Validation | `chat-input.tsx:67-76` | `trim()` + `containsBadWord` toast 안내 |
| 3. Client SDK Push | `lib/chat/send-message.ts:sendChatMessage` | `push(messagesRef, { ...payload, createdAt: serverTimestamp() })` |
| 4. RTDB Rules | `database.rules.json:9` | `auth != null && auth.token.role != 'banned' && auth.token.registered == true && newData.child('authorUid').val() == auth.uid` |
| 5. Storage Persist | RTDB `chat/messages/{channelId}/{messageId}` | serverTimestamp() ms 정렬 키 |
| 6. Realtime Subscription | `lib/chat/use-channel.ts:onChildAdded` | `limitToLast(50)` + 중복 ID 가드 |
| 7. UI Render | `components/feature/chat-channel.tsx:role="log" aria-live="polite"` | 스크린리더 announce + hidden 필터 + admin keptByOperator 우회 |

**일관성**: ✅ PASS — 마스킹 (`maskBadWords`) 클라이언트 사전 + 서버 RTDB rules 가드 이중. `serverTimestamp()` 사용으로 클라이언트 시각 신뢰 안 함.

### 2.3 Bookmark Feature — 토글 → users.bookmarkCount denormalize

| Hop | 위치 | 가드 / 변환 |
|---|---|---|
| 1. UI Toggle | `components/feature/bookmark-button.tsx` | `aria-pressed` + `useOptimistic` 낙관적 업데이트 |
| 2. Client Action | `bookmark-button.tsx:handleClick` | `canBookmark` guard (미등록 시 `/login` toast) |
| 3. Server Action | `lib/bookmark/actions.ts:addBookmark / removeBookmark` | `auth()` + `registered` + `hasAdminCredentials` 가드 |
| 4. DB Transaction (Add) | `actions.ts:71-99` | READS: `tx.get(userRef)` + `tx.get(itemsRef.doc(docId))` 병렬 → currentCount + isNew 결정 → `LIMIT_EXCEEDED` throw or write |
| 5. DB Transaction (Remove) | `actions.ts:remove` | `tx.get(bookmarkRef)` → exists 시 delete + `FieldValue.increment(-1)` (멱등) |
| 6. Cache Revalidation | `revalidatePath('/me/bookmarks') + revalidatePath(href)` | Next.js 16 cache invalidation |
| 7. UI Toast + GA4 | `bookmark-button.tsx:78-82` | 성공/실패 toast + `logEvent('bookmark_add' / 'bookmark_remove')` |

**일관성**: ✅ PASS — 200건 한도 + 멱등 처리 + `users.bookmarkCount` denormalize (M4 해소).

### 2.4 Wiki Feature — Server Component → Firestore + seed fallback

| Hop | 위치 | 가드 / 변환 |
|---|---|---|
| 1. UI Route | `app/{class,jinryeong,skill,equipment,content,munpa,tips}/page.tsx` | Server Component, async function |
| 2. Adapter | `lib/wiki/{classes,jinryeong,skill,content,equipment}-adapter.ts` | `listWikiClasses()` 등 |
| 3. Firestore Read | `db.collection('wiki_classes').orderBy(...).get()` | Admin SDK (Server Component) |
| 4. Fallback | adapter `catch (err) { return seedClasses; }` | Firestore 미설정 / 빈 컬렉션 시 `data/wiki/classes.ts` 시드 사용 |
| 5. Type Conversion | adapter `data() as WikiClassDoc` → `Omit<WikiClassDoc, 'updatedAt'>` | exactOptionalPropertyTypes 조건부 spread |
| 6. Render | `components/domain/{class,jinryeong,content,equipment,skill,munpa,tip}-card.tsx` | 도메인 컴포넌트 + bookmarkSlot (BookmarkButton 주입) |
| 7. Client Hydration | `components/feature/bookmark-button.tsx` | initialBookmarked + useOptimistic |

**일관성**: ✅ PASS — Firestore fallback이 빈 컬렉션 / Admin SDK 미설정 양쪽 모두 처리. 102 시드 항목으로 동작 보장.

---

## 3. E2E 5 시나리오 정적 검증 — P6.3

> 운영자 게이트 (RTDB/Storage 활성화 + role=admin claim + Vercel env 14건 + 도메인 G4) 통과 전이므로 라이브 E2E 보류. 코드 경로 + 보안 가드 + 트랜잭션 무결성 정적 검증.

### S1: Google OAuth → 등록 폼 → 위키 진입

| Step | 위치 | 검증 |
|---|---|---|
| 1. `/login` 페이지 진입 | `app/login/page.tsx` | metadata noindex + AuthButtons |
| 2. Google OAuth | `lib/auth/config.ts` Google provider | callbacks.signIn → banned 체크 |
| 3. NextAuth Adapter | `lib/auth/auth.ts` `FirestoreAdapter` (lazy) | `users` 컬렉션 생성 |
| 4. `/register` redirect | proxy.ts (Edge) | `!session.user.registered` → /register |
| 5. RegisterForm 제출 | `lib/auth/register.ts:registerUser` | 4-table 트랜잭션 + claims |
| 6. `/` 진입 | `router.push('/') + router.refresh()` | TopBar UserMenu + ChatWidget mount (loader) |
| 7. GA4 | `logEvent('register_complete', {...})` | ✅ |

**라이브 게이트 항목**: Google OAuth client ID/secret (Vercel env) + Firebase Auth provider 활성화

### S2: Kakao OAuth → Custom Token bridge → 등록 폼

| Step | 위치 | 검증 |
|---|---|---|
| 1. Kakao OAuth | `lib/auth/config.ts` Kakao provider | access_token JWT 저장 |
| 2. JWT callback | `config.ts:151` `token.accessToken = account.access_token` | (m4 cast 제거됨) |
| 3. Custom Token 교환 | `app/api/auth/kakao-exchange/route.ts` | kapi.kakao.com → Firebase Custom Token |
| 4. `/register` flow | S1과 동일 | 4-table 트랜잭션 |

**라이브 게이트 항목**: Kakao REST API key (Vercel env) + Firebase Auth Custom Token

### S3: 채팅 전체 채널 메시지 송수신 + 마스킹

| Step | 위치 | 검증 |
|---|---|---|
| 1. ChatWidget mount | `chat-widget-loader.tsx` dynamic ssr:false | bundle lazy load |
| 2. 전체 탭 select | `chat-widget.tsx:Tabs value="global"` | channelId='global' |
| 3. 입력 욕설 감지 | `chat-input.tsx:containsBadWord` | toast 안내 + masking |
| 4. sendChatMessage | RTDB push + serverTimestamp | RTDB rules registered=true claim |
| 5. useChannel onChildAdded | 다른 사용자 클라이언트 즉시 반영 | `aria-live="polite"` announce |
| 6. GA4 | `logEvent('chat_send', { channel_kind: 'global', has_image: false, masked_count: 1 })` | ✅ |

**라이브 게이트 항목**: RTDB 활성화 + database.rules.json deploy + Firebase Custom Token bridge

### S4: 북마크 토글 (직업 카드)

| Step | 위치 | 검증 |
|---|---|---|
| 1. `/class` 진입 | Server Component → `listWikiClasses()` | seed fallback 보장 |
| 2. 카드 + BookmarkButton slot | `app/class/page.tsx:bookmarkSlot={...}` | C1 slot 패턴 |
| 3. 토글 (낙관적) | `bookmark-button.tsx:useOptimistic` | aria-pressed 토글 |
| 4. addBookmark 트랜잭션 | `actions.ts` (M4 denormalize) | bookmarkCount++ + items.add |
| 5. revalidatePath | `/me/bookmarks` 캐시 무효화 | |
| 6. GA4 | `logEvent('bookmark_add', { target_type: 'class', target_id })` | ✅ |
| 7. 200건 한도 | `LIMIT_EXCEEDED` 토스트 | ✅ |

### S5: 채팅 신고 3건 누적 자동 hidden + admin 처리

| Step | 위치 | 검증 |
|---|---|---|
| 1. 다른 사용자 메시지 우클릭 / 신고 버튼 | `chat-message.tsx:Flag` | aria-label="이 메시지 신고하기" |
| 2. ChatReportDialog | `chat-report-dialog.tsx` Tabs reason 선택 | 6 reasons (ReportReason) |
| 3. reportChatMessage Server Action | `report-action.ts` | 4 가드 + reportId 중복 차단 |
| 4. 트랜잭션 | `chat_reports` + `chat_report_counts.count` increment | 3건 누적 시 `autoHidden=true` |
| 5. RTDB hidden mark | `getAdminDatabase().ref().update({ hidden: true })` | 일반 사용자 클라이언트 필터링 |
| 6. /admin 콘솔 | `admin-moderation-table.tsx` listPendingReports | 신고된 메시지 + 이미지 (next/image) |
| 7. resolveReport | `lib/moderation/actions.ts` | kept_by_operator / deleted + audit `moderation_logs` |
| 8. GA4 | `logEvent('chat_report', { channel_kind, reasons: 'spam,abusive', auto_hidden: true })` | ✅ |

**라이브 게이트 항목**: role=admin custom claim 부여 + admin 사용자 1명 (kay@agentkay.it) Firebase Console에서 직접 설정

---

## 4. Quality Gates 최종 상태

| Gate | P5 | P6 | 비고 |
|---|---|---|---|
| M0 Plan | ✅ | ✅ | PRD + Design + Plan |
| M1 Architecture | ✅ | ✅ | Critical 0 |
| M2 Security | ✅ | ✅ | rules registered claim |
| M3 Design Tokens | ✅ | ✅ | WCAG AA |
| M4 Type Safety | ✅ | ✅ | any 0 |
| M5 Build | ✅ | ✅ | 18 routes |
| M7 Accessibility | ✅ | ✅ | 96-100 |
| M8 Match Rate | ✅ | ✅ | 96% |
| M9 Performance Desktop | ✅ | ✅ | 89 |
| M9 Performance Mobile | ⚠️ V1 게이트 | ⚠️ V1 게이트 | Pretendard subset 필요 |
| M10 Code Quality | ✅ | ✅ | 89+ |
| **GA4 17 이벤트** | — | ✅ 17 정의 + 11 활성 | login/wiki_card_click V1 stub |
| **7-Layer dataFlowIntegrity** | — | ✅ 4 feature PASS | |
| **E2E 5 시나리오** | — | ✅ 정적 PASS | 라이브 = 운영자 게이트 후 |

---

## 5. 운영자 게이트 (Operator Gates) — 라이브 E2E 사전 작업

P8 archive 이전, production deploy 후 라이브 E2E 5 시나리오 재실행을 위해 운영자 (kay@agentkay.it)가 수행해야 할 작업:

1. **Firebase Console** (https://console.firebase.google.com):
   - RTDB 활성화 (asia-southeast1 또는 asia-northeast3)
   - Storage 활성화 + storage.rules deploy
   - Firestore 활성화 + firestore.rules + firestore.indexes.json deploy
   - Authentication → Google + Kakao (Custom Token) provider 활성화
   - kay@agentkay.it 사용자 가입 후 Firebase Admin SDK로 `setCustomUserClaims(uid, { role: 'admin' })` 직접 실행 (또는 1회용 스크립트)

2. **Vercel** (Project Settings):
   - 도메인 G4 결정 (god-kkabi-guide.vercel.app 또는 커스텀)
   - env 14건 입력 (NEXTAUTH_URL / AUTH_SECRET / Google OAuth / Kakao REST / Firebase project + service account + RTDB URL / Storage bucket / NEXT_PUBLIC_FIREBASE_* 4건)
   - 첫 production deploy
   - robots.txt index:true 활성화 (필요 시)

3. **Lighthouse Production 재측정** (Mobile):
   - real-world 네트워크 (LTE/5G) → Performance ≥85 게이트 통과 예상
   - LCP / CLS / INP Web Vitals 데이터 수집 시작
   - 미달 시 Pretendard subset 작업 V1 진입

4. **GA4 + GTM**:
   - GA4 측정 ID (`G-PBS54YVK5F`) DebugView 검증 — 11 활성 이벤트 발화 확인
   - V1 게이트: login + wiki_card_click 트래커 코드 추가

---

## 6. P6 종합 판정

- **GA4**: 17 이벤트 정의 + 11 활성 ✅
- **7-Layer**: 4 feature 모두 PASS ✅
- **E2E 정적**: S1-S5 5 시나리오 모두 PASS ✅
- **라이브 E2E**: 운영자 게이트 후 production deploy 검증으로 이관 (P8 archive 직전 게이트)

### 결정

> **다음 단계**: **P7 Report → Sprint v2 완료 보고서 + KPI 추적 시작 + V1 인풋 정리** 진입.
> 라이브 E2E + Lighthouse Mobile 재측정은 P8 archive 직전 운영자 게이트 사전 작업 후 자동 재실행.

---

**Sprint MVP v2 Phase 6 QA 종료** — 2026-05-16

Reporter: Claude (CTO Lead, L4 Aggressive)
Operator: kay@agentkay.it
