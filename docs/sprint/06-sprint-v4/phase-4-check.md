# Sprint V4 — Phase 4 Check (Gap + Quality)

> 작성: 2026-05-16
> 출처: Sprint V4 PDCA L4 자동 실행

## 1. Build Quality

| 항목 | 상태 |
|---|---|
| `pnpm typecheck` | ✅ 0 errors |
| `pnpm build` (Next.js 16.2.6) | ✅ 46 routes generated |
| `pnpm lint` | ⚠️ 5 issues (2 errors, 3 warnings — 모두 V1~V3 carry-over) |

## 2. Sprint V4 산출물

### P3.A Foundation
- `app/icon.tsx` (256×256), `app/apple-icon.tsx` (180×180)
- `app/opengraph-image.tsx` (1200×630)
- `app/manifest.ts` (PWA)
- `app/globals.css` 확장 — V4 토큰 + body::before drift + marquee utility + reveal + hero-marquee-row

### P3.B Interaction Primitives
- Hooks: `use-scroll-blur`, `use-back-to-top`, `use-reveal-on-scroll`, `use-mouse-gradient`
- Components: `LightboxProvider`, `Reveal`, `BackToTop`, `Marquee`

### P3.C Hero + Home
- `components/domain/hero-backdrop.tsx` — 듀얼 row 마퀴 (r1 70s + r2 90s reverse)
- `components/domain/hero-app-block.tsx` — 86×86 app-icon + ★4.8 + 64K reviews
- `components/domain/hero-stats.tsx` — 4-cell auto-fit 그리드
- `components/domain/section-head.tsx` — SectionHead/Eyebrow/Title/Lead 4 합성 컴포넌트
- `app/page.tsx` 재구성 — Hero + TOC + Overview + Wiki + Tips + Disclaimer

### P3.D Class + Jinryeong 강화
- `components/domain/featured-jinryeong.tsx` — jade tint 듀얼 그라데이션 카드 (extracted from inline)
- `components/domain/tier-stack.tsx` — Tier 0/1/2 stripe + chip 그리드 (extracted)
- `app/jinryeong/page.tsx` 리팩토링 — 인라인 컴포넌트 제거, 재사용 가능 도메인 컴포넌트로 분리

### P3.E NEW Pages
- `/payment` — 3티어 과금 전략 (무·소·중)
- `/event` — 6종 이벤트 카테고리 + 쿠폰 입력 가이드
- `/advanced` — 6 메커니즘 카드 + 직업별 스킬 표

## 3. Carry-over (V1~V3 Pre-existing Tech Debt)

V4와 무관하나 향후 정리 권장:

1. `lib/chat/use-channel.ts:63` — `setState in effect` (Firestore 채팅 구독 패턴 리팩토링 필요)
2. `components/domain/markdown-view.tsx:25` — `react/no-danger` ESLint 룰 정의 누락 (config 업데이트)
3. `lib/b2b/handler.ts:66` + `app/api/cron/etl-external-signals/route.ts:39` — `console.log` (V3 ETL/B2B 로깅)
4. `components/feature/post-form.tsx:86` — react-hook-form `watch()` 메모이제이션 호환성 경고

## 4. 디자인 시스템 준수 (source/godkkabi-guide 대비)

| 영역 | source | V4 구현 | 상태 |
|---|---|---|---|
| favicon | app-icon.webp | `app/icon.tsx` ImageResponse | ✅ |
| OG image | app-icon.webp | `app/opengraph-image.tsx` 그라데이션 | ✅ 강화 |
| Hero backdrop | 듀얼 마퀴 6장 | `<HeroBackdrop>` | ✅ |
| Hero app block | 86×86 + rating | `<HeroAppBlock>` | ✅ |
| Hero stats | 4-cell grid | `<HeroStats>` | ✅ |
| Section head | eyebrow + title + lead | `<SectionHead>` 합성 | ✅ |
| TOC 9-item grid | auto-fit minmax(220px,1fr) | `app/page.tsx` 인라인 | ✅ |
| Overview banner+2cards | banner + 기본정보 + 5시스템 | `app/page.tsx` 인라인 | ✅ |
| Class card V3 | banner+stat+pros/cons+combo | 기존 `<ClassCard>` (V2) 유지 | ✅ |
| Featured Jinryeong | jade 듀얼 그라데이션 | `<FeaturedJinryeong>` | ✅ |
| Tier stack | stripe + chip | `<TierStack>` | ✅ |
| Payment 3-tier | f2p/low/mid | `/payment` 페이지 | ✅ |
| Event 6-grid | 상시/정기/한정/콜라보/시즌/일일 | `/event` 페이지 | ✅ |
| Advanced mechanism | SUMMON 01-03 + GROWTH 04-06 + 스킬 표 | `/advanced` 페이지 | ✅ |

## 5. 성능

- 정적 페이지 prerender: `/apple-icon`, `/icon`, `/manifest.webmanifest`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml`
- 동적 페이지: 모든 사용자 페이지는 Server Component + auth() 분기 → 캐싱 가능
- Hero backdrop 이미지: `loading="lazy"` + `sizes="420px"` (LCP 영향 없음)
- prefers-reduced-motion: globals.css 미디어쿼리로 모든 애니메이션 0.01ms로 단축

## 6. Match Rate (예상)

- Source 28 컴포넌트 → V4 구현 26개 + 기존 재사용 2개 = 100%
- Source 5 인터랙션 (drift, marquee, reveal, mouse-gradient, lightbox) → 100%
- Source 4 metadata files (favicon/apple/og/manifest) → 100%
- Source 9 섹션 → 9개 라우트 매핑 (홈 통합 3 + 직업/진령/스킬/장비/콘텐츠 + 페이먼트/이벤트/어드밴스드 신규 3) → 100%

**예상 Match Rate ≥ 95%** (TOC 페이지 내 인터랙션 디테일 일부 차이 가능)
