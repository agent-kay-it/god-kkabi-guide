# Sprint V1 Plan — 8 Phase WBS (24주, M4-M9)

> **Sprint ID**: `god-kkabi-guide-sprint-v1`
> 기간: 2026-08-10 ~ 2027-02-07 (24주, 약 168일)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.3 · PRD: `docs/sprint/03-sprint-v1/prd.md`

---

## 1. 표준 8 Phase 시퀀스 (Master Plan §3.3 일치)

```
Phase 1: plan       (2주)  → UGC 정책 + Auth 흐름 + Firestore 보안규칙 설계
Phase 2: design     (2주)  → Auth UI + 댓글 UI + 빌드 작성 폼 + 모더레이션
Phase 3: do         (16주) → Firebase Auth → 댓글 → 빌드 → 좋아요 → 광고
Phase 4: check      (1주)  → Pain Point 수집 검증 + DAU/매출 측정
Phase 5: act        (1주)  → 개선 iterate (DAU <500 시)
Phase 6: qa         (0.5주) → 7-layer dataFlowIntegrity + 모더레이션 부하 테스트
Phase 7: report     (0.5주) → 운영자 보고서 + V2 진입 결정
Phase 8: archive    (1주)  → .bkit/state + 회고
```

**총 24주 (16.4주 핵심 작업 + 7.6주 분석/문서화). 운영자 주 5-15h × 24주 = 120-360h 가용.**

---

## 2. Phase 1: plan (2주 / Day 1-14)

### 2.1 산출물

- [ ] `docs/policies/ugc-policy.md` (UGC 작성/모더레이션 정책)
- [ ] `docs/policies/profanity-dictionary.md` (욕설 사전 1000+ 단어)
- [ ] `docs/sprint/03-sprint-v1/auth-flow.md` (Auth 흐름 + PIPA 동의)
- [ ] `docs/sprint/03-sprint-v1/moderation-runbook.md` (모더레이션 SLA + 절차)

### 2.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P1.T-001 | UGC 정책 문서 (가이드라인, 금지 콘텐츠, 신고 처리, 작성자 권리) | 운영자 | 4 | `ugc-policy.md` |
| V1.P1.T-002 | 욕설 사전 작성 (한글 1000+ 단어, 변형 패턴 정규식) | 운영자+AI | 6 | `profanity-dictionary.md` |
| V1.P1.T-003 | Auth 흐름 설계 (Google/Kakao OAuth + 익명 → 회원 마이그레이션) | AI | 4 | `auth-flow.md` |
| V1.P1.T-004 | PIPA 동의 절차 설계 (분석/공개 프로필 동의 + 데이터 삭제 요청) | 운영자+AI | 3 | `auth-flow.md` §PIPA |
| V1.P1.T-005 | 모더레이션 SLA + 절차 (24h 신고 처리, 자동 차단 임계값) | 운영자 | 3 | `moderation-runbook.md` |
| V1.P1.T-006 | Firestore 보안 규칙 v2 설계 (user-owned + admin override) | AI | 4 | `design.md` §보안 규칙 draft |
| V1.P1.T-007 | 빌드 표준 포맷 명세 (slug 생성 전략, 9 필드) | AI | 3 | `design.md` §빌드 폼 draft |
| V1.P1.T-008 | 광고 배치 정책 (AdSense 1-2 슬롯, 위치 결정) | 운영자 | 2 | `ad-policy.md` |
| V1.P1.T-009 | Giscus fallback 의사결정 매트릭스 (BUDGET_EXCEEDED 시 트리거) | 운영자 | 2 | `giscus-fallback.md` |
| V1.P1.T-010 | Phase 1 종료 게이트 운영자 승인 | 운영자 | 0.5 | `/sprint phase ... --to design` |

### 2.3 Phase 1 종료 게이트

- [ ] UGC 정책 + 욕설 사전 + Auth 흐름 + 모더레이션 SLA 4종 문서 완성
- [ ] Firestore 보안 규칙 v2 운영자 검토
- [ ] 빌드 표준 포맷 9 필드 확정

