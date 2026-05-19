# F13-H-04 — 채팅 자동 리다이렉트 + 3-tier 채널 (데스크탑)

**URL**: `https://staging.kkaebizigi.com/chat` → `https://staging.kkaebizigi.com/chat/server-S785`
**Viewport**: 1920×1080
**인증**: 무명랑ʸᵘᴸ (서버 S785, 문파 무명)
**실행일**: 2026-05-18

---

## 1. 사전 조건

- 인증 사용자
- 사용자 캐릭터 정보 (서버 S785, 문파 ID 미설정) 존재
- Sprint V3/V4 의 multi-tier 채팅 채널 (전체 / 서버 / 문파) 적용 완료

---

## 2. 시나리오 단계

| # | Action | Expected |
|---|---|---|
| 1 | `navigate` → `/chat` | 302 → `/chat/server-S785` (사용자 서버 기반 자동) |
| 2 | `get_page_text` | 3-tier 채널 탭 노출 |
| 3 | 탭 라벨 확인 | 전체 / 서버 S785 / 문파 미설정 |
| 4 | `read_console_messages` | error 0 |
| 5 | `read_network_requests` | 4xx/5xx 0 |

---

## 3. UI 노출 데이터

| 탭 | 라벨 | 상태 |
|---|---|---|
| 1 | 전체 (글로벌) | 활성 채널 |
| 2 | 서버 S785 (사용자 서버 기준 자동 선택) | 현재 선택 |
| 3 | 문파 미설정 | disabled / 안내 |

---

## 4. 7-Layer Data Flow

| Layer | 검증 | Status |
|---|---|---|
| L1 UI | `/chat` middleware redirect | Pass |
| L2 Client | useAuth() → server-id 추출 | Pass |
| L3 API | Firestore Realtime DB / Firestore listener | Pass |
| L4 Validation | 문파 미설정 시 disabled 처리 | Pass |
| L5 DB | RTDB / Firestore subscribe | Pass |
| L6 Response | 메시지 stream → client | Pass |
| L7 UI Update | 탭 + 메시지 영역 노출 | Pass |

S1 score: **7/7 = 100%**

---

## 5. 콘솔 / 네트워크

```
console.error  : 0
network 4xx    : 0
network 5xx    : 0
```

특히 Firebase Realtime DB / Firestore `Listen/channel` 의 long-polling reconnect 가
정상 동작 (BUG-13-002 firebaseinstallations 차단 해소 효과).

---

## 6. 결론

채팅 모듈은 (1) 자동 채널 선택 (2) 3-tier 라우팅 (3) 미설정 상태 graceful degradation
모두 정상. Sprint 12 의 CSP fix 가 Firebase 전체 도메인 + Realtime DB 도메인을 정상
허용함을 입증.

**Sprint 13 영향**: 신규 버그 0건.
