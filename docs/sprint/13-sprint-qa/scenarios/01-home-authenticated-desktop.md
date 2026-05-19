# F13-H-01 — 홈 페이지 (인증 / 데스크탑)

**URL**: `https://staging.kkaebizigi.com/`
**Viewport**: 1920×1080
**인증**: 무명랑ʸᵘᴸ (UID 183334138)
**실행일**: 2026-05-18
**도구**: Chrome MCP

---

## 1. 사전 조건

- 사용자 Google 세션 로그인 상태
- Sprint 12 CSP hotfix (PR #28) 적용 staging deploy 완료
- 신규 사용자 가입 플로우 완료 (registered=true)

---

## 2. 시나리오 단계

| # | Action | Tool | Expected |
|---|---|---|---|
| 1 | `tabs_create_mcp` → "https://staging.kkaebizigi.com" | tabs_create_mcp | Tab 생성 + 200 OK |
| 2 | `read_console_messages({ tabId, pattern: "error\|Error" })` | read_console_messages | error 0건 |
| 3 | `read_network_requests({ tabId, status: 400 })` ~ 500 | read_network_requests | 4xx/5xx 0건 |
| 4 | `get_page_text({ tabId })` 페이지 본문 추출 | get_page_text | 홈 컨텐츠 노출 |
| 5 | 헤더에 사용자명 "무명랑ʸᵘᴸ" 확인 | get_page_text grep | 통과 |
| 6 | 푸터 카피라이트 + 약관 링크 확인 | get_page_text grep | 통과 |

---

## 3. 7-Layer Data Flow 검증

| Layer | Element | Status | Evidence |
|---|---|---|---|
| L1 UI render | 홈 페이지 SSR HTML 도착 | Pass | get_page_text 응답 본문 풍부 |
| L2 Client hydration | React hydration 완료 | Pass | console error 0 + interactive |
| L3 API call | (홈은 정적 + Firestore read) Featured posts fetch | Pass | network 200 OK 흐름 |
| L4 Validation | 미인증 게이트 통과 (홈은 public) | Pass | redirect 없음 |
| L5 DB read | Firestore posts (latest) read | Pass | Firestore Listen 정상 |
| L6 Response | JSON 응답 client 도달 | Pass | hydration 완료 시점 측정 |
| L7 UI update | 게시물 리스트 / 캐릭터 카드 노출 | Pass | DOM 정상 |

S1 score: **7/7 = 100%**

---

## 4. 발견된 이슈

**없음** — 모든 검증 항목 통과.

---

## 5. 콘솔 / 네트워크 로그 요약

```
console.error  : 0
console.warning: 1 (Pretendard font swap notice, allowlist)
network 4xx    : 0
network 5xx    : 0
```

---

## 6. 결론

홈 페이지는 인증된 사용자의 실제 세션에서 정상 동작. Sprint 12 의 CSP / Sentry idle /
AdSense lazy / Speed Insights production-only 조치가 staging 검증에서도 안정적으로
동작함을 확인.

**Sprint 13 영향**: 본 시나리오는 P0/P1/P2/P3 어떤 등급의 버그도 발생시키지 않음.
