# Sprint 14 — Plan (Feature × Phase Breakdown)

> PRD 의 SUCCESS 항목을 11 features 로 분해.
> 각 feature 는 자체 PR + squash merge 가 단위.

---

## 1. Feature Map

| ID | Feature | Priority | 의존 | PR 예상 |
|---|---|--:|---|---|
| F14-A | Firebase emulator suite 분리 + e2e mode | P0 | — | 1 |
| F14-B | Auth specs 8건 + storageState 자동 export | P0 | F14-A | 1 |
| F14-C | Post specs 12건 ([TEST-Sprint14] 프리픽스) | P0 | F14-A, F14-B | 2 (CRUD + 인터랙션) |
| F14-D | Chat specs 10건 | P0 | F14-A, F14-B | 2 (channel + 인터랙션) |
| F14-E | Profile specs 6건 | P1 | F14-A, F14-B | 1 |
| F14-F | Admin specs 6건 + admin 권한 emulator | P1 | F14-A, F14-B | 1 |
| F14-G | Search specs 5건 | P2 | F14-A, F14-B | 1 |
| F14-H | axe-core a11y 3 page | P0 | F14-A | 1 |
| F14-I | Visual baseline 100 screenshot + diff | P1 | F14-A | 1 |
| F14-J | BUG-13-003 (UID 가시성) fix | P3 | — | 1 |
| F14-K | [TEST-Sprint14] cleanup 시나리오 + 자동 실행 | P0 | F14-B~G | 1 |

**총 PR 예상**: 13개 (각 PR squash merge → main 통합)

---

## 2. Phase Schedule

| Phase | 일자 | 산출물 |
|---|---|---|
| PRD | 05-19 | `prd.md` |
| Plan | 05-19 | 본 문서 |
| Design | 05-19 ~ 05-20 | `design.md` + `emulator/` 가이드 |
| Do | 05-20 ~ 05-29 | 13 PR (F14-A → F14-K) |
| Iterate | 05-29 ~ 05-31 | P0/P1 fix cycle ≤5 |
| QA | 05-31 ~ 06-01 | `reports/qa-summary.md` + matrix |
| Report | 06-01 | `report.md` |
| Archive | 06-02 | state JSON → archived |

---

## 3. F14-A — Firebase emulator suite 분리 + e2e mode

### 3.1 Tasks
- [F14-A-1] firebase-tools install + `firebase.json` 작성 (emulator suite 구성)
- [F14-A-2] `lib/firebase/client.ts` — `NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true` 시 emulator 연결 분기
- [F14-A-3] `lib/firebase/admin.ts` — 동일 분기 (server-side)
- [F14-A-4] `e2e/global-setup.ts` — emulator 자동 시작 + seed data import
- [F14-A-5] `e2e/global-teardown.ts` — emulator export + 정리
- [F14-A-6] `e2e/emulator/seed-fixtures.ts` — 4 role test user (admin/regular/banned/new) + 기본 데이터
- [F14-A-7] `e2e/emulator/auth-token-helper.ts` — Admin SDK 로 custom token 생성 → page.evaluate 로 signInWithCustomToken
- [F14-A-8] `.github/workflows/e2e.yml` 갱신 — emulator 자동 시작 + 환경변수 주입
- [F14-A-9] `scripts/test-e2e.sh` 갱신 — `--use-emulator` 플래그
- [F14-A-10] `next.config.ts` — e2e mode 시 AdSense/Sentry 비활성화 분기
- [F14-A-11] commit + PR + squash merge

### 3.2 DoD
- emulator suite (auth+firestore+storage+rtdb) 로컬 + CI 모두 동작
- staging deploy 영향 0 (분기 변수가 default false)
- e2e 모드에서 OAuth 자동 우회 (custom token 사용)

---

## 4. F14-B — Auth specs 8건

### 4.1 Tasks
- [F14-B-1] `e2e/tests/auth/login.spec.ts` — 정상 로그인 + 토큰 발급
- [F14-B-2] `e2e/tests/auth/register.spec.ts` — 첫 진입 → registered=true 전환
- [F14-B-3] `e2e/tests/auth/logout.spec.ts` — 로그아웃 + 세션 cleanup
- [F14-B-4] `e2e/tests/auth/banned.spec.ts` — banned role 시 게이트 차단
- [F14-B-5] `e2e/tests/auth/multi-tab.spec.ts` — 다중 탭 세션 sync
- [F14-B-6] `e2e/tests/auth/session-expiry.spec.ts` — refresh token 갱신
- [F14-B-7] `e2e/tests/auth/custom-token.spec.ts` — Admin SDK custom token flow
- [F14-B-8] `e2e/tests/auth/delete-account.spec.ts` — 회원탈퇴 + 데이터 cascade
- [F14-B-9] commit + PR + squash merge

