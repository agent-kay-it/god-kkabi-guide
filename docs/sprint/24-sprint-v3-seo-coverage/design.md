# Sprint 24 Design

## 1. F24-A — SEO sitemap.ts

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kkaebizigi.com';

const STATIC_PATHS = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
  { path: '/post', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/jinryeong', priority: 0.9, changeFrequency: 'weekly' as const },
  // ... 25 paths
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    priority,
    changeFrequency,
  }));
}
```

## 2. F24-A — robots.txt

```typescript
// app/robots.ts (이미 있으면 강화)
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NEXT_PUBLIC_SITE_URL?.includes('kkaebizigi.com')
    && !process.env.NEXT_PUBLIC_SITE_URL?.includes('staging');
  return {
    rules: isProduction
      ? [{ userAgent: '*', allow: '/' }]
      : [{ userAgent: '*', disallow: '/' }], // staging 검색 인덱싱 차단
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

## 3. F24-B — Coverage

대상 모듈 우선순위:
1. lib/firebase/admin.ts (smoke + env 검증)
2. lib/auth/auth.ts (helpers)
3. lib/insights/jinryeong-rate.ts (aggregation 잔여)
4. lib/storage helper

추정 +3 pt.

## 4. F24-C — feature RTL 8+ 신규

Sprint 19/20/21 패턴 동일.

## 5. F24-D — Sentry config (실 통합은 Sprint 25)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});

// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
});

// instrumentation.ts (root)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
```

SENTRY_DSN 은 tene env 로 등록 (사용자 작업).
