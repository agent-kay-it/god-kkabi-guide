# Sprint 13 / F13-H — Chrome MCP Integration QA 시나리오 개요

> 본 폴더는 Chrome MCP (`mcp__claude-in-chrome__*`) 를 사용하여 사용자의 실제 인증된
> 브라우저 세션으로 staging.kkaebizigi.com 의 핵심 페이지를 통합 검증한 결과입니다.
>
> Playwright storageState 자동화 대신 Chrome MCP 직접 실행으로 전환한 이유:
>  - Firebase 단일 prod 프로젝트 (god-kkabi-guide) 정책상 자동 OAuth 위험
>  - 사용자가 이미 로그인된 Chrome 세션 보유 → 실제 운영 조건과 동일
>  - storageState 수동 export 의 fragility 회피
>  - 사용자 명시 요청 — "인증 내 계정으로 하면 되잖아... chrome으로 테스트 하는거 아냐?
>    내 계정 등록 되어 있어. 꼼꼼하게 똑바로 좀 해봐"

---

## 1. 검증 환경

| 항목 | 값 |
|---|---|
| Target | `https://staging.kkaebizigi.com` |
| 인증 사용자 | 무명랑ʸᵘᴸ (S785 / 무명 / 검객 (무당)) |
| 이메일 | kay@agentkay.it |
| Firebase UID | 183334138 |
| 인증 방식 | Google OAuth (실제 세션 재사용) |
| Chrome MCP tab | tabId 1470693753 |
| 데스크탑 viewport | 1920×1080 |
| 모바일 viewport | 393×852 (Pixel 7 modeled) |
| 검증일 | 2026-05-18 |

---

## 2. Sprint 12 CSP Hotfix 적용 확인

Sprint 13 / F13-A smoke test 가 발견했던 BUG-13-001 (vercel.live) +
BUG-13-002 (firebaseinstallations) 는 `next.config.ts` PR (#28) 으로 fix.
본 F13-H 실행 시점에는 모든 9 페이지에서 **console error 0 / network error 0**
확인 → Sprint 12 + Sprint 13 누계 효과 입증.

---

## 3. 시나리오 목록

| # | 파일 | 페이지 | 핵심 검증 |
|---|---|---|---|
| 01 | `01-home-authenticated-desktop.md` | `/` | 홈 SSR + 로그인 상태 헤더 |
| 02 | `02-me-hub-desktop.md` | `/me` | 사용자 허브 (캐릭터 카드 + 통계) |
| 03 | `03-post-list-desktop.md` | `/post` | 게시판 empty state + 카테고리 필터 |
| 04 | `04-chat-server-channel-desktop.md` | `/chat` → `/chat/server-S785` | 자동 리다이렉트 + 3-tier 채널 |
| 05 | `05-me-profile-desktop.md` | `/me/profile` | 프로필 편집 + 이미지 업로더 + UID 노출 |
| 06 | `06-me-bookmarks-desktop.md` | `/me/bookmarks` | 북마크 empty state |
| 07 | `07-search-index-desktop.md` | `/search` | 101 항목 색인 + 6 카테고리 |
| 08 | `08-class-directory-desktop.md` | `/class` | 3 직업 (전사/검객/영매) |
| 09 | `09-jinryeong-directory-desktop.md` | `/jinryeong` | 11 진령 (T0/T1/T2) |
| 10 | `10-mobile-viewport-cross-check.md` | 핵심 페이지 모바일 재확인 | 393×852 viewport |

---

## 4. 합격 기준 (Pass Criteria)

각 시나리오는 다음을 만족해야 합격:

1. **Console errors = 0** (allowlist 제외)
2. **Network 4xx/5xx = 0** (allowlist 제외)
3. **핵심 UI 요소 가시성** — 헤더, 푸터, 페이지 제목, 핵심 콘텐츠 영역
4. **인증 상태 일관성** — 로그인 사용자명 / 캐릭터 정보 정확 노출
5. **CSP 위반 없음** — Sprint 12 hotfix 가 모든 origin 을 허용하는지 확인
6. **응답성** — 페이지 진입 후 5초 이내 인터랙티브 가능 (FCP/LCP 체감)

---

## 5. Allowlist (의도된 noise)

다음은 에러로 카운트하지 않음:

**Console**:
- Firebase Auth `iframe` 의 `onmessage` warning (Google OAuth 정상 동작)
- Google Analytics measurement Id 미설정 warning (staging 의도)
- `Pretendard` font-display swap notice
- HMR (development) 노이즈 — staging 검증이라 해당 없음

**Network**:
- Firestore `Listen/channel` long-polling 404 reconnect (Firestore 정상 패턴)
- adsbygoogle (광고 차단기) 404
- vercel.live 의 idle disconnect (preview 빌드)

---

## 6. 데이터 흐름 매트릭스 연결

각 시나리오의 7-Layer 흐름은 `../reports/data-flow-matrix.md` 의 해당 feature row 에
"Pass"/"Fail" 로 정량 기록. F13-H 합계 점수가 Sprint 13 QA Phase 의 **S1 score**
(7-Layer dataFlowIntegrity) 로 집계됨.

---

## 7. 후속 작업

- **bug-tracker.md 갱신** — 9 페이지 모두 0 신규 버그 확인 → Sprint 13 신규 P1+ 0건
- **prod-cutover-checklist.md** — Sprint 13 종료 시 prod 배포 전 체크리스트
- **Sprint 13 Report Phase** — KPI 집계 + Sprint 14 carry items 정리