### 4.2 DoD
- 8/8 spec green (chromium-desktop + chromium-mobile)
- 0 flake (3 회 반복 실행 통과)

---

## 5. F14-C — Post specs 12건 ([TEST-Sprint14] 프리픽스)

### 5.1 Tasks
**CRUD (PR 1)**:
- [F14-C-1] `post-text-create.spec.ts` — 텍스트 게시물 작성 → DB 저장 → 목록 반영
- [F14-C-2] `post-image-create.spec.ts` — 이미지 업로드 → CloudFront URL → 게시
- [F14-C-3] `post-youtube-create.spec.ts` — youtube URL embed 정상 노출
- [F14-C-4] `post-link-create.spec.ts` — 외부 링크 og:image preview
- [F14-C-5] `post-autosave.spec.ts` — 작성 중 30s autosave 동작
- [F14-C-6] `post-edit.spec.ts` — 본인 게시물 수정
- [F14-C-7] `post-delete.spec.ts` — 본인 게시물 삭제 + cascade (댓글)
- [F14-C-8] commit + PR + squash merge

**인터랙션 (PR 2)**:
- [F14-C-9] `post-comment.spec.ts` — 댓글 작성/수정/삭제
- [F14-C-10] `post-like.spec.ts` — 좋아요 토글 + count sync
- [F14-C-11] `post-report.spec.ts` — 게시물 신고 → admin 큐 진입
- [F14-C-12] `post-view.spec.ts` — view count 증가
- [F14-C-13] `post-legacy-img.spec.ts` — legacy URL 이미지 정상 노출
- [F14-C-14] commit + PR + squash merge

### 5.2 DoD
- 12/12 spec green
- 모든 테스트 데이터는 [TEST-Sprint14] 프리픽스 + e2eSeedId 태그
- afterAll cleanup 이 100% 데이터 회수

---

## 6. F14-D — Chat specs 10건

### 6.1 Tasks
**Channel (PR 1)**:
- [F14-D-1] `chat-channel-global.spec.ts` — 전체 채널 메시지 송수신
- [F14-D-2] `chat-channel-server.spec.ts` — 서버 채널 (S785)
- [F14-D-3] `chat-channel-clan.spec.ts` — 문파 채널 (미설정 → disabled)
- [F14-D-4] `chat-image.spec.ts` — 이미지 첨부 + CloudFront 노출
- [F14-D-5] `chat-link.spec.ts` — 링크 preview
- [F14-D-6] commit + PR + squash merge

**보안 / 정책 (PR 2)**:
- [F14-D-7] `chat-rate-limit.spec.ts` — rate limit (5 msg/10s) 차단
- [F14-D-8] `chat-report.spec.ts` — 메시지 신고
- [F14-D-9] `chat-banned.spec.ts` — banned 사용자 입력 차단
- [F14-D-10] `chat-leak.spec.ts` — XSS / script injection 차단
- [F14-D-11] `chat-mobile-drawer.spec.ts` — 모바일 드로어 (393×852)
- [F14-D-12] commit + PR + squash merge

### 6.2 DoD
- 10/10 spec green
- 채널 송수신 latency < 2s
- XSS 차단 100%

---

## 7. F14-E — Profile specs 6건

### 7.1 Tasks
- [F14-E-1] `profile-edit.spec.ts` — 프로필 수정 (닉네임 / 서버 / 문파)
- [F14-E-2] `profile-upload-photo.spec.ts` — presigned URL → S3 → CloudFront 끝-끝
- [F14-E-3] `profile-reset-photo.spec.ts` — 사진 제거 → default 이미지 복귀
- [F14-E-4] `profile-delete-account.spec.ts` — 회원탈퇴 + cascade (game data / chat / bookmarks)
- [F14-E-5] `profile-recent-activity.spec.ts` — 최근 본 항목 표시
- [F14-E-6] `profile-bookmarks.spec.ts` — 북마크 추가/제거 / 정렬
- [F14-E-7] commit + PR + squash merge

### 7.2 DoD
- 6/6 spec green
- 이미지 업로드 e2e 흐름 검증 (presigned URL → S3 → CloudFront)

---

## 8. F14-F — Admin specs 6건

