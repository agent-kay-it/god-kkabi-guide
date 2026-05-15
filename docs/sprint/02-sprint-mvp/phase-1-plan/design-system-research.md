# 디자인 시스템 선정 보고서 (Sprint MVP Phase 1 plan)

> 작성일: 2026-05-15 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/02-sprint-mvp/design.md` §4 디자인 시스템
> 운영자 요청 (2026-05-15): "shadcn 등 게임에 어울리는 공개된 디자인 시스템 선정해서 가져와서 커스텀해서 사용"
> 결정: **shadcn/ui (베이스) + Magic UI (모션) + Lucide Icons + Framer Motion** 조합 채택

---

## 1. 본 문서의 역할

원본 HTML 1444라인의 다크/골드/퍼플/시안 한국 오컬트 무드를 Next.js 16 App Router로 이식할 때 사용할 **공개 디자인 시스템**을 선정한다. 운영자 요청에 따라 게임 IP 분위기 + 1인 운영 부담 최소 + 클린 아키텍처 호환 + 성능(Lighthouse ≥90) 4기준을 모두 만족하는 조합을 도출한다.

## 2. 후보 디자인 시스템 비교 매트릭스

| 시스템 | 라이선스 | 컴포넌트 | 게임 분위기 | 커스텀 자유도 | 번들 크기 | shadcn 호환 | 1인 운영 부담 |
|--------|---------|--------|-----------|------------|----------|------------|------------|
| **shadcn/ui** | MIT (copy-paste, 의존성 0) | 50+ 베이스 | 중간 (60+ 테마, 다크 우수) | ★★★ 최상 (코드 소유) | tree-shaking 친화 | self | 낮음 |
| Magic UI | MIT (copy-paste) | 60+ 모션 | 높음 (네온, animated beams, retro grids) | ★★★ | tree-shaking | ✅ 100% | 낮음 |
| Aceternity UI | MIT (copy-paste) | 200+ | 매우 높음 (3D 카드, spotlight, particle) | ★★★ | medium | ✅ 100% | 중간 (모션 무거움) |
| DaisyUI | MIT (npm) | 60+ | 중간 (테마 30+) | ★★ | small | △ (Tailwind 충돌 가능) | 낮음 |
| Mantine | MIT (npm) | 100+ | 중간 (자체 테마 엔진) | ★★ (오버라이드 한계) | large (~150KB) | ❌ | 중간 |
| Park UI | MIT (copy-paste) | 30+ | 중간 (Panda CSS) | ★★ | small | △ (Tailwind와 별도) | 중간 (Panda 학습) |
| 게임 특화 (react-game-engine, react-arcade) | 다양 | (피상) | 매우 높음 | ★ (특화 too narrow) | 큼 | ❌ | 높음 (적합도 낮음) |

> 출처: [shadcn/ui 공식](https://ui.shadcn.com), [Magic UI](https://magicui.design), [Aceternity UI](https://ui.aceternity.com), [Aceternity vs Magic UI vs shadcn 2026 비교](https://www.pkgpulse.com/guides/aceternity-ui-vs-magic-ui-vs-shadcn-animated-react-2026), [Awesome shadcn/ui](https://github.com/birobirobiro/awesome-shadcn-ui).

## 3. 선정 결정 — shadcn/ui 베이스 + Magic UI 모션

### 3.1 선정 사유

**shadcn/ui를 베이스로 선정한 이유**:
1. **copy-paste 철학** → 의존성 0, 코드 소유권 100%, 운영자가 직접 조작 자유
2. **Radix UI 프리미티브** → 접근성(ARIA) 자동 보장 (M5 WCAG AA 게이트 충족)
3. **Tailwind CSS v4 통합** → 본 프로젝트 design.md §4 디자인 토큰 22개와 매끄럽게 매핑
4. **다크 모드 우수** → 본 프로젝트 핵심 분위기 (한국 오컬트 다크)
5. **번들 크기** → 사용한 컴포넌트만 포함, Lighthouse ≥90 달성 용이
6. **커뮤니티** → 60+ 테마 + 1568 blocks + 1189 컴포넌트 활용 가능
7. **Next.js 16 App Router 1급 지원** + Vercel 공식 권장

**Magic UI를 모션 레이어로 보강하는 이유**:
1. **shadcn 100% 호환** (Tailwind + Framer Motion 기반)
2. **polished 마이크로 인터랙션** (Shimmer Button, Animated Gradient Text, Blur Fade) — 한국 오컬트 분위기에 어울리는 절제된 모션
3. Aceternity 대비 **theatrical 효과 적음** → 가독성 우선 가이드 페이지에 적합
4. copy-paste → shadcn과 동일 운영 방식

**Aceternity UI는 선택적 활용** (V1+ 검토):
- 진령 카드 3D 호버 효과 (V1 빌드 공유 페이지에서 등장)
- TierList의 spotlight 효과
- MVP에서는 성능 우선이므로 보류, V1 진입 시 1-2개 컴포넌트만 선택 도입

### 3.2 채택 안 한 이유

| 시스템 | 비채택 사유 |
|--------|-----------|
| **DaisyUI** | Tailwind 클래스명 충돌 가능. shadcn과 병행 어려움. 테마 엔진이 자체적 (CSS variables와 다름) |
| **Mantine** | 번들 ~150KB → Lighthouse 영향. shadcn 호환 안 됨. CSS-in-JS 의존성 |
| **Park UI** | Panda CSS 학습 곡선. Tailwind v4와 별도 빌드 시스템 |
| **게임 특화 라이브러리** | 게임 콘트롤·캔버스 위주 (방치형 RPG 게임 자체 개발에 적합) — 본 프로젝트는 정보 가이드 사이트라 미스매치 |

## 4. 추가 채택 도구 — 보조 레이어

| 도구 | 라이선스 | 역할 | 채택 사유 |
|------|--------|------|---------|
| **Tailwind CSS v4** | MIT | 스타일링 베이스 | shadcn 표준, `@theme` 디렉티브로 디자인 토큰 22개 자동 매핑, JIT 컴파일 |
| **Framer Motion** | MIT | 애니메이션 라이브러리 | Magic UI/Aceternity 공통 기반, layoutId 트랜지션 우수 |
| **Lucide Icons** | ISC | 아이콘 세트 (5,500+) | shadcn 공식 권장, tree-shaking, 한국 게임 아이콘 부족 시 보완으로 [Iconify](https://iconify.design) phosphor/game-icons 추가 |
| **next-themes** | MIT | 테마 전환 (다크/라이트) | shadcn 공식 권장. MVP는 다크 고정이지만 V2 라이트 옵션 대비 |
| **class-variance-authority (cva)** | Apache-2.0 | 컴포넌트 variant 관리 | shadcn 공식 사용. ClassCard 전사/검객/영매 변형, Alert 4 variant 처리 |
| **clsx + tailwind-merge** | MIT | className 병합 유틸 | shadcn 공식 `cn()` 헬퍼 |
| **Iconify (선택)** | MIT | 게임 아이콘 보완 | game-icons collection (4,000+ 게임 특화 아이콘) — 도깨비/요괴 아이콘 활용 |

## 5. 한국 오컬트 분위기 커스텀 전략

### 5.1 디자인 토큰 매핑 (HTML 원본 22개 → Tailwind v4 `@theme`)

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* === Background === */
  --color-bg-primary: #0a0612;        /* 짙은 오컬트 베이스 */
  --color-bg-secondary: #14092a;      /* 카드 베이스 */
  --color-bg-card: #1c1235;           /* 컴포넌트 베이스 */
  --color-bg-card-hover: #261845;     /* 호버 상태 */

  /* === Accent (한국 오컬트 핵심) === */
  --color-accent-gold: #e8b860;       /* 골드 (주 강조) */
  --color-accent-gold-light: #f6d27b; /* 골드 라이트 (호버) */
  --color-accent-red: #c93b4a;        /* 핏빛 (위험/0티어) */
  --color-accent-purple: #8b5cf6;     /* 신비 보라 (오컬트) */
  --color-accent-cyan: #38d9d9;       /* 도술 시안 */
  --color-accent-green: #5dd66c;      /* 회복/성공 */

  /* === Text === */
  --color-text-primary: #f0e6d8;      /* 양피지 톤 (한지 영감) */
  --color-text-secondary: #b9aec0;    /* 부드러운 회보라 */
  --color-text-muted: #8a7b94;        /* 흐릿한 보라회색 */

  /* === Border === */
  --color-border-gold: rgba(232, 184, 96, 0.35);
  --color-border-soft: rgba(255, 255, 255, 0.08);

  /* === Effects === */
  --shadow-glow: 0 0 24px rgba(232, 184, 96, 0.15);

  /* === Typography === */
  --font-sans: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --font-display: "Noto Serif KR", "Nanum Myeongjo", serif;  /* 한지 분위기 헤더용 (V1+) */

  /* === Radius === */
  --radius: 0.75rem;  /* shadcn 기본 (다크 + 부드러운 한국 무드) */
}
```