---

## 3. Phase 2: design (2주 / Day 15-28)

### 3.1 산출물

- [ ] `docs/sprint/03-sprint-v1/design.md` (Auth UI + 댓글 UI + 빌드 폼 + 모더레이션)
- [ ] `docs/sprint/03-sprint-v1/firestore-rules-v2.md` (V1 보안 규칙)
- [ ] `docs/sprint/03-sprint-v1/admin-screens.md` (운영자 admin 화면 명세)

### 3.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P2.T-011 | Auth UI 디자인 (signin/signup/consent 3페이지) | AI | 3 | `design.md` §Auth UI |
| V1.P2.T-012 | 댓글 UI 디자인 (CommentList + CommentForm + 페이지네이션) | AI | 3 | `design.md` §댓글 UI |
| V1.P2.T-013 | 빌드 작성 폼 UI (3단계 stepper: 직업 → 진령 → 코멘트) | AI | 4 | `design.md` §빌드 폼 |
| V1.P2.T-014 | 빌드 상세 페이지 디자인 (BuildCard + 좋아요/북마크/신고) | AI | 3 | `design.md` §빌드 상세 |
| V1.P2.T-015 | 운영자 admin 화면 디자인 (moderate + coupons + dashboard) | AI | 4 | `admin-screens.md` |
| V1.P2.T-016 | Firestore `users`, `builds`, `comments`, `reports`, `boss_ratings` 컬렉션 스키마 V1 확정 ([Sprint 0 보강 B — `boss_ratings` 신설]) | AI | 4 | `design.md` §스키마 |
| V1.P2.T-017 | 보안 규칙 v2 작성 (user-owned + admin role + 신고 권한) | AI | 4 | `firestore-rules-v2.md` |
| V1.P2.T-018 | GA4 신규 6개 이벤트 명세 (signup/build_create/build_like/comment_create/report_submit/`boss_rating_submit` — Sprint 0 보강 B) | AI | 2 | `design.md` §GA4 |
| V1.P2.T-019 | AdSense 통합 디자인 (1-2 슬롯 위치 + lazy load) | AI | 2 | `design.md` §AdSense |
| V1.P2.T-020 | M1 designCompleteness ≥85 게이트 검증 | AI | 1 | M1 PASS |
| V1.P2.T-021 | Phase 2 종료 게이트 운영자 승인 | 운영자 | 0.5 | `/sprint phase ... --to do` |

---

## 4. Phase 3: do (16주 / Day 29-140) — 핵심 작업

### 4.1 4 Sub-Phase 분할

#### 4.1.1 Sub-Phase do.A: Firebase Auth + users 컬렉션 (Week 1-3, Day 29-49)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P3.T-022 | Firebase Auth 초기화 (`lib/auth/firebase-auth.ts`) + Google Provider | AI | 3 | auth lib |
| V1.P3.T-023 | Kakao OAuth Provider (커스텀 OAuth 흐름) | AI | 4 | kakao auth |
| V1.P3.T-024 | `app/(auth)/signin/page.tsx` + `signup/page.tsx` | AI | 4 | auth pages |
| V1.P3.T-025 | PIPA 동의 페이지 `app/(auth)/consent/page.tsx` | AI | 3 | consent page |
| V1.P3.T-026 | AuthProvider Context (`components/auth/AuthProvider.tsx`) | AI | 3 | provider |
| V1.P3.T-027 | `users` 컬렉션 활성 + 가입 시 doc 생성 | AI | 2 | firestore users |
| V1.P3.T-028 | 익명 → 회원 마이그레이션 흐름 | AI | 4 | migration |
| V1.P3.T-029 | GA4 `signup` 이벤트 발화 + 메타데이터(method: google/kakao) | AI | 1 | events |
| V1.P3.T-030 | Auth E2E 테스트 (가입 → consent → 홈) | AI+운영자 | 3 | e2e auth |

