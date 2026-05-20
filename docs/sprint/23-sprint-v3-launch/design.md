# Sprint 23 Design — V3 Launch

> Sprint 23 features 구현 표준.

---

## 1. F23-A — V2 UI 마무리

### 1.1 NicknameChangeForm /me 통합

```typescript
// lib/auth/cooldown.ts (신규)
import { NICKNAME_COOLDOWN_MS } from './change-nickname';

export function calcNicknameCooldownRemainingMs(
  lastChangedAtMs: number | undefined,
): number {
  if (!lastChangedAtMs || lastChangedAtMs <= 0) return 0;
  const elapsed = Date.now() - lastChangedAtMs;
  return Math.max(0, NICKNAME_COOLDOWN_MS - elapsed);
}
```

### 1.2 /me 페이지 변경
```tsx
import { NicknameChangeForm } from '@/components/feature/nickname-change-form';
import { calcNicknameCooldownRemainingMs } from '@/lib/auth/cooldown';

// userDoc.nicknameChangedAtMs → cooldown 계산
const cooldownMs = calcNicknameCooldownRemainingMs(userDoc.nicknameChangedAtMs);

// 새 섹션 추가
<section aria-labelledby="my-nickname" className="mt-6">
  <h2 id="my-nickname" className="sr-only">닉네임 변경</h2>
  <NicknameChangeForm currentNickname={nickname} cooldownRemainingMs={cooldownMs} />
</section>
```

### 1.3 F3.5 owned 진령 source
```tsx
// app/simulator/page.tsx
const session = await auth();
const ownedJinryeong = await getUserOwnedJinryeong(session?.user?.id);
const recommendation = recommendBuilds({
  ownedJinryeong,
  ...(session?.user?.classId ? { classId: session.user.classId } : {}),
});
```

```typescript
// lib/auth/user-owned.ts (신규)
export async function getUserOwnedJinryeong(uid?: string): Promise<readonly WikiJinryeongId[]> {
  if (!uid || !hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('users').doc(uid).get();
    const data = snap.data() as { ownedJinryeong?: readonly WikiJinryeongId[] } | undefined;
    return data?.ownedJinryeong ?? [];
  } catch {
    return [];
  }
}
```

---

## 2. F23-B — Sentry 통합

### 2.1 패키지 설치 + 환경변수
```bash
pnpm add @sentry/nextjs
```
- `SENTRY_DSN` (tene secret)
- `SENTRY_AUTH_TOKEN` (build 시 source map upload, tene)

### 2.2 instrumentation.ts (Next.js 16)
```typescript
// instrumentation.ts (root)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
```

### 2.3 sentry.client.config.ts
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% transactions
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0, // 100% on error
  enabled: process.env.NODE_ENV === 'production',
});
```

### 2.4 SLO 정책 (docs/05-policy/slo-policy.md)
- p95 latency < 1500ms
- 5xx error rate < 0.5%
- Error budget: 99.5% availability / month
- 알람 임계값: 5xx > 1% over 5min → Sentry alert

### 2.5 인스트루먼트 우선순위
- Server Action — 명시적 try/catch + Sentry.captureException
- Server Component — Next.js auto-instrumentation
- Client error boundary — sentry/react ErrorBoundary

---

## 3. F23-C — SEO 강화

### 3.1 metadata 강화 패턴
```typescript
// app/jinryeong/page.tsx
export const metadata: Metadata = {
  title: '진령 11종 가이드',
  description: '갓깨비 키우기의 진령 11종 등급 · 시너지 · 직업별 추천 빌드.',
  keywords: ['갓깨비 진령', '진령 시너지', '진령 빌드', '...'],
  openGraph: {
    title: '진령 — 등급보다 시너지',
    description: '...',
    images: [{ url: 'https://kkaebizigi.com/og/jinryeong.png' }],
  },
  twitter: { card: 'summary_large_image' },
};
```

### 3.2 JSON-LD 추가 (structured-data.tsx 확장)
- 진령 페이지: `Article` schema
- 시뮬레이터: `WebApplication` schema
- 게시물: `BlogPosting` schema

### 3.3 sitemap.xml
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: 'https://kkaebizigi.com/', priority: 1.0 },
    { url: 'https://kkaebizigi.com/jinryeong', priority: 0.9 },
    // ...
  ];
}
```

### 3.4 robots.txt
- Production: Allow /
- Staging: Disallow / (이미 robots config 에 있음)

---

## 4. F23-D — feature RTL 패턴

Sprint 19-22 동일 (jsdom + cleanup + vi.mock).

8+ 신규 파일.

---

## 5. F23-E — Coverage 70%+

### Scope
- lib/auth/ 잔여 + lib/storage/ 잔여 + lib/personalization/ 잔여
- lib/nlp/aggregate.ts (server-only) — basic smoke
- lib/insights/jinryeong-rate.ts aggregate logic 확장

추정 +4 pt.

---

## 6. F23-F — CI 결과 분석

`reports/ci-e2e-analysis.md` / `lighthouse-analysis.md` / `visual-baseline-status.md`.

---

## 7. Chrome QA — V3 첫 검증

### 7.1 페이지
Sprint 21-22 의 8 unique + 신규:
- /admin/* (운영자 페이지 익명 redirect 검증)
- /sitemap.xml (200 status)
- /robots.txt (200 status)

### 7.2 새 기능 검증
- /me 페이지의 NicknameChangeForm 렌더링 + UI 인터랙션
- /simulator 의 RecommendationCard 가 로그인 사용자 owned source 사용
- Sentry — 의도적 console error → Sentry dashboard 캡처 확인 (Sprint 24 carry)

---

## 8. 공통 규칙

- typecheck / lint / vitest 0 fail
- file-based commit message
- branch: `feature/sprint-23-{a~f}-{slug}`
- merge: squash --admin
- 회귀 보호 10 sprint 연속 유지