### 5.2 shadcn 컴포넌트 한국 오컬트 커스텀 패턴

| shadcn 컴포넌트 | 본 프로젝트 적용 위치 | 커스텀 포인트 |
|---------------|-------------------|------------|
| `<Button>` | CTA, CouponCode 복사 버튼 | gold gradient + glow shadow, hover scale 1.02 |
| `<Card>` | ClassCard, JinryeongCard, ComboCard | linear-gradient bg-card → bg-secondary, border-gold left 4px (직업별 다른 컬러) |
| `<Badge>` | BuildTagBadge, TierLabel, ClassTag | 0티어=red, 1티어=gold, 2티어=purple, 색상 코딩 |
| `<Tabs>` | Class 페이지 전사/검객/영매 전환 | underline 변형, gold accent |
| `<Accordion>` | TipCard, FAQ (V1) | gold separator |
| `<Dialog>` | 직업 진단 결과 모달 | gold border, blur backdrop |
| `<Toast>` (sonner) | CouponCode 복사 알림 | bottom-right, gold tint |
| `<ScrollArea>` | ScreenshotStrip 가로 스크롤 | scrollbar gold thin |

### 5.3 Magic UI 모션 적용 (선택적, MVP에서 3개만)

| Magic UI 컴포넌트 | 본 프로젝트 적용 위치 | 효과 |
|----------------|-------------------|------|
| `<BlurFade>` | Hero, 섹션 진입 시 | 부드러운 페이드 인 — 한국 오컬트 신비감 |
| `<AnimatedGradientText>` | h1.title (홈 메인 타이틀) | 골드 그라데이션 흐르는 효과 |
| `<ShimmerButton>` | "999뽑기 받기" CTA | 골드 빛 흐름 — 가챠 분위기 |

