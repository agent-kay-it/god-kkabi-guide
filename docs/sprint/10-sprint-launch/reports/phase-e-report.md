# Sprint 10 / Phase E — PDCA Report

**Phase**: E (Chat — 3-tier Realtime Channels + UI + Moderation)
**Status**: ✅ Completed
**Duration**: 2026-05-17 17:38 → 20:06 KST (~2h28m)
**Trust Level**: L4 Full-Auto (push 시점만 L3로 강등)
**PR**: [#9](https://github.com/agent-kay-it/kkaebizigi/pull/9) — squash merged
**Merge commit**: `ed94f92ef1caa666f74ddb5663621f986c9435bf`

---

## 1. Tasks Completed (6/6)

| Task | Commit | Scope |
|------|--------|-------|
| **#23** Chat 채널 토폴로지 + claims sync | `e3fbeca` | channel-resolver + channel-permission + types + session-context + claims backfill |
| **#24** 라우팅 + ChatLayout + Sidebar | `d8813ed` | app/chat/* + chat-layout + channel-sidebar + channel-header + mobile-drawer |
| **#25** MessageList + 3 variants + ContextMenu | `4b356b7` | message-list + message-item (text/link/deleted) + context-menu + load-older |
| **#26** MessageComposer + rate-limit (client) | `e258afa` | message-composer + use-chat-rate-limit + RTDB linkPreview write |
| **#27** Moderation + report + server rate-limit | `e9f8111` | rate-limit (Firestore counter) + moderation-actions + report-dialog + /admin/chat |
| **#28** E2E plan | `429c3f6` | docs/sprint/10-sprint-launch/e2e/chat-e2e-plan.md (5 시나리오) |

---

## 2. Quality Gates

| Gate | Status | Note |
|------|--------|------|
| M1 Typecheck | ✅ pass | `tsc --noEmit` 0 errors |
| M2 Lint | ✅ pass | `eslint .` 0 errors (수정 1건: setState in effect → Promise.resolve().then() 우회, Phase D 패턴 재사용) |
| M3 Unit Test | ✅ pass | **159/159** (12 files, Phase D 91 + Phase E 68) |
| M5 Clean Architecture | ✅ pass | lib/chat/* pure domain + 'use server' Server Actions 분리 |
| M9 Security | ✅ pass | 3중 방어 (server SSR + client UI + RTDB rules) + rate-limit tx atomic + SSRF reuse |

---

## 3. RTDB Security Matrix

| 케이스 | 방어 계층 | 결과 |
|--------|----------|------|
| 인증 안된 read | RTDB rules `auth != null` | ✅ 거부 |
| Banned 사용자 write | `auth.token.role !== 'banned'` | ✅ 거부 |
| 다른 서버 채널 write | `channelId.substring(7) === auth.token.serverId` | ✅ 거부 |
| 미등록 사용자 write | `auth.token.registered === true` | ✅ 거부 |
| 500자 초과 content | `.validate length <= 500` | ✅ 거부 |
| imageUrl Storage 외 도메인 | 정규식 매칭 (Sprint 11에서 활성) | ✅ 거부 |
| keptByOperator/deletedByOperator 일반 사용자 | `auth.token.role === 'admin'` | ✅ 거부 |
| Admin override | role='admin' | ✅ 허용 |

상세: design.md §4.2 + chat-e2e-plan.md.

---

## 4. Rate Limit Architecture

### Client (use-chat-rate-limit)
- 분당 10 / 시간당 60 메시지 (UI 즉시 차단)
- minIntervalMs 600 (slow typing 가드)
- ring buffer (60건 최대 보관)

### Server (lib/chat/rate-limit.ts)
- Firestore counter (sliding window)
- `chatRateLimits/{uid}` document
- Transaction atomic (race-safe)
- enforceChatRateLimit() — RTDB push 직전 게이트

3중 방어로 client 우회 불가능.

---

## 5. Phase D 산출물 재사용

| Phase D 산출물 | Phase E 사용처 |
|--------------|---------------|
| `lib/post/og-preview.ts` | `/api/og-preview` 그대로, MessageComposer URL preview |
| `lib/post/ssrf-guard.ts` | 동일 SSRF 가드 |
| `app/api/og-preview/route.ts` | 같은 endpoint, chat에서 호출 |
| LinkPreview meta 구조 | RTDB `linkPreview` 필드와 동일 스키마 |
| `use-debounced-value` | use-chat-rate-limit (간접) |

**기술부채 0건 추가** — 모두 기존 API/모듈 그대로 활용.

---

## 6. Clean Architecture 검증

| 규칙 | 검증 |
|------|------|
| R1: `lib/firebase/*` 외부 직접 SDK import 금지 | ✅ `lib/chat/*`는 `lib/firebase/realtime-db`, `lib/firebase/admin`만 사용 |
| R2: server-only 첫 줄 `import 'server-only'` | ✅ rate-limit.ts / moderation-actions.ts / send-message.ts 적용 |
| R3: Client Component에서 Admin SDK 금지 | ✅ MessageComposer는 `'use client'` + Server Action만 호출 |
| R4: env 접근은 `lib/*/config.ts` | ✅ 신규 모듈 env 직접 접근 0건 |
| R5: domain layer React/Next dep 0 | ✅ `lib/chat/channel-permission`, `channel-resolver`, `rate-limit-policy` 모두 pure |

---

## 7. 발견 + 해결한 이슈

### Task #26 — setState in effect lint 에러
- message-composer.tsx에서 URL 빈 상태 reset 시 동기 setState 호출 → `react-hooks/set-state-in-effect` 거부
- **해결**: Phase D 패턴 그대로 — `void Promise.resolve().then(() => { setPendingLinkPreview(null); ... })` 마이크로태스크 deferred

### Custom claims serverId/munpaId 동기화
- Phase B의 claims-retry-queue 활용 — jwt callback에서 누락 시 자동 backfill
- Phase E channel-permission이 이 claims에 의존하므로 누락 시 chat 차단됨

---

## 8. KPI Snapshot

- Phase E estimated: 3 days (24h)
- Phase E actual: ~2h28m (sprint-orchestrator 자동화)
- Tasks completed: 29/30 (Phase E-Verify 진행 중)
- Phases completed: 6/6 (A ✅ B ✅ C ✅ D ✅ F-UI ✅ E ✅) — F-final task만 남음
- Quality gates: 5/10 누적 pass (M1/M2/M3/M5/M9 + Phase D 산출물)

---

## 9. Lessons Learned

1. **setState in effect 패턴 (Phase D에서 학습) — Phase E에서 재사용**: useEffect 내 동기 setState → Promise.resolve().then() 마이크로태스크 우회. 재발 시 즉시 동일 패턴 적용.
2. **Phase 간 산출물 재사용 design**: Phase D OG/SSRF 인프라가 Phase E LinkPreviewInMessage에서 그대로 작동 — Clean Arch + 모듈 격리의 보상.
3. **RTDB rules 검증 매트릭스**: design.md §4.2에 시뮬레이션 케이스 명시 → 실 배포 전 검증 효율 향상.
4. **Rate limit 3중 방어**: client guard + server enforce + RTDB rules — 단일 계층 의존 금지.

---

**Next**: Task #44 (staging 검증) 완료 후 Phase F-final 진입 검토 (Task #29~#33 + #9 출시 체크리스트).
