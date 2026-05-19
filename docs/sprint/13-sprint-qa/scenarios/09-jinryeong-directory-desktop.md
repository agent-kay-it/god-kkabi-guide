# F13-H-09 — 진령 디렉토리 (`/jinryeong`) (데스크탑)

**URL**: `https://staging.kkaebizigi.com/jinryeong`
**Viewport**: 1920×1080
**인증**: 무명랑ʸᵘᴸ
**실행일**: 2026-05-18

---

## 1. 사전 조건

- 진령 (jinryeong) 정적 데이터 staging 배포 완료
- 11 진령 (T0 2 / T1 4 / T2 5)

---

## 2. 시나리오 단계

| # | Action | Expected |
|---|---|---|
| 1 | `navigate` → `/jinryeong` | 200 OK |
| 2 | `get_page_text` | 11 진령 카드 노출 |
| 3 | 티어 분포 확인 | T0 2 / T1 4 / T2 5 |
| 4 | 정렬 / 필터 동작 (기본) | 티어 → 이름 |
| 5 | `read_console_messages` | error 0 |
| 6 | `read_network_requests` | 4xx/5xx 0 |

---

## 3. UI 노출 데이터

| 티어 | 건수 |
|---|---|
| T0 | 2 |
| T1 | 4 |
| T2 | 5 |
| **합계** | **11** |

---

## 4. 7-Layer Data Flow

| Layer | 검증 | Status |
|---|---|---|
| L1 UI | `/jinryeong` SSR + 카드 | Pass |
| L2 Client | 티어 필터 hook | Pass |
| L3 API | 정적 JSON fetch | Pass |
| L4 Validation | 진령 ID + 티어 schema | Pass |
| L5 DB | 정적 데이터 (N/A) | N/A |
| L6 Response | JSON 정상 도달 | Pass |
| L7 UI Update | 카드 그리드 노출 | Pass |

S1 score: **6/6 측정 layer Pass**.

---

## 5. 콘솔 / 네트워크

```
console.error  : 0
network 4xx    : 0
network 5xx    : 0
```

---

## 6. 결론

진령 디렉토리는 정상. T0/T1/T2 그룹화 노출 + 11 항목 모두 가시. 정적 데이터 hydration
안정.

**Sprint 13 영향**: 신규 버그 0건.