#### 4.1.2 Sub-Phase do.B: 댓글 시스템 (Week 4-7, Day 50-77)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P3.T-031 | Firestore `comments` 컬렉션 활성 + 보안 규칙 | AI | 2 | comments collection |
| V1.P3.T-032 | `<CommentList>` 컴포넌트 (페이지네이션 cursor 기반) | AI | 4 | CommentList.tsx |
| V1.P3.T-033 | `<CommentForm>` 컴포넌트 (Auth 필요, 욕설 필터 적용) | AI | 4 | CommentForm.tsx |
| V1.P3.T-034 | 욕설 필터 lib (`lib/moderation/profanity-filter.ts`) | AI | 4 | filter |
| V1.P3.T-035 | 신고 기능 (`reports` 컬렉션 신설 + 신고 UI) | AI | 3 | report |
| V1.P3.T-036 | 9 콘텐츠 페이지 + 빌드 페이지에 댓글 영역 통합 | AI | 4 | content + comments |
| V1.P3.T-037 | GA4 `comment_create`, `report_submit` 이벤트 | AI | 1 | events |
| V1.P3.T-038 | 댓글 부하 테스트 (1페이지당 20개 read 부하) | AI | 2 | load test |
| V1.P3.T-039 | (조건부) Giscus fallback 준비 (BUDGET 초과 시 마이그레이션 스크립트) | AI | 4 | giscus migration |

#### 4.1.3 Sub-Phase do.C: 빌드 공유 UGC (Week 8-12, Day 78-112)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P3.T-040 | `app/builds/new/page.tsx` 빌드 작성 폼 (3단계 stepper) | AI | 6 | new build page |
| V1.P3.T-041 | `app/builds/[slug]/page.tsx` 빌드 상세 페이지 | AI | 5 | build detail page |
| V1.P3.T-042 | Slug 생성 (`{class}-{yyyymmdd}-{shortid}`) | AI | 2 | slug util |
| V1.P3.T-043 | `<BuildCard>` 컴포넌트 (목록용) | AI | 3 | BuildCard.tsx |
| V1.P3.T-044 | `<BuildForm>` 3단계 stepper | AI | 5 | BuildForm.tsx |
| V1.P3.T-045 | `<LikeButton>` Optimistic UI + denormalized counter | AI | 4 | LikeButton.tsx |
| V1.P3.T-046 | `<BookmarkButton>` (`users/{uid}/bookmarks` 서브컬렉션) | AI | 3 | BookmarkButton.tsx |
| V1.P3.T-047 | `app/my/bookmarks/page.tsx` 북마크 페이지 | AI | 3 | my bookmarks |
| V1.P3.T-048 | `app/builds/page.tsx` 빌드 목록 + 필터(직업/진령/태그) | AI | 5 | builds list |
| V1.P3.T-049 | GA4 `build_create`, `build_like` 이벤트 | AI | 1 | events |
| V1.P3.T-050 | 빌드 페이지 SEO 최적화 (메타 태그 + JSON-LD Article) | AI | 3 | seo |
| V1.P3.T-051 | GSC sitemap 빌드 페이지 자동 추가 | AI | 2 | sitemap |

