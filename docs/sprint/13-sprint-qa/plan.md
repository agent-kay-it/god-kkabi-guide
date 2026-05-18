# Sprint 13 — Plan (WBS)

**Sprint ID**: `13-sprint-qa`
**상위 문서**: `prd.md`
**작성일**: 2026-05-18

---

## 1. WBS 구조

Sprint 13 은 **8개 Feature** × 8-Phase 컨테이너로 구성. 각 feature 는 독립 PR + squash merge.

| Feature ID | 이름 | 시나리오 수 | 우선순위 | 의존 |
|---|---|:--:|:--:|:--:|
| **F13-A** | Playwright workspace + CI 인프라 | — | P0 | — |
| **F13-B** | Auth + 세션 시나리오 | 8 | P0 | F13-A |
| **F13-C** | Post CRUD + 댓글 + 좋아요 + 북마크 시나리오 | 12 | P0 | F13-A |
| **F13-D** | Chat 3-tier + 이미지 + 신고 시나리오 | 10 | P0 | F13-A |
| **F13-E** | Profile + 회원탈퇴 + 프로필 사진 시나리오 | 6 | P1 | F13-A |
| **F13-F** | Admin 시나리오 (moderation + coupon + dict) | 6 | P1 | F13-A |
| **F13-G** | Search + Discovery + Recently-viewed 시나리오 | 5 | P2 | F13-A |
| **F13-H** | a11y + 시각 회귀 + Chrome MCP 탐색 + 종합 보고 | 13 | P0 | F13-B~G |

총 시나리오: **60** (50+ 목표 초과)
총 예상 task: **35**

---

## 2. Feature F13-A — Playwright Workspace + CI

**목표**: e2e 인프라 신규 구축.

| Task ID | 제목 | 산출물 | 시간 |
|---|---|---|---|
| 13-A-1 | `pnpm add -D @playwright/test @axe-core/playwright` + `pnpm playwright install --with-deps chromium` | package.json + lockfile | 20m |
| 13-A-2 | `playwright.config.ts` — projects: chromium-desktop + chromium-mobile + webkit-mobile, retries 2, fullyParallel true | config | 45m |
| 13-A-3 | `e2e/fixtures/test-users.ts` — Firebase Auth 실 test user (admin/regular/banned/new) 3개 + cookie pre-load fixture | fixture | 90m |
| 13-A-4 | `e2e/fixtures/seed-data.ts` — beforeAll 에 Firebase Admin SDK 로 시드 post/chat/bookmark 생성 + afterAll 정리 | fixture | 90m |
| 13-A-5 | `e2e/fixtures/chrome-mcp-helpers.ts` — `runChromeMCPScenario(name, steps)` 헬퍼 (각 scenario markdown 을 prompt 로 변환) | helper | 60m |
| 13-A-6 | `.github/workflows/e2e.yml` 신규 — vercel preview 대기 → playwright 실행 → report artifact | workflow | 60m |
| 13-A-7 | `scripts/test-e2e.sh` — local 실행 wrapper (tene run + emulator detect) | shell | 30m |
| 13-A-8 | F13-A commit + PR + squash merge | PR | 15m |

**완료 조건**: `pnpm test:e2e` 로컬 실행 시 dummy spec 1건 green.

---

## 3. Feature F13-B — Auth + 세션 (8 시나리오)

| Task ID | 제목 | 시나리오 | 시간 |
|---|---|---|---|
| 13-B-1 | `auth/01-google-signin.spec.ts` | 새 사용자 Google sign-in → registration 폼 → /me 진입 | 60m |
| 13-B-2 | `auth/02-existing-user-login.spec.ts` | 기존 사용자 1-tap 로그인 | 30m |
| 13-B-3 | `auth/03-logout.spec.ts` | 로그아웃 → 보호 페이지 redirect | 30m |
| 13-B-4 | `auth/04-banned-user.spec.ts` | banned role 사용자가 chat / post 작성 차단 확인 | 45m |
| 13-B-5 | `auth/05-multi-tab-session.spec.ts` | 탭 A 로그아웃 → 탭 B 보호 page refresh → redirect | 60m |
| 13-B-6 | `auth/06-session-expiry.spec.ts` | JWT 만료 후 갱신 | 45m |
| 13-B-7 | `auth/07-firebase-custom-token.spec.ts` | NextAuth session → Firebase custom token 동기화 (RTDB 연결 확인) | 60m |
| 13-B-8 | `auth/08-delete-account-cooldown.spec.ts` | 탈퇴 신청 → 30일 cooldown 표시 | 45m |
| 13-B-9 | F13-B commit + PR + squash merge | PR | 15m |

---

## 4. Feature F13-C — Post CRUD + Engagement (12 시나리오)

