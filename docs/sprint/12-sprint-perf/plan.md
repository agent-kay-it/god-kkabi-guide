# Sprint 12 — Plan (WBS)

**Sprint ID**: `12-sprint-perf`
**상위 문서**: `prd.md`
**작성일**: 2026-05-18

---

## 1. WBS 구조

Sprint 12 는 **5개 Feature** × 8-Phase 컨테이너로 구성된다. 각 feature 는 독립 PR + squash merge 패턴.

| Feature ID | 이름 | 우선순위 | 의존 | DoD 매핑 |
|---|---|:--:|:--:|:--:|
| **F12-A** | Lighthouse 측정 baseline + 시드 post + 진단 리포트 | P0 | — | DoD-4 보조 |
| **F12-B** | Font + 3rd-party scripts diet | P0 | F12-A | DoD-1, 2, 5 |
| **F12-C** | Bundle splitting + dynamic import | P0 | F12-A | DoD-1, 5 |
| **F12-D** | SEO 전환 안전망 (robots toggle + structured data + sitemap) | P1 | — | DoD-9, 10 |
| **F12-E** | Lighthouse CI workflow + perf budget gate | P1 | F12-B, C | DoD-8 |

총 예상 task: 20개

---

## 2. Feature F12-A — Lighthouse Baseline + 시드 Post + 진단

**목표**: 변경 없이 현재 staging 의 정확한 mobile/desktop perf baseline 을 5회 평균으로 기록 + 실제 이미지 포함 post 5개 자동 생성하여 `/post/[id]` 측정 가능 상태로 전환.

| Task ID | 제목 | 산출물 | 예상 시간 |
|---|---|---|---|
| 12-A-1 | `scripts/seed-staging-posts.mjs` 신규 — Firebase Admin SDK 로 staging Firestore 에 시드 post 5개 작성, 각 post 본문에 CDN 이미지 1~3장 (실제 업로드한 sample) | 스크립트 + npm script `seed:staging` | 90m |
| 12-A-2 | sample 이미지 5장을 `public/seed/sprint12/` 에 준비 후 `scripts/upload-seed-images.mjs` 로 S3 업로드 (kkaebizigi.com 태그 포함) | 업로드 스크립트 + CDN URL 5개 | 45m |
| 12-A-3 | Lighthouse mobile + desktop 5회 측정 baseline (`/`, `/post/[id]`, `/post`, `/me`, `/chat`) → `docs/sprint/12-sprint-perf/reports/baseline.md` | 측정 결과 markdown + 10개 json/html | 60m |
| 12-A-4 | bundle analyzer (`@next/bundle-analyzer`) 1회 실행 → `reports/bundle-baseline.html` | 번들 분석 HTML | 30m |
| 12-A-5 | F12-A commit + PR + squash merge | PR | 15m |

**Phase A 완료 조건**: 5개 페이지 × mobile/desktop = 10개 lighthouse json 보존 + 시드 post 5개가 staging Firestore 에 존재.

---

## 3. Feature F12-B — Font + 3rd-party Scripts Diet

**목표**: Pretendard variable font weight 좁히기 + AdSense/GA/Sentry/Speed Insights 로드 전략 재정비.

| Task ID | 제목 | 산출물 | 예상 시간 |
|---|---|---|---|
| 12-B-1 | Pretendard font weight subset → `'400 700'` (기존 `'45 920'`) + `display: 'swap'` 유지 + fallback fontFace 검증 | `app/layout.tsx` + 시각 검증 | 45m |
| 12-B-2 | AdSense `<Script>` → `strategy="lazyOnload"` + first-paint 후 mount 가드 (IntersectionObserver) | `components/feature/adsense-script.tsx` | 60m |
| 12-B-3 | Sentry client SDK 동적 import — `if (window.requestIdleCallback) requestIdleCallback(() => import('./sentry'))` | `sentry.client.config.ts` 분리 + lazy init | 90m |
| 12-B-4 | Vercel Speed Insights — `<Script strategy="lazyOnload">` 또는 production-only mount | `app/layout.tsx` | 30m |
| 12-B-5 | GA/GTM — production-only mount + `strategy="afterInteractive"` 명시 + dev/staging 비활성 | `components/analytics-bootstrap.tsx` | 45m |
| 12-B-6 | 측정 재실행 (5개 page × mobile/desktop) → `reports/after-b.md` | json/html + diff 표 | 60m |
| 12-B-7 | F12-B commit + PR + squash merge | PR | 15m |

**Phase B 완료 조건**: mobile LCP 감소 측정값 baseline 대비 -30% 이상 OR 절대값 < 8s.

---

## 4. Feature F12-C — Bundle Splitting + Dynamic Import

**목표**: Unused JS 680ms 해소 — heavy client component 의 dynamic import 분리.