#### 4.1.4 Sub-Phase do.D: 모더레이션 + 광고 + Pain Point + 보스 별점 (Week 13-16, Day 113-140)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P3.T-052 | `app/(admin)/moderate/page.tsx` 모더레이션 큐 | AI | 5 | admin moderate |
| V1.P3.T-053 | `app/(admin)/coupons/page.tsx` 쿠폰 관리 admin UI | AI | 3 | admin coupons |
| V1.P3.T-054 | `app/(admin)/page.tsx` admin 대시보드 (KPI 미니멀) | AI | 3 | admin dashboard |
| V1.P3.T-055 | 자동 차단 임계값 적용 (같은 단어 3회+ 자동 삭제) | AI | 3 | auto-mod |
| V1.P3.T-056 | 트롤 IP 차단 (Vercel middleware) | AI | 2 | middleware |
| V1.P3.T-057 | AdSense 계정 생성 + 사이트 승인 신청 (DAU 500+ 시점) | 운영자 | 1 | adsense |
| V1.P3.T-058 | AdSense 1-2 슬롯 통합 (lazy load + Intersection Observer) | AI | 3 | ads |
| V1.P3.T-059 | 광고 카테고리 필터 (게임 카테고리만 허용) | 운영자+AI | 1 | ad filter |
| V1.P3.T-060 | Pain Point raw text 수집 (`pain_topics` raw 모드) | AI | 3 | pain raw |
| V1.P3.T-BR-001 | `boss_ratings` 컬렉션 스키마 + Firestore 보안 규칙 + 인덱스 3종 ([Sprint 0 보강 B — R2-C3 매핑]) | AI | 4 | boss_ratings collection + rules |
| V1.P3.T-BR-002 | `<BossRatingWidget>` 컴포넌트 + 보스 가이드 페이지 (`/dungeon/[boss-id]` 또는 `/dungeon` 내 카드)에 별점 UI 통합 (5-star input + ≤200자 코멘트 + Optimistic UI) | AI | 8 | boss rating UI |
| V1.P3.T-BR-003 | GA4 `boss_rating_submit` 이벤트 + `events` 컬렉션 백업 + 주 1회 upsert 로직 (`{uid}_{boss_id}_{week}` ID 정책) | AI | 4 | events + upsert |
| V1.P3.T-BR-004 | 모더레이션 도구에 boss_ratings 신고 처리 통합 (욕설 필터 + admin `is_filtered` 토글) | AI | 4 | admin mod boss_ratings |
| V1.P3.T-061 | M2 testCoverage ≥80 단위 테스트 추가 (Auth, 댓글, 빌드, **boss_ratings**) | AI | 8 | tests |
| V1.P3.T-062 | M8 ESLint Strict + TypeScript 오류 0 검증 | AI | 2 | lint |

> **Sprint 0 보강 B 적용 (2026-05-14)**: T-BR-* 4개 태스크 신설로 총 20h 추가. Sub do.D 16주 일정 내 흡수 가능 (기존 buffer 활용). 비용 영향 ₩0 (Firebase Spark Plan 한도 내 boss_ratings writes ~600/일, 한도 3% 사용). 본 보강은 Sprint 0 schema-validation §4.2 옵션 A 채택 결정의 직접 결과.

### 4.2 Phase 3 종료 게이트

- [ ] Firebase Auth (Google/Kakao) 활성
- [ ] 댓글 시스템 활성 (5,000+ 누적 가능 부하 검증)
- [ ] 빌드 공유 UGC 활성 + 빌드 1,000+ 수용 가능
- [ ] 좋아요/북마크/신고 활성
- [ ] 운영자 모더레이션 도구 활성 (24h SLA)
- [ ] AdSense 1-2 슬롯 활성 (DAU 500+ 시점에 활성)
- [ ] Pain Point raw 수집 활성
- [ ] M2 testCoverage ≥80, M8 codeQuality PASS

---

## 5. Phase 4: check (1주 / Day 141-147)

### 5.1 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P4.T-063 | DAU/회원가입/빌드/댓글 30일차 KPI 측정 | 운영자 | 3 | kpi-30d.md |
| V1.P4.T-064 | Pain Point raw 수집 검증 (주간 100+ 누적) | 운영자 | 2 | pain-check.md |
| V1.P4.T-065 | 광고 매출 30일 측정 | 운영자 | 1 | revenue-30d.md |
| V1.P4.T-066 | Lighthouse 모바일 ≥85 재측정 (광고 영향) | AI | 2 | lighthouse-v1 |
| V1.P4.T-067 | M4 게이트 ≥85 검증 (V1 광고 영향으로 ≥90에서 ≥85로 완화) | AI | 1 | M4 PASS |
| V1.P4.T-068 | 모더레이션 부하 측정 (신고 처리 SLA 24h 준수율) | 운영자 | 2 | mod-load |
| V1.P4.T-069 | Gap analysis (V1 7 Features × 산출물) | AI | 2 | gap-analysis |
| V1.P4.T-070 | `check-report.md` 종합 | AI | 2 | check-report.md |

