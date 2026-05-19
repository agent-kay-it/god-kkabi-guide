# F13-H-10 — 모바일 viewport cross-check (393×852)

**URL 묶음**: `/`, `/me`, `/chat`, `/post`, `/search`
**Viewport**: 393×852 (Pixel 7 modeled)
**인증**: 무명랑ʸᵘᴸ
**실행일**: 2026-05-18

---

## 1. 사전 조건

- Sprint V7 의 모바일 드로어 + 반응형 보강 (commit `2b5d9e6`) 적용
- Sprint 12 의 Pretendard subset + AdSense lazy + Sentry idle 적용

---

## 2. 시나리오 단계

각 페이지에 대해:

| # | Action | Expected |
|---|---|---|
| 1 | `resize_window` → 393×852 | viewport 적용 |
| 2 | `navigate` → target | 200 OK |
| 3 | `get_page_text` | 모바일 레이아웃 노출 |
| 4 | 햄버거 / 드로어 인터랙션 확인 | 토글 가능 |
| 5 | `read_console_messages` | error 0 |
| 6 | `read_network_requests` | 4xx/5xx 0 |
| 7 | (선택) `get_screenshot` baseline 비교 | diff < 1% |

---

## 3. 페이지별 모바일 검증 결과

| 페이지 | 레이아웃 | 드로어 | 콘솔 error | network err |
|---|---|---|---|---|
| `/` | 단일 컬럼 | OK | 0 | 0 |
| `/me` | 카드 stack | OK | 0 | 0 |
| `/chat` | 탭 + 입력 fixed bottom | OK | 0 | 0 |
| `/post` | 카드 리스트 + 카테고리 sticky | OK | 0 | 0 |
| `/search` | 입력 fixed top + 결과 list | OK | 0 | 0 |

---

## 4. 7-Layer Data Flow (모바일)

각 페이지의 L1~L7 흐름은 데스크탑과 동일 (반응형 CSS 분기만 차이). 따라서 데스크탑
시나리오의 S1 score 가 모바일에도 적용됨. 단, 다음 추가 검증:

| 모바일 특이 항목 | 검증 | Status |
|---|---|---|
| 햄버거 메뉴 a11y 라벨 | `aria-label="메뉴 열기"` | Pass |
| 드로어 focus trap | 키보드 Tab 순환 | Pass (axe-core 향후 자동 검사) |
| viewport meta | `width=device-width, initial-scale=1` | Pass |
| 하단 fixed UI 의 safe-area | `env(safe-area-inset-bottom)` | Pass |

---

## 5. 콘솔 / 네트워크 합계

```
console.error  (5 페이지): 0
network 4xx    (5 페이지): 0
network 5xx    (5 페이지): 0
```

---

## 6. 결론

모바일 viewport 에서도 5 페이지 모두 console / network 에러 0건. Sprint V7 의
모바일 드로어 + 반응형 보강이 Sprint 13 시점에도 regression 없음을 확인.

**Sprint 13 영향**: 신규 버그 0건. Sprint V7 의 모바일 폴리쉬가 통합 검증을 통과.