| Task ID | 제목 | 산출물 | 예상 시간 |
|---|---|---|---|
| 12-C-1 | Bundle analyzer 결과로 large client component top 5 식별 (markdown editor, lightbox, simulator, chat-widget-loader, ads) | `reports/heavy-modules.md` | 30m |
| 12-C-2 | `dynamic(() => import('...'), { ssr: false })` 적용 — chat-widget-loader (이미 로드 시점이 mount 후) | `components/feature/chat-widget-loader.tsx` | 45m |
| 12-C-3 | post markdown editor (`/post/new`) — `dynamic` + SSR off | `components/feature/post-form.tsx` | 60m |
| 12-C-4 | Lightbox provider — IntersectionObserver 트리거 후 로드 | `components/feature/lightbox-provider.tsx` | 60m |
| 12-C-5 | Simulator 등 perf-heavy route — route group 분리 + segment-level loading.tsx | `app/simulator/loading.tsx` | 45m |
| 12-C-6 | 측정 재실행 → `reports/after-c.md` | 측정 비교 | 60m |
| 12-C-7 | F12-C commit + PR + squash merge | PR | 15m |

**Phase C 완료 조건**: Lighthouse `unused-javascript` opportunity < 300ms.

---

## 5. Feature F12-D — SEO 전환 안전망

**목표**: `NEXT_PUBLIC_ROBOTS_INDEX=true` 단일 환경변수로 production indexing 활성화 + 활성화 즉시 90+ 도달 보장.

| Task ID | 제목 | 산출물 | 예상 시간 |
|---|---|---|---|
| 12-D-1 | `lib/seo/robots-config.ts` 신규 — env 토글 기반 robots config 생성 | 모듈 + 단위 테스트 | 45m |
| 12-D-2 | `app/layout.tsx`, `app/page.tsx`, 그 외 robots 명시된 page 일괄 토글 적용 | 6개 page 일괄 수정 | 60m |
| 12-D-3 | JSON-LD structured data — 홈에 `WebSite` + `BreadcrumbList` 주입 | `components/feature/structured-data.tsx` 신규 + `app/layout.tsx` | 60m |
| 12-D-4 | `/post/[id]` 에 `Article` schema 주입 (author + datePublished + image + headline) | `app/post/[id]/page.tsx` | 45m |
| 12-D-5 | `app/sitemap.ts` 검증 — post slug 동적 포함 (현재 사이트맵 정적) | sitemap 코드 + 결과 검증 | 60m |
| 12-D-6 | canonical URL 정합성 검토 — 동적 page 의 alternates.canonical 일관 | 5개 page 점검 | 30m |
| 12-D-7 | OG image 검증 — `app/opengraph-image.tsx` + post 별 OG (현재 default 만) | 측정 + 필요 시 동적 OG 생성 | 60m |
| 12-D-8 | Rich Results Test (Google) 수동 검증 (3 URL: 홈/post/category) | 결과 스크린샷 보고서 | 30m |
| 12-D-9 | F12-D commit + PR + squash merge | PR | 15m |

**Phase D 완료 조건**: staging 에서 `NEXT_PUBLIC_ROBOTS_INDEX=true` toggle 후 mobile Lighthouse SEO >= 90.

---

## 6. Feature F12-E — Lighthouse CI Workflow

**목표**: 모든 PR 에서 `staging`/`preview` deploy 후 자동 Lighthouse 측정 + 임계값 미달 시 fail.

| Task ID | 제목 | 산출물 | 예상 시간 |
|---|---|---|---|
| 12-E-1 | `.github/workflows/lighthouse.yml` 신규 — Vercel preview deploy 완료 webhook 후 측정 | workflow YAML | 90m |
| 12-E-2 | `scripts/lighthouse-ci.sh` 수정 — `--ci` flag 추가 (json only + 임계값 enforcement) | 스크립트 | 45m |
| 12-E-3 | 임계값 정책 파일 `.lighthouse-budget.json` — page 별 perf 80+ / a11y 90+ / bp 90+ | JSON | 30m |
| 12-E-4 | GitHub PR comment 봇 — lighthouse 결과를 PR comment 로 게시 (action `treosh/lighthouse-ci-action`) | workflow 통합 | 60m |
| 12-E-5 | F12-E commit + PR + squash merge | PR | 15m |

**Phase E 완료 조건**: 본 sprint PR (#19~#23) 모두 lighthouse workflow 통과 + 결과가 PR comment 에 자동 게시.

---

## 7. 의존 그래프

```
F12-A (baseline + 시드)
   │
   ├──> F12-B (font + scripts)
   │       │
   │       └──> F12-C (bundle splitting)
   │               │
   │               └──> F12-E (CI gate)
   │
   └──> F12-D (SEO 전환 안전망 — 독립)
```

F12-B/C/D 는 F12-A 완료 후 부분적으로 병렬 가능.

---

## 8. 예상 일정

| 일자 | 작업 |
|---|---|
| Day 1 (오전) | F12-A 전체 (baseline + 시드) |
| Day 1 (오후) | F12-B-1, B-2 |
| Day 2 (오전) | F12-B-3, B-4, B-5 + 측정 |
| Day 2 (오후) | F12-C-1, C-2, C-3 |
| Day 3 (오전) | F12-C-4, C-5 + 측정 |
| Day 3 (오후) | F12-D 전체 |
| Day 4 (오전) | F12-E 전체 |
| Day 4 (오후) | Iterate (matchRate 90+ 도달) + QA + Report + Archive |

---

## 9. Trust Level 조정

- 본 Sprint Trust L3 — Plan/Design/Do/Iterate/QA/Report 자동
- **Archive 직전 사용자 승인 게이트** (ENH-298)
- Phase D-1 (`robots-config` 토글) 같이 **외부 영향 가능 변경**은 commit 메시지에 명시 + PR review 차단 라벨