| Task ID | 제목 | 시나리오 | 시간 |
|---|---|---|---|
| 13-C-1 | `post/01-create-text-only.spec.ts` | 텍스트 post 작성 → 게시 → /post/[id] 진입 | 30m |
| 13-C-2 | `post/02-create-with-image.spec.ts` | 이미지 첨부 (presigned URL → S3 → CDN propagation 대기) → 본문 next/image 렌더 확인 | 90m |
| 13-C-3 | `post/03-create-with-youtube.spec.ts` | YouTube URL → embed 자동 변환 | 45m |
| 13-C-4 | `post/04-create-with-link-preview.spec.ts` | 일반 URL → OG preview 카드 | 45m |
| 13-C-5 | `post/05-autosave.spec.ts` | 작성 중 새로고침 → draft 복원 | 30m |
| 13-C-6 | `post/06-edit-post.spec.ts` | 본인 post 편집 → 본문 변경 | 30m |
| 13-C-7 | `post/07-delete-post.spec.ts` | 본인 post 삭제 → 404 | 30m |
| 13-C-8 | `post/08-comment-thread.spec.ts` | 댓글 작성 + 답글 + 좋아요 | 45m |
| 13-C-9 | `post/09-like-bookmark.spec.ts` | 좋아요 → /me/bookmarks 노출 | 45m |
| 13-C-10 | `post/10-report.spec.ts` | 신고 → admin 대기열 등장 | 45m |
| 13-C-11 | `post/11-view-count.spec.ts` | 두 사용자 view → count == 2 | 30m |
| 13-C-12 | `post/12-firebasestorage-legacy-img.spec.ts` | 레거시 firebasestorage URL post 가 native img 로 렌더 (Sprint 11 E 검증) | 30m |
| 13-C-13 | F13-C commit + PR + squash merge | PR | 15m |

---

## 5. Feature F13-D — Chat (10 시나리오)

| Task ID | 제목 | 시나리오 | 시간 |
|---|---|---|---|
| 13-D-1 | `chat/01-global-channel-send.spec.ts` | global 채널 텍스트 메시지 | 45m |
| 13-D-2 | `chat/02-server-channel.spec.ts` | 서버 채널 접근 (등록된 serverId 만) | 45m |
| 13-D-3 | `chat/03-guild-channel.spec.ts` | 문파 채널 접근 (등록된 guildId 만) | 45m |
| 13-D-4 | `chat/04-image-message.spec.ts` | 이미지 메시지 + Lightbox 열기 + ESC 닫기 | 90m |
| 13-D-5 | `chat/05-link-preview-in-message.spec.ts` | URL 메시지 → OG preview inline | 45m |
| 13-D-6 | `chat/06-rate-limit.spec.ts` | 5초 내 5건 초과 → 차단 | 45m |
| 13-D-7 | `chat/07-report-message.spec.ts` | 신고 → admin/chat 대기열 | 45m |
| 13-D-8 | `chat/08-banned-user-blocked.spec.ts` | banned 사용자 입력란 비활성 | 30m |
| 13-D-9 | `chat/09-channel-isolation.spec.ts` | global 메시지가 server/guild 채널에 누락되어 노출되지 않음 (cross-channel leak 차단) | 90m |
| 13-D-10 | `chat/10-mobile-drawer.spec.ts` | 모바일 sidebar drawer 열기/닫기 + 채널 전환 | 60m |
| 13-D-11 | F13-D commit + PR + squash merge | PR | 15m |

---

## 6. Feature F13-E — Profile (6 시나리오)

| Task ID | 제목 | 시나리오 | 시간 |
|---|---|---|---|
| 13-E-1 | `profile/01-edit-profile.spec.ts` | 닉네임/서버/문파 변경 | 30m |
| 13-E-2 | `profile/02-upload-photo.spec.ts` | 프로필 사진 업로드 → customPhotoURL 반영 | 60m |
| 13-E-3 | `profile/03-reset-photo.spec.ts` | 구글 사진으로 리셋 | 30m |
| 13-E-4 | `profile/04-delete-account-flow.spec.ts` | 탈퇴 신청 → 30일 cooldown 표시 | 45m |
| 13-E-5 | `profile/05-recent-activity.spec.ts` | /me 에 최근 활동 5건 노출 | 30m |
| 13-E-6 | `profile/06-bookmarks-list.spec.ts` | /me/bookmarks 정렬 + 페이지네이션 | 45m |
| 13-E-7 | F13-E commit + PR + squash merge | PR | 15m |

---

## 7. Feature F13-F — Admin (6 시나리오)

