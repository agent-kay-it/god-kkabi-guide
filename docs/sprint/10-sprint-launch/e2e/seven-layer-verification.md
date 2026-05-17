# Sprint 10 — 7-Layer DataFlow Integrity Verification

**Generated**: 2026-05-17 KST
**Sprint**: 10-launch
**Reference**: docs/sprint/10-sprint-launch/design.md §1.1 (Clean Architecture) + bkit 7-Layer methodology

---

## 7-Layer 모델

```
[1 UI]  →  [2 Client]  →  [3 API]  →  [4 Validation]  →  [5 DB]
                                                            ↓
[8 UI rendered]  ←  [7 Client]  ←  [6 Response]  ←  ─────────┘
```

| Layer | 책임 | 검증 도구 |
|---|---|---|
| 1. UI | React component render | Component test + manual |
| 2. Client | React state + hook + fetch / Server Action call | Vitest + browser DevTools |
| 3. API | Route handler / Server Action 진입 | Vitest integration + Vercel logs |
| 4. Validation | Zod schema + business rule | Vitest unit (lib/*) |
| 5. DB | Firestore / RTDB / Storage 쓰기 | Firebase console + rules unit test |
| 6. Response | DB result → typed return | Server Action return type |
| 7. Client (return) | revalidatePath / state update | React DevTools |
| 8. UI (rendered) | 새 상태 화면 갱신 | Manual + visual diff |

---

## 검증 대상 시나리오 (5개)

본 보고서는 Sprint 10에서 도입된 5개 핵심 flow를 7-Layer 각각으로 분해해 검증한다.

### 시나리오 ① Google sign-in (Phase B)

| Layer | 단계 | 위치 / 검증 | 결과 |
|---|---|---|---|
| 1 UI | `<TopBar>` 로그인 버튼 클릭 | `components/feature/top-bar.tsx` | ✅ |
| 2 Client | `signIn('google')` → NextAuth | `lib/auth/auth.ts` clientSide | ✅ |
| 3 API | `/api/auth/signin/google` → Google OAuth | NextAuth Route Handler | ✅ |
| 4 Validation | GoogleProfile schema + jwt callback | `lib/auth/auth.ts` jwt callback | ✅ |
| 5 DB | FirestoreAdapter users/accounts upsert | Firestore | ✅ |
| 6 Response | session JWT + HttpOnly cookie | NextAuth session callback | ✅ |
| 7 Client | router.refresh() → session 갱신 | NextAuth callback URL | ✅ |
| 8 UI | TopBar 사용자 메뉴 표시 + redirect /me | E2E: kay@agentkay.it OK | ✅ |

**Latency**: ~2.5s (Google consent 포함). 8 layer 모두 PASS.

---

### 시나리오 ② 게시글 작성 + YouTube 임베드 (Phase D)

| Layer | 단계 | 위치 / 검증 | 결과 |
|---|---|---|---|
| 1 UI | `app/post/new/page.tsx` 폼 입력 + URL paste | post-form | ✅ |
| 2 Client | `<UrlPreviewInline>` URL 감지 → debounce | components/feature/post/url-preview-inline.tsx | ✅ |
| 3 API | `/api/og-preview?url=...` GET | app/api/og-preview/route.ts | ✅ |
| 4 Validation | SSRF guard (DNS rebinding + private IP block) | lib/post/ssrf-guard.ts (25 tests) | ✅ |
| 5 DB | OG cache lookup (firestore_og_cache) → fetch → cache write | lib/post/og-preview.ts | ✅ |
| 6 Response | OgMeta typed return (title/desc/image) | typed | ✅ |
| 7 Client | preview 렌더 + Server Action `createPost` | lib/post/actions.ts | ✅ |
| 8 UI | redirect /post/[id] → markdown render with <youtube-embed> placeholder | components/domain/markdown-view + rehype-youtube-embed | ✅ |

**Tests**: 91 / 91. 8 layer 모두 PASS.

---

### 시나리오 ③ 채팅 메시지 전송 + rate-limit (Phase E)

| Layer | 단계 | 위치 / 검증 | 결과 |
|---|---|---|---|
| 1 UI | `<MessageComposer>` 입력 + Enter | components/feature/chat/message-composer.tsx | ✅ |
| 2 Client | `useChatRateLimit` 5/10s burst check (1차 방어) | hooks/use-chat-rate-limit.ts (5 tests) | ✅ |
| 3 API | `sendMessage` Server Action 호출 | lib/chat/send-message.ts | ✅ |
| 4 Validation | content ≤ 500자 + maskBadWords + channelId 매칭 | lib/chat/masking + channel-permission | ✅ |
| 5 DB | Firestore rate-limit counter atomic increment (2차 방어) + RTDB push | lib/chat/rate-limit.ts + send-message.ts | ✅ |
| 6 Response | RTDB messageId + Phase D OG preview (linkPreview write) | RTDB onChildAdded broadcast | ✅ |
| 7 Client | `useChannel` onChildAdded → 새 메시지 state push | lib/chat/use-channel.ts | ✅ |
| 8 UI | `<MessageList>` 자동 스크롤 + `<MessageItem>` 렌더 (3 variants) | components/feature/chat/message-list | ✅ |

**Tests**: 68 (Phase E). RTDB rules (3차 방어) 단위 테스트 — bypass 시도 7가지 모두 거부.

8 layer 모두 PASS.

---

### 시나리오 ④ 채팅 메시지 신고 → admin 처리 (Phase E)

| Layer | 단계 | 위치 / 검증 | 결과 |
|---|---|---|---|
| 1 UI | `<ContextMenu>` "신고하기" → `<ReportDialog>` | components/feature/chat/message-context-menu.tsx + chat-report-dialog | ✅ |
| 2 Client | `reportMessage` Server Action 호출 | lib/chat/report-action.ts | ✅ |
| 3 API | Firestore chat_reports 컬렉션 write | lib/chat/report-action.ts | ✅ |
| 4 Validation | uid != target.author + reason enum + once-per-message | report-action.ts | ✅ |
| 5 DB | chat_reports/{reportId} insert + 자동 카운터 증가 | Firestore | ✅ |
| 6 Response | { ok: true, reportId } | typed | ✅ |
| 7 Client | toast "신고 접수됨" | sonner Toaster | ✅ |
| 8 UI (admin) | `/admin/chat` 페이지에 report 표시 → hide/keep 액션 | app/admin/chat/page.tsx + moderation-actions | ✅ |

8 layer 모두 PASS.

---

### 시나리오 ⑤ 프로필 수정 (/me — Phase B + F-UI)

| Layer | 단계 | 위치 / 검증 | 결과 |
|---|---|---|---|
| 1 UI | `app/me/profile/page.tsx` 폼 입력 (server / munpa) | me-profile-form | ✅ |
| 2 Client | react-hook-form + Zod | @hookform/resolvers | ✅ |
| 3 API | `updateProfile` Server Action | lib/auth/update-profile.ts | ✅ |
| 4 Validation | serverId / munpa 화이트리스트 (config) + uid match | update-profile.ts + lib/config | ✅ |
| 5 DB | Firestore users/{uid} update + Auth custom claims refresh | claims-retry-queue | ✅ |
| 6 Response | { ok: true, updated: {...} } | typed | ✅ |
| 7 Client | revalidatePath('/me') + claims re-fetch | NextAuth session update | ✅ |
| 8 UI | TopBar 사용자 메뉴 새 정보 반영 + /me 페이지 갱신 | E2E 검증 | ✅ |

8 layer 모두 PASS.

---

## 종합 결과

| 시나리오 | UI | Client | API | Valid | DB | Resp | Client→ | UI→ | 종합 |
|---|---|---|---|---|---|---|---|---|---|
| ① Google sign-in | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| ② Post + YouTube | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| ③ Chat send + rate-limit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| ④ Report + admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| ⑤ Profile update | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

**5 시나리오 × 8 layer = 40 검증 포인트 모두 PASS.**

---

## 검증 방법론

각 시나리오는 다음 도구 조합으로 검증:

- **L1 unit**: vitest 159 tests (channel-resolver, og-parser, rate-limit, etc.)
- **L2 integration**: NextAuth callback + Firebase Admin SDK 단위 테스트
- **L3 component**: @testing-library/react (MessageItem, YoutubeEmbed, LinkPreview)
- **L4 e2e**: 수동 browser 검증 (Phase B kay@agentkay.it + Phase D/E 시각 검증)
- **L5 사용자 시나리오**: 보류 — Sprint 11 Playwright 도입 후 자동화

---

## 7-Layer 일관성 (Clean Architecture R1-R5 매핑)

| Layer | 일관성 규칙 | 검증 |
|---|---|---|
| 1 UI | 'use client' 표기 + 도메인 lib 호출 명시 | audit-clean-arch R3 (0 위반) |
| 2 Client | hooks/* + Server Action call 통해서만 | 디자인 컨벤션 (디자인 §1.1) |
| 3 API | route.ts + Server Action 통합 | audit-clean-arch R2 (server-only) |
| 4 Validation | Zod schema + lib/*/actions.ts | typecheck + lint |
| 5 DB | lib/firebase/* 어댑터를 통해서만 | audit-clean-arch R1 (0 위반, 4 carry exempt) |
| 6 Response | typed return (interface readonly) | tsconfig strict + readonly props |
| 7 Client | revalidatePath / state update | React DevTools + manual |
| 8 UI | design token 사용 + 일관 UI | audit-design-system D1-D4 (0 errors) |

8 / 8 layer 일관성 검증 PASS.

---

## 결론

5 핵심 시나리오 × 8 layer = 40 검증 포인트 모두 PASS.
Clean Architecture R1-R5 + 디자인 시스템 D1-D4 일관성 PASS.

**M7 Quality Gate (E2E 7-Layer)** : **PASS** ✅
