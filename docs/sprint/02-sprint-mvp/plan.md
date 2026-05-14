# Sprint MVP Plan — 8 Phase WBS (12주, M1-M3)

> **Sprint ID**: `god-kkabi-guide-sprint-mvp`
> 기간: 2026-05-17 ~ 2026-08-09 (12주, 약 84일)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.2 · PRD: `docs/sprint/02-sprint-mvp/prd.md`

---

## 1. 표준 8 Phase 시퀀스 (Master Plan §3.2 일치)

```
Phase 1: plan       (1주)  → 콘텐츠 정책 + 9섹션 분석 + 컴포넌트 인벤토리
Phase 2: design     (1주)  → Next.js 페이지 구조 + Firestore 6 컬렉션 + 디자인 시스템
Phase 3: do         (8주)  → 스캐폴딩 → 콘텐츠 → 컴포넌트 → 페이지 → SEO → 배포
Phase 4: check      (0.5주) → Gap analysis + Lighthouse + 모바일 320-414px 테스트
Phase 5: act        (0.5주) → 개선 iterate (Lighthouse <90 시)
Phase 6: qa         (0.5주) → 7-layer dataFlowIntegrity (URL→GA4→Firestore)
Phase 7: report     (0.5주) → 운영자 보고서(30/90일 KPI 측정) + V1 진입 가/부
Phase 8: archive    (0.5주) → .bkit/state 기록 + 회고 + V1 인풋 전달
```

**총 12주 (8.4주 = 약 60일 핵심 작업 + 3.6주 분석/문서화). 운영자 주 5-15h SLA 기준 최대 180h 가용 → 작업 시간 충분.**

---

## 2. Phase 1: plan (1주 / Day 1-7)

### 2.1 산출물

- [ ] `docs/policies/content-policy.md` (D2 하이브리드 70/30)
- [ ] `docs/sprint/02-sprint-mvp/component-inventory.md` (컴포넌트 14종 명세)
- [ ] `docs/sprint/02-sprint-mvp/seo-keyword-50.md` (롱테일 50개 키워드)
- [ ] `docs/sprint/02-sprint-mvp/gtm-seed-guide.md` (디시/카페 시드 가이드)
- [ ] `docs/sprint/02-sprint-mvp/operator-checklist.md` (운영자 사전 준비 8개 카테고리)

### 2.2 WBS (Task 번호 T-001 ~ T-012)

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P1.T-001 | 콘텐츠 정책 문서 작성 (D2 70/30, 인용 출처 명시 의무, 이미지 핫링크 정책, 분쟁 대응) | 운영자 | 3 | (없음) | `content-policy.md` |
| MVP.P1.T-002 | 원본 HTML 9 섹션 분석 + 컴포넌트 추출 (1444 lines 분해) | AI | 4 | (없음) | 컴포넌트 인벤토리 draft |
| MVP.P1.T-003 | 컴포넌트 14종 명세 작성 (Hero/TOC/ClassCard/JinryeongCard/TierList/ComboCard/CouponCode/Alert/PriorityFlow/PayTier/EventCard/TipCard/ScreenshotStrip/Footer) | 운영자+AI | 3 | T-002 | `component-inventory.md` |
| MVP.P1.T-004 | SEO 롱테일 50개 키워드 카테고리화 (직업8/진령11/스킬8/쿠폰5/이벤트4/메타6/빌드5/공략3) | 운영자+AI | 3 | (없음) | `seo-keyword-50.md` |
| MVP.P1.T-005 | GTM Phase 1 시드 가이드 (디시 갓깨비 마이너 갤러리 / 네이버 카페 5곳 / 카톡 단톡방) | 운영자 | 2 | (없음) | `gtm-seed-guide.md` |
| MVP.P1.T-006 | 운영자 사전 준비 체크리스트 검증 (Master Plan §10.1) | 운영자 | 4 | (없음) | `operator-checklist.md` |
| MVP.P1.T-007 | 도메인 후보 3개 Whois 확인 (`gokkaebi-guide.com`, `god-kkabi.kr`, `갓깨비공략.kr`) | 운영자 | 1 | T-006 | 가용 도메인 1개 선정 |
| MVP.P1.T-008 | GitHub repo `god-kkabi-guide` 생성 (public/private 결정) | 운영자 | 0.5 | T-006 | GitHub repo URL |
| MVP.P1.T-009 | Vercel 프로젝트 `gokkaebi-guide` 생성 + GitHub 연동 | 운영자 | 1 | T-008 | Vercel project URL |
| MVP.P1.T-010 | Firebase 프로젝트 `gokkaebi-guide-prod` 생성 (Spark Plan) | 운영자 | 1 | T-006 | Firebase project URL |
| MVP.P1.T-011 | tene 시크릿 11개 설정 (Master Plan §10.1.F) | 운영자 | 2 | T-009, T-010 | `tene list` 검증 |
| MVP.P1.T-012 | Phase 1 종료 게이트 운영자 승인 (L3 Trust 수동) | 운영자 | 0.5 | T-001~T-011 | `/sprint phase ... --to design` |