### 8.1 Tasks
- [F14-F-1] `admin-pending-posts.spec.ts` — 승인 대기 큐 + 승인/거절
- [F14-F-2] `admin-chat-reports.spec.ts` — 채팅 신고 처리
- [F14-F-3] `admin-penalties.spec.ts` — 사용자 ban / 해제
- [F14-F-4] `admin-coupons.spec.ts` — 쿠폰 발급 / 회수
- [F14-F-5] `admin-dictionaries.spec.ts` — 진령 / 직업 dictionary 관리
- [F14-F-6] `admin-non-admin-403.spec.ts` — non-admin 접근 시 403
- [F14-F-7] commit + PR + squash merge

### 8.2 DoD
- 6/6 spec green
- admin 권한 게이트 100% 통과
- non-admin 우회 시도 0건 성공

---

## 9. F14-G — Search specs 5건

### 9.1 Tasks
- [F14-G-1] `search-korean.spec.ts` — 한글 검색 + 자모 분리
- [F14-G-2] `search-related.spec.ts` — 관련 항목 추천
- [F14-G-3] `search-recent-views.spec.ts` — 최근 본 + cookie 기반
- [F14-G-4] `search-tag.spec.ts` — tag 검색 + facet
- [F14-G-5] `search-empty-state.spec.ts` — 검색 결과 없음 empty state
- [F14-G-6] commit + PR + squash merge

### 9.2 DoD
- 5/5 spec green
- 한글 자모 검색 정확도 100%

---

## 10. F14-H — axe-core a11y 3 page

### 10.1 Tasks
- [F14-H-1] `e2e/tests/a11y/home.a11y.spec.ts` — `/` critical/serious 0
- [F14-H-2] `e2e/tests/a11y/post.a11y.spec.ts` — `/post/[id]` critical/serious 0
- [F14-H-3] `e2e/tests/a11y/chat.a11y.spec.ts` — `/chat/server-S785` critical/serious 0
- [F14-H-4] 발견된 violation fix (필요 시)
- [F14-H-5] commit + PR + squash merge

### 10.2 DoD
- 3/3 page axe-core critical/serious = 0
- WCAG 2.1 AA 부합

---

## 11. F14-I — Visual baseline 100 screenshot + diff

### 11.1 Tasks
- [F14-I-1] `e2e/visual/baseline.config.ts` — pixelmatch + threshold 1%
- [F14-I-2] `e2e/visual/capture-baseline.ts` — 50 page × (desktop + mobile) = 100 screenshot
- [F14-I-3] `e2e/visual/snapshots/` baseline commit
- [F14-I-4] `e2e/tests/visual/regression.spec.ts` — baseline 대비 diff
- [F14-I-5] `.github/workflows/visual.yml` — PR 마다 diff 결과 PR comment
- [F14-I-6] commit + PR + squash merge

### 11.2 DoD
- 100 baseline 캡처 완료
- diff < 1% (animation disable + viewport 고정)

---

## 12. F14-J — BUG-13-003 (/me/profile UID 가시성) fix

### 12.1 Tasks
- [F14-J-1] `app/(authed)/me/profile/page.tsx` — UID 노출 제거 (default)
- [F14-J-2] `NEXT_PUBLIC_DEBUG_PROFILE=true` 시에만 노출 옵션
- [F14-J-3] 이메일 노출 정책도 함께 재검토
- [F14-J-4] 회귀 spec 추가 (`profile-no-uid-leak.spec.ts`)
- [F14-J-5] commit + PR + squash merge

### 12.2 DoD
- production build 에서 UID 노출 0
- 회귀 spec green

---

## 13. F14-K — [TEST-Sprint14] cleanup 자동화

### 13.1 Tasks
- [F14-K-1] `scripts/cleanup-test-data.mjs` — Firebase Admin SDK 로 [TEST-Sprint14] 프리픽스 데이터 일괄 삭제
- [F14-K-2] `e2e/global-teardown.ts` 에 통합 — 각 spec 종료 후 자동 실행
- [F14-K-3] cleanup 시나리오 spec (검증)
- [F14-K-4] commit + PR + squash merge

### 13.2 DoD
- cleanup 실행 후 [TEST-Sprint14] 데이터 0
- spec 반복 실행 시 데이터 누적 0

---

## 14. Iterate / QA / Report / Archive

| Phase | 작업 |
|---|---|
| Iterate | matchRate < 90% 시 ≤5 cycle 내 fix (각 feature 의 PR 단위) |
| QA | data-flow-matrix 갱신 (Sprint 13 의 50 cells → 14 의 56 cells full coverage) + axe + visual + 모든 spec 합산 |
| Report | KPI / lessons / carry / Sprint 15 입력 정리 |
| Archive | 사용자 승인 후 state JSON → archived |
