# Sprint 16 — Design

> 8 PR 의 기술 구현 가이드.

---

## 1. F16-A — lib/ unit test part 1

### 1.1 lib/sentry/config.ts

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getSentryConfig } from './config';

describe('getSentryConfig', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  it('DSN 미설정 시 enabled=false', () => {
    expect(getSentryConfig().enabled).toBe(false);
  });
  it('DSN 설정 시 enabled=true', () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://x@sentry.io/1';
    expect(getSentryConfig().enabled).toBe(true);
  });
});
```

### 1.2 lib/reaction/actions.ts (pure 부분)
- toggle 로직만 분리하여 테스트 (Firestore call 은 mock)

### 1.3 lib/simulator/synergy-matrix.ts
- 입력: 직업 + 진령 조합
- 출력: 시너지 점수 (deterministic)

### 1.4 lib/subscription/guards.ts
- canAccessPremiumFeature(user) — boolean

### 1.5 lib/search/site-search-index.ts
- 정적 데이터 → 검색 index 변환 logic

---

## 2. F16-B — lib/ unit test part 2

### 2.1 우선순위 모듈
- lib/wiki/build-tag.ts
- lib/storage/types.ts (constants)
- lib/auth/auth.ts (의 testable config)
- lib/chat 의 추가 validator
- lib/post 의 추가 helper

---

## 3. F16-C — escapeJsonLd refactor

```typescript
// components/feature/structured-data.tsx
// 기존 local function 제거
import { escapeJsonLd } from '@/lib/seo/json-ld';
```

회귀 spec:
- 기존 component output 의 escape 동작이 동일한지 snapshot 또는 unit test
- 향후 lib/seo/json-ld.ts 의 9 unit test 가 회귀 보호

---

## 4. F16-D — Lighthouse / a11y warn fix

### 4.1 best-practices warn 예측 (Lighthouse 일반)
- `target="_blank"` 시 `rel="noopener noreferrer"` (XSS 방어)
- `<meta name="theme-color" content="#xxx">` 추가
- HTTPS 강제 — Next.js 가 처리 (영향 0)
- console.error 사용 정상화

### 4.2 a11y 추가 fix
- color-contrast: text-text-mute 가 background 대비 4.5:1 이상 확인
- landmark-one-main: `<main>` 단일성 확인
- heading-order: h1 → h2 → h3 순서

---

## 5. F16-E — Visual baseline workflow

### 5.1 baseline 자동 생성 정책
```yaml
# .github/workflows/visual-baseline-update.yml
on:
  workflow_dispatch:
    inputs:
      reason: { required: true, type: string }

jobs:
  capture:
    steps:
      - run: pnpm playwright test e2e/tests/visual --update-snapshots
      - run: |
          git checkout -b chore/visual-rebaseline-$(date +%s)
          git add e2e/visual/snapshots/
          git commit -m "chore(visual): rebaseline — ${{ inputs.reason }}"
          gh pr create --title "chore(visual): rebaseline" --body "..."
```

### 5.2 README 갱신
- 첫 baseline 생성 절차 (한 번만 수동)
- rebaseline trigger (의도된 UI 변경 후)
- diff > 1% PR fail 시 대응

---

## 6. F16-F — i18n PoC

### 6.1 next-intl 도입

```bash
pnpm add next-intl
```

### 6.2 메시지 파일

```json
// i18n/messages/ko.json
{
  "terms": {
    "title": "이용약관",
    "lastUpdated": "최종 갱신: {date}"
  }
}
```

### 6.3 PoC page

```typescript
// app/terms/page.tsx (PoC만)
import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('terms');
  return <h1>{t('title')}</h1>;
}
```

### 6.4 LocaleProvider

```typescript
// components/i18n-provider.tsx
'use client';
import { NextIntlClientProvider } from 'next-intl';
```

본 PoC 는 단일 page 만 — 전체 라우팅 변경은 Sprint 17+ 결정.

---

## 7. F16-G — S3 cutover checklist

체크리스트 내용:
1. emulator vs S3 환경 변수 검증
2. presigned URL TTL (5분) staging 적용
3. CORS 정책 (origin: https://staging.kkaebizigi.com)
4. CloudFront cache invalidation 명령
5. rollback 절차 (Sprint 11 의 S3 백업 활용)

---

## 8. F16-H — selector tuning

### 8.1 wait-helpers 적용 audit

각 spec 의 `loginAs(page, role)` 직후:
```typescript
import { waitForUserLoaded } from '../../fixtures/wait-helpers';

await loginAs(page, 'regular');
await waitForUserLoaded(page);  // 신규 적용
await page.goto('/me');
```

### 8.2 단계적 적용
- F14-B (Auth specs 8건) 우선
- 점진적으로 다른 spec 으로 확대 — Sprint 17+

---

## 9. Coverage 강화 전략

| Sprint | Lines coverage | Strategy |
|---|--:|---|
| 14 | 0% | 측정 없음 |
| 15 | 12.79% | baseline 설정 |
| 16 (목표) | 35%+ | high-value 모듈 10+ test 추가 |
| 17 (목표) | 50%+ | 잔여 lib/ + components/ 일부 |
| 18 (목표) | 70%+ | 전체 lib/ + critical components |

---

## 10. Risk Mitigation

| Risk | 대응 위치 |
|---|---|
| coverage 35% 미달 | F16-A + F16-B 의 우선순위 모듈 |
| Lighthouse fix 의 perf 회귀 | 각 fix 마다 vercel-build |
| next-intl PoC 의 SSR 충돌 | 단일 page (/terms) 만 |
| visual capture 의 stabilize 실패 | F15-C 의 5 가지 강화 활용 |
| S3 cutover 영향 | 체크리스트만, 실 cutover 별도 |