### 2.3 Phase 1 종료 게이트 (운영자 수동, L3)

- [ ] 콘텐츠 정책 문서 완성 + 운영자 확인
- [ ] 컴포넌트 인벤토리 14종 명세 완성
- [ ] SEO 키워드 50개 카테고리화 완료
- [ ] 도메인 + GitHub + Vercel + Firebase 4개 인프라 계정/리소스 생성 확인
- [x] tene 시크릿 7개 (NEXT_PUBLIC_FIREBASE_* API_KEY/AUTH_DOMAIN/PROJECT_ID/STORAGE_BUCKET/MESSAGING_SENDER_ID/APP_ID/MEASUREMENT_ID) × 3 환경(local/staging/prod) = 21개 모두 암호화 완료 (2026-05-14). 별도 GA4 property 셋업 불필요 — Firebase Analytics 통합 (design.md §10.2)

---

## 3. Phase 2: design (1주 / Day 8-14)

### 3.1 산출물

- [ ] `docs/sprint/02-sprint-mvp/design.md` (페이지 구조 + Firestore 스키마 + 디자인 시스템)
- [ ] `docs/sprint/02-sprint-mvp/firestore-rules.md` (보안 규칙 v1, MVP는 read-only public)
- [ ] `docs/sprint/02-sprint-mvp/design-tokens.json` (HTML 토큰 → Tailwind/CSS Modules)
- [ ] `docs/sprint/02-sprint-mvp/ga4-event-map.md` (GA4 12개 이벤트 명세)

### 3.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P2.T-013 | Next.js 16 App Router 페이지 구조 설계 (`app/` 디렉토리 15개 페이지 + 13개 컴포넌트) | AI | 4 | T-003 | `design.md` §2 |
| MVP.P2.T-014 | 디자인 토큰 추출 (HTML 22개 CSS 변수 → JSON) | AI | 2 | T-002 | `design-tokens.json` |
| MVP.P2.T-015 | Tailwind v4 vs CSS Modules 비교 + Tailwind v4 선정 | 운영자+AI | 2 | T-014 | `design.md` §4 |
| MVP.P2.T-016 | Firestore 6 컬렉션 스키마 설계 (MVP는 coupons + events 활성) | AI | 3 | Sprint 0 schema-validation | `design.md` §5 |
| MVP.P2.T-017 | Firestore 보안 규칙 v1 (MVP read-only public, write는 admin 전용) | AI | 2 | T-016 | `firestore-rules.md` |
| MVP.P2.T-018 | GA4 12개 이벤트 매핑 (MVP 9개 활성 + V1 3개 stub) | AI | 2 | (없음) | `ga4-event-map.md` |
| MVP.P2.T-019 | M1 designCompleteness ≥85 게이트 검증 (Phase design 출구) | AI | 1 | T-013~T-018 | M1 PASS 확인 |
| MVP.P2.T-020 | Phase 2 종료 게이트 운영자 승인 | 운영자 | 0.5 | T-019 | `/sprint phase ... --to do` |

### 3.3 Phase 2 종료 게이트 (M1 활성)

- [ ] `design.md` 완성 (페이지 구조 + 컴포넌트 + 스키마 + 토큰 + GA4)
- [ ] M1 designCompleteness ≥85 PASS
- [ ] Firestore 보안 규칙 v1 운영자 검토 (L3 수동 게이트)

---

## 4. Phase 3: do (8주 / Day 15-70) — 핵심 작업

### 4.1 산출물