| Task ID | 제목 | 시나리오 | 시간 |
|---|---|---|---|
| 13-F-1 | `admin/01-pending-posts.spec.ts` | 신고된 post 승인/거절 | 60m |
| 13-F-2 | `admin/02-chat-reports.spec.ts` | 신고된 chat 메시지 처리 | 45m |
| 13-F-3 | `admin/03-penalties.spec.ts` | 사용자 ban / temp-ban / unban | 60m |
| 13-F-4 | `admin/04-coupons.spec.ts` | 쿠폰 생성 + 발급 → 사용자 redeem | 60m |
| 13-F-5 | `admin/05-dictionaries.spec.ts` | 사전 단어 추가 / 검색 마스킹 회귀 | 45m |
| 13-F-6 | `admin/06-non-admin-403.spec.ts` | regular role 이 /admin/* 진입 시 403 | 30m |
| 13-F-7 | F13-F commit + PR + squash merge | PR | 15m |

---

## 8. Feature F13-G — Search + Discovery (5 시나리오)

| Task ID | 제목 | 시나리오 | 시간 |
|---|---|---|---|
| 13-G-1 | `search/01-fulltext-korean.spec.ts` | 한글 부분 매칭 + diacritic stripping | 60m |
| 13-G-2 | `search/02-related-posts.spec.ts` | post 하단 관련 post 5건 표시 | 45m |
| 13-G-3 | `search/03-recent-views.spec.ts` | 최근 본 5건 노출 + 로그아웃 후 초기화 | 45m |
| 13-G-4 | `search/04-tag-navigation.spec.ts` | 카테고리/태그 클릭 → 필터 적용 | 30m |
| 13-G-5 | `search/05-empty-state.spec.ts` | 검색 결과 0건 → empty state UI | 30m |
| 13-G-6 | F13-G commit + PR + squash merge | PR | 15m |

---

## 9. Feature F13-H — a11y + 시각 회귀 + Chrome MCP 탐색 + 종합 (13 시나리오)

| Task ID | 제목 | 시나리오 | 시간 |
|---|---|---|---|
| 13-H-1 | `a11y/01-home.spec.ts` — axe 자동 / 0 violations | 시나리오 1 | 30m |
| 13-H-2 | `a11y/02-post-detail.spec.ts` | 시나리오 1 | 30m |
| 13-H-3 | `a11y/03-chat.spec.ts` | 시나리오 1 | 30m |
| 13-H-4 | `visual/baseline.spec.ts` — 100 screenshot baseline (mobile + desktop × 50 page) | baseline | 90m |
| 13-H-5 | `scenarios/01-google-signin-mobile.md` — Chrome MCP 탐색 | scenario md | 30m |
| 13-H-6 | `scenarios/02-post-with-image-upload.md` | scenario md | 45m |
| 13-H-7 | `scenarios/03-chat-image-message.md` | scenario md | 45m |
| 13-H-8 | `scenarios/04-profile-photo-upload.md` | scenario md | 30m |
| 13-H-9 | `scenarios/05-admin-moderation-flow.md` | scenario md | 30m |
| 13-H-10 | `scenarios/06-mobile-drawer-navigation.md` | scenario md | 30m |
| 13-H-11 | `scenarios/07-search-discovery.md` | scenario md | 30m |
| 13-H-12 | `scenarios/08-banned-user-restrictions.md` | scenario md | 30m |
| 13-H-13 | `scenarios/09-cross-tab-session.md` | scenario md | 30m |
| 13-H-14 | `scenarios/10-payment-redirect.md` (mock) | scenario md | 30m |
| 13-H-15 | `reports/data-flow-matrix.md` — 8 feature × 7 layer | 매트릭스 | 60m |
| 13-H-16 | `reports/qa-summary.md` + `reports/bug-tracker.md` | 보고서 | 90m |
| 13-H-17 | `checklist-prod-cutover.md` (Sprint 14 진입 게이트) | 체크리스트 | 60m |
| 13-H-18 | F13-H commit + PR + squash merge | PR | 15m |

---

## 10. 의존 그래프

```
F13-A (Playwright + CI 인프라)
   │
   ├──> F13-B (Auth)
   ├──> F13-C (Post)
   ├──> F13-D (Chat)
   ├──> F13-E (Profile)
   ├──> F13-F (Admin)
   └──> F13-G (Search)
           │
           └──> F13-H (a11y + 시각 + MCP + 종합)
```

F13-B~G 는 F13-A 완료 후 병렬 가능.

---

## 11. 예상 일정

| 일자 | 작업 |
|---|---|
| Day 1 | F13-A 전체 (인프라 + CI + dummy spec green) |
| Day 2 (오전) | F13-B (Auth 8건) |
| Day 2 (오후) | F13-C (Post 12건) — 절반 |
| Day 3 (오전) | F13-C 나머지 + F13-D (Chat 10건) |
| Day 3 (오후) | F13-D 나머지 + F13-E (Profile 6건) |
| Day 4 (오전) | F13-F (Admin 6건) + F13-G (Search 5건) |
| Day 4 (오후) | F13-H (a11y + visual baseline + MCP 시나리오) |
| Day 5 (오전) | Iterate — 발견 bug 후속 fix PR |
| Day 5 (오후) | QA 매트릭스 + 종합 보고서 + Archive |

---

## 12. Trust Level 조정

- 본 Sprint Trust L3 — Plan/Design/Do/Iterate/QA/Report 자동
- **Archive 직전 사용자 승인 게이트** (ENH-298)
- F13-A-6 (`.github/workflows/e2e.yml`) 같이 CI 추가는 **외부 영향 가능**, PR 단독 squash 가 안전
- 발견된 P0/P1 bug 는 Sprint 13 내부에서 fix → 새 PR 분기 (별도 sprint 신설 금지)
