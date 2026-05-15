# Sprint V4 실행 Plan — L4 자동 모드 단일 세션 압축

> 36주 분량의 V4 콘텐츠/디자인 고도화를 단일 세션 L4 자동 모드로 압축 실행.
> MASTER-PLAN §5 WBS에 따라 P0 → P8 진행.

---

## 1. 실행 범위 (Full scope 채택)

### 1.1 P3.A Foundation (코드 ~400줄)

- `app/icon.tsx` (256×256, Next.js metadata file) — app-icon.webp 기반
- `app/apple-icon.tsx` (180×180)
- `app/opengraph-image.tsx` (1200×630, Hero 배너 + 텍스트)
- `app/manifest.ts` (PWA manifest)
- `app/globals.css` 확장 — body::before (radial 3-stop) + ::after (dot pattern 3px) + drift 30s + 스크롤바 + ::selection + reduced-motion 가드
- Tailwind 토큰 — rhythm / container-max / ease-out / dur-fast/base/slow

### 1.2 P3.B Interaction Primitives (코드 ~600줄)

- 5 hooks (`hooks/use-*.ts`)
- 5 components (Reveal / BackToTop / LightboxProvider / ScrollBlurTopBar 강화 / Marquee)

### 1.3 P3.C Hero + Home (코드 ~500줄)

- HeroBackdrop 듀얼 마퀴 + HeroAppBlock + HeroStats + SectionHead 컴포넌트
- `app/page.tsx` 재구성 — TOC + Overview + 위키 카테고리 (보존) + Tips + Roadmap preview

### 1.4 P3.D Class + Jinryeong (코드 ~700줄)

- ClassCardV3 + class detail data + class page 재구성
- FeaturedJinryeong + TierStack + jinryeong page 재구성

### 1.5 P3.E 5 신규/강화 페이지 (코드 ~1200줄)

- Systems / Dungeon 강화 (기존 page 확장)
- Payment / Event / Advanced (NEW)
- Tips roadmap 추가

### 1.6 운영자 게이트 (코드 외)

- favicon 시각 검증 (browser tab)
- LinkedIn OG preview 검증 (배포 후)
- 콘텐츠 검수 (D2 70/30 — source 직접 인용 vs 운영자 정리)
- Chrome MCP 4-breakpoint 시각 검증

---

## 2. PDCA 진행

```
P0 사전 (자산 4장 이식) ✅ 완료
P1 Plan (본 문서) ✅
P2 Design (design.md) → 본 문서가 design 통합
P3.A Foundation
P3.B Interaction
P3.C Hero + Home
P3.D Class + Jinryeong
P3.E 5 신규/강화 페이지
P4 Check (gap-detector + code-analyzer)
P5 Act (iterate)
P6 QA (7-Layer + E2E)
P7 Report (V4 종합)
P8 Archive (tag v4.0.0-v4-archived)
```

---

## 3. Quality Gates (MASTER-PLAN §6 발췌)

| Gate | 목표 |
|:----:|------|
| M0 TypeScript strict | 0 errors |
| M3 보안 | XSS (lightbox img sanitize) |
| M4 디자인 토큰 정합 | source vs Tailwind 1:1 |
| M5 Match Rate | ≥90% |
| M6 Lighthouse Mobile | ≥85 |
| M7 반응형 4-breakpoint | 480/720/1024/1440 |
| M7 WCAG AA | axe-core 0 critical |
| M8 Interaction 5종 + reduced-motion | 5/5 + 가드 |
| M11 favicon + OG + manifest | 4 files 생성 |

---

## 4. 디자인 토큰 1:1 매핑

| source CSS variable | Tailwind / globals.css |
|---------------------|------------------------|
| `--ink-base #07070b` | 이미 globals.css |
| `--ink-elev #0e0e15` | 이미 |
| `--bronze` `#c89968` | 이미 |
| `--jade` `#7eb6a8` | 이미 |
| `--vermilion` `#c87870` | 이미 |
| `--indigo` `#8b8bc5` | 이미 |
| `--rhythm clamp(56px, 9vw, 96px)` | **V4 신규** → `.section-rhythm` utility |
| `--container-max 1140px` | **V4 신규** → `max-w-[1140px]` |
| `--ease-out cubic-bezier(0.16, 1, 0.3, 1)` | **V4 신규** → `ease-out-soft` Tailwind extend |
| `--dur-fast 200ms / --dur-base 400ms / --dur-slow 700ms` | **V4 신규** → `duration-fast/base/slow` extend |

---

## 5. 인터랙션 명세 5종 (P3.B 핵심)

### 5.1 useScrollBlur (Topbar)

```typescript
// scroll.y > 24 → .scrolled 추가
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

### 5.2 useRevealOnScroll

```typescript
// IntersectionObserver threshold 0.12, rootMargin "0px 0px -8% 0px"
// 1회만 toggle, unobserve
```

### 5.3 useMouseGradient

```typescript
// mousemove → --mx, --my percent CSS variable
// ref attach
```

### 5.4 useLightbox (Context + Provider)

```typescript
// open(src, alt) / close()
// body scroll lock (document.body.style.overflow)
// ESC key listener
// click outside container
```

### 5.5 useBackToTop

```typescript
// scroll.y > 600 → visibility
```

모든 hooks는 `prefers-reduced-motion` 가드 (필요 시).

---

## 6. 다음

P3.A Foundation부터 진행. 단일 세션 압축이지만 sub-phase마다 typecheck + commit으로 회귀 차단.