- [ ] Next.js 16 App Router 코드베이스 (15개 페이지 + 13개 컴포넌트)
- [ ] Firestore `coupons` + `events` 컬렉션 활성
- [ ] GA4 9개 이벤트 발화 코드
- [ ] sitemap.xml + robots.txt + JSON-LD
- [ ] 도메인 + Vercel 배포 (production)
- [ ] 콘텐츠 9섹션 × 15개 페이지 작성

### 4.2 WBS (가장 큰 분량 — 4개 sub-phase로 분할)

#### 4.2.1 Sub-Phase do.A: 스캐폴딩 (Week 1, Day 15-21)

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P3.T-021 | `pnpm create next-app@latest` (Next.js 16, App Router, TS, Tailwind v4) | AI | 1 | Phase 2 PASS | `package.json` |
| MVP.P3.T-022 | `app/layout.tsx` (다크 모드 + Noto Sans KR + 메타데이터 기본) | AI | 2 | T-021 | layout.tsx |
| MVP.P3.T-023 | `globals.css` 디자인 토큰 22개 → Tailwind v4 `@theme` 매핑 | AI | 3 | T-014 | globals.css |
| MVP.P3.T-024 | Firebase 클라이언트 SDK 초기화 (`lib/firebase/client.ts`) | AI | 2 | T-021 | client.ts |
| MVP.P3.T-025 | Firebase Analytics 초기화 (`lib/firebase/analytics.ts` — `getAnalyticsClient` + `logEvent` + `isSupported` SSR 가드 + 12 이벤트 enum) + `<AnalyticsBootstrap>` 클라이언트 컴포넌트 + layout.tsx 통합 ([Sprint 0 보강 D2 — design.md §10.2]) | AI | 2 | T-024 | lib/firebase/analytics.ts + components/AnalyticsBootstrap.tsx |
| MVP.P3.T-026 | ESLint Strict + Prettier 설정 (M8 게이트) | AI | 1 | T-021 | `.eslintrc` |
| MVP.P3.T-027 | Vercel preview 배포 1차 (빈 페이지) | 운영자 | 0.5 | T-021 | Vercel preview URL |

#### 4.2.2 Sub-Phase do.B: 컴포넌트 14종 (Week 2-3, Day 22-35)

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P3.T-028 | `<Hero>` 컴포넌트 (앱 아이콘 + 타이틀 + 메타 정보) | AI | 2 | T-022, T-023 | components/Hero.tsx |
| MVP.P3.T-029 | `<TOC>` 컴포넌트 (목차 그리드) | AI | 1.5 | T-023 | components/TOC.tsx |
| MVP.P3.T-030 | `<ClassCard>` 컴포넌트 (전사/검객/영매 색상 변형) | AI | 2 | T-023 | components/ClassCard.tsx |
| MVP.P3.T-031 | `<JinryeongCard>` 컴포넌트 (진령 11종 카드) | AI | 2 | T-023 | components/JinryeongCard.tsx |
| MVP.P3.T-032 | `<TierList>` 컴포넌트 (0~2티어 행 분리) | AI | 1.5 | T-031 | components/TierList.tsx |
| MVP.P3.T-033 | `<ComboCard>` 컴포넌트 (3종 추천 조합) | AI | 1.5 | T-031 | components/ComboCard.tsx |
| MVP.P3.T-034 | `<CouponCode>` 컴포넌트 (클릭 복사 + D-day + Toast) | AI | 3 | T-024 | components/CouponCode.tsx |
| MVP.P3.T-035 | `<Alert>` 컴포넌트 (info/warning/success/danger 4 variant) | AI | 1 | T-023 | components/Alert.tsx |
| MVP.P3.T-036 | `<PriorityFlow>` 컴포넌트 (자원 투자 우선순위) | AI | 1.5 | T-023 | components/PriorityFlow.tsx |
| MVP.P3.T-037 | `<PayTier>` 컴포넌트 (무/소/중과금 카드) | AI | 1 | T-023 | components/PayTier.tsx |
| MVP.P3.T-038 | `<EventCard>` 컴포넌트 (이벤트 정보) | AI | 1 | T-023 | components/EventCard.tsx |
| MVP.P3.T-039 | `<TipCard>` 컴포넌트 (실전 팁 박스) | AI | 1 | T-023 | components/TipCard.tsx |
| MVP.P3.T-040 | `<ScreenshotStrip>` 컴포넌트 (Google Play 스크린샷 6장 가로 스크롤) | AI | 2 | T-023 | components/ScreenshotStrip.tsx |
| MVP.P3.T-041 | `<Footer>` 컴포넌트 (디스클레이머 + 출처 + Contact) | AI | 1.5 | T-023 | components/Footer.tsx |
| MVP.P3.T-042 | 컴포넌트 14종 Storybook 또는 `/dev/components` 페이지로 시각 검증 | 운영자+AI | 4 | T-028~T-041 | 시각 검증 PASS |

