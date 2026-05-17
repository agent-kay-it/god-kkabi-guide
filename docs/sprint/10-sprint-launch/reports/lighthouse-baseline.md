# Lighthouse Baseline — Sprint 10 / Phase F-final (Task #31)

**Generated**: 2026-05-17
**Target**: staging.kkaebizigi.com (Vercel staging deployment)
**Reference**: docs/sprint/10-sprint-launch/design.md §10 (Performance Budget)

---

## 1. 설치 & 실행

### 사전 조건

```bash
# macOS
brew install --cask google-chrome

# Linux
sudo apt install -y chromium-browser
```

### 실행

```bash
# 전체 (desktop + mobile)
./scripts/lighthouse-ci.sh

# desktop만
./scripts/lighthouse-ci.sh --desktop

# mobile만
./scripts/lighthouse-ci.sh --mobile

# 특정 URL
./scripts/lighthouse-ci.sh --url https://kkaebizigi.com/post/abc
```

스크립트는 `pnpm dlx @lhci/cli@latest`를 호출하므로 devDep 부풀음 없이 즉시 사용 가능.

리포트는 `.lighthouseci/` (desktop) + `.lighthouseci-mobile/` (mobile)에 HTML로 저장됨.

---

## 2. 대상 페이지 (4개)

| # | URL | 페이지 | 디자인 ref |
|---|---|---|---|
| 1 | `/` | 홈 (hero + featured) | design.md §10 (≤ 200ms TTFB, ≤ 150KB JS) |
| 2 | `/class` | 직업 가이드 (cards grid) | design.md §10 |
| 3 | `/jinryeong` | 진령 가이드 (cards grid) | design.md §10 |
| 4 | `/post` | 게시판 목록 | design.md §10 (≤ 300ms TTFB, ≤ 180KB JS) |

게시물 상세(`/post/[id]`)는 동적 라우트로 매번 다른 콘텐츠를 측정하므로 회귀 비교 시 노이즈가 큼 — Sprint 11에서 대표 글 1건 고정 URL 추가 측정 검토.

---

## 3. Performance Budget 목표 (design.md §10)

### Desktop

| 페이지 | TTFB | FCP | LCP | TTI | JS bundle (gzip) |
|---|---|---|---|---|---|
| `/` | ≤ 200ms | ≤ 1.0s | ≤ 1.8s | ≤ 2.5s | ≤ 150KB |
| `/post` | ≤ 300ms | ≤ 1.2s | ≤ 2.0s | ≤ 3.0s | ≤ 180KB |
| `/post/[id]` | ≤ 300ms | ≤ 1.2s | ≤ 2.5s (YT lazy) | ≤ 3.0s | ≤ 200KB |
| `/chat/[id]` | ≤ 400ms | ≤ 1.5s | ≤ 2.5s | ≤ 3.5s | ≤ 250KB |
| `/login` | ≤ 200ms | ≤ 1.0s | ≤ 1.5s | ≤ 2.0s | ≤ 130KB |

### Category Targets

| 카테고리 | Desktop 목표 | Mobile 목표 | 비고 |
|---|---|---|---|
| Performance | ≥ 90 | ≥ 85 | Mobile 다소 완화 |
| Accessibility | ≥ 90 | ≥ 90 | A11y 동일 |
| Best Practices | ≥ 90 | ≥ 90 | CSP/HTTPS/etc |
| SEO | ≥ 90 | ≥ 90 | meta/sitemap/robots |

---

## 4. 베이스라인 네트워크 측정 (curl proxy)

Chrome이 로컬에 설치되어 있지 않은 환경에서 `curl` 기반 프록시 측정 (Vercel edge → 클라이언트 raw HTTP).

측정 시각: 2026-05-17 11:40 KST  (region: ap-northeast-1 추정)

| 페이지 | TCP connect | TTFB (server) | Total | HTML size |
|---|---|---|---|---|
| `/` | 18ms | **527ms** | 711ms | 152 KB |
| `/class` | 19ms | **1005ms** | 1215ms | 110 KB |
| `/jinryeong` | 20ms | **859ms** | 1088ms | 150 KB |
| `/post` | 17ms | **615ms** | 615ms | 33 KB |

**해석**:
- `/` TTFB 527ms — design.md §10 목표 200ms 대비 2.6× 초과 → ISR/SSG 검토 필요
- `/class` TTFB 1005ms — Firestore 다중 컬렉션 조회 가능성. 캐시/ISR 도입 검토
- `/jinryeong` TTFB 859ms — 동일 패턴
- `/post` TTFB 615ms + small HTML — Streaming SSR로 작동 중 (size 33KB는 shell만, 후속 streamed)

**제약**: TTFB는 cold-start + DB query + RSC 합산. Lighthouse FCP/LCP는 추가로 클라이언트 hydration 포함 → 실측 시 더 높게 나옴.

