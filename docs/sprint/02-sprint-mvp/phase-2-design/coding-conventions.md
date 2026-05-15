# 코딩 컨벤션 + 클린 아키텍처 가이드

> 작성일: 2026-05-15 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/02-sprint-mvp/design.md` + `design-system-research.md` §6
> 적용 범위: Sprint MVP Phase 3 do.A ~ V3 전 스프린트 공통 기준
> 목표: TypeScript strict + ESLint Strict + 클린 아키텍처 4계층 + Ports & Adapters 패턴

---

## 1. TypeScript Strict 모드

### 1.1 tsconfig.json 필수 옵션

```json
{
  "compilerOptions": {
    /* 기본 */
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,

    /* Strict — 모두 활성 */
    "strict": true,                      /* noImplicitAny + strictNullChecks 등 포함 */
    "noImplicitAny": true,               /* any 타입 암시적 추론 금지 */
    "strictNullChecks": true,            /* null/undefined 명시적 처리 강제 */
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,           /* 모든 코드 경로에서 반환값 필수 */
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,    /* 배열/객체 인덱스 접근 시 undefined 처리 강제 */
    "exactOptionalPropertyTypes": true,  /* optional prop에 undefined 명시 강제 */
    "noUnusedLocals": true,              /* 미사용 변수 에러 */
    "noUnusedParameters": true,          /* 미사용 파라미터 에러 */

    /* Next.js 필수 */
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 1.2 타입 작성 원칙

```typescript
// ✅ 명시적 반환 타입 선언
export async function getValidCoupons(): Promise<CouponDoc[]> { ... }

// ✅ noUncheckedIndexedAccess 대응 — 배열 인덱스 접근
const firstItem = items[0];            // type: CouponDoc | undefined
if (firstItem !== undefined) { ... }  // 필수 가드

// ✅ 유니온 타입 우선, any 금지
type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

// ❌ 금지 패턴
const value: any = fetchData();        // any 타입 절대 금지
const result = value as SomeType;      // type assertion 최소화 (불가피 시 as unknown as T)

// ✅ 도메인 타입은 types/ 디렉토리에만
// types/coupon.ts, types/build.ts, types/ga4.ts 등
```

---

## 2. ESLint Strict + Prettier

### 2.1 eslint.config.mjs (Next.js 16 Flat Config)

```javascript
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  /* TypeScript Strict */
  ...compat.extends('plugin:@typescript-eslint/strict-type-checked'),
  ...compat.extends('plugin:@typescript-eslint/stylistic-type-checked'),

  /* Tailwind CSS — class 순서 자동 정렬 */
  ...compat.extends('plugin:tailwindcss/recommended'),

  /* Import 순서 */
  ...compat.extends('plugin:import/recommended'),
  ...compat.extends('plugin:import/typescript'),

  {
    rules: {
      /* TypeScript */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',

      /* Import 순서 (5단계 그룹 — §4 import 순서 규칙과 일치) */
      'import/order': [
        'error',
        {
          groups: [
            'builtin',        // Node.js 내장
            'external',       // npm 패키지
            'internal',       // @/* alias
            'parent',         // ../
            'sibling',        // ./
            'index',          // ./index
            'object',
            'type',
          ],
          pathGroups: [
            { pattern: 'react',       group: 'external', position: 'before' },
            { pattern: 'next',        group: 'external', position: 'before' },
            { pattern: 'next/**',     group: 'external', position: 'before' },
            { pattern: '@/lib/**',    group: 'internal', position: 'before' },
            { pattern: '@/types/**',  group: 'internal', position: 'before' },
            { pattern: '@/components/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['react', 'next'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-cycle': 'error',      /* 순환 import 금지 */

      /* React */
      'react/function-component-definition': ['error', { namedComponents: 'function-declaration' }],
      'react/self-closing-comp': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    settings: {
      tailwindcss: {
        config: 'tailwind.config.ts',
      },
    },
  },
];

export default eslintConfig;
```

### 2.2 prettier.config.mjs

```javascript
/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],  /* Tailwind class 자동 정렬 */
};

export default config;
```

---

## 3. 파일/디렉토리 네이밍 컨벤션

| 유형 | 규칙 | 예시 |
|------|------|------|
| 파일 (컴포넌트) | kebab-case | `class-card.tsx`, `jinryeong-card.tsx` |
| 파일 (훅) | camelCase with `use` prefix | `useAnalytics.ts`, `useCoupons.ts` |
| 파일 (유틸) | camelCase | `formatDate.ts`, `calcDday.ts` |
| 파일 (타입) | PascalCase | `CouponTypes.ts`, `BuildTypes.ts` |
| 파일 (상수) | SCREAMING_SNAKE_CASE | `GA4_EVENTS.ts` |
| React 컴포넌트 함수 | PascalCase | `function ClassCard(...)` |
| 변수/함수 | camelCase | `getValidCoupons`, `formatExpiresAt` |
| 상수 | SCREAMING_SNAKE_CASE | `CORE_BACKUP_EVENTS` |
| CSS 모듈 파일 | kebab-case | `hero.module.css` (본 프로젝트는 Tailwind 우선, CSS Module은 예외적) |
| 디렉토리 | kebab-case | `components/domain/`, `lib/firebase/` |

---

## 4. Import 순서 규칙

모든 파일의 import는 다음 5개 그룹으로 구분하며 그룹 사이에 빈 줄 1개를 둔다. ESLint `import/order` 룰이 자동 검증한다.

```typescript
// ─── Group 1: React / Next.js ───
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';

// ─── Group 2: 외부 라이브러리 ───
import { cva, type VariantProps } from 'class-variance-authority';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// ─── Group 3: @/lib/* ───
import { logEvent } from '@/lib/firebase/analytics';
import { getValidCoupons } from '@/lib/firestore/coupons';
import { cn } from '@/lib/utils';

// ─── Group 4: @/types/* ───
import type { CouponDoc } from '@/types/coupon';
import type { BuildTag } from '@/types/build';

// ─── Group 5: @/components/* ───
import { Alert } from '@/components/domain/alert';
import { Button } from '@/components/ui/button';

// ─── Group 6: 상대 경로 (같은 디렉토리) ───
import { formatDday } from './formatDday';
```

---

## 5. 클린 아키텍처 4계층

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: app/  — Next.js App Router (Server Component 우선)   │
│  - layout.tsx, page.tsx, error.tsx, loading.tsx, not-found.tsx  │
│  - metadata export (Next.js Metadata API)                       │
│  - Server Component에서 lib/ 직접 호출 (DB, Cache)             │
│  - Client Component는 'use client' 명시 파일로만 격리           │
└────────────────────────────┬────────────────────────────────────┘
                             │ import
┌────────────────────────────▼────────────────────────────────────┐
│  Layer 2: components/  — UI 레이어                             │
│  ├── ui/         shadcn 베이스 (절대 도메인 로직 금지)          │
│  ├── motion/     Magic UI 모션 (절대 도메인 로직 금지)          │
│  ├── domain/     갓깨비 도메인 컴포넌트 (ui/ + motion/ 조합)   │
│  └── feature/    V1+ 기능 컴포넌트 (Auth, Comment, BuildForm)  │
└────────────────────────────┬────────────────────────────────────┘
                             │ import
┌────────────────────────────▼────────────────────────────────────┐
│  Layer 3: lib/  — Application 레이어 (비즈니스 로직 + Port)    │
│  ├── firebase/   client.ts + analytics.ts + firestore.ts        │
│  ├── firestore/  coupons.ts + events.ts (Adapter)               │
│  ├── analytics/  events.ts (logEvent 래퍼)                      │
│  ├── hooks/      useAnalytics.ts + useCoupons.ts (Client Hook)  │
│  └── utils.ts    cn() 헬퍼 + formatDate 등                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ type import only
┌────────────────────────────▼────────────────────────────────────┐
│  Layer 4: types/  — 도메인 타입 (순수 타입 선언만)             │
│  ├── coupon.ts   CouponDoc                                      │
│  ├── build.ts    BuildDoc + BuildTag enum 11종                   │
│  ├── jinryeong.ts Jinryeong + JinryeongTier                     │
│  ├── class.ts    GameClass + ClassQuiz                          │
│  └── ga4.ts      GA4EventName 12종                              │
└─────────────────────────────────────────────────────────────────┘
```

### 5.1 계층별 import 방향 엄수

```
app/           → components/, lib/, types/          ✅
components/    → lib/, types/                       ✅
components/ui/ ← components/domain/ (단방향)        ✅
components/domain/ → components/ui/, components/motion/ ✅
lib/           → types/                             ✅

components/ui/ → components/domain/                ❌ 역참조 금지
lib/           → components/                        ❌ 역참조 금지
types/         → lib/, components/                  ❌ 역참조 금지 (순수 타입만)
```

### 5.2 Server Component vs Client Component 분리 원칙

```typescript
// ✅ Server Component (기본) — 'use client' 없음
// app/(content)/jinryeong/page.tsx
import { getJinryeongData } from '@/lib/firestore/jinryeong';

export default async function JinryeongPage() {
  const jinryeong = await getJinryeongData();   // 서버에서 직접 데이터 조회
  return <TierList tiers={jinryeong} />;         // 정적 렌더링 가능
}

// ✅ Client Component (상호작용 필요 시만) — 'use client' 명시
// components/domain/coupon-code.tsx
'use client';
import { useState } from 'react';

export function CouponCode({ code }: CouponCodeProps) {
  const [copied, setCopied] = useState(false);  // 클라이언트 상태
  // ...
}

// ❌ 금지 — 불필요한 'use client'
// Server Component에서도 되는 로직에 'use client' 남용
```

---

## 6. Ports & Adapters 패턴 (Firebase 격리)

Firebase 의존성은 `lib/firebase/` + `lib/firestore/`에만 격리한다. 컴포넌트는 추상화된 함수만 호출한다.

```
컴포넌트 → lib/firestore/coupons.ts → lib/firebase/firestore.ts → Firebase SDK
```

```typescript
// lib/firestore/coupons.ts — Adapter (Port 구현체)
import { getDocs, query, collection, where, orderBy } from 'firebase/firestore';
import { unstable_cache } from 'next/cache';

import { getFirestoreClient } from '@/lib/firebase/firestore';
import type { CouponDoc } from '@/types/coupon';

export const getValidCoupons = unstable_cache(
  async (): Promise<CouponDoc[]> => {
    const db = getFirestoreClient();
    const q = query(
      collection(db, 'coupons'),
      where('status', '==', 'valid'),
      orderBy('expires_at', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CouponDoc));
  },
  ['valid-coupons'],
  { revalidate: 60 * 60 * 12 },  // 12h ISR
);

// app/coupon/page.tsx — 컴포넌트 (Firebase 직접 참조 없음)
import { getValidCoupons } from '@/lib/firestore/coupons';

export default async function CouponPage() {
  const coupons = await getValidCoupons();  // Adapter만 호출
  return <CouponList coupons={coupons} />;
}
```

---

## 7. 컴포넌트 작성 패턴

### 7.1 Named Export 강제

```typescript
// ✅ Named export (tree-shaking 친화)
export function CouponCode({ code, status, onCopy }: CouponCodeProps) { ... }

// ❌ Default export 금지 (컴포넌트 위치 추적 어려움)
export default function CouponCode() { ... }

// 예외: Next.js App Router의 page.tsx, layout.tsx, error.tsx는 default export 필수
// (Next.js 규격)
```

### 7.2 Props 인터페이스 패턴

```typescript
// ✅ 명시적 interface (type보다 interface 선호 — 확장 용이)
interface CouponCodeProps extends VariantProps<typeof couponStatusVariants> {
  code: string;
  description: string;
  status: CouponStatus;
  expiresAt?: Date;
  onCopy?: (code: string) => Promise<void>;
  className?: string;
}

// ✅ children은 React.ReactNode
interface AlertProps {
  children: React.ReactNode;
  variant: AlertVariant;
  title?: string;
}
```

### 7.3 async 컴포넌트 (Server Component)

```typescript
// ✅ Server Component에서 async 사용 가능
export default async function CouponPage() {
  const coupons = await getValidCoupons();
  // ...
}

// ✅ Suspense로 로딩 상태 처리
import { Suspense } from 'react';

export default function JinryeongPage() {
  return (
    <Suspense fallback={<JinryeongSkeleton />}>
      <JinryeongContent />
    </Suspense>
  );
}
```

---

## 8. 에러 처리 표준 패턴

Next.js App Router 표준 에러 파일들을 모든 주요 라우트에 배치한다.

```
app/
├── error.tsx               # 루트 에러 경계 (Server/Client 공통)
├── not-found.tsx           # 404 페이지
├── loading.tsx             # 루트 로딩 (Suspense fallback)
└── (content)/
    ├── error.tsx           # 콘텐츠 섹션 에러 (라우트 그룹별)
    └── loading.tsx         # 콘텐츠 섹션 로딩
```

```typescript
// app/error.tsx — 에러 경계
'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Alert variant="danger" title="오류가 발생했습니다">
        {error.message}
      </Alert>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}

// app/not-found.tsx — 404
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Alert variant="info" title="페이지를 찾을 수 없습니다">
        요청하신 페이지가 존재하지 않습니다.
      </Alert>
    </div>
  );
}
```

---

## 9. 테스트 컨벤션

### 9.1 파일 배치 규칙

```
components/domain/
├── coupon-code.tsx
├── coupon-code.test.tsx    # 컴포넌트와 동일 디렉토리
└── coupon-code.stories.tsx # Storybook (V1+)