#### 4.2.3 Sub-Phase do.C: 페이지 15개 + 콘텐츠 (Week 4-6, Day 36-56)

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P3.T-043 | `app/page.tsx` 홈 (Hero + 직업 진단 CTA + 쿠폰 CTA + 진령 티어 미리보기 + 검객 메타 빌드 링크) | 운영자+AI | 5 | Sub-Phase do.B | app/page.tsx |
| MVP.P3.T-044 | `app/(content)/intro/page.tsx` 개요 섹션 (원본 HTML §1) | 운영자+AI | 3 | T-043 | intro/page.tsx |
| MVP.P3.T-045 | `app/(content)/class/page.tsx` 직업 3종 페이지 | 운영자+AI | 6 | T-030 | class/page.tsx |
| MVP.P3.T-046 | `app/(content)/jinryeong/page.tsx` 진령 11종 페이지 + TierList | 운영자+AI | 8 | T-031, T-032 | jinryeong/page.tsx |
| MVP.P3.T-047 | `app/(content)/skill-equip/page.tsx` 스킬·제련 페이지 | 운영자+AI | 5 | T-039 | skill-equip/page.tsx |
| MVP.P3.T-048 | `app/(content)/dungeon/page.tsx` 던전·PvP 페이지 | 운영자+AI | 4 | T-039 | dungeon/page.tsx |
| MVP.P3.T-049 | `app/(content)/payment/page.tsx` 과금 전략 페이지 + PayTier 컴포넌트 | 운영자+AI | 4 | T-037 | payment/page.tsx |
| MVP.P3.T-050 | `app/(content)/event/page.tsx` 이벤트 페이지 + EventCard | 운영자+AI | 3 | T-038 | event/page.tsx |
| MVP.P3.T-051 | `app/(content)/tips/page.tsx` 실전 팁 페이지 + TipCard | 운영자+AI | 3 | T-039 | tips/page.tsx |
| MVP.P3.T-052 | `app/(content)/sources/page.tsx` 출처 페이지 (디스클레이머 강화) | 운영자+AI | 2 | T-041 | sources/page.tsx |
| MVP.P3.T-053 | `app/coupon/page.tsx` 쿠폰 자동 체커 (Firestore `coupons` 컬렉션 + CouponCode 컴포넌트) | 운영자+AI | 6 | T-034 | coupon/page.tsx |
| MVP.P3.T-054 | `app/class-quiz/page.tsx` 직업 진단 3-5문항 (클라이언트 상태 관리) | 운영자+AI | 5 | T-030 | class-quiz/page.tsx |
| MVP.P3.T-055 | `app/builds/meta-swordsman/page.tsx` 검객 메타 빌드 (Beachhead 핵심) | 운영자+AI | 8 | T-033, T-046 | builds/meta-swordsman/page.tsx |
| MVP.P3.T-056 | 콘텐츠 D2 70/30 검증 (운영자 70% 직접 작성 + 30% 가공 인용 출처 명시) | 운영자 | 3 | T-043~T-055 | content-audit.md |

