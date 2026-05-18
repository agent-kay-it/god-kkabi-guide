# Sprint 12 — Design (Perf 진단 + 구현 사양)

**Sprint ID**: `12-sprint-perf`
**상위 문서**: `prd.md`, `plan.md`
**작성일**: 2026-05-18

---

## 1. Perf Diagnosis Matrix

### 1.1 Lighthouse Mobile 분석 결과 (Sprint 11 baseline)

| Metric | Score | Weight | Value | 영향 비중 |
|---|:--:|:--:|---|:--:|
| FCP | 0.97 | 10 | 1.4s | low |
| LCP | **0.00** | **25** | **16.0s** | **HIGH** |
| TBT | 1.00 | 30 | 10ms | none |
| CLS | 1.00 | 25 | 0 | none |
| Speed Index | 0.98 | 10 | 2.3s | low |

→ **LCP (weight 25 × score 0) = 25 point loss**. 단일 항목이 perf 점수 25점을 깎고 있음. LCP 만 해결하면 75 → 95+ 가능.

### 1.2 LCP element 식별 실패의 의미

`audits['largest-contentful-paint-element'].details.items === undefined` 의 원인 후보:

| 원인 후보 | 검증 방법 | 확률 |
|---|---|:--:|
| Hero `<Image>` 자체가 16s 이내 paint 못함 | DevTools Performance trace | M |
| CSP/CSP-violation 으로 image 차단 (간접 LCP 차단) | console-error audit 확인 | L |
| layout.tsx 의 다중 `<Script>` 가 main thread 차단 | TBT 10ms 이므로 차단은 아님 | L |
| Critical CSS 평가 지연 + FOIT | font-display swap 적용됨 — 가능성 낮음 | L |
| Pretendard Variable woff2 (~800KB) 가 preload 후 첫 paint 직전 점유 | network waterfall 분석 | **H** |
| AdSense `<Script>` 초기 fetch 가 image fetch 와 경합 (HTTP/2 multiplex 우선순위) | network priority 분석 | **H** |

### 1.3 Action Matrix

| 변경 | 예상 LCP 절감 | risk | 복원 비용 |
|---|---:|:--:|:--:|
| Pretendard weight `'45 920'` → `'400 700'` (subset) | -800~1500ms (font payload 50%↓) | L | revert 5min |
| AdSense → `lazyOnload` + IO mount | -400~800ms (script defer) | M (매출 영향) | revert 10min |
| Sentry SDK 동적 import (`requestIdleCallback`) | -200~500ms (client bundle) | M (error 누락 가능) | revert 30min |
| Speed Insights → production-only | -100~200ms | L | revert 5min |
| GA → production-only + afterInteractive | -100~300ms | L | revert 5min |
| chat-widget-loader dynamic | -100~200ms | L | revert 20min |
| post markdown editor dynamic (`/post/new` only) | -200~500ms | L | revert 30min |
| lightbox-provider dynamic | -100~200ms | L | revert 30min |

**예상 누적 절감**: 2-4초 (= LCP 16s → 12~14s, 추가 작업 필요).

### 1.4 LCP 16s 가 12-14s 까지만 절감되면?

→ DoD-1 (`< 4s`) 미달. 추가 조치:

| 추가 조치 | 절감 예상 |
|---|:--:|
| `app/page.tsx` Hero `<Image>` priority + `fetchPriority="high"` + `loading="eager"` 명시 | -1~2s |
| Hero 이미지를 next/image avif 우선 + width 1200 → 600 (모바일) | -2~4s |
| HeroBackdrop 의 `<div>` background-image → CSS `image-set()` + AVIF | -1~2s |
| Critical above-the-fold CSS inline (이미 inline 됨 — 검증만) | 0~1s |
| Route segment loading.tsx → suspense streaming | -1~2s (perceived) |

→ 위 조합 + Phase B/C 누적 = mobile LCP 4~6s 목표 가능. **반복 사이클 (E)에서 ≤ 4s 도달 시까지 iterate**.

---

## 2. 구현 사양 — Phase D 액션별

### 2.1 F12-B-1 — Pretendard font weight subset

```ts
// app/layout.tsx (수정)
const pretendard = localFont({
  src: [
    {
      path: '../public/fonts/PretendardVariable.woff2',
      weight: '400 700', // ← '45 920' 에서 좁힘
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-pretendard',
  preload: true,
  fallback: ['Pretendard', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
});
```

**검증 시나리오**:
1. 모바일 Chrome 시각 점검 — 한글 본문 + heading + button 가독성
2. `font-weight: 800` 사용 위치 grep → 없음 확인 (현재 `font-bold` = 700)
3. Dynamic weight (`font-medium` = 500) — fallback 으로 자동 보간

### 2.2 F12-B-2 — AdSense lazyOnload + IO mount

```tsx
// components/feature/adsense-script.tsx (수정)
'use client';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export function AdSenseScript(): React.JSX.Element | null {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    // First viewport interaction OR 2s 후 mount
    const idleCallback = (window as any).requestIdleCallback ?? setTimeout;
    const handle = idleCallback(() => setShouldMount(true), 2000);
    return () => {
      const cancel = (window as any).cancelIdleCallback ?? clearTimeout;
      cancel(handle);
    };
  }, []);

  if (!shouldMount) return null;
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <Script
      strategy="lazyOnload"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=..."
      crossOrigin="anonymous"
    />
  );
}
```

### 2.3 F12-B-3 — Sentry SDK 동적 import

