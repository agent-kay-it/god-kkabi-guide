# Chat E2E Plan — Sprint 10 Phase E (Task #28)

**Sprint**: `sprint-10-launch` Phase E
**Branch**: `feature/sprint-10-phase-e-chat`
**Scope**: 3-tier RTDB chat — `/chat/global`, `/chat/server-{S}`, `/chat/munpa-{S_M}`
**Out of scope**: 이미지 첨부 (Sprint 11), pinned messages (v2), presence (v2)

## 0. 환경 사전 조건

| 항목 | 값 |
|---|---|
| Base URL | `https://staging.kkaebizigi.com` |
| RTDB | `god-kkabi-guide-default-rtdb` (asia-southeast1) |
| Firestore | `god-kkabi-guide` |
| Test accounts | T1 (S785/문파A), T2 (S785/문파A), T3 (S999/문파B), T4 (admin), T5 (banned) |
| Browser | Chrome 131+ (devtools open) + iPhone SE 414×896 emulation |

## 1. 시나리오 매트릭스 (5 시나리오)

### S1 — Happy Path: 인증 사용자 3 채널 표시 + 메시지 송수신

**Actor**: T1
**Steps**:
1. `/chat` 접근 → `/chat/munpa-S785_문파A`로 redirect (defaultChannelFor priority)
2. ChannelSidebar에 3 항목 표시: 전체 / 서버 S785 / 문파 문파A
3. global 클릭 → URL이 `/chat/global` 변경 + active highlight 이동
4. MessageComposer에 "안녕하세요" 입력 → Enter
5. 1초 내 MessageList에 본인 메시지 표시 (우측 정렬, bronze 배경)
6. 새로고침 후에도 메시지 영구 보존 (RTDB persisted)

**Expected**:
- M1 typecheck/lint pass
- 모든 채널에 클릭으로 진입 가능
- 송신 후 메시지 ID는 RTDB push key 패턴 `^[A-Za-z0-9_-]+$`
- GA4 event `chat_send` 발화 (channel_kind=global)

**PASS criteria**:
- [ ] 3 채널 nav 표시
- [ ] global/server/munpa 전환 시 메시지 list 갱신
- [ ] 송신 후 본인 메시지 즉시 표시
- [ ] 새로고침 후에도 보존

---

### S2 — 권한 거부: 다른 서버 채널 접근 차단

**Actor**: T1 (S785) attempting access to T3's server (S999)
**Steps**:
1. T1으로 로그인
2. 직접 URL 입력: `/chat/server-S999`
3. SSR 단계에서 `canAccessChannel` → `SERVER_MISMATCH`
4. defaultChannelFor(T1) = `munpa-S785_문파A` 로 redirect 발생

**Expected**:
- HTTP 307 redirect (next/redirect)
- 최종 URL: `/chat/munpa-S785_문파A?denied=SERVER_MISMATCH`
- T1이 devtools로 직접 RTDB read 시도 → Firebase Auth `permission-denied` 에러
- T1의 메시지 send 시도 → RTDB rules가 거부

**PASS criteria**:
- [ ] /chat/server-S999 직접 접근 → redirect
- [ ] RTDB read 거부 (콘솔 에러 PERMISSION_DENIED)
- [ ] RTDB write 거부

**3중 방어 검증**:
- Layer 1 (SSR `canAccessChannel`): ✅ redirect
- Layer 2 (UI `ChannelSidebar`): server-S999 nav 항목 없음
- Layer 3 (RTDB rules): direct write/read 거부

---

### S3 — Race Condition: 다중 사용자 동시 채팅

**Actor**: T1 + T2 (같은 채널 `/chat/munpa-S785_문파A`)
**Steps**:
1. T1과 T2 동시 로그인 (2 탭 또는 2 디바이스)
2. T1: "메시지 A1" 송신 (timestamp t=0)
3. T2: "메시지 B1" 송신 (timestamp t=10ms — 거의 동시)
4. T1: "메시지 A2" 송신 (timestamp t=200ms)
5. 두 사용자 화면 모두에서 시간 순서 (A1, B1, A2)로 표시되는지 확인

**Expected**:
- `onChildAdded` 이벤트가 양쪽 클라이언트에 1초 이내 도달
- 메시지 순서는 `createdAt` (RTDB serverTimestamp ms) 기준 정렬
- 충돌 시 RTDB push key가 lexicographic order (timestamp 포함)로 안정성 보장

**PASS criteria**:
- [ ] T1 화면: A1 → B1 → A2 순서
- [ ] T2 화면: A1 → B1 → A2 순서
- [ ] 양쪽 모두 < 1초 latency (P95)
- [ ] 누락 메시지 0건

---

### S4 — Rate Limit: 분당 10회 초과 거부

**Actor**: T2 (registered user, not admin)
**Steps**:
1. T2로 `/chat/global` 접근
2. 빠르게 "메시지 1", "메시지 2", ..., "메시지 11" 송신 (1초 간격)
3. 11번째 메시지 송신 시 `enforceChatRateLimit` → `RATE_LIMIT_EXCEEDED` (scope=minute)

**Expected**:
- 첫 10개: 정상 전송
- 11번째: toast "분당 한도 초과 — N초 후 다시 시도하세요"
- 60초 대기 후 → 다시 송신 가능
- admin (T4)은 우회 (제한 없음)

**PASS criteria**:
- [ ] 1-10번째 정상 송신
- [ ] 11번째 toast 에러 + RTDB 미저장
- [ ] 60초 후 복구
- [ ] T4 admin은 11개 연속 송신 가능