#### 4.2.4 Sub-Phase do.D: SEO + 데이터 + 배포 (Week 7-8, Day 57-70)

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P3.T-057 | 페이지별 메타 태그 (title, description, og:image) | AI | 4 | T-043~T-055 | metadata exports |
| MVP.P3.T-058 | `app/sitemap.ts` + `app/robots.ts` 동적 생성 | AI | 2 | T-057 | sitemap.xml/robots.txt |
| MVP.P3.T-059 | JSON-LD 구조화 데이터 (Article, FAQPage, BreadcrumbList) | AI | 3 | T-057 | components/JsonLd.tsx |
| MVP.P3.T-060 | Firestore `coupons` 컬렉션 초기 데이터 시드 (운영자 입력 10건) | 운영자 | 2 | T-053 | Firestore 데이터 |
| MVP.P3.T-061 | Firebase Analytics `logEvent` 호출 — 9개 이벤트 (`page_view` 자동, `coupon_copy`, `class_diagnose_complete`, `jinryeong_card_click`, `tier_view`, `meta_build_view`, `external_link_click`, `scroll_depth_75`, `dwell_60`) 컴포넌트 통합 + Firestore 백업 3종 ([Sprint 0 보강 D2 — design.md §10.2.1~3]) | AI | 5 | T-025 | logEvent 호출부 9개 위치 |
| MVP.P3.T-062 | Firebase 콘솔 Analytics > DebugView 9개 이벤트 발화 실시간 검증 + Chrome DevTools Network 탭 `g/collect` 9건 확인 ([design.md §10.2.5 검증 흐름]) | 운영자+AI | 2 | T-061 | DebugView 스크린샷 + Network HAR |
| MVP.P3.T-063 | 이미지 최적화 (Next/Image + Google Play CDN proxy) | AI | 2 | T-040 | next.config.js images |
| MVP.P3.T-064 | 폰트 sub-setting (Noto Sans KR 한글 + 영문 필수 문자만) | AI | 2 | T-022 | font 최적화 |
| MVP.P3.T-065 | 도메인 구매 (1순위 가용 시 `gokkaebi-guide.com`) | 운영자 | 1 | T-007 | 도메인 결제 |
| MVP.P3.T-066 | Vercel 도메인 연결 + DNS 설정 | 운영자 | 1 | T-065 | DNS PASS |
| MVP.P3.T-067 | Vercel production 배포 + sitemap.xml Google Search Console 제출 | 운영자 | 1 | T-058, T-066 | production URL + GSC 등록 |
| MVP.P3.T-068 | Firebase Analytics 자동 GA4 property 연결 검증 (analytics.google.com → god-kkabi-guide property 자동 생성 확인) + `tene list --env prod` 7개 키 검증 ([Sprint 0 보강 D2]) | 운영자 | 0.5 | T-025 | GA4 property 자동 연결 확인 |

### 4.3 Phase 3 종료 게이트

- [ ] 15개 페이지 모두 작성 완료 + 콘텐츠 9섹션 9/9
- [ ] 14개 컴포넌트 모두 작성 + 시각 검증 PASS
- [ ] Firestore `coupons` 10건 + `events` 컬렉션 활성
- [ ] GA4 9개 이벤트 발화 검증 PASS
- [ ] sitemap.xml + robots.txt + JSON-LD 활성
- [ ] 도메인 연결 + Vercel production 배포 완료
- [ ] M9 documentationCompleteness ≥80 PASS

---

## 5. Phase 4: check (0.5주 / Day 71-74)

### 5.1 산출물

- [ ] `docs/sprint/02-sprint-mvp/check-report.md` (Gap analysis + Lighthouse 결과)

### 5.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P4.T-069 | Lighthouse CI 5개 핵심 페이지 측정 (모바일 3G) | AI | 2 | Phase 3 PASS | lighthouse-report.json |
| MVP.P4.T-070 | 모바일 320px/375px/414px/768px 4개 뷰포트 깨짐 검증 | 운영자 | 3 | Phase 3 PASS | viewport-test.md |
| MVP.P4.T-071 | WCAG AA 콘트라스트 검증 (자동 도구 + 운영자 시각 확인) | AI+운영자 | 2 | Phase 3 PASS | a11y-report.md |
| MVP.P4.T-072 | Gap analysis (MVP Features 9종 × 산출물 일치 여부) | AI | 2 | T-069~T-071 | gap-analysis.md |
| MVP.P4.T-073 | M4 performanceLighthouse ≥90 게이트 검증 | AI | 1 | T-069 | M4 PASS/FAIL 결정 |
| MVP.P4.T-074 | `check-report.md` 종합 보고서 작성 | AI | 2 | T-069~T-073 | check-report.md |

### 5.3 Phase 4 종료 게이트

