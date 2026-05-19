# F13-H-03 — 게시판 (`/post`) Empty State (데스크탑)

**URL**: `https://staging.kkaebizigi.com/post`
**Viewport**: 1920×1080
**인증**: 무명랑ʸᵘᴸ
**실행일**: 2026-05-18

---

## 1. 사전 조건

- 인증 사용자
- staging Firestore 의 posts 컬렉션 empty (Sprint 12 seed 미실행 결정 — Firebase
  단일 prod 정책)

---

## 2. 시나리오 단계

| # | Action | Expected |
|---|---|---|
| 1 | `navigate` → `/post` | 200 OK |
| 2 | `get_page_text` | empty state 메시지 + 카테고리 필터 |
| 3 | `read_console_messages` | error 0 |
| 4 | `read_network_requests` | 4xx/5xx 0 |

---

## 3. UI 노출 데이터

| 항목 | 값 |
|---|---|
| 게시물 수 | 0 |
| 카테고리 필터 | 전체 / 잡담 / 공략 / 자랑 / 인증 등 |
| 글쓰기 CTA | 노출 (로그인 사용자만) |

---

## 4. 7-Layer Data Flow

| Layer | 검증 | Status |
|---|---|---|
| L1 UI | `/post` SSR + 카테고리 chips | Pass |
| L2 Client | useEffect → Firestore listener attach | Pass |
| L3 API | Firestore `posts` query (empty) | Pass |
| L4 Validation | empty 결과 처리 | Pass |
| L5 DB | Firestore query latency 정상 | Pass |
| L6 Response | empty array 정상 도달 | Pass |
| L7 UI Update | Empty state 컴포넌트 노출 | Pass |

S1 score: **7/7 = 100%**

---

## 5. 콘솔 / 네트워크

```
console.error  : 0
network 4xx    : 0
network 5xx    : 0
```

---

## 6. 결론

`/post` 페이지는 empty 데이터 상태에서도 안정. Firestore query → empty UI 분기 정상.

**주의**: posts 가 0건이라 P0/P1 게시판 흐름 (작성/조회/댓글) 의 cross-feature 검증은
프로덕션 실 데이터로 후속 검증 필요. 단, Sprint 13 의 P0/P1 게이트는 "empty 시 에러
없음" + "신규 작성 path 가 깨지지 않음" 으로 정의.

**Sprint 13 영향**: 신규 버그 0건.
