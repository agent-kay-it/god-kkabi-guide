# F13-H-07 — 사이트 검색 (`/search`) — 101 항목 색인 (데스크탑)

**URL**: `https://staging.kkaebizigi.com/search`
**Viewport**: 1920×1080
**인증**: 무명랑ʸᵘᴸ
**실행일**: 2026-05-18

---

## 1. 사전 조건

- Sprint V6/V7 의 사이트 검색 v2 적용
- 색인 데이터 (gear / class / jinryeong / boss / 등) staging 에 존재

---

## 2. 시나리오 단계

| # | Action | Expected |
|---|---|---|
| 1 | `navigate` → `/search` | 200 OK |
| 2 | `get_page_text` | 검색 입력 + 카테고리 필터 + 색인 통계 |
| 3 | 색인 항목 수 확인 | 101 항목 |
| 4 | 카테고리 수 확인 | 6 카테고리 |
| 5 | `read_console_messages` | error 0 |
| 6 | `read_network_requests` | 4xx/5xx 0 |

---

## 3. UI 노출 데이터

| 항목 | 값 |
|---|---|
| 색인 총 건수 | 101 |
| 카테고리 수 | 6 |
| 카테고리 예시 | 직업, 진령, 무기, 보스, 게시물, 가이드 |
| 검색 입력 | 활성 |
| 정렬 옵션 | 적합도 / 최신순 등 (Sprint V6 기준) |

---

## 4. 7-Layer Data Flow

| Layer | 검증 | Status |
|---|---|---|
| L1 UI | `/search` SSR + 입력 폼 | Pass |
| L2 Client | 색인 hydration | Pass |
| L3 API | (정적 색인 JSON fetch) | Pass |
| L4 Validation | 색인 schema 정합 | Pass |
| L5 DB | (정적 데이터라 직접 DB 미사용) | N/A |
| L6 Response | 색인 JSON 정상 도달 | Pass |
| L7 UI Update | 카테고리 chips + 통계 노출 | Pass |

S1 score: **6/6 측정 layer Pass** (L5 정적 색인이라 N/A).

---

## 5. 콘솔 / 네트워크

```
console.error  : 0
network 4xx    : 0
network 5xx    : 0
```

---

## 6. 결론

검색 페이지의 색인 hydration 정상. 정적 JSON 색인 fetch → React 컴포넌트 렌더링까지
안정. Sprint V6 의 검색 v2 가 Sprint 13 시점에도 regression 없음.

**Sprint 13 영향**: 신규 버그 0건.