**서버 검증**:
- Firestore `chat_rate_limits/{T2.uid}` doc에 `minuteCount=10`, `hourCount=10`
- 1분 경과 후 doc 갱신 시 `minuteWindowStart`가 새 시각으로 reset
- 동시 11개 요청 (`Promise.all`)에서도 정확히 10개만 통과 (tx atomic)

---

### S5 — 신고 + Admin Moderation Queue

**Actor**: T1 reports, T4 (admin) resolves
**Steps**:
1. T2가 "도배 메시지" 송신 (`/chat/global`)
2. T1이 해당 메시지의 ContextMenu → "신고" 클릭
3. ReportDialog 모달 표시: 신고 사유 선택 (스팸/욕설/광고/기타)
4. "스팸" 체크 + extraText "동일 메시지 반복" 입력 → 제출
5. Toast "신고가 접수되었습니다"
6. T4 (admin)이 `/admin/chat` 또는 `/admin` 접근 → 신고 큐에 1건 표시
7. T4가 "메시지 삭제" 클릭 → resolveReport
8. 모든 사용자 화면에서 해당 메시지가 "운영자에 의해 삭제된 메시지입니다." placeholder로 전환

**Expected**:
- 동일 메시지 같은 사용자가 재신고 → 1회만 카운트 (tx로 dup 차단)
- 신고 3건 누적 시 자동 `hidden=true` (AUTO_HIDE_THRESHOLD)
- 운영자 결정 후 `chat_reports/{reportId}.resolved=deleted`
- moderation_logs에 actorUid + targetMessageId 기록

**PASS criteria**:
- [ ] T1이 신고 → Firestore `chat_reports/{messageId}__{T1.uid}` 1건 생성
- [ ] T4 admin 페이지에 표시
- [ ] T4가 "삭제" → RTDB 메시지에 `deletedByOperator=true`
- [ ] T1, T2 모두 화면에서 "삭제된 메시지" placeholder로 즉시 갱신 (onChildChanged)
- [ ] T1이 동일 메시지 재신고 시도 → tx에서 dup 감지 + no-op

---

## 2. 부하 테스트 (Optional — 시간 허용 시)

**Goal**: 10명 동시 채팅 + 1분간 500 메시지 (= 50 msg/s) 처리량 측정

**Setup**:
- 10개 Chrome 탭 또는 puppeteer 스크립트 (각 T1~T10 계정)
- `/chat/global` 모두 진입
- 각 클라이언트가 1초 간격으로 50 메시지 발송 (총 500)

**Metrics**:
- 전송 성공률: ≥ 99%
- onChildAdded 도달 latency P95: ≤ 1.0s
- RTDB write 실패: 0건 (rate limit 거부 제외)
- Firestore `chat_rate_limits` tx 충돌 retry: 모니터링 (정상 < 10건)

**미구현 — 후속 작업**:
- `scripts/chat-load-test.ts` (puppeteer + signInWithCustomToken)
- Vercel staging 환경에서 직접 실행은 cron quota 영향 우려 → 별도 ephemeral 환경에서 측정 권장

## 3. 보안 매트릭스 검증

| Vector | Defense | Test |
|---|---|---|
| Path traversal (channelId=`../admin`) | `validateChannelId` regex | unit test (45 cases) ✅ |
| Cross-server read | RTDB rules `.read` + SSR canAccessChannel | S2 시나리오 |
| Cross-server write | RTDB rules `.write` + UI 차단 | S2 시나리오 |
| Self-report | `reportChatMessage` 가드 + Firestore rule | unit test |
| Dup report | tx + reportId = `${messageId}__${reporterUid}` | S5 시나리오 |
| Rate limit bypass (client) | Server Action `enforceChatRateLimit` | S4 시나리오 |
| Race condition (10 concurrent) | Firestore `runTransaction` | S4 동시 11개 |
| RTDB schema injection | RTDB rules `$other.validate = false` | manual `set` 시도 |
| linkPreview malformed | RTDB rules image https-only + url https-only | unit test (message-variant) |
| Banned user write | RTDB rules `auth.token.role != 'banned'` | T5 시나리오 |

## 4. 실행 체크리스트

### 사전 빌드 검증
- [x] typecheck 0 errors
- [x] lint 0 errors
- [x] vitest 68 tests passed
- [ ] staging build 성공 (Vercel 자동 배포)

### Staging 검증
- [ ] S1 — Happy path (T1)
- [ ] S2 — 권한 거부 (T1 → S999)
- [ ] S3 — Race condition (T1 + T2)
- [ ] S4 — Rate limit (T2)
- [ ] S5 — 신고 + admin (T1 → T4)
- [ ] 모바일 414×896 — drawer 작동
- [ ] 콘솔 0 error (RTDB permission-denied는 의도된 시나리오 외)
- [ ] 0 404

### 후속 작업 (Phase F)
- [ ] 부하 테스트 스크립트 작성 + 실행 (10명 / 500 msg)
- [ ] Sentry RTDB 에러율 모니터링 alert 등록
- [ ] presence (lastSeen) — Sprint 11

## 5. 결과 보고 양식

```
| 시나리오 | 결과 | 메모 |
|---|---|---|
| S1 Happy Path | PASS / FAIL | latency 평균 X ms |
| S2 권한 거부 | PASS / FAIL | redirect → /chat/munpa-... |
| S3 Race | PASS / FAIL | 순서 일치, P95 = X ms |
| S4 Rate Limit | PASS / FAIL | tx 정확도 100% |
| S5 Report + Mod | PASS / FAIL | dup 신고 1회만 카운트 |
| 부하 (optional) | PASS / FAIL / SKIP | 50 msg/s P95 |
```

---

**Authored**: 2026-05-17
**Sprint**: 10 Phase E
**Reviewer**: kay (project owner)
