# F13-H-08 — 직업 디렉토리 (`/class`) (데스크탑)

**URL**: `https://staging.kkaebizigi.com/class`
**Viewport**: 1920×1080
**인증**: 무명랑ʸᵘᴸ
**실행일**: 2026-05-18

---

## 1. 사전 조건

- 직업 (class) 정적 데이터 staging 에 배포 완료
- 사용자 캐릭터 직업 = 검객 (무당) — 본인 직업 강조 노출 검증

---

## 2. 시나리오 단계

| # | Action | Expected |
|---|---|---|
| 1 | `navigate` → `/class` | 200 OK |
| 2 | `get_page_text` | 3 직업 카드 노출 |
| 3 | 티어 / 추천 패치 라벨 확인 | T0 / T1 표기 |
| 4 | 본인 직업 강조 노출 | "검객" 카드 강조 |
| 5 | `read_console_messages` | error 0 |
| 6 | `read_network_requests` | 4xx/5xx 0 |

---

## 3. UI 노출 데이터

| 직업 | 티어 | 비고 |
|---|---|---|
| 전사 | T1 | 정상 |
| 검객 | T0 | 본인 직업 강조 (UI hint) |
| 영매 | T1 | 정상 |

---

## 4. 7-Layer Data Flow

| Layer | 검증 | Status |
|---|---|---|
| L1 UI | `/class` SSR + 카드 그리드 | Pass |
| L2 Client | 본인 직업 강조 hook | Pass |
| L3 API | 정적 JSON fetch | Pass |
| L4 Validation | 직업 ID schema 정합 | Pass |
| L5 DB | 정적 데이터 (N/A) | N/A |
| L6 Response | JSON 정상 도달 | Pass |
| L7 UI Update | 카드 + 티어 칩 노출 | Pass |

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

직업 디렉토리는 정상. 본인 직업 (검객) 강조 UI hint 도 정상 노출. 정적 메타 데이터의
번들 크기는 Sprint 12 의 bundle-analyzer 결과 기준 acceptable.

**Sprint 13 영향**: 신규 버그 0건.