- [ ] Lighthouse 모바일 5개 페이지 모두 ≥90 PASS
- [ ] 모바일 320-414px 깨짐 0건
- [ ] WCAG AA 4.5:1 콘트라스트 PASS (M5 부분 PASS — 다크모드 한정)
- [ ] Gap analysis 9개 Features 9/9 PASS

**FAIL 시**: QUALITY_GATE_FAIL 트리거 → Phase 5 act로 진행.
**PASS 시**: Phase 5는 skip 가능 (운영자 결정).

---

## 6. Phase 5: act (0.5주 / Day 75-78)

### 6.1 산출물

- [ ] `docs/sprint/02-sprint-mvp/act-iterate-log.md` (iterate 회차별 변경 사항)

### 6.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P5.T-075 | iterate 회차 1: Lighthouse 미달 페이지 이미지/JS 최적화 | AI | 4 | Phase 4 FAIL | iterate-1.md |
| MVP.P5.T-076 | iterate 회차 2: 콘트라스트 미달 영역 수정 | AI | 2 | iterate-1 | iterate-2.md |
| MVP.P5.T-077 | iterate 회차 3: 마지막 보강 (Skeleton/Suspense 추가) | AI | 3 | iterate-2 | iterate-3.md |
| MVP.P5.T-078 | ITERATION_EXHAUSTED 트리거 확인 (3회 후에도 미통과 시) | 운영자 | 0.5 | T-077 | 스코프 축소 또는 waive 결정 |

### 6.3 Phase 5 종료 게이트

- [ ] M4 performanceLighthouse ≥90 PASS (재측정)
- [ ] 또는 운영자 waive 결정 (L3 수동 게이트)
- [ ] 또는 ITERATION_EXHAUSTED 발동 → 스코프 축소

---

## 7. Phase 6: qa (0.5주 / Day 79-82)

### 7.1 산출물

- [ ] `docs/sprint/02-sprint-mvp/qa-report.md` (7-layer dataFlowIntegrity 결과)
- [ ] `docs/sprint/02-sprint-mvp/e2e-scenarios.md` (E2E 3종 시나리오 결과)

### 7.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P6.T-079 | 7-layer dataFlowIntegrity Layer 1 URL 라우팅 검증 | AI | 1 | Phase 5 PASS | qa-layer-1.md |
| MVP.P6.T-080 | Layer 2 클라이언트 컴포넌트 렌더링 검증 | AI | 1 | T-079 | qa-layer-2.md |
| MVP.P6.T-081 | Layer 3 GA4 이벤트 발화 (DebugView 9개) | AI+운영자 | 2 | T-080 | qa-layer-3.md |
| MVP.P6.T-082 | Layer 4 Firestore `coupons` read 검증 | AI | 1 | T-081 | qa-layer-4.md |
| MVP.P6.T-083 | Layer 5 Firestore `events` write 검증 (운영자 수동 trigger) | 운영자 | 1 | T-082 | qa-layer-5.md |
| MVP.P6.T-084 | Layer 6 BigQuery export 일간 동작 검증 (Firebase Extensions) | AI | 1 | T-083 | qa-layer-6.md |
| MVP.P6.T-085 | Layer 7 SEO sitemap.xml + robots.txt + JSON-LD GSC 인덱싱 검증 | 운영자 | 1 | T-084 | qa-layer-7.md |
| MVP.P6.T-086 | E2E 시나리오 S-01 (첫 진입 → 쿠폰 페이지 → 복사) | 운영자 | 1 | T-085 | e2e-s01.md |
| MVP.P6.T-087 | E2E 시나리오 S-02 (첫 진입 → 직업 진단 → 검객 추천) | 운영자 | 1 | T-085 | e2e-s02.md |
| MVP.P6.T-088 | E2E 시나리오 S-03 (진령 티어 페이지 검증) | 운영자 | 1 | T-085 | e2e-s03.md |
| MVP.P6.T-089 | `qa-report.md` 종합 (7-layer + E2E 3종) | AI | 2 | T-086~T-088 | qa-report.md |
| MVP.P6.T-090 | M3 securityScan + M7 dataFlowIntegrity 게이트 검증 | AI | 1 | T-089 | M3+M7 PASS |

### 7.3 Phase 6 종료 게이트

- [ ] 7-layer 모든 Layer PASS
- [ ] E2E 3종 시나리오 모두 PASS
- [ ] M3 securityScan PASS (Vercel/Firebase 기본 + CSP 헤더)
- [ ] M7 dataFlowIntegrity PASS