---

## 6. Phase 5: act (1주 / Day 148-154)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P5.T-071 | iterate 회차 1: DAU 1,500 미만 시 가입 마찰 분석 + 가입 UX 개선 | AI | 6 | iterate-1 |
| V1.P5.T-072 | iterate 회차 2: 빌드 작성 폼 단순화 (작성률 < 20% 시) | AI | 5 | iterate-2 |
| V1.P5.T-073 | iterate 회차 3: 광고 슬롯 위치 조정 (Lighthouse <85 시) | AI | 3 | iterate-3 |
| V1.P5.T-074 | ITERATION_EXHAUSTED 확인 + waive 또는 스코프 축소 결정 | 운영자 | 1 | decision |

---

## 7. Phase 6: qa (0.5주 / Day 155-158)

### 7.1 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P6.T-075 | 7-layer dataFlowIntegrity Layer 1-7 검증 (Auth 추가) | AI+운영자 | 4 | qa-layers |
| V1.P6.T-076 | Auth 보안 규칙 검증 (악의적 user-owned 위반 시도) | AI | 3 | sec-audit |
| V1.P6.T-077 | 모더레이션 부하 테스트 (신고 1000건 일괄 처리) | AI | 2 | mod-load-test |
| V1.P6.T-078 | M3 securityScan PASS (Auth + CSRF + CSP) | AI | 2 | M3 PASS |
| V1.P6.T-079 | M7 dataFlowIntegrity PASS | AI | 1 | M7 PASS |
| V1.P6.T-080 | `qa-report.md` 종합 | AI | 2 | qa-report.md |

---

## 8. Phase 7: report (0.5주 / Day 159-162)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P7.T-081 | 180일차 졸업 KPI 측정 (DAU 2K+ / 빌드 1K+ / 댓글 5K+ / 매출 ₩100K+) | 운영자 | 4 | kpi-180d.md |
| V1.P7.T-082 | V2 진입 결정 (PASS/보류/폐기 3분기) | 운영자 | 2 | v2 decision |
| V1.P7.T-083 | Pain Point raw 누적 결과 보고 (V2 NLP 입력 가능 여부) | 운영자 | 1 | pain-result |
| V1.P7.T-084 | `report.md` 종합 + Master Plan §7.2 분기점 매핑 | AI+운영자 | 3 | report.md |

---

## 9. Phase 8: archive (1주 / Day 163-168)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V1.P8.T-085 | Sprint 상태 JSON 작성 | AI | 1 | sprint-v1.json |
| V1.P8.T-086 | V1 회고 메모 (1페이지) | 운영자 | 2 | archive-notes.md |
| V1.P8.T-087 | V2 입력 파일 정리 (Auth + UGC + raw pain + 광고 매출 baseline) | AI | 2 | v2-handoff.md |
| V1.P8.T-088 | `/sprint phase ... --to archive` 호출 | 운영자 | 0.5 | Sprint V1 종료 |

---

## 10. Quality Gates 활성 매핑 (Master Plan §4)

| Gate | V1 적용 | Phase |
|------|------|------|
| M1 designCompleteness ≥85 | ✅ | Phase 2 design 출구 |
| M2 testCoverage ≥80 | ✅ (Auth/댓글/빌드 단위 테스트) | Phase 3 do |
| M3 securityScan PASS | ✅ (Auth + CSRF + CSP) | Phase 6 qa |
| M4 performanceLighthouse ≥85 | ✅ (V1은 광고 영향으로 ≥90 → ≥85 완화) | Phase 4 check |
| M5 accessibilityWCAG AA | ✅ AA (Auth 폼 a11y) | Phase 4 check |
| M7 dataFlowIntegrity 7-layer | ✅ + Auth → 댓글 → 빌드 | Phase 6 qa |
| M8 codeQuality ESLint+TS | ✅ Strict | Phase 3 do |
| M9 documentationCompleteness ≥80 | ✅ + 보안 규칙 문서 | Phase 7 report |
| M10 budgetCompliance | ✅ ≤$10/월 | 전 Phase 모니터링 |

