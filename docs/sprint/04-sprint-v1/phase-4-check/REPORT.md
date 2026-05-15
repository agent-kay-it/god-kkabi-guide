# Sprint V1 — Phase 4 Check Report

> **분석 시점**: 2026-05-15
> **기준 commit**: 66f126f (P3 Do 완료)
> **사용자 요구 (verbatim)**: "꼼꼼하고 완벽하게 클린아키텍처, 품질, 성능, 코딩컨벤션, 디자인시스템 신경써어 완성도 높게 작업해야해. 빠르게 하거나 허투루 하지마."
> **결론**: P5 Act iterate 필수 — Critical 4 + Major 3 처리 후 재검증

---

## §1. Executive Summary

| 지표 | 값 | Gate | 상태 |
|------|---:|:----:|:----:|
| Gap Match Rate | 84.2% | ≥90% | ⚠️ Below |
| Code Quality (5축 평균) | 86 | ≥85 | ✅ |
| Security (Storage rules) | 75 | ≥90 | ❌ Critical |
| Clean Architecture (역참조) | 98 | ≥95 | ✅ |
| TypeScript Strict | 92 | ≥90 | ✅ |
| WCAG AA 정적 (ARIA + semantic) | 양호 | Pass | ✅ |
| 7-Layer dataFlowIntegrity | 4/7 break | 모두 Pass | ⚠️ |

**총 발견 사항**: Critical 4 / Major 3 / Minor 4

**Production 차단 이슈 (P5 Act 즉시 처리)**:
1. **CA-C1** — Firebase Storage rules에 `posts/` 경로 부재 → 이미지 업로드 100% 실패
2. **GAP-C1** — JWT `advertisingConsent` 미전파 → AdSense 영구 비활성
3. **GAP-C2** — `AdSlotInfeed` 컴포넌트 미마운트 → monetization 50% 결손
4. **GAP-C3** — `WikiCardTracker` 미사용 → GA4 STUB 활성화 50%만 달성

---

## §2. Gap Analysis 요약

상세: [`GAP-ANALYSIS.md`](./GAP-ANALYSIS.md)

| Axis | Score | 가중치 |
|------|------:|------:|
| Structural Match | 98% | 10% |
| Functional Depth | 82% | 20% |
| API Contract | 90% | 20% |
| Intent Match | 75% | 25% |
| Behavioral Completeness | 88% | 15% |
| UX Fidelity | 80% | 10% |
| **Weighted Overall** | **84.2%** | 100% |

**주요 발견**:
- Critical 3: GAP-C1/C2/C3 (위 §1 요약)
- Major 3: M1 (댓글 liked 하드코딩), M2 (pending_edit 본인 미표시), M3 (운영자 승인 큐 페이지 부재 — Sprint V2 carry)

---

## §3. Code Analysis 요약

상세: [`CODE-ANALYSIS.md`](./CODE-ANALYSIS.md)

| 축 | Score | Status |
|----|------:|:------:|
| 보안 | 75 | ⚠️ (CA-C1) |
| Clean Architecture | 98 | ✅ |
| TypeScript Strict | 92 | ✅ |
| 디자인 시스템 / a11y | 88 | ✅ |
| 성능 | 90 | ✅ |
| GA4 / 추적 | 75 | ⚠️ (GAP-C3 의존) |

**주요 발견**:
- Critical 1: CA-C1 (storage.rules)
- Major 2: CA-M1 (태그 멤버십, V2 carry), CA-M2 (CSP img-src)
- Minor 4: 주석 정리, console.error 표준화, 외부 이미지 정책, in 쿼리 분할

**Pass Items (보안 명세 충족)**:
- Markdown XSS: rehype-sanitize 화이트리스트 + protocols https only + `dangerouslySetInnerHTML` 1군데만 (사전 sanitize)
- Server Action 표준: 8개 모듈 모두 `'use server'` + `'server-only'` + auth() guard
- Clean Arch: `components/domain → feature` 역참조 0건 (grep 검증)
- Reaction 본인 차단, 신고 페널티 Firestore transaction race 차단
- Firestore rules 17 컬렉션, indexes 18건

