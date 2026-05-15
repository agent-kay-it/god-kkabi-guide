# Sprint V5 — Phase 4 Check Report

> 작성: 2026-05-16
> 출처: Sprint V5 PDCA L4 자동 실행 완료

## 1. Build Quality (게이트 통과)

| 항목 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ **0 errors** |
| `pnpm lint` | ✅ **0 errors / 0 warnings** |
| `pnpm build` (Next.js 16.2.6) | ✅ 46 routes 통과 |

**V4 → V5: 5 lint issues (2 errors + 3 warnings) → 0/0.** 100% 해결.

## 2. V4 Carry-over 4건 완료

| # | 항목 | 해결 방식 |
|--:|---|---|
| 1 | `lib/chat/use-channel.ts:63` setState in effect | render-phase reset (React 권장 패턴) + init error는 합법 setState-in-effect로 명시적 disable |
| 2 | `markdown-view.tsx:25` react/no-danger 룰 미정의 | 불필요한 disable 코멘트 제거 (보안은 source rehype-sanitize에서 보장) |
| 3 | `b2b/handler.ts` + `cron/etl-external-signals` console.info | `lib/observability/audit-log.ts` emitAuditLog 헬퍼로 통합 → console.warn 시맨틱 |
| 4 | `post-form.tsx:86` form.watch() 메모이제이션 | `useWatch({ control, name })` 로 전환 → React Compiler 호환 |

## 3. Sprint V5 산출물

### P3.A — V4 Carry-over (4 fix)
- `lib/chat/use-channel.ts` 리팩토링
- `components/domain/markdown-view.tsx` 코멘트 정리
- `lib/observability/audit-log.ts` 신규 (구조화 감사 로그)
- `lib/b2b/handler.ts` + `app/api/cron/etl-external-signals/route.ts` audit log 적용
- `components/feature/post-form.tsx` useWatch 전환

### P3.B — V4 컴포넌트 Wiring
- `app/layout.tsx` — `<LightboxProvider>` + `<BackToTop />` 통합
- `components/feature/featured-jinryeong-zoomable.tsx` 신규 (lightbox 트리거 client wrapper)
- `app/jinryeong/page.tsx` — FeaturedJinryeongZoomable 사용

### P3.C — V4 SectionHead 디자인 시스템 Propagation
8개 페이지 헤더를 V4 패턴(`HeroMeta + SectionHead{SectionEyebrow + SectionTitle + SectionLead}`)으로 통일:

| 페이지 | num | label |
|---|---|---|
| `/class` | 02 | Class |
| `/jinryeong` | 03 | Jinryeong |
| `/skill` | 04a | Skills |
| `/equipment` | 04b | Forging |
| `/content` | 05 | Dungeon · PvP |
| `/tips` | 08 | Tactics |
| `/coupon` | 07b | Coupons |
| `/munpa` | 10 | Munpa |
| `/simulator` | — | Tools |

### P3.D — 성능 audit
- 이미지 priority hint: hero-app-block.tsx ✅ (LCP candidate) / hero-backdrop.tsx priority={false} ✅
- 배너 이미지: `loading="lazy"` 적용됨
- 폰트: Pretendard Variable local woff2 + JetBrains Mono Google subset, display: swap
- bundle: 46 routes 모두 정상 빌드
- raw `<img>` 태그: 없음 (전부 Next/Image)

### P3.E — 접근성 + SEO audit
- `<html lang="ko">` ✅
- HeroBackdrop banner 이미지 alt="" + aria-hidden ✅ (decorative)
- 의미적 이미지 alt: "동양 판타지 탐험 — 갓깨비 키우기 공식 배너" ✅
- robots: index:false (1인 운영 정책 유지) — JSON-LD structured data 생략

## 4. Layout 통합 검증

```
TooltipProvider
└─ LightboxProvider (V5 신규)
   ├─ AnalyticsBootstrap
   ├─ PageEngagementTracker
   ├─ TopBar
   ├─ children (모든 페이지)
   ├─ ChatWidgetLoader (등록 사용자만)
   ├─ AdSlotSticky (광고 조건부)
   ├─ BackToTop (V5 신규, scroll > 600px 자동 표시)
   └─ Toaster
```

- LightboxProvider Context → 모든 자손이 `useLightbox()` 호출 가능
- BackToTop fixed positioning → 어디서나 우하단 노출

## 5. 무회귀 검증

- 모든 기존 V1-V4 페이지 빌드 통과
- TopBar / ChatWidget / AdSlotSticky 등 layout 자식 무손실
- WikiCardTracker / BookmarkButton / 시뮬레이터 등 인터랙티브 기능 무영향
- 새 audit-log 헬퍼는 B2B + cron만 사용 (다른 console.warn/error는 무관)

## 6. Carry-over (V5 → V6)

없음. V5는 V4 carry-over를 모두 해소했으며 신규 carry-over 항목 없음.

## 7. 졸업 게이트 PASS

- [x] V4 종료 (Match ~95%)
- [x] `pnpm typecheck` 0 errors
- [x] `pnpm lint` 0 errors + 0 warnings
- [x] `pnpm build` 46 routes 통과
- [x] LightboxProvider + BackToTop layout 통합
- [x] 9 페이지 SectionHead pattern 적용 (8 + simulator)
- [x] V4 carry-over 4건 모두 해결
- [x] 신규 회귀 없음 (build 무손실)
