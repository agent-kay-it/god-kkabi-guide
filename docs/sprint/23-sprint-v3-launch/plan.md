# Sprint 23 Plan — Feature 분해

> Sprint 23 의 6 features 분해.

---

## F23-A — V2 UI 마무리

### Scope
1. **`/me` 페이지에 NicknameChangeForm 통합**
   - 신규 helper `lib/auth/cooldown.ts` — cooldownRemainingMs 계산
   - /me/page.tsx: NicknameChangeForm props (currentNickname / cooldownRemainingMs) 전달
2. **F3.5 로그인 source 통합**
   - 신규 Firestore 필드 `users.ownedJinryeong: WikiJinryeongId[]` (운영자 또는 사용자 입력)
   - /simulator/page.tsx: 로그인 시 fetch → recommendBuilds 호출
   - admin 콘솔에서 사용자 데이터 입력 (Sprint 24+ admin UI carry)

### 산출물
- 신규 helper + 페이지 변경 + 8+ tests
- 1-2 PR

---

## F23-B — SLO 모니터링 + Sentry

### Scope
1. `@sentry/nextjs` 통합
   - server / client / edge runtime 별 instrumentation
   - DSN 은 tene secret (SENTRY_DSN)
2. SLO 메트릭 정의
   - 4 golden signals (Latency / Traffic / Errors / Saturation)
   - 5xx 비율 < 0.5% / p95 latency < 1500ms / Error budget 정의
3. 알람 임계값 (Sentry alerts)
4. server-only 모듈 인스트루멘트 우선 (Server Action 에러 catch)

### 산출물
- `sentry.server.config.ts` + `sentry.client.config.ts`
- `instrumentation.ts` (Next.js 16 hook)
- 정책 문서 `docs/05-policy/slo-policy.md`
- 1 PR

---

## F23-C — SEO 최적화

### Scope
1. **메타 태그**: 모든 page.tsx 의 metadata 강화 (description, keywords, og:image)
2. **structured data (JSON-LD)**: 진령 / 스킬 / 게시물 / 시뮬레이터 페이지
3. **sitemap.xml**: dynamic generation (next-sitemap or app/sitemap.ts)
4. **robots.txt**: 검색 엔진 친화 (production 만 index)
5. **Open Graph + Twitter Cards**: 공유 카드 표준화

### 산출물
- `app/sitemap.ts` (또는 sitemap.xml)
- `app/robots.ts` (이미 있으면 강화)
- `components/feature/structured-data.tsx` 확장
- 5+ 페이지의 metadata 강화
- 1-2 PR

---

## F23-D — components/feature/ RTL 7 → 15+

### 우선 컴포넌트 (8+ 신규)

| 컴포넌트 | mock 의존 |
|---|---|
| post-card | next/link / next/image |
| comment-thread | listComments / lib/reaction |
| chat-input | useTransition + RTDB mock |
| chat-message | next/image |
| comment-form | createComment Server Action |
| post-form | useForm + zodResolver |
| structured-data | JSON-LD inline |
| auth-buttons | next/form + signIn Server Action |

### 산출물
- 8+ 신규 파일
- 60+ tests
- 1 PR

---

## F23-E — Coverage 70%+

### Scope
미커버 lib/ 모듈:
- `lib/auth/` 잔여 (auth.ts / register-schema 외)
- `lib/storage/` 잔여 (upload helper outside __tests__)
- `lib/personalization/` 잔여
- `lib/nlp/aggregate.ts` (server-only)
- `lib/insights/jinryeong-rate.ts` 잔여 aggregation
- `app/api/*` (route handlers)

### 추정
- 80+ 신규 tests
- +4 pt coverage (66.03 → 70+)

### 산출물
- 5+ 신규 test 파일
- 1 PR

---

## F23-F — CI 실 결과 분석

### Scope
1. Sprint 22 이후 e2e.yml 결과 수집 (queue 적체 해소 가정)
2. lighthouse.yml 첫 성공 run 분석
3. visual-baseline workflow 실 실행
4. 분석 보고서 3종

### 산출물
- `reports/ci-e2e-analysis.md`
- `reports/lighthouse-analysis.md`
- `reports/visual-baseline-status.md`
- 1-2 fix PR (필요시)

---

## Chrome QA — Sprint 21-22 패턴 확장

QA phase 에서:
1. 새 페이지 검증 (`/admin/*` 운영자 페이지 익명 redirect)
2. 새 기능 검증 (NicknameChangeForm — /me 페이지)
3. Sentry 에러 캡처 확인 (의도적 console.error 트리거 후)
4. SEO 메타 검증 (page source 의 og:image, sitemap)

---

## 작업 순서 (의존성)

1. **F23-A** (마스터 V2 UI 마무리, 다른 features 무관)
2. **F23-B** (Sentry — 모든 후속 feature 의 에러 캡처에 사용)
3. **F23-D** (RTL 확대, Sprint 19-22 패턴 재사용)
4. **F23-E** (Coverage, 독립)
5. **F23-C** (SEO, F23-D 의 structured-data 와 연계)
6. **F23-F** (CI 결과, sprint 진행 중 백그라운드)
7. Iterate / QA / Report / Archive