```ts
// sentry.client.config.ts (분리)
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const idle = (window as any).requestIdleCallback ?? setTimeout;
  idle(() => {
    import('./sentry.client.init').then((m) => m.initSentry());
  }, 3000);
}
```

```ts
// sentry.client.init.ts (신규)
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}
```

**리스크 완화**: 첫 3s 동안 발생하는 client error 는 capture 안됨. ErrorBoundary 에서 `window.__pendingErrors` 큐 관리 후 init 시 flush.

### 2.4 F12-C — Dynamic import 패턴

```tsx
// components/feature/chat-widget-loader.tsx (수정)
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('./chat-widget'), {
  ssr: false,
  loading: () => null,
});

export { ChatWidget as ChatWidgetLoader };
```

```tsx
// app/post/new/page.tsx (수정)
import dynamic from 'next/dynamic';

const PostForm = dynamic(() => import('@/components/feature/post-form').then(m => m.PostForm), {
  ssr: false,
  loading: () => <PostFormSkeleton />,
});
```

### 2.5 F12-D-1 — `lib/seo/robots-config.ts`

```ts
// lib/seo/robots-config.ts (신규)
import type { Metadata } from 'next';

const INDEX_ENABLED = process.env.NEXT_PUBLIC_ROBOTS_INDEX === 'true';

export const robotsConfig: NonNullable<Metadata['robots']> = INDEX_ENABLED
  ? { index: true, follow: true }
  : { index: false, follow: false };

export const isProductionIndexing = INDEX_ENABLED;
```

```ts
// app/layout.tsx (수정)
import { robotsConfig } from '@/lib/seo/robots-config';

export const metadata: Metadata = {
  // ...
  robots: robotsConfig,
};
```

### 2.6 F12-D-3 — Structured Data

```tsx
// components/feature/structured-data.tsx (신규)
export function WebsiteStructuredData({ url }: { url: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '갓깨비 키우기 비공식 팬 가이드',
    url,
    inLanguage: 'ko-KR',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ArticleStructuredData({ post, url }: { post: Post; url: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.imageUrls?.[0] ?? undefined,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author.name },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

### 2.7 F12-E — Lighthouse CI workflow

```yaml
# .github/workflows/lighthouse.yml (신규)
name: Lighthouse CI

on:
  pull_request:
    types: [opened, synchronize]
  workflow_dispatch:

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - name: Wait for Vercel Preview
        uses: patrickedqvist/wait-for-vercel-preview@v1
        id: vercel
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            ${{ steps.vercel.outputs.url }}
            ${{ steps.vercel.outputs.url }}/post
            ${{ steps.vercel.outputs.url }}/chat
          budgetPath: ./.lighthouse-budget.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

```json
// .lighthouse-budget.json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "script", "budget": 400 },
      { "resourceType": "total", "budget": 1500 }
    ],
    "timings": [
      { "metric": "interactive", "budget": 5000 },
      { "metric": "first-contentful-paint", "budget": 2000 }
    ]
  }
]
```

---

## 3. 검증 사양

### 3.1 Lighthouse 측정 프로토콜 (5회 평균)

```bash
for i in 1 2 3 4 5; do
  npx lighthouse@13.3.0 https://staging.kkaebizigi.com/ \
    --output=json \
    --output-path=./docs/sprint/12-sprint-perf/reports/run-$i.json \
    --chrome-flags="--headless=new" \
    --quiet
done

node scripts/lighthouse-average.mjs ./docs/sprint/12-sprint-perf/reports/run-*.json
```

### 3.2 회귀 가드 (S2 codeQuality)

| 체크 | 명령 | 합격선 |
|---|---|:--:|
| typecheck | `pnpm typecheck` | 0 err |
| lint | `pnpm lint` | 0 err |
| vitest | `pnpm vitest run` | 226+ passed |
| next build | `pnpm next build` | success |

### 3.3 시각 회귀 (manual via Chrome MCP)

Sprint 12 는 perf-only 이므로 UI 시각 변경 금지. 변경 후 5개 page 모바일 스크린샷 + 기존 스크린샷 비교:

1. `/` (Hero, TOC, Overview)
2. `/post` (list)
3. `/post/[id]` (시드 post)
4. `/me` (profile card)
5. `/chat` (channel sidebar)

---

## 4. Rollback 계획

| Phase | Rollback 트리거 | 조치 |
|---|---|---|
| B-1 (font) | 한글 weight 깨짐 | weight `'45 920'` 복원 PR |
| B-2 (AdSense) | 매출 추적 누락 | `strategy="afterInteractive"` 복원 |
| B-3 (Sentry) | client error 누락 다수 | 동기 init 복원 + sample rate 0.05 |
| C (dynamic) | hydration 깨짐 | 해당 컴포넌트만 `ssr: true` 복원 |
| D (robots) | `NEXT_PUBLIC_ROBOTS_INDEX=true` 후 색인 실패 | 환경변수 false 로 즉시 복원 |
| E (CI) | 모든 PR 가 fail | budget 임계값 50/60/70/80 점진 강화 |

---

## 5. 결정 기록

- **ADR-12.2**: Sentry sample rate 0.1 (production) — DAU < 1000 단계에서 충분, prod 비용 절감
- **ADR-12.3**: AdSense lazy 로드 — 현재 매출 0원이므로 perf 우선
- **ADR-12.4**: robots:index 토글은 별도 PR (Sprint 14 prod cutover 와 동시 활성화) — Sprint 12 에서는 토글 구조만 준비
