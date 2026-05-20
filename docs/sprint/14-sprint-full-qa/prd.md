# Sprint 14 — Full Integration QA + Emulator Migration (PRD)

> Sprint 13 의 carry-forward 9건을 모두 해소하는 대형 sprint.
> "꼼꼼하지 못했다" 는 Sprint 13 회고의 직접적 후속 작업.

**Sprint 명**: Full Integration QA + Emulator Migration
**기간**: 2026-05-19 ~ 2026-06-02 (2주, scope 큰 만큼 phaseTimeout 대폭 확장)
**Trust Level**: L4 (full-auto, 사용자 명시 요청 — "토큰과 시간은 얼마든 소모되어도 상관없어")
**의존**: Sprint 13 archive 완료

---

## 1. WHY — 왜 이 Sprint 가 필요한가

Sprint 13 은 본질적 통합 QA 의 절반만 수행했다:
- 검증한 것: 9 페이지 read-only 진입 + console/network 에러 카운트
- 검증하지 못한 것: 모든 CRUD/인터랙션, a11y, 시각 회귀, admin flow

prod-cutover 전에 **CRUD/인터랙션 자동 회귀 안전망** 이 반드시 필요하다.
Firebase 단일 prod 정책은 emulator 분리로 해결 가능. Sprint 14 는 그 해결을 포함.

---

## 2. WHO — 영향받는 사용자

- **본 사용자 (kay@agentkay.it)** — prod 출시 전 안전 검증 받음
- **운영팀 (kay@agentkay.it)** — 자동 회귀 안전망 보유
- **신규 사용자** — 안정적인 가입/사용 흐름 보장
- **기존 사용자 (post 작성자, 채팅 사용자)** — CRUD 손상 방지

---

## 3. SUCCESS — 성공 정의

| 영역 | 목표 |
|---|---|
| Auth | 8 specs green (login/register/logout/banned/multi-tab/session-expiry/custom-token/delete-account) |
| Post | 12 specs green (text/image/youtube/link/autosave/edit/delete/comment/like/report/view/legacy-img) |
| Chat | 10 specs green (3 channel + image + link + rate-limit + report + banned + leak + mobile-drawer) |
| Profile | 6 specs green (edit/upload-photo/reset-photo/delete-account/recent-activity/bookmarks) |
| Admin | 6 specs green (pending-posts/chat-reports/penalties/coupons/dictionaries/non-admin-403) |
| Search | 5 specs green (한글검색/related/recent-views/tag/empty-state) |
| a11y | axe-core 3 page (홈/post/chat) — 0 critical/serious |
| Visual | baseline 100 screenshot + diff < 1% |
| Emulator | Firebase Auth/Firestore/Storage/RTDB emulator suite — staging+prod 분리 |
| Cleanup | [TEST-Sprint14] 데이터 일괄 삭제 시나리오 + 매 sprint 종료 시 자동 실행 |
| Bug fix | BUG-13-003 (/me/profile UID 가시성 정책) 수정 |

---

## 4. RISK — 위험 요소

| Risk | 영향 | 대응 |
|---|---|---|
| Firebase emulator 환경 분리 시 staging deploy 깨짐 | High | emulator 환경변수 분기 (`NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true`) — staging 은 영향 없도록 분리 |
| 사용자 실 계정에 테스트 데이터 누적 | Medium | [TEST-Sprint14] 프리픽스 + e2eSeedId 태그 → 일괄 cleanup |
| Playwright Google OAuth 자동화 실패 | High | emulator 의 testToken API 사용 + 별도 service account 로 custom token 생성 |
| Visual baseline 의 noise (rendering 시점 차이) | Medium | retries 3 + animation disable + viewport stabilization |
| Sprint scope 가 너무 커서 phase timeout | High | phaseTimeoutHours 를 240 (10일) 으로 확장 |
| AdSense / Sentry 비활성화 안 되어 e2e 노이즈 | Medium | `NEXT_PUBLIC_E2E_MODE=true` 시 disable |
| Admin 시나리오에 admin 권한 계정 필요 | Medium | emulator 의 custom claims API 활용 |

---

## 5. SCOPE — Sprint 14 가 포함/제외

**포함**:
- Firebase emulator suite 분리 + e2e mode 분기
- 47 Playwright specs (Auth/Post/Chat/Profile/Admin/Search 전체)
- axe-core a11y 자동 검사 (3 page)
- Visual baseline 100 screenshot + diff workflow
- [TEST-Sprint14] cleanup 자동화
- BUG-13-003 (P3) 수정

**제외** (Sprint 15+):
- prod 배포 자동화 (현재 수동 cutover 유지)
- 다국어 (i18n) 검증
- 성능 회귀 (Sprint 12 의 Lighthouse 자동화로 별도 다룸)
- Multi-region Firebase replication
- Penetration testing / OWASP scan (별도 보안 sprint)

---

## 6. ASSUMPTIONS — 가정

1. Firebase emulator suite 가 god-kkabi-guide 프로젝트 ID 와 분리 가능 (emulator 의 dummy project ID 사용)
2. Vercel preview deploy 시 emulator 자동 시작 가능 (또는 별도 emulator 모드 분기)
3. 사용자 실 계정에 [TEST-Sprint14] 프리픽스 데이터를 일시적으로 생성/삭제 가능
4. Playwright + @axe-core/playwright 1.60.0 / 4.11.3 호환성 유지
5. GitHub Actions runner 의 디스크 사용량 충분 (emulator + chromium + screenshots)

---

## 7. DEPENDENCIES — 외부 의존

- `firebase-tools` (emulator suite CLI)
- `@playwright/test` 1.60.0 (이미 설치)
- `@axe-core/playwright` 4.11.3 (이미 설치)
- `pixelmatch` + `pngjs` (visual diff)
- GitHub Actions secrets (E2E_STORAGE_*_B64, 4 role)
- Vercel preview URL (e2e workflow 의 webServer)

---

## 8. NON-FUNCTIONAL REQUIREMENTS

- **테스트 실행 시간**: 47 specs + a11y + visual 전체 < 30분 (병렬 실행)
- **테스트 격리**: 각 spec 은 자체 emulator state 로 시작 (beforeAll seed + afterAll cleanup)
- **flake rate**: < 5% (retries 3 후 fail 률)
- **coverage**: lib/ 의 핵심 모듈 70% 이상 (선택적 — Sprint 14 이후 일반 sprint 도 보존)
- **시각 diff threshold**: < 1% (pixelmatch ratio)

---

## 9. STAKEHOLDER

| Role | Person | 책임 |
|---|---|---|
| Owner | kay (사용자) | Sprint 승인, prod cutover 결정 |
| Tech Lead | Claude (AI) | 구현 + 검증 |
| QA | Claude (AI) + 사용자 | 시나리오 작성, bug triage |
| Operator | kay@agentkay.it | prod 배포 실행 |
