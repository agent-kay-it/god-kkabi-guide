# Sprint MVP v2 Plan — WBS + Phase 분해

> 운영자: kay@agentkay.it
> 입력: `prd.md`, `design.md`, `SCOPE-CHANGE.md`
> Trust Level: L4 Aggressive + Chrome MCP 시각 검증
> 예상 기간: 6-8주 (가속 효과)

---

## 1. Phase 개요 (8 Phase + 사전)

| Phase | 기간 | 주요 산출물 | Quality Gate |
|-------|------|------------|------------|
| **P0 pre** | 0.5일 | SCOPE-CHANGE 결정 + Sprint v2 state 등록 | M0 |
| **P1 plan** | 0.5일 (이미 완료) | PRD v2 + Plan v2 + Design v2 | M1 |
| **P2 design 보강** | 1-2일 | Firestore 스키마 + 디자인 토큰 + Auth flow | M2 |
| **P3 do.A 스캐폴딩 + Auth** | 3-4일 | 신규 디자인 토큰 적용 + Firebase Auth 통합 + 등록 폼 + Settings | M7 (TS strict) |
| **P3 do.B 위키 코어** | 5-7일 | 직업 3 entity + 진령 11 entity + 북마크 + 신규 홈 + 직업 진단 | — |
| **P3 do.C 위키 확장** | 5-7일 | 장비 30+ + 스킬 15+ + 문파 + 콘텐츠 20+ + Tips 확장 | — |
| **P3 do.D 채팅 + 배포** | 4-5일 | 3 채널 채팅 + 이미지 + 플로팅 + 알림 + admin + production 배포 | M3, M4, M5 |
| **P4 check** | 1일 | Lighthouse + WCAG + Gap analysis | M4, M5 |
| **P5 act** | 1-2일 | iterate (필요 시) | M8 |
| **P6 qa** | 1-2일 | 7-layer dataFlowIntegrity + E2E Chrome 5 시나리오 | — |
| **P7 report** | 0.5일 | KPI 추적 시작 + V1 인풋 정리 | M9 |
| **P8 archive** | 0.5일 | Sprint state 종료 + 다음 Sprint 입력 | M10 |

**총 예상 기간**: 24-35일 (3.5-5주, 단일 운영자 풀 타임 가정)
**가속 효과 적용 후**: 6-8주 (운영자 SLA 5-15h/주 기준)

---

## 2. WBS (Work Breakdown Structure)

### Phase 0 (사전) — 0.5일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P0.T-001 | 기존 sprint-mvp state 'archived' 처리 + report 링크 명시 | AI | 0.5 | (없음) | `.bkit/state/sprints/god-kkabi-guide-sprint-mvp.json` 업데이트 |
| P0.T-002 | 신규 sprint-mvp-v2 state 생성 (trustLevel 4 + autoPauseTriggers) | AI | 0.5 | T-001 | `.bkit/state/sprints/god-kkabi-guide-sprint-mvp-v2.json` |
| P0.T-003 | 기존 v1 컴포넌트/페이지 archive 브랜치 보관 (`archive/v1-static-guide`) | AI | 0.5 | (없음) | git 브랜치 |
| P0.T-004 | source/godkkabi-guide/.git 제거 + 자산 인벤토리 정리 | AI | 0.5 | T-003 | clean source/ |

### Phase 1 (plan) — 이미 완료 (3 산출물 작성됨)

| 산출물 | 상태 |
|--------|------|
| `docs/sprint/03-sprint-mvp-v2/SCOPE-CHANGE.md` | ✅ |
| `docs/sprint/03-sprint-mvp-v2/prd.md` | ✅ |
| `docs/sprint/03-sprint-mvp-v2/design.md` | ✅ |
| `docs/sprint/03-sprint-mvp-v2/plan.md` (본 문서) | ✅ |
| `docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md` | ⏳ (최종 종합) |

