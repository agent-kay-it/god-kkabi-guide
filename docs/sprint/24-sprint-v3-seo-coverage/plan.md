# Sprint 24 Plan

## F24-A — SEO 강화
- `app/sitemap.ts` (Next.js 16 MetadataRoute.Sitemap) — 25 public path + dynamic posts
- 메타 강화 5+ 페이지 (/, /post, /simulator, /jinryeong, /coupon, /me)
- structured data 확대 (FAQPage, ItemList, WebApplication)

## F24-B — Coverage 70%+
- lib/firebase/admin.ts smoke
- lib/auth/auth.ts core helpers
- lib/insights/jinryeong-rate.ts aggregation 잔여
- lib/storage/__tests__ 외 helper
- +3 pt 추정

## F24-C — feature RTL 8 → 15+
8+ 신규: post-form / comment-form / comment-thread / chat-message / chat-input / chat-channel / penalty-badge / featured-jinryeong

## F24-D — Sentry config 파일
- `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts`
- `instrumentation.ts` (Next.js 16)
- `docs/05-policy/slo-policy.md` (SLO 정의)
- SENTRY_DSN env 등록은 사용자 작업 (Sprint 25 carry)

## 작업 순서
1. F24-A (SEO, 독립)
2. F24-B (Coverage)
3. F24-C (feature RTL)
4. F24-D (Sentry design)
5. Iterate / QA (Chrome sitemap.xml / robots.txt / structured data 확인) / Report / Archive