---

## §4. Lighthouse 측정 — 운영자 게이트 사전

### 4.1 상태

Sprint V1 P3 Do에서 신규 추가된 자산:
- **Pretendard subset**: `public/fonts/PretendardVariable.woff2` (운영자가 `pyftsubset` 수동 적용 필요 — `docs/sprint/04-sprint-v1/phase-3-do/P3.A-OPERATOR-GATES.md`)
- **AdSense Script + Sticky/Infeed**: Production env 없이는 dead code (4-조건 가드 + GAP-C1으로 인해 영구 false)
- **23 GA4 이벤트**: 신규 6 + STUB 활성화 (단 wiki_card_click 미연결 — GAP-C3)

### 4.2 측정 정책

Sprint v2 패턴 재현:
1. **로컬 dev 측정 의미 없음** — production env 변수 (AdSense publisher ID + slot IDs) 없이는 광고 컴포넌트가 모두 무효화되어 실제 LCP/CLS 영향 미반영
2. **Pretendard subset 미수행** — 운영자 수동 게이트 (woff2 1.4MB → 500KB 한도 검증) 통과 전까지 LCP/FCP 측정 변동성 큼
3. **본 P4 단계의 Lighthouse는 production deployment 직후 별도 측정 게이트로 carry**

### 4.3 측정 게이트 (Sprint V1 P6 QA 또는 production deployment 직후)

목표 (`prd.md §성능 목표`):
- **LCP** ≤ 2.5s
- **FID/INP** ≤ 200ms
- **CLS** ≤ 0.1
- **Lighthouse Performance** ≥ 85 (Mobile)
- **Pretendard subset KB** ≤ 500KB (운영자 게이트 사전 `scripts/verify-font-subset.sh`로 검증)

운영자 액션 필요:
1. `pyftsubset` 수동 적용 후 `scripts/verify-font-subset.sh` 통과 확인
2. Vercel env 3건 등록 (`NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`, `NEXT_PUBLIC_ADSENSE_SLOT_STICKY`, `NEXT_PUBLIC_ADSENSE_SLOT_INFEED`)
3. AdSense 가입 + 검토 14일 통과 (`P3.D-OPERATOR-GATES.md`)
4. Production deployment 후 `npx lighthouse https://<prod-url>/post --preset=desktop` + `--preset=mobile` 측정

---

## §5. WCAG AA 정적 검증

### 5.1 정적 점검 (grep 기반)

| 항목 | V1 신규 적용 수 | Pass 기준 |
|------|---------------:|:----------:|
| ARIA 속성 (aria-label/describedby/hidden, role) | 19건 | ≥10 ✅ |
| Semantic HTML (h1/h2/h3, main, nav, article, section, header) | 27건 (V1 6 페이지) | ≥15 ✅ |
| label-for 매칭 (htmlFor=) | 10건 | ≥5 ✅ |
| button type="button" 명시 | 11건 | ≥5 ✅ |
| dangerouslySetInnerHTML 사전 sanitize | 1군데 (markdown-view.tsx, 사전 sanitize 보장) | Pass ✅ |

### 5.2 시각적 검증 — V1 컴포넌트별 a11y 패턴

| 컴포넌트 | a11y 패턴 | Status |
|----------|-----------|:------:|
| `PostForm` | Label htmlFor + Input id + aria-describedby (error message) | ✅ |
| `CommentForm` | 동일 패턴 | ✅ |
| `CommentItem` | 답글/좋아요/신고 button aria-label + type="button" | ✅ |
| `LikeButton` | aria-pressed (좋아요 상태) | ✅ |
| `PostReportDialog` | shadcn Dialog 표준 (focus trap, aria-modal) | ✅ |
| `AdminPenaltyTable` | table role + th scope | ✅ |
| `AdminDictionaryTable` | Checkbox aria-checked + Trash2 aria-label | ✅ |
| `MarkdownView` | prose 스타일링 + 키보드 네비게이션 (h2/h3 heading hierarchy) | ✅ |
| `AdSenseScript` | beforeInteractive 전략 | ✅ |

### 5.3 콘트라스트 (디자인 토큰 v2)