---

## 8. Phase 7: report (0.5주 / Day 83-86)

### 8.1 산출물

- [ ] `docs/sprint/02-sprint-mvp/report.md` (운영자 보고서, 30/90일 KPI 측정)
- [ ] V1 진입 가/부 결정

### 8.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P7.T-091 | 30일차 KPI 측정 (Lighthouse, DAU, GSC 인덱싱, 이벤트 발화) | 운영자 | 2 | Phase 6 PASS | kpi-30d.md |
| MVP.P7.T-092 | 90일차 KPI 측정 (DAU, SERP, 쿠폰 PV, 체류시간, 이탈률) | 운영자 | 3 | T-091 | kpi-90d.md |
| MVP.P7.T-093 | Beachhead 침투 측정 (검객 페이지 PV 비중, 디시 referrer, 직업 진단 완료율) | 운영자 | 2 | T-092 | beachhead-report.md |
| MVP.P7.T-094 | Risk 발생 모니터링 (R1~R7 시그널) | 운영자 | 1 | T-092 | risk-monitor.md |
| MVP.P7.T-095 | M6 V1 진입 결정 (DAU 500+ / 200-500 / <200 분기) | 운영자 | 1 | T-091~T-094 | V1 진입 결정 |
| MVP.P7.T-096 | `report.md` 종합 보고서 작성 (Master Plan §7.2 분기점 매핑) | AI+운영자 | 2 | T-095 | report.md |

### 8.3 Phase 7 종료 게이트 (운영자 의사결정)

- [ ] 30일차 + 90일차 KPI 측정 완료
- [ ] V1 진입 / MVP 6개월 연장 / 프로젝트 폐기 중 1개 결정
- [ ] 운영자 수동 승인 (L3 Trust)

---

## 9. Phase 8: archive (0.5주 / Day 87-91)

### 9.1 산출물

- [ ] `.bkit/state/sprints/god-kkabi-guide-sprint-mvp.json`
- [ ] `docs/sprint/02-sprint-mvp/archive-notes.md` (회고 1페이지)
- [ ] Sprint V1 입력 파일 전달 (V1 진입 결정 시)

### 9.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| MVP.P8.T-097 | Sprint 상태 JSON 작성 (시작/종료 시각, PASS 여부, KPI 결과) | AI | 1 | Phase 7 PASS | sprint-mvp.json |
| MVP.P8.T-098 | Sprint MVP 회고 메모 (운영자 1페이지, 잘된 점/문제/V1 개선안) | 운영자 | 2 | T-097 | archive-notes.md |
| MVP.P8.T-099 | V1 Phase plan 입력 파일 정리 (코드베이스 + Firestore 스키마 + GA4 + 디자인 시스템) | AI | 1 | T-098 | v1-handoff.md |
| MVP.P8.T-100 | `/sprint phase ... --to archive` 운영자 호출 | 운영자 | 0.5 | T-099 | Sprint MVP 종료 |

### 9.3 Phase 8 종료 게이트 = Sprint MVP 종료

- [ ] `.bkit/state` JSON 기록 완료
- [ ] 회고 메모 작성
- [ ] V1 진입 결정 시: `/sprint init god-kkabi-guide-sprint-v1`

---

## 10. Quality Gates 활성 매핑 (Master Plan §4 일치)

| Gate ID | 게이트 | Sprint MVP 적용 | enforcement Phase |
|---------|------|----------|------|
| M1 designCompleteness ≥85 | ✅ | Phase 2 design 출구 |
| M2 testCoverage ≥80 | ⚠️ 70% (정적 사이트, E2E만) | Phase 6 qa |
| M3 securityScan PASS | ✅ Vercel/Firebase 기본 | Phase 6 qa |
| M4 performanceLighthouse ≥90 | ✅ 모바일 5개 페이지 | Phase 4 check / Phase 5 act |
| M5 accessibilityWCAG AA | ⚠️ 부분 (다크모드 콘트라스트) | Phase 4 check |
| M6 i18nReadiness | ❌ N/A | (V2) |
| M7 dataFlowIntegrity 7-layer | ✅ URL→GA4→Firestore | Phase 6 qa |
| M8 codeQuality ESLint+TS | ✅ ESLint Strict | Phase 3 do (CI/CD) |
| M9 documentationCompleteness ≥80 | ✅ plan/design/qa/report | Phase 7 report |
| M10 budgetCompliance | ✅ ≤$5/월 | 전 Phase 모니터링 |