### Phase 2 (design 보강) — 1-2일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P2.T-005 | Firestore 12 컬렉션 스키마 finalize + 보안 규칙 draft | AI | 3 | design.md §5 | `docs/sprint/03-sprint-mvp-v2/firestore-schema.md` |
| P2.T-006 | Firebase Auth + Custom Claims 흐름 다이어그램 + 시퀀스 다이어그램 | AI | 2 | design.md §4 | `docs/sprint/03-sprint-mvp-v2/auth-flow.md` |
| P2.T-007 | 신규 디자인 토큰 (18개) finalize + WCAG AA 콘트라스트 검증 | AI | 2 | design.md §3 | `docs/sprint/03-sprint-mvp-v2/design-tokens-v2.json` |
| P2.T-008 | Pretendard 폰트 로드 전략 결정 (localFont vs CDN) | 운영자+AI | 1 | T-007 | 결정 기록 |
| P2.T-009 | 컴포넌트 인벤토리 v2 finalize (재사용 10 + 재작성 5 + 신규 21) | AI | 2 | design.md §10 | `docs/sprint/03-sprint-mvp-v2/component-inventory-v2.md` |
| P2.T-010 | wiki 엔티티 시드 데이터 작성 계획 (운영자 콘텐츠 작성 일정) | 운영자+AI | 2 | design.md §5 | 운영자 콘텐츠 시드 일정 |

**M2 Gate**: Phase 2 보강 6 산출물 완성 + 운영자 결정 G1 (Auth Provider), G2 (채팅 백엔드).