> Aceternity UI는 V1에서 빌드 공유 페이지의 3D 카드 hover로 도입 검토. MVP는 성능 우선이므로 제외.

## 6. 클린 아키텍처 통합 — 디자인 시스템과 도메인 분리

```
components/
├── ui/                       # ⬅ shadcn 베이스 (copy-paste, 절대 도메인 로직 금지)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── toast.tsx
│   └── ...
├── motion/                   # ⬅ Magic UI 모션 (copy-paste)
│   ├── blur-fade.tsx
│   ├── animated-gradient-text.tsx
│   └── shimmer-button.tsx
├── domain/                   # ⬅ 갓깨비 도메인 컴포넌트 (ui/motion 조합)
│   ├── hero.tsx
│   ├── toc.tsx
│   ├── class-card.tsx
│   ├── jinryeong-card.tsx
│   ├── tier-list.tsx
│   ├── combo-card.tsx
│   ├── coupon-code.tsx
│   ├── alert.tsx
│   ├── priority-flow.tsx
│   ├── pay-tier.tsx
│   ├── event-card.tsx
│   ├── tip-card.tsx
│   ├── screenshot-strip.tsx
│   ├── footer.tsx
│   └── build-tag-badge.tsx
└── feature/                  # ⬅ V1+ feature 컴포넌트 (Auth, Comment, BuildForm 등)
    └── (V1 진입 시)
```

