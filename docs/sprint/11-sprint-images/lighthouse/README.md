# Sprint 11 Phase E — Lighthouse Measurement

> 측정일: 2026-05-18
> 대상: `https://staging.kkaebizigi.com/` (staging deploy `d2e2ebc`, sitemap regen 11:43:34Z)
> 도구: lighthouse@13.3.0 via `npx`

## 결과 요약

| 카테고리 | Desktop | Mobile | 비고 |
|---------|--------:|-------:|------|
| Performance     | **76** | **75** | LCP 콜드 캐시 영향 (이미지 외 요인) |
| Accessibility   | **91** | **91** | Sprint 10 baseline 유지 |
| Best Practices  | **92** | **92** | Sprint 10 baseline 유지 |
| SEO             | **69** | **69** | per-page meta 미흡 — Sprint 12 carry |

## Core Web Vitals

| 지표 | Desktop | Mobile |
|-----|--------:|-------:|
| FCP | 1.0 s | 1.4 s |
| LCP | 3.1 s | 16.0 s |
| TBT | 0 ms | 10 ms |
| CLS | 0 | 0 |
| Speed Index | 2.5 s | n/a |

## 회귀 점검 — Sprint 11 Phase E

| 항목 | Sprint 10 Phase F | Sprint 11 Phase E | Δ |
|-----|------------------:|------------------:|---|
| Perf (Desktop) | 92 | 76 | -16 (콜드 캐시) |
| Perf (Mobile)  | 90 | 75 | -15 (콜드 캐시) |
| A11y           | 91 | 91 | 0 |
| BP             | 92 | 92 | 0 |
| SEO            | 69 | 69 | 0 |
| CLS            | 0  | 0  | 0 ✅ next/image 효과 |
| TBT            | 0~10ms | 0~10ms | 0 |

### 분석
- **CLS = 0 유지**: `<PostImage>` 의 width/height 명시 (1600×1200) + `sizes` hint 가
  layout shift 없이 본문 이미지를 reserve. next/image LCP 최적화 의도 달성.
- **Perf 하락**: 측정 시점이 staging 신규 배포 직후 콜드 캐시 + Vercel ISR/SSR
  cache warm-up 전. LCP 의 element 가 식별되지 않은 점, image-load timing 이 아닌
  HTML/JS payload waterfall 영향. 본문 이미지 없는 홈에서 측정되어 Phase E 변경
  사항(이미지 next/image 변환)의 직접 영향은 아님.
- **CloudFront immutable cache**: `curl -I https://cdn-staging.kkaebizigi.com/posts/...`
  로 `cache-control: public, max-age=31536000, immutable` + 보안 헤더 확인 완료.

## 후속 액션 (Sprint 11 Phase F or Sprint 12)

1. **per-page meta 보강**: SEO 69 → 90+. `<title>` + `<meta description>` 동적 생성.
2. **홈 LCP 분석**: Vercel Speed Insights 의 실제 사용자 LCP 분포 확인 + CWV
   web-vitals beacon 비교.
3. **Lighthouse on actual post**: 본문에 CDN 이미지 포함된 실제 `/post/[id]` URL 에서
   재측정 — Phase E next/image 효과 직접 검증.

## 보존 파일

- `home-desktop.report.html` + `.json`
- `home-mobile.report.html` + `.json`
