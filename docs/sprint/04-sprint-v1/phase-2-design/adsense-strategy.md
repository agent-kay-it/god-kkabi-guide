# AdSense Strategy V1

> **Sprint V1** — Google AdSense 통합 전략 + GDPR/PIPA 동의 + 정책 가드

---

## 1. 광고 단위 배치

| 슬롯 | 위치 | 사이즈 | 노출 페이지 |
|---|---|---|---|
| **Sticky 하단** | 모든 페이지 하단 고정 (z-index 40) | 320×50 (mobile) / 728×90 (desktop) | `/`, `/post`, `/post/[id]`, `/me/*` |
| **인피드** | 게시물 리스트 5번째 슬롯 | 반응형 (네이티브) | `/post` only |

**광고 금지 페이지**:
- 위키 페이지 (`/class`, `/jinryeong`, `/skill`, ...) — UX + 데이터 노이즈 차단
- 채팅 위젯 내부 — UX
- 로그인/등록 폼 — 전환율 보호
- 운영자 콘솔 (`/admin/*`) — admin 본인 클릭 차단

---

## 2. 동의 게이트 (GDPR + PIPA)

### 2.1 PIPA 5번째 동의 항목

기존 4 동의 (age14plus / chatPublic / unofficial / operator24h) + V1 추가:
- **`advertising`** (선택, 미동의 시 광고 미노출)

### 2.2 동의 흐름

**신규 사용자**:
- 등록 폼 (P3.D `register-form.tsx`)에서 PIPA 5번째 추가
- 기본값 `true` (사용자가 명시적 해제 가능)

**기존 v2 사용자**:
- 첫 로그인 시 `/me/consent` 모달 (1회) — advertising 추가 동의 입력
- 미동의 시 `users.consent.advertising = false` → 광고 차단

### 2.3 GDPR 준수 (EU 사용자 대비, 한국 메인이라도 안전)

- consent storage signal (TCF v2) — V1.5 검토 (한국 메인은 PIPA로 충분)
- non-personalized ads fallback (사용자 미동의 시):
  ```html
  <script>
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = 1;
  </script>
  ```

---

## 3. AdSense 스크립트 정책 가드

### 3.1 노출 조건 (4 조건 AND)

```ts
function shouldShowAds(session: Session | null): boolean {
  // 1. 운영 환경만
  if (process.env.NODE_ENV !== 'production') return false;
  // 2. AdSense publisher ID env 설정됨
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER) return false;
  // 3. admin 본인 클릭 차단
  if (session?.user?.role === 'admin') return false;
  // 4. 사용자 동의
  if (!session?.user?.consent?.advertising) return false;
  return true;
}
```

### 3.2 dev 환경 가드

- `NODE_ENV !== 'production'` 시 컴포넌트 자체 `return null`
- Vercel preview 환경은 production이지만 도메인 다름 — `NEXT_PUBLIC_VERCEL_ENV === 'production'`도 체크 가능 (V1 후속)

### 3.3 admin 본인 클릭 차단

- AdSense 정책 위반 (본인 클릭 영구 정지)
- 1인 운영이라 critical
- `role === 'admin'` 사용자 (kay@agentkay.it 1명)에게 광고 컴포넌트 자체 미렌더

---

## 4. ads.txt

도메인 루트에 `public/ads.txt` 게시:
```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Next.js: `public/ads.txt` 정적 파일로 자동 서빙.

---

## 5. 컴포넌트 구조

### 5.1 `components/feature/adsense-script.tsx` (스크립트 로더)

```tsx
'use client';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export function AdSenseScript({ publisher, consent }: { publisher: string; consent: boolean }) {
  const [loaded, setLoaded] = useState(false);
  if (process.env.NODE_ENV !== 'production') return null;
  if (!consent) return null;
  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      onLoad={() => setLoaded(true)}
    />
  );
}
```

### 5.2 `components/feature/ad-slot-sticky.tsx`

```tsx
'use client';
export function AdSlotSticky({ slot }: { slot: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-ink-elev/95 backdrop-blur-md border-t border-ink-line">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '320px', height: '50px' }}  // mobile
        data-ad-client={publisher}
        data-ad-slot={slot}
        data-ad-format="auto"
      />
    </div>
  );
}
```

### 5.3 `components/feature/ad-slot-infeed.tsx`

```tsx
'use client';
export function AdSlotInfeed({ slot }: { slot: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-ink-line bg-ink-card-strong">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisher}
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
      />
    </div>
  );
}
```

### 5.4 layout.tsx 통합

```tsx
// app/layout.tsx
const adsenseConfig = {
  publisher: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER,
  slotSticky: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STICKY,
  slotInfeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED,
};
const adsConsent = session?.user?.consent?.advertising ?? false;
const showAds = shouldShowAds(session);

<body>
  {showAds && adsenseConfig.publisher ? (
    <AdSenseScript publisher={adsenseConfig.publisher} consent={adsConsent} />
  ) : null}
  {children}
  {showAds && adsenseConfig.slotSticky && !isAdminPath ? (
    <AdSlotSticky slot={adsenseConfig.slotSticky} />
  ) : null}
</body>
```

`isAdminPath = pathname.startsWith('/admin')` — middleware.ts 또는 proxy.ts에서 헤더 전달.

---

## 6. M11 Quality Gate

- ✓ PIPA 5번째 동의 항목 도입
- ✓ 미동의 시 광고 미노출
- ✓ dev 환경 미노출
- ✓ admin role 미노출
- ✓ ads.txt 게시
- ✓ AdSense 정책 검토 통과 (운영자 게이트)
- ✓ non-personalized fallback

---

## 7. 운영자 게이트 (P3.D)

1. AdSense 가입 (https://www.google.com/adsense/)
2. 사이트 등록 (도메인 G4 결정 후)
3. ads.txt 게시 (`public/ads.txt`)
4. 검토 대기 (~14일)
5. 광고 단위 발급 (Sticky + Infeed 2건)
6. Vercel env 추가:
   - `NEXT_PUBLIC_ADSENSE_PUBLISHER=pub-XXXXXXXXXXXXXXXX`
   - `NEXT_PUBLIC_ADSENSE_SLOT_STICKY=XXXXXXXXXX`
   - `NEXT_PUBLIC_ADSENSE_SLOT_INFEED=XXXXXXXXXX`

---

## 8. CSP 갱신

`next.config.ts`의 CSP 헤더에 추가:
```diff
- "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com"
+ "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net"

- "img-src 'self' https://play-lh.googleusercontent.com https://is1-ssl.mzstatic.com https://firebasestorage.googleapis.com data: blob:"
+ "img-src 'self' https://play-lh.googleusercontent.com https://is1-ssl.mzstatic.com https://firebasestorage.googleapis.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net data: blob:"

+ "frame-src 'self' https://googleads.g.doubleclick.net"
```

`frame-src 'none'` → `'self'` 변경 또는 google ads 도메인 화이트리스트.

---

## 9. 결정

- AdSense는 1인 운영비 회수 목적이므로 침입적이지 않게 (Sticky + Infeed 1건만)
- 운영자 본인 클릭 영구 차단 (critical)
- dev 환경 노출 정책 위반 방지
- 미동의 사용자 광고 0개 (GDPR/PIPA)
