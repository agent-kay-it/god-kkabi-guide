# F13-H-06 — 북마크 Empty State (데스크탑)

**URL**: `https://staging.kkaebizigi.com/me/bookmarks`
**Viewport**: 1920×1080
**인증**: 무명랑ʸᵘᴸ
**실행일**: 2026-05-18

---

## 1. 사전 조건

- 인증 사용자
- 사용자의 북마크 컬렉션 0건 (`/me` 통계상 북마크 0)

---

## 2. 시나리오 단계

| # | Action | Expected |
|---|---|---|
| 1 | `navigate` → `/me/bookmarks` | 200 OK |
| 2 | `get_page_text` | empty state 안내 + 게시판 이동 CTA |
| 3 | `read_console_messages` | error 0 |
| 4 | `read_network_requests` | 4xx/5xx 0 |

---

## 3. 7-Layer Data Flow

| Layer | 검증 | Status |
|---|---|---|
| L1 UI | `/me/bookmarks` SSR | Pass |
| L2 Client | useAuth + Firestore listener | Pass |
| L3 API | Firestore `users/{uid}/bookmarks` query | Pass |
| L4 Validation | empty 분기 정상 | Pass |
| L5 DB | empty collection 응답 | Pass |
| L6 Response | empty array | Pass |
| L7 UI Update | empty state CTA 노출 | Pass |

S1 score: **7/7 = 100%**

---

## 4. 콘솔 / 네트워크

```
console.error  : 0
network 4xx    : 0
network 5xx    : 0
```

---

## 5. 결론

북마크 empty 상태에서도 안정. Sprint V6 의 북마크 정렬/필터 기능은 본 empty 상태에선
보이지 않음 (의도된 분기 — 1건 이상부터 노출).

**Sprint 13 영향**: 신규 버그 0건.