**규칙**:
1. `ui/`는 절대 도메인 로직 (갓깨비/진령/직업 등) 포함 금지 — shadcn 표준 그대로
2. `motion/`는 ui/와 동일 — Magic UI 표준 그대로
3. `domain/`은 갓깨비 IP 컴포넌트 — ui/motion을 조합해 도메인 의미 부여
4. import 방향: `domain/` → `ui/` + `motion/` (단방향, 역참조 금지)

## 7. 라이선스 + Attribution

| 도구 | 라이선스 | 본 프로젝트 의무 |
|------|---------|--------------|
| shadcn/ui | MIT | 코드 copy 후 자유 사용. attribution 필요 없음. `lib/utils.ts` cn() 헬퍼 유래 명시 권장 |
| Magic UI | MIT | 동일. footer에 "Inspired by Magic UI" 선택 |
| Aceternity UI | MIT | 동일 |
| Tailwind CSS / Framer Motion / Lucide | MIT/ISC | 동일 |

**디스클레이머 위치**: `app/(content)/sources/page.tsx` — 공개 디자인 시스템 출처 명시 (디자인 시스템 + 갓깨비 IP + UGC 인용 정책 통합 디스클레이머)

## 8. 설치 명령 (Sprint MVP Phase 3 do.A)

```bash
# 1. Next.js 16 스캐폴딩
pnpm create next-app@latest god-kkabi-guide \
  --typescript --tailwind --app --no-src-dir --turbopack \
  --import-alias "@/*"

# 2. shadcn/ui 초기화
cd god-kkabi-guide
pnpm dlx shadcn@latest init
#   - Style: Default
#   - Base color: Zinc (다크 베이스)
#   - CSS variables: Yes
#   - tailwind.config.js: 자동 생성
#   - components.json: 자동 생성

# 3. 베이스 컴포넌트 설치
pnpm dlx shadcn@latest add button card badge tabs dialog toast accordion scroll-area sonner separator

# 4. Magic UI 모션 컴포넌트 (3개 — MVP)
pnpm dlx shadcn@latest add "https://magicui.design/r/blur-fade"
pnpm dlx shadcn@latest add "https://magicui.design/r/animated-gradient-text"
pnpm dlx shadcn@latest add "https://magicui.design/r/shimmer-button"

# 5. Firebase + 보조 라이브러리
pnpm add firebase react-hook-form zod date-fns lucide-react clsx tailwind-merge class-variance-authority
pnpm add -D @types/node
```

## 9. 결정 요약

| 항목 | 결정 |
|------|------|
| **베이스 UI 시스템** | shadcn/ui (copy-paste, MIT, Tailwind v4 통합) |
| **모션 보강** | Magic UI (BlurFade + AnimatedGradientText + ShimmerButton, MVP 3개) |
| **선택 보강** | Aceternity UI 보류 (V1+ 진령 카드 3D 검토) |
| **CSS 엔진** | Tailwind CSS v4 `@theme` 디렉티브 |
| **아이콘** | Lucide Icons (베이스) + Iconify game-icons (보완) |
| **컴포넌트 구조** | components/ui (shadcn) / motion (Magic UI) / domain (갓깨비) / feature (V1+) — 단방향 import |
| **디자인 토큰** | HTML 원본 22개 CSS 변수 → Tailwind v4 `@theme` 매핑 (§5.1) |
| **라이센스** | 모두 MIT — Footer에 출처 표기 |

본 결정은 Sprint MVP Phase 2 design `design.md` §4 디자인 시스템에 반영되어 Phase 3 do.A 스캐폴딩의 직접 입력으로 사용된다.

---

## Sources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn UI 2026 가이드 — DesignRevision](https://designrevision.com/blog/shadcn-ui-guide)
- [shadcn React Themes (60+)](https://www.shadcn.io/theme)
- [Magic UI](https://magicui.design)
- [Aceternity UI](https://ui.aceternity.com/)
- [Aceternity vs Magic UI vs shadcn 2026 비교](https://www.pkgpulse.com/guides/aceternity-ui-vs-magic-ui-vs-shadcn-animated-react-2026)
- [Awesome shadcn/ui curated list](https://github.com/birobirobiro/awesome-shadcn-ui)
- [11+ Best Shadcn Alternatives — Tailgrids](https://tailgrids.com/blog/shadcn-alternatives)