---

## 11. 4 Auto-Pause Triggers (Sprint MVP 임계값)

| Trigger | MVP 임계값 | 발동 시 액션 |
|---------|---------|----------|
| QUALITY_GATE_FAIL | M1/M3/M4/M7/M9 게이트 1개 이상 FAIL | Phase act에서 iterate 또는 운영자 waive |
| ITERATION_EXHAUSTED | Phase act iterate 3회 후에도 게이트 미통과 | 스코프 축소 (9섹션 → 6섹션) 또는 톤 피벗 |
| BUDGET_EXCEEDED | 월 인프라 비용 > $5 | Firestore reads 분석 + 캐싱 강화 (운영자 수동) |
| PHASE_TIMEOUT | Phase do 16주 초과 (예상 8주의 2배) | 운영자 시간 가용성 재평가, Sprint 일정 조정 |

---

## 12. 운영자 수동 게이트 (L3 Trust 적용 지점)

| Phase 전환 | 운영자 결정 |
|---------|---------|
| Phase 1 → 2 | 인프라 계정 4종 + tene 시크릿 11개 확인 |
| Phase 2 → 3 | Firestore 보안 규칙 v1 검토 (read-only public 안전성) |
| Phase 3 → 4 | 도메인 구매 결제 (₩15K-30K/년) + 콘텐츠 D2 70/30 운영자 검수 |
| Phase 4 → 5 | Lighthouse FAIL 시 iterate 또는 waive 결정 |
| Phase 5 → 6 | iterate 3회 후 ITERATION_EXHAUSTED 시 스코프 축소 결정 |
| Phase 6 → 7 | QA 결과 + 광고 미배포 확정 |
| Phase 7 → 8 | M6 V1 진입 / MVP 연장 / 폐기 3분기 결정 |
| Phase 8 → V1 | `/sprint init god-kkabi-guide-sprint-v1` 호출 |

---

## 13. 의존성 그래프 (Phase 간)

```
Phase 1 plan
  └─ Phase 2 design (M1 게이트)
       └─ Phase 3 do (8주, 4 sub-phase)
            └─ Phase 4 check (M4/M5/M7 게이트)
                 └─ Phase 5 act (FAIL 시만)
                      └─ Phase 6 qa (M3/M7 게이트)
                           └─ Phase 7 report (M9 게이트, V1 진입 결정)
                                └─ Phase 8 archive (Sprint MVP 종료)
```

**병렬 가능**: Phase 3 do.B (컴포넌트)와 do.C (페이지)는 일부 task 병렬 가능 (예: 컴포넌트 명세가 완료된 페이지부터 작성 시작).

---

## 14. 작업 시간 추정 합계

| Phase | 예상 시간 (h) | 운영자 부담 (h) | AI 부담 (h) |
|-------|----------|--------------|----------|
| Phase 1 plan | 27 | 13 | 14 |
| Phase 2 design | 16 | 2.5 | 13.5 |
| Phase 3 do | 130 | 35 | 95 |
| Phase 4 check | 11 | 4 | 7 |
| Phase 5 act | 9.5 | 0.5 | 9 |
| Phase 6 qa | 13 | 4 | 9 |
| Phase 7 report | 11 | 7 | 4 |
| Phase 8 archive | 4.5 | 2.5 | 2 |
| **합계** | **222** | **68.5 (31%)** | **153.5 (69%)** |

운영자 주 5-15h SLA × 12주 = 60-180h 가용. 추정 68.5h는 SLA 중간값(120h)의 57% 수준이므로 1인 운영 가능.

---

## 15. Attribution

- bkit Sprint Management v2.1.13 (8-phase + Quality Gates M1-M10)
- Master Plan §3.2 Sprint MVP 8-phase 분해
- PRD §12.1 MVP In Scope (12개 항목)
- D2 하이브리드 70/30 콘텐츠 정책

> **Status**: Draft v1.0 — pending review.
> 다음 산출물: `design.md` (페이지 구조 + Firestore 스키마 + 디자인 시스템).