### Phase 3 do.A (스캐폴딩 + Auth) — 4-5일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P3.A.T-011 | source/godkkabi-guide/images 11 webp → public/images/ 복사 | AI | 0.5 | P0.T-004 | public/images/ |
| P3.A.T-012 | Google Play CDN 9 screenshots 다운로드 → public/images/screenshot-*.webp | 운영자 | 1 | T-011 | 자체 호스팅 이미지 |
| P3.A.T-013 | app/globals.css 디자인 토큰 v2 교체 (18 토큰) | AI | 2 | P2.T-007 | globals.css 갱신 |
| P3.A.T-014 | Pretendard Variable 폰트 통합 (localFont) | AI | 1 | P2.T-008 | layout.tsx 갱신 |
| P3.A.T-015 | Firebase Auth + Realtime DB + Storage 활성화 (운영자 콘솔) | 운영자 | 1 | (없음) | Firebase 콘솔 설정 |
| P3.A.T-015b | Kakao Developers 앱 등록 + REST API 키 발급 | 운영자 | 1 | (없음) | Kakao 키 |
| P3.A.T-015c | NextAuth.js v5 (Auth.js) 통합 + Firebase Adapter | AI | 3 | T-015, T-015b | next-auth 설정 |
| P3.A.T-016 | lib/firebase/auth.ts (signInWithCustomToken + signOut + getAuthClient) | AI | 2 | T-015c | lib/firebase/auth.ts |
| P3.A.T-016b | Server Action `/api/auth/kakao/callback` (Kakao token → Firebase custom token) | AI | 2 | T-015b | Kakao bridge |
| P3.A.T-017 | lib/auth/useAuth.ts hook + lib/auth/server.ts (verifyAuth) | AI | 2 | T-016 | lib/auth/* |
| P3.A.T-018 | app/(auth)/sign-in/page.tsx + SignInButton 2종 (Google/Kakao) | AI | 2 | T-016 | sign-in 페이지 |
| P3.A.T-019 | UserRegisterForm 컴포넌트 + 5 필드 + PIPA 동의 4 체크박스 (Zod 검증) | AI | 4 | T-017 | components/feature/user-register-form.tsx |
| P3.A.T-020 | app/(auth)/register/page.tsx + Server Action `/api/auth/register` | AI | 3 | T-019, P2.T-005 | 등록 페이지 + Server Action |
| P3.A.T-021 | app/(user)/layout.tsx (auth guard + redirect 로직) | AI | 1 | T-017 | 권한 가드 |
| P3.A.T-022 | app/(user)/settings/page.tsx (UID 외 모든 필드 수정) | AI | 3 | T-021 | settings 페이지 |
| P3.A.T-023 | UserAvatar 컴포넌트 (photoURL + nickname + classBadge) | AI | 1.5 | T-017 | components/feature/user-avatar.tsx |
| P3.A.T-024 | Firebase Security Rules 배포 (users, servers, munpas) | AI+운영자 | 1 | P2.T-005 | firestore.rules |
| P3.A.T-025 | typecheck + lint + build 검증 | AI | 0.5 | T-022 | 통과 |
| P3.A.T-026 | feature/p3-v2-doa-auth 브랜치 commit + staging push | AI | 0.5 | T-025 | git push |

### Phase 3 do.B (위키 코어 + 북마크 + 홈) — 5-7일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P3.B.T-027 | lib/firestore/wiki.ts (getWikiClass / getWikiJinryeong / getAllWikiEntries) | AI | 3 | P3.A.T-024 | wiki 어댑터 |
| P3.B.T-028 | WikiCategoryNav 컴포넌트 (6 카테고리 사이드바) | AI | 2 | (없음) | components/domain/wiki-category-nav.tsx |
| P3.B.T-029 | StatsGrid + SynergyBlock + SourceCitation 신규 컴포넌트 3개 | AI | 4 | (없음) | components/domain/* |
| P3.B.T-030 | Hero 재작성 (banner-korean-carry 배경 + 신규 톤) | AI | 3 | P3.A.T-014 | components/domain/hero.tsx 재작성 |
| P3.B.T-031 | ClassCard 재작성 (vermilion/bronze/indigo + StatsGrid) | AI | 3 | T-029 | components/domain/class-card.tsx 재작성 |
| P3.B.T-032 | JinryeongCard 재작성 (catalog 모티프) | AI | 3 | T-029 | components/domain/jinryeong-card.tsx 재작성 |
| P3.B.T-033 | app/(public)/page.tsx 홈 재작성 (Hero + Wiki 미리보기 + 직업진단 CTA) | AI | 4 | T-030, T-031 | 홈 페이지 v2 |
| P3.B.T-034 | app/(public)/wiki/page.tsx 위키 인덱스 | AI | 3 | T-028 | wiki 인덱스 |
| P3.B.T-035 | app/(public)/wiki/class/page.tsx 직업 종합 + 동적 [classId]/page.tsx | AI | 5 | T-031, T-027 | 직업 4 페이지 |
| P3.B.T-036 | wiki_classes Firestore 시드 데이터 작성 (3 entity) | 운영자+AI | 4 | T-027 | Firestore 3 docs |
| P3.B.T-037 | app/(public)/wiki/jinryeong/page.tsx 카탈로그 + [id]/page.tsx | AI | 5 | T-032, T-027 | 진령 12 페이지 |
| P3.B.T-038 | wiki_jinryeong Firestore 시드 데이터 작성 (11 entity) | 운영자+AI | 6 | T-027 | Firestore 11 docs |
| P3.B.T-039 | BookmarkButton 컴포넌트 + lib/bookmark/toggle.ts | AI | 3 | P3.A.T-021 | components/feature/bookmark-button.tsx |
| P3.B.T-040 | app/(user)/my/bookmarks/page.tsx 북마크 모음 + BookmarkList | AI | 3 | T-039 | 북마크 페이지 |
| P3.B.T-041 | app/(public)/class-quiz/page.tsx 재작성 (ClassQuiz 재사용 + v2 디자인) | AI | 2 | T-031 | 직업 진단 v2 |
| P3.B.T-042 | logEvent('bookmark_add/remove', 'wiki_entity_view') 통합 | AI | 1 | T-039 | analytics 통합 |
| P3.B.T-043 | typecheck + lint + build + Chrome 시각 검증 | AI | 1 | T-042 | 통과 |
| P3.B.T-044 | feature/p3-v2-dob-wiki-core 커밋 + staging push | AI | 0.5 | T-043 | git push |

### Phase 3 do.C (위키 확장 + Tips) — 5-7일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P3.C.T-045 | WikiEntityCard 카탈로그 카드 신규 컴포넌트 | AI | 2 | (없음) | components/domain/wiki-entity-card.tsx |
| P3.C.T-046 | app/(public)/wiki/equipment/page.tsx 카탈로그 + [slug]/page.tsx | AI | 4 | T-045 | 장비 페이지 |
| P3.C.T-047 | wiki_equipments Firestore 시드 (30 entity) | 운영자+AI | 8 | (없음) | Firestore 30 docs |
| P3.C.T-048 | app/(public)/wiki/skill/page.tsx 카탈로그 + [slug]/page.tsx | AI | 4 | T-045 | 스킬 페이지 |
| P3.C.T-049 | wiki_skills Firestore 시드 (15 entity, 3 직업 × Core/Active/Passive) | 운영자+AI | 5 | (없음) | Firestore 15 docs |
| P3.C.T-050 | app/(public)/wiki/munpa-system/page.tsx | AI | 3 | T-045 | 문파 페이지 |
| P3.C.T-051 | app/(public)/wiki/content/page.tsx 카탈로그 + [slug]/page.tsx | AI | 4 | T-045 | 콘텐츠 페이지 |
| P3.C.T-052 | wiki_contents Firestore 시드 (20 entity, 던전 5 + 이벤트 15) | 운영자+AI | 5 | (없음) | Firestore 20 docs |
| P3.C.T-053 | app/(public)/tips/page.tsx 확장 + [id]/page.tsx 상세 | AI | 3 | T-045 | Tips 페이지 |
| P3.C.T-054 | app/(user)/tips/new/page.tsx 사용자 팁 작성 + Server Action | AI | 3 | P3.A.T-021 | 팁 작성 페이지 |
| P3.C.T-055 | app/(public)/coupon/page.tsx 재작성 (CouponCode v2 + 신고 버튼) | AI | 3 | (없음) | 쿠폰 페이지 v2 |
| P3.C.T-056 | app/(public)/intro/page.tsx + app/(public)/sources/page.tsx 갱신 | AI | 2 | (없음) | intro/sources |
| P3.C.T-057 | typecheck + lint + build 검증 | AI | 1 | T-056 | 통과 |
| P3.C.T-058 | feature/p3-v2-doc-wiki-expansion 커밋 + staging push | AI | 0.5 | T-057 | git push |

### Phase 3 do.D (채팅 + admin + 배포) — 4-5일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P3.D.T-059 | lib/firebase/storage.ts + Storage 보안 규칙 배포 + browser-image-compression 통합 | AI+운영자 | 2 | P3.A.T-024 | Storage 활성화 + 자동 압축 |
| P3.D.T-059b | lib/firebase/realtime-db.ts + Realtime DB 보안 규칙 배포 | AI+운영자 | 1 | P3.A.T-015 | Realtime DB 활성화 |
| P3.D.T-060 | lib/chat/subscribe.ts (Realtime DB `onValue` + `onChildAdded` 페이지네이션) | AI | 3 | T-059b | chat SDK |
| P3.D.T-061 | lib/chat/send.ts + Server Action `/api/chat/send` (sanitize + 욕설 마스킹 + rate limit) | AI | 3 | T-060 | chat send |
| P3.D.T-061b | lib/moderation/korean-bad-words.ts (사전 20-30 키워드 + 별표 마스킹) | AI | 1 | (없음) | text filter |
| P3.D.T-062 | lib/chat/upload-image.ts (Storage 1MB 검증) | AI | 2 | T-059 | image upload |
| P3.D.T-063 | MessageList + MessageItem + MessageInput 3 컴포넌트 | AI | 5 | T-060 | components/chat/* |
| P3.D.T-064 | ChannelSwitcher (global/server/munpa) + 자동 채널 가입 | AI | 3 | P3.A.T-020 | components/chat/channel-switcher.tsx |
| P3.D.T-065 | FloatingChat 위젯 (우하단 fixed + 토글 + 새 메시지 dot) | AI | 4 | T-063, T-064 | components/chat/floating-chat.tsx |
| P3.D.T-066 | ImageUploadButton + 채팅 이미지 첨부 통합 | AI | 2 | T-062 | components/chat/* |
| P3.D.T-067 | NewMessageToast 알림 (sonner) | AI | 2 | T-063 | 알림 |
| P3.D.T-068 | app/(public)/layout.tsx에 FloatingChat 통합 | AI | 0.5 | T-065 | layout 갱신 |
| P3.D.T-068b | ReportButton 컴포넌트 + Server Action `/api/moderation/report` (중복/자기 신고 차단) | AI | 3 | T-061 | components/feature/report-button.tsx |
| P3.D.T-068c | chat_reports Firestore 컬렉션 + 자동 숨김 3회 임계 로직 | AI | 2 | T-068b | 신고 시스템 |
| P3.D.T-069 | app/(admin)/admin/page.tsx 대시보드 (KPI 카운터) | AI | 3 | P3.A.T-021 | admin 페이지 |
| P3.D.T-070 | app/(admin)/admin/coupons/page.tsx 쿠폰 CRUD | AI | 4 | T-069 | admin coupons |
| P3.D.T-071 | app/(admin)/admin/moderation/page.tsx 신고 큐 + ⭐ **유지/삭제/리셋** 액션 (운영자 신고 해지) | AI | 5 | T-069 | admin moderation |
| P3.D.T-071b | 운영자 액션 audit log (`moderation_logs` 컬렉션) + 30일 보존 정책 | AI | 1.5 | T-071 | audit |
| P3.D.T-072 | logEvent v2 신규 8 이벤트 통합 (sign_in/register/bookmark/chat/wiki_view/tip_create) | AI | 2 | 전 Phase | analytics 확장 |
| P3.D.T-073 | sitemap.ts 동적 갱신 (wiki entity 80+ 포함) | AI | 2 | P3.C 모든 wiki | sitemap.ts v2 |
| P3.D.T-074 | next.config.ts CSP 갱신 (Firebase Storage + Auth 추가) | AI | 0.5 | (없음) | CSP v2 |
| P3.D.T-075 | typecheck + lint + build + Chrome 시각 검증 | AI | 1.5 | T-074 | 통과 |
| P3.D.T-076 | feature/p3-v2-dod-chat + staging push | AI | 0.5 | T-075 | git push |
| P3.D.T-077 | **운영자 G3 게이트** — 이미지 정책 확인 (1MB / JPG·PNG·WebP) | 운영자 | 0.5 | T-066 | 결정 |
| P3.D.T-078 | **운영자 G4 게이트** — 도메인 결정 + DNS 설정 | 운영자 | 1 | (없음) | 도메인 등록 |
| P3.D.T-079 | Vercel production 배포 (vercel deploy --prod) | AI | 1 | T-076 | production 라이브 |

**M3 Gate**: Lighthouse + Production 라이브 + Auth + 채팅 작동.

### Phase 4 check — 1일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P4.T-080 | Lighthouse Mobile 측정 (홈 + wiki/class/swordsman + coupon) | AI | 1 | P3.D.T-079 | Lighthouse JSON |
| P4.T-081 | WCAG AA 검증 (axe-core 또는 Lighthouse a11y 92+) | AI | 1 | T-080 | a11y 보고서 |
| P4.T-082 | Gap analysis (design.md vs 실제 구현) | AI | 2 | T-081 | gap 보고서 |
| P4.T-083 | Chrome MCP mobile viewport 시각 검증 (375 / 768 / 1280) | AI | 2 | T-082 | 시각 검증 |
| P4.T-084 | Firebase Auth 동작 검증 (실제 Google OAuth + 등록 흐름) | AI+운영자 | 1 | (없음) | Auth 검증 |
| P4.T-085 | 채팅 실시간 동작 검증 (2 브라우저 동시 메시지 전송) | AI+운영자 | 1 | (없음) | 채팅 검증 |

**M4/M5 Gate**: Lighthouse ≥ 85 / Accessibility ≥ 90.

### Phase 5 act — 1-2일 (필요 시)

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P5.T-086 | Performance < 85 시 iterate (LCP + 번들 분리) | AI | 4 | P4.T-080 | 성능 개선 |
| P5.T-087 | Gap < 90% 시 iterate (누락 컴포넌트/페이지 보강) | AI | 4 | P4.T-082 | gap 보강 |
| P5.T-088 | Chrome 시각 차이 발견 시 디자인 조정 | AI | 2 | P4.T-083 | 디자인 fix |
| P5.T-089 | iterate 후 재측정 + 통과 확인 | AI | 1 | T-086~088 | 재측정 PASS |

**M8 Gate**: iterate 후 Lighthouse ≥ 85 + Gap ≥ 90%.

### Phase 6 qa — 1-2일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P6.T-090 | E2E 시나리오 1 — Google 로그인 → 등록 → 홈 | AI | 1 | (없음) | E2E PASS |
| P6.T-091 | E2E 시나리오 2 — Wiki 진령 페이지 → 북마크 → 모음 확인 | AI | 1 | (없음) | E2E PASS |
| P6.T-092 | E2E 시나리오 3 — 채팅 메시지 + 이미지 전송 → 다른 브라우저 수신 | AI+운영자 | 1.5 | (없음) | E2E PASS |
| P6.T-093 | E2E 시나리오 4 — 쿠폰 복사 + 직업 진단 + 검객 빌드 dwell | AI | 1 | (없음) | E2E PASS |
| P6.T-094 | E2E 시나리오 5 — admin 쿠폰 CRUD + 신고 처리 | AI+운영자 | 1 | (없음) | E2E PASS |
| P6.T-095 | 7-layer dataFlowIntegrity (UI → Client → API → Validation → DB → Response → UI) | AI | 2 | T-090~094 | 7-layer PASS |
| P6.T-096 | Firebase DebugView 9 v1 + 8 v2 이벤트 = 17 이벤트 발화 검증 | AI+운영자 | 1.5 | (없음) | GA4 검증 |

### Phase 7 report — 0.5일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P7.T-097 | `docs/sprint/03-sprint-mvp-v2/report.md` 작성 | AI | 2 | P6 완료 | Sprint v2 report |
| P7.T-098 | KPI 추적 시작 라인 명시 (M+30 / M+90) | AI | 0.5 | T-097 | KPI 라인 |
| P7.T-099 | V1+ 인풋 자산 정리 | AI | 1 | T-097 | V1 인풋 |

### Phase 8 archive — 0.5일

| ID | 태스크 | 담당 | 예상 (h) | 의존성 | 산출물 |
|----|------|------|---------|--------|--------|
| P8.T-100 | sprint-mvp-v2 state 'completed' + 다음 Sprint 정의 | AI | 1 | P7 완료 | state 종료 |
| P8.T-101 | main 브랜치 PR 생성 (staging → main 머지) | AI+운영자 | 1 | (없음) | PR |

---

## 3. 태스크 총합

- **총 태스크**: 101개
- **AI 단독**: 약 70개 (70%)
- **AI+운영자**: 약 25개 (25%)
- **운영자 단독**: 약 6개 (6%) — Firebase 활성화, 콘텐츠 시드, 도메인 결정

---

## 4. Critical Path (의존성)

```
P0 → P1 (이미 완료) → P2 보강 → P3.A Auth → P3.B 위키코어 → P3.C 위키확장 → P3.D 채팅+배포 → P4 check → P5 act (선택) → P6 qa → P7 report → P8 archive
```

**병렬 가능 경로**:
- P3.B 위키코어 진행 중 → P3.C 콘텐츠 시드 작업 (운영자 작성) 병행 가능
- P3.D 채팅 진행 중 → P3.D admin 페이지 병행 가능
- P3.C wiki_equipments 시드 30 entity 작성 (운영자) → 동시에 P3.D 채팅 진행 가능

---

## 5. 운영자 결정 게이트 일정

| 게이트 | 시점 | 결정 사항 |
|--------|------|---------|
| **G1 Auth Provider** | P2 design | Google OAuth (1차 권장) vs Google+카카오 듀얼 |
| **G2 채팅 백엔드** | P2 design | Firestore onSnapshot (권장) vs Realtime DB |
| **G3 이미지 정책** | P3.D do.D | 최대 크기 (1MB 권장) + 모더레이션 정책 |
| **G4 도메인 등록** | P3.D do.D | kkaebizigi.com / gokkaebi.guide / jinryeong.kr 등 |
| **G5 Blaze 전환** | M3 graduation | DAU 200+ 도달 시 Blaze 전환 여부 |

---

## 6. Risk Register (RAID)

| ID | 위험 | 확률 | 영향 | 대응 |
|----|------|-----|------|------|
| R1 | Auth 진입 장벽 → 이탈 | 30% | 高 | wiki read 익명 허용 + 가입 단순화 |
| R2 | 채팅 비활성 → 빈 채널 | 40% | 中 | 운영자 매일 1-2 메시지 시드 |
| R3 | Firestore Spark 한도 초과 | 25% | 高 | 채팅 무한 스크롤 페이지네이션 + Blaze 전환 |
| R4 | 사용자 신고/스팸 | 20% | 高 | 24h 신고 검토 + 자동 숨김 임계 |
| R5 | Joy Nice Games 법적 클레임 | 5% | 致命 | 비공식 명시 + 24h 삭제 약속 |
| R6 | 디자인 시스템 불일치 | 10% | 中 | P3.B 단계 운영자 시각 검증 |
| R7 | wiki 시드 콘텐츠 부족 (≥80 entity) | 35% | 中 | MVP 시드 50 entity로 축소 가능 |
| R8 | Pretendard 폰트 사이즈 영향 | 15% | 低 | localFont 최적화 + sub-setting |

---

## 7. Quality Gates 매트릭스

| Gate | 기준 | Phase | 자동/수동 |
|------|------|-------|----------|
| M0 | Sprint state 등록 | P0 | 자동 |
| M1 | plan 4 산출물 완성 | P1 | 자동 |
| M2 | design 보강 6 산출물 + G1/G2 결정 | P2 | 자동+수동 |
| M3 | 졸업 조건 (Lighthouse + Production) | P3.D | 자동 |
| M4 | Lighthouse Mobile ≥ 85 | P4 | 자동 |
| M5 | WCAG AA / Accessibility ≥ 90 | P4 | 자동 |
| M7 | TS strict, lint 0 warning | 모든 Phase | 자동 |
| M8 | iterate 후 ≥ 85 | P5 | 자동 |
| M9 | report 작성 | P7 | 자동 |
| M10 | Sprint archive | P8 | 자동 |

---

## 8. Auto-Pause Triggers

| Trigger | 조건 | 작동 |
|---------|------|------|
| QUALITY_GATE_FAIL | M3/M4/M5 미달 | iterate (P5) 자동 진입 |
| ITERATION_EXHAUSTED | P5 iterate 5회 | 운영자 통보 + 일시 정지 |
| BUDGET_EXCEEDED | Spark 한도 80% 도달 | 운영자 G5 게이트 |
| PHASE_TIMEOUT | Phase 예상 시간 2배 초과 | 운영자 결정 |
| OPERATOR_DECISION | G1-G5 게이트 | 운영자 직접 결정 후 재개 |

---

> **다음 산출물**: `MASTER-PLAN.md` (Sprint 전체 종합 요약)