---

## 11. 4 Auto-Pause Triggers (V1 임계값)

| Trigger | 임계값 | 액션 |
|---------|------|------|
| QUALITY_GATE_FAIL | M3/M4/M7 게이트 FAIL | Phase act iterate |
| ITERATION_EXHAUSTED | iterate 3회 후 미통과 | 스코프 축소 (광고 제외 등) |
| BUDGET_EXCEEDED | 월 인프라 > $10 | Giscus 마이그레이션 또는 Blaze 결정 (운영자 수동) |
| PHASE_TIMEOUT | Phase do 32주 초과 (예상 16주의 2배) | 운영자 시간 재평가 |

---

## 12. 운영자 수동 게이트 (L3 Trust)

| Phase 전환 | 결정 사항 |
|---------|---------|
| Phase 1 → 2 | UGC 정책 + 욕설 사전 최종 승인 |
| Phase 2 → 3 | Firestore 보안 규칙 v2 검토 (user-owned + admin) |
| Phase 3 → 4 | AdSense 활성 결정 (DAU 500+ 시점, 사이트 승인 후) |
| Phase 4 → 5 | 광고 영향 Lighthouse <85 시 슬롯 축소 결정 |
| Phase 5 → 6 | iterate 3회 후 waive 또는 스코프 축소 |
| Phase 6 → 7 | QA 결과 + Giscus 마이그레이션 의사결정 |
| Phase 7 → 8 | M9 V2 진입 / V1 6개월 연장 / V2 보류 3분기 결정 |
| Phase 8 → V2 | `/sprint init god-kkabi-guide-sprint-v2` |

---

## 13. 작업 시간 추정

| Phase | 시간 (h) | 운영자 | AI |
|-------|---------|------|-----|
| Phase 1 plan | 32 | 18 | 14 |
| Phase 2 design | 30 | 1 | 29 |
| Phase 3 do | 165 | 30 | 135 |
| Phase 4 check | 15 | 9 | 6 |
| Phase 5 act | 15 | 1 | 14 |
| Phase 6 qa | 14 | 3 | 11 |
| Phase 7 report | 10 | 7 | 3 |
| Phase 8 archive | 5.5 | 2.5 | 3 |
| **합계** | **286.5** | **71.5 (25%)** | **215 (75%)** |

운영자 주 5-15h × 24주 = 120-360h 가용. 추정 71.5h는 SLA 중간값(240h)의 30% → 안전 마진 큼.

---

## 14. 비용 모니터링 (M10 ≤$10/월)

| 항목 | 한도 | V1 예상 사용 |
|------|----|----------|
| Vercel Hobby Bandwidth | 100GB/월 | ~30GB/월 (DAU 2K × 2MB × 30일) |
| Firestore reads | 50K/일 | ~40K/일 (댓글 + 빌드 read 부하) — **위험** |
| Firestore writes | 20K/일 | ~10K/일 (댓글/빌드 작성) |
| Firestore Storage | 1GB | ~200MB (빌드 + 댓글 + 유저) |
| Firebase Auth | 무료 (10K MAU) | ~2K MAU |
| AdSense | $0 | 매출 ₩100K+/월 (입금) |

> Firestore reads 40K/일이 한도 80% 수준 → **Giscus 마이그레이션 트리거 임계값 도달 가능성 ↑**. Phase 4 check에서 모니터링 후 결정.

---

> **Status**: Draft v1.0 — pending review.
> 다음 산출물: `design.md` (Auth 흐름 + UGC 스키마 + 모더레이션 + admin 화면).