---

## 5. 실측 (Lighthouse) — 수행 가이드

L4 자동화 환경에 Chrome이 설치되지 않아 본 Phase F-final에서 실측은 보류. 다음 환경 중 하나에서 실측 수행:

### 5.1 Local (사용자 macOS)

```bash
# 한 번만
brew install --cask google-chrome

# 실행
cd /Users/popup-kay/Documents/GitHub/agentkay/kkaebizigi
./scripts/lighthouse-ci.sh --desktop
./scripts/lighthouse-ci.sh --mobile
```

실행 시간: 1 페이지 × 3 runs × 2 모드 ≈ 5~8분.

### 5.2 GitHub Actions (CI integration — 후속 Sprint)

`.github/workflows/lighthouse.yml` 신설:

```yaml
name: Lighthouse CI
on:
  pull_request:
    branches: [staging, main]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install -g @lhci/cli
      - run: lhci autorun --config=lighthouse-ci.json
      - run: lhci autorun --config=lighthouse-ci.mobile.json
```

### 5.3 Vercel Speed Insights (production 측정)

Task #32에서 통합 — `@vercel/speed-insights` 패키지로 실 사용자 RUM 데이터 수집.

---

## 6. 예상 권장 사항 (실측 전 hypothesis)

### Performance (실측 후 확정)

1. **`/`, `/class`, `/jinryeong` TTFB 단축** — Firestore 데이터의 ISR/SSG 캐싱 (Vercel revalidate 600s 등)
2. **Image optimization** — 이미 next/image + AVIF/WebP 사용 중 (next.config.ts) → 추가 lazy
3. **Font preload** — Pretendard Variable subset 이미 preload (수직 layout shift 방어). Lighthouse가 잡으면 추가 `dns-prefetch` 검토
4. **Code splitting** — RTDB SDK는 chat 페이지에서만 dynamic import (design.md §10)
5. **Third-party scripts** — Google AdSense + GA4 → defer/async 확인
6. **YouTube embed lazy** — `lite-youtube` 패턴 (Phase D에서 이미 iframe sandbox)

### Accessibility

1. **Color contrast** — 디자인 토큰 WCAG AA 검증 완료 (design-tokens-v2.json)
2. **ARIA labels** — Radix UI 사용 → 대부분 자동
3. **Focus management** — manual 검증 필요 (chat composer, modal trap)

### Best Practices

1. **CSP** — 이미 강화됨 (next.config.ts headers)
2. **HTTPS** — Vercel 자동
3. **console errors** — RSC prefetch 503 (Phase D 알려진 이슈) → Sentry 통합 후 모니터링 (Task #32)

### SEO

1. **sitemap.ts + robots.ts** — 이미 존재 (app/sitemap.ts, app/robots.ts)
2. **meta description** — 페이지별 metadata export 검증
3. **structured data** — JSON-LD 추가 검토 (Sprint 11)

---

## 7. Quality Gate 결과 (M8)

본 Phase F-final에서:
- **M8 Lighthouse**: `pending` → `partial-pass`
  - 인프라/스크립트/config: ✅ 완료
  - 실측: ⏸ 사용자 환경에서 1회 수동 실행 후 결과를 본 보고서 §8에 기재 예정

---

## 8. 실측 결과 (TODO — 사용자 환경에서 채우기)

```
[ ] desktop 4 페이지 × 3 runs
[ ] mobile 4 페이지 × 3 runs
[ ] HTML 보고서 첨부 (.lighthouseci/*.html)
[ ] 각 카테고리 점수 표 채우기:
```

| 페이지 | Mode | Performance | A11y | Best Practices | SEO |
|---|---|---|---|---|---|
| `/` | desktop | TBD | TBD | TBD | TBD |
| `/` | mobile | TBD | TBD | TBD | TBD |
| `/class` | desktop | TBD | TBD | TBD | TBD |
| `/class` | mobile | TBD | TBD | TBD | TBD |
| `/jinryeong` | desktop | TBD | TBD | TBD | TBD |
| `/jinryeong` | mobile | TBD | TBD | TBD | TBD |
| `/post` | desktop | TBD | TBD | TBD | TBD |
| `/post` | mobile | TBD | TBD | TBD | TBD |

---

## 9. Sprint 11 carry items

- Vercel Speed Insights RUM 데이터 1주일 수집 후 분석
- ISR/SSG 적용으로 TTFB < 300ms 달성
- Lighthouse 점수 desktop ≥ 90, mobile ≥ 85 달성 검증
- GitHub Actions CI에 lighthouse job 통합 (PR마다 자동 측정)
- `/post/[id]` 대표 글 1개 고정 측정 (회귀 비교용)