- bronze/jade/vermilion/indigo + glass-card 토큰은 Sprint v2 P4에서 ≥4.5:1 WCAG AA 통과 확인 — V1에서 신규 색상 토큰 추가 없음, 회귀 없음.

### 5.4 미해결 항목

없음 — 정적 분석 통과. (단 실제 스크린리더 / 키보드 네비게이션 라이브 테스트는 P6 QA 단계에서 별도 진행)

---

## §6. 7-Layer dataFlowIntegrity 정적 검증

### 6.1 V1 신규 6 데이터 흐름

각 행에서 **UI → Client → Server Action → Validation → Firestore/Storage → Response → Client → UI** 7-hop 추적.

| Flow | Layer 1-3 | Layer 4 (Validation) | Layer 5 (DB) | Layer 6-7 (Response) | Layer 8 (UI) | 상태 |
|------|:---------:|:--------------------:|:------------:|:--------------------:|:------------:|:----:|
| **F1: Post Create** | ✅ PostForm → uploadPostImage → createPost | ✅ PostInputSchema (Zod) | ⚠️ **Storage rules fail** (CA-C1) | ✅ return ok | ✅ router.push | ❌ Break (Layer 5) |
| **F2: Comment Create** | ✅ CommentForm → createComment | ✅ Zod + depth check (lib/comment/actions.ts:117) | ✅ Firestore transaction | ✅ revalidatePath | ✅ render | ✅ Pass |
| **F3: Reaction Toggle** | ✅ LikeButton useOptimistic | ✅ idempotent + self-block (lib/reaction/actions.ts:61) | ✅ Firestore transaction (denormalize) | ✅ return result | ✅ revert on error | ✅ Pass |
| **F4: Post Report** | ✅ PostReportDialog → reportPostOrComment | ✅ Zod | ✅ Firestore + recordReport trigger | ✅ return ok | ✅ toast | ✅ Pass |
| **F5: Penalty Apply** | (no UI — internal) | ✅ runTransaction 임계값 검사 | ✅ Firestore + setUserClaims | ✅ return result | (no UI) | ✅ Pass |
| **F6: AdSense Render** | ⚠️ `advertisingConsent` JWT undefined (GAP-C1) | (no validation) | (no DB) | (no response) | ❌ showAds false (Layer 8) | ❌ Break (Layer 1) |
| **F7: Wiki Card Click → GA4** | ❌ WikiCardTracker 미마운트 (GAP-C3) | (no validation) | (no DB) | (no response) | ❌ logEvent 미호출 (Layer 8) | ❌ Break (Layer 1) |

### 6.2 정합성 점수

- **Pass**: 4 / 7 (F2, F3, F4, F5)
- **Break**: 3 / 7 (F1, F6, F7)
- **P5 Act 후 예상 Pass**: 7 / 7 (Critical 4 모두 해소 시)

---

## §7. P5 Act iterate 실행 계획

### 7.1 통합 우선순위 (P0 → P1)

| # | ID | Source | Severity | 작업 | 예상 시간 | Pass Criteria |
|--:|----|--------|----------|------|-----------|---------------|
| 1 | **CA-C1** | code-analysis | Critical | `storage.rules`에 `posts/{userId}/{filename}` 규칙 추가 | ~15m | Firebase emulator에서 unauthorized upload 거부 + authorized upload 성공 |
| 2 | **GAP-C1** | gap-analysis | Critical | JWT `advertisingConsent` 전파 (`lib/auth/config.ts` jwt 콜백 + register.ts 연결) | ~1h | `session.user.advertisingConsent`이 등록 후 즉시 true 반환 |
| 3 | **GAP-C2** | gap-analysis | Critical | `app/post/page.tsx`에 `AdSlotInfeed` 5번째 위치 삽입 + env 변수 (`NEXT_PUBLIC_ADSENSE_SLOT_INFEED`) | ~30m | grep 매칭 + 빌드 통과 |
| 4 | **GAP-C3** | gap-analysis | Critical | 6개 wiki 페이지 (`/class /jinryeong /skill /equipment /content /munpa`)에 `WikiCardTracker` wrapper 적용 | ~1h | grep 매칭 ≥6 + GA4 디버거에서 wiki_card_click 발화 확인 |
| 5 | **GAP-M1** | gap-analysis | Major | `getMyReactionsForComments` 추가 + `app/post/[id]/page.tsx:130` 연결 | ~1h | `liked={...}` 동적 |
| 6 | **GAP-M2** | gap-analysis | Major | `listPosts`에 본인 글 pending_edit 포함 + "심사 중" 배지 | ~30m | `/me/posts`에서 pending_edit 표시 |
| 7 | **CA-M2** | code-analysis | Major | CSP `img-src`에 `*.googleusercontent.com` 추가 확인 | ~10m | next.config.ts header inspect |

