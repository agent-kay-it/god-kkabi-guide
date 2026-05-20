# Sprint 25 Design

## 1. Coverage 70%+

### 1.1 lib/firebase/admin.ts
- hasAdminCredentials / getAdminFirestore / getAdminDatabase / getAdminAuth
- env 검증 + lazy init mock

### 1.2 lib/auth/auth.ts
- NextAuth handlers 의 wrapping 부분 (smoke 만)

### 1.3 lib/sentry/config.ts
- 기존 sentry config (이미 90.16%)
- 잔여 line 처리

## 2. feature RTL 15+ (6+ 신규)

Sprint 19/20/21 패턴 동일 (jsdom + cleanup + vi.mock).

## 3. Metadata 강화

```typescript
export const metadata: Metadata = {
  title: '진령 11종 가이드 — 등급보다 시너지',
  description: '갓깨비 키우기의 진령 11종 등급 · 시너지 · 직업별 추천 빌드.',
  keywords: ['갓깨비 진령', '진령 시너지', '진령 빌드'],
  openGraph: {
    title: '진령 — 등급보다 시너지',
    description: '...',
    images: [{ url: '/og/jinryeong.png', width: 1200, height: 630 }],
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/jinryeong' },
};
```

## 4. structured data 확대

```typescript
// components/feature/structured-data.tsx 확장
export function ItemListStructuredData({ items, name }: {...}): React.JSX.Element;
export function WebApplicationStructuredData({ name, url, description }: {...}): React.JSX.Element;
```

승인자: kay@agentkay.it