lib/firestore/
├── coupons.ts
└── coupons.test.ts         # lib도 동일 위치에 테스트 배치
```

### 9.2 Vitest 설정 (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

### 9.3 컴포넌트 테스트 패턴

```typescript
// coupon-code.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { CouponCode } from './coupon-code';

describe('CouponCode', () => {
  it('유효 쿠폰 코드를 렌더링한다', () => {
    render(
      <CouponCode
        code="GOKKAEBI2026"
        description="999뽑기 증정"
        reward="다이아 1000"
        status="valid"
      />,
    );
    expect(screen.getByText('GOKKAEBI2026')).toBeInTheDocument();
  });

  it('복사 버튼 클릭 시 onCopy가 호출된다', async () => {
    const onCopy = vi.fn().mockResolvedValue(undefined);
    render(
      <CouponCode code="TEST" description="desc" reward="reward" status="valid" onCopy={onCopy} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /복사/i }));
    expect(onCopy).toHaveBeenCalledWith('TEST');
  });
});
```

---

## 10. Git Commit 컨벤션 (Conventional Commits)

### 10.1 커밋 메시지 형식

```
type(scope): subject

body (선택)

Co-Authored-By: Claude <claude@anthropic.com>
```

### 10.2 type 매핑

| type | 사용 상황 | 예시 |
|------|---------|------|
| `feat` | 새 기능 추가 | `feat(coupon): 쿠폰 D-day 카운트다운 추가` |
| `fix` | 버그 수정 | `fix(analytics): SSR 환경에서 logEvent null 참조 오류 수정` |
| `chore` | 빌드/설정 변경 | `chore: pnpm 패키지 추가 (firebase, lucide-react)` |
| `docs` | 문서 수정 | `docs(design): component-inventory 15종 보강` |
| `style` | 코드 스타일 (기능 변화 없음) | `style: prettier 포맷 적용` |
| `refactor` | 리팩토링 (기능 변화 없음) | `refactor(firebase): Ports & Adapters 패턴으로 분리` |
| `test` | 테스트 추가/수정 | `test(coupon-code): 복사 버튼 클릭 테스트 추가` |
| `perf` | 성능 개선 | `perf(fonts): Noto Sans KR sub-setting 적용` |
| `ci` | CI/CD 설정 | `ci: Lighthouse CI GitHub Actions 추가` |

### 10.3 scope 매핑 (본 프로젝트)

| scope | 대상 |
|-------|------|
| `scaffold` | Next.js 스캐폴딩 |
| `design-tokens` | globals.css + Tailwind @theme |
| `firebase` | lib/firebase/* |
| `analytics` | lib/firebase/analytics.ts + AnalyticsBootstrap |
| `coupon` | components/domain/coupon-code.tsx + lib/firestore/coupons.ts |
| `jinryeong` | components/domain/jinryeong-card.tsx + tier-list.tsx |
| `builds` | components/domain/build-tag-badge.tsx + builds/* 페이지 |
| `class-quiz` | app/class-quiz/page.tsx |
| `seo` | sitemap.ts + robots.ts + metadata |
| `ci` | GitHub Actions + Vercel 배포 |

### 10.4 임시 파일을 통한 커밋 (heredoc 방지)

```bash
# heredoc 사용 금지 — 대신 임시 파일 활용
printf 'feat(scaffold): Next.js 16 스캐폴딩 + 디자인 토큰 22개 Tailwind v4 매핑\n\n- pnpm create next-app 기반\n- shadcn/ui 초기화\n- globals.css @theme 토큰 22개\n- Firebase Analytics SSR 가드\n\nCo-Authored-By: Claude <claude@anthropic.com>' > .git/COMMIT_MSG.tmp
git commit -F .git/COMMIT_MSG.tmp
rm .git/COMMIT_MSG.tmp
```

---

## 11. PR 정책

| 브랜치 흐름 | 규칙 |
|-----------|------|
| `feature/*` → `staging` | CI 통과 필수 (lint + typecheck + build) |
| `staging` → `main` | CI 통과 + 운영자 확인 (L4에서는 Chrome E2E 자동 통과가 조건) |
| 직접 `main` push | 금지 |
| 긴급 hotfix | `fix/hotfix-xxx` → `staging` PR → 즉시 `main` PR |

### 11.1 CI 필수 검증 (GitHub Actions — V1+ 도입)

```yaml
# .github/workflows/ci.yml (Phase 3 do.D 이후 활성)
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck       # tsc --noEmit
      - run: pnpm lint            # ESLint Strict
      - run: pnpm build           # Next.js 빌드 검증
```

---

## 12. package.json scripts 표준

```json
{
  "scripts": {
    "dev":       "tene run -- next dev --turbopack -p 3000",
    "build":     "tene run -- next build",
    "start":     "tene run -- next start",
    "lint":      "next lint",
    "lint:fix":  "next lint --fix",
    "format":    "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test":      "vitest run",
    "test:ui":   "vitest --ui",
    "test:watch": "vitest"
  }
}
```

---

> **Status**: Draft v1.0 — Phase 3 do.A 스캐폴딩 시점부터 적용.
> **연관 문서**: `design-system-research.md` §6, `design.md` §10, `plan.md` §4 WBS