**총 예상 시간**: ~4.5시간 (Sprint v2 P5 패턴 — 1 세션 내 완료 가능)

### 7.2 Carry-over (Sprint V2)

- GAP-M3: `/admin/posts/pending` 큐 페이지 + approve/reject Server Action
- CA-M1: 태그 멤버십 검증 (Zod refine)
- CA-m1~m4: 주석 정리, console.error 표준화, 외부 이미지 정책 정리, in 쿼리 분할 방어

### 7.3 검증 게이트 (P5 Act 완료 시)

- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm build` 통과
- [ ] gap-detector 재실행 → Match Rate ≥90%
- [ ] code-analyzer 재실행 → Security ≥90
- [ ] 7-Layer F1/F6/F7 break 해소 확인
- [ ] commit + Sprint state phase=p6_qa

---

## §8. Quality Gates 종합 (Sprint V1 M0-M12)

| Gate | 기준 | Status | 비고 |
|:----:|------|:------:|------|
| M0 | TypeScript strict 0 errors | ✅ | P3 Do에서 6회 시도 후 안정화 |
| M1 | Firestore rules 17 컬렉션 보호 | ✅ | posts/comments/reactions/penalties/dictionaries 모두 |
| M2 | Server Action `'use server'` + `'server-only'` + auth() | ✅ | 8개 모듈 일관 적용 |
| M3 | Markdown XSS 방어 | ✅ | rehype-sanitize + dangerouslySetInnerHTML 1군데만 |
| M4 | Clean Arch 역참조 0건 | ✅ | grep 0 matches |
| M5 | Match Rate ≥90% | ❌ | 84.2% — P5 Act 후 재검증 |
| M6 | Lighthouse Mobile ≥85 | ⏸️ | 운영자 게이트 사전 (production CDN 측정) |
| M7 | WCAG AA 정적 | ✅ | ARIA 19 + semantic 27 + htmlFor 10 |
| M8 | 7-Layer Pass | ❌ | 4/7 — P5 Act 후 재검증 |
| M9 | GA4 23 이벤트 정의 | ✅ | types/ga4.ts 일치 |
| M10 | PIPA 5번째 동의 정의 | ⚠️ | 정의 ✅ / JWT 전파 ❌ (GAP-C1) |
| M11 | AdSense GDPR/PIPA 4-가드 정의 | ⚠️ | 정의 ✅ / advertisingConsent 영구 false ❌ |
| M12 | Storage rules posts 경로 | ❌ | CA-C1 — P5 Act 즉시 처리 |

**Gate 통과**: 8 / 12 (M0-M4, M7, M9 명확 ✅; M10/M11/M12 P5 Act 후 ✅; M5/M8 재측정 후 ✅; M6 운영자 게이트)

---

## §9. 다음 단계

1. **P5 Act iterate** — Critical 4 + Major 3 처리 (~4.5h, 단일 세션)
2. **P5 검증** — gap-detector + code-analyzer 재실행 → ≥90% 달성 확인
3. **P5 commit** — `refactor(v1-p5-act)` + sprint state phase=p6_qa
4. **P6 QA** — E2E 정적 시나리오 + 7-Layer F1/F6/F7 break 해소 검증
5. **P7 Report** — Sprint V1 종합 보고서 + KPI + V2 인풋
6. **P8 Archive** — Sprint state 종료 + tag

---

**P4 Check 종료. P5 Act iterate 진입.**
