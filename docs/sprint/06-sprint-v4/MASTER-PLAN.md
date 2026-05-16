# Sprint V4 Master Plan — 콘텐츠/디자인 고도화 (source 격차 회수 + Showcase 완성)

> **Sprint ID**: `god-kkabi-guide-sprint-v4`
> **상태**: 📝 Draft (계획 단계)
> **작성일**: 2026-05-16 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> **목표**: source/godkkabi-guide의 2495줄 HTML 디자인 + 11 sections 콘텐츠 풍부도 + 인터랙티브 디자인 + 모바일/PC 반응형 깊이를 현재 Next.js 16 + Firestore 인프라에 완전 이식.
> **전제**: V1/V2/V3에서 이미 완성된 인프라 (Auth + UGC + B2B API + admin SaaS + Toss 결제 + i18n + NLP + ETL)는 그대로 유지. 본 sprint는 **공개 페이지의 콘텐츠/디자인 깊이만** 보강.

---

## §0. Executive Summary — 격차 진단

source `index.html`은 **2495줄 단일 페이지**에 다음을 모두 담음:
- **11 sections** (TOC / Overview / Class / Jinryeong / Systems / Dungeon / Payment / Event / Tips / Advanced / Footer)
- **앱 아이콘 favicon + apple-touch-icon + OG image** (`./images/app-icon.webp` 활용)
- **Hero backdrop 듀얼 로우 마퀴** (6 배너 70s/90s linear 무한)
- **Glass card mouse-following gradient** (`[data-interactive]` 마우스 따라가는 라디얼)
- **IntersectionObserver reveal-on-scroll** (`.reveal` + `data-delay` stagger)
- **Topbar scroll blur** (`.scrolled` 클래스 트리거)
- **Lightbox** (`data-zoom` 이미지 확대 + ESC 닫기 + body scroll lock)
- **Back-to-top** (24px FAB + 600px 초과 시 표시)
- **Smooth scroll for in-page anchors** (offset 60px)
- **Featured Jinryeong** (서해용왕 280px image + body 2-column)
- **Class banner + accent stripe** (직업별 vermilion/bronze/indigo)
- **Tier stack** (0/1/2 stripe + tier color)
- **Trap card** (자동사냥 함정/해법)
- **Pay tier** (f2p/low/mid 컬러 + counter)
- **Event list + Tips grid + 7-day roadmap**
- **Advanced section** (메커니즘 디테일 — 289줄)
- **Mobile fine-tuning** (`@media (max-width:600px)` 5건 + `prefers-reduced-motion`)

현재 구현 (`app/page.tsx` 207줄)은:
- ✅ 위키 6 카테고리 그리드 (V2)
- ✅ Hero 1장 (banner-korean-carry 30% opacity)
- ✅ Tips 3개 preview
- ❌ **favicon / apple-touch-icon / OG image 모두 누락** (Next.js metadata 파일 형태로 미작성)
- ❌ Hero backdrop 마퀴 없음
- ❌ Glass card mouse-following gradient 없음
- ❌ IntersectionObserver reveal 없음 (정적 페이지)
- ❌ Topbar scroll blur 없음 (현재 topbar는 정적)
- ❌ Lightbox 없음
- ❌ Back-to-top FAB 없음
- ❌ Featured Jinryeong / Class banner 없음
- ❌ Tier 페이지 분리 (현재 `/jinryeong`만)
- ❌ Dungeon / Payment / Event / Advanced 섹션 부재
- ❌ 7-day Roadmap 미존재
- ❌ source 이미지 11개 중 6개만 이식 (`app-icon`, `banner-baekgwi`, `banner-infinite-gear`, `skills-list-swordsman` 4개 누락)

**격차 한 줄 요약**: "인프라(Auth/UGC/B2B/Toss/admin)는 만점, 콘텐츠와 인터랙티브 디자인은 30점."

---

## §1. Mission + Anti-Mission + 4-Perspective Value

### 1.1 Mission

> **"V1-V3의 풀스택 인프라를 보존한 채, source의 11 sections × 1page 풍부 콘텐츠를 Next.js App Router로 분해하되, source의 디자인 깊이 (마퀴 / mouse-following gradient / reveal / lightbox / featured / tier / trap / pay-tier / event / advanced) 100% 이식 + PC/모바일 반응형 100% 회수 + favicon/OG image/PWA manifest 완성."**

### 1.2 Anti-Mission

- ❌ source HTML 통째로 1page 단일 페이지화 (App Router 이점 상실)
- ❌ V1-V3 인프라 재작성 (Auth / UGC / B2B / Toss / admin 등 보존)
- ❌ source CSS를 Tailwind 미적용 raw CSS로 복사 (디자인 토큰 일관성 파괴)
- ❌ source JS를 React 외부 DOM 조작으로 복사 (hydration mismatch 위험)
- ❌ 운영자 미동의 디자인 변형 (예: 새 컬러 토큰 도입, JetBrains Mono 폐기)

### 1.3 4-Perspective Value

| 관점 | 가치 |
|------|------|
| **Problem (왜 필요한가)** | V3까지 인프라는 완성됐지만 공개 페이지가 비어 있어 **SEO 신호 + 영업 데모 자료 + Pilot 가치 평가**가 약하다. source 1page 디자인이 이미 검증된 안 — Game8 / Mihoyo 수준 디자인 깊이를 즉시 회수 가능. |
| **Solution (어떻게)** | source 11 sections를 Next.js 라우트 4-5개로 분해 (Home / Class / Jinryeong / Systems / Advanced) + source의 컴포넌트 패턴 (`.glass[data-interactive]`, `.class-card`, `.tier-row`, `.note`, `.trap-card`, `.pay-tier`, `.event`, `.flow`)을 React 컴포넌트로 1:1 매핑. JS는 useEffect + IntersectionObserver hooks로 변환. |
| **Function UX Effect** | (1) 사용자가 첫 진입에 favicon + OG image + 마퀴 배너 + reveal 애니메이션으로 "고급 게임 가이드" 인식. (2) PC 768px+ 3-column / mobile 1-column 자동 반응형. (3) Lightbox로 스크린샷 자세히. (4) Back-to-top + smooth scroll 만족도. |
| **Core Value** | "1인 운영 가이드의 시각적 신뢰도를 Game8 50% 수준까지 끌어올려, B2B Pilot 가격 협상 anchor를 강화한다." |

---

## §2. Context Anchor (5-Key)

| Key | Value |
|-----|-------|
| **WHY** | source 디자인 = 이미 검증된 1page 콘텐츠 비전. 현재 사이트는 UGC/구독 인프라 위주라 첫 진입 시 "비어 보임". V3 영업 단계에서 게임사가 사이트를 처음 보면 콘텐츠 풍부도가 가격 anchor에 직접 영향. |
| **WHO** | (1) 일반 사용자 — 게임 입문/메타 추종 25-40세. (2) B2B 영업 의사결정자 — Demo 단계 사이트 시연. (3) 운영자 — 본업 외 시간 콘텐츠 갱신 부담 최소화. |
| **RISK** | (1) source 콘텐츠를 그대로 복사 시 운영자 검증 안 된 정보 노출 (예: 메타 변동). (2) hydration mismatch (Server vs Client). (3) IntersectionObserver / lightbox / 마퀴 모두 client-side → bundle size 증가. (4) reduced-motion 사용자 a11y. (5) i18n 페이지 마이그레이션 미완료 (V2 carry) — 본 sprint에서 함께 진행 권장. |
| **SUCCESS** | (1) Lighthouse Mobile ≥85 유지. (2) source 11 sections 콘텐츠 100% 이식. (3) source 인터랙션 5종 (마퀴/gradient/reveal/lightbox/totop) 모두 작동. (4) favicon / OG image / apple-touch-icon 모두 생성. (5) PC 1140px / Tablet 720px / Mobile 480px 3-breakpoint 검증. (6) WCAG AA 유지. |
| **SCOPE** | **In**: Next.js metadata files (icon.tsx + apple-icon.tsx + opengraph-image.tsx + manifest) / Hero backdrop 마퀴 / GlassCard mouse-following / RevealOnScroll hook / Lightbox 컴포넌트 / TopBar scroll blur / BackToTop FAB / Class detail page 강화 / Jinryeong featured + tier stack / Systems (스킬/제련) page / Dungeon page / Payment 가이드 page / Event/이벤트 page / Tips 확장 + 7-day Roadmap / Advanced (메커니즘) page / source 누락 이미지 5장 이식 (app-icon + banner-baekgwi + banner-infinite-gear + skills-list-swordsman + Google Play 9장은 추후). **Out**: V1-V3 인프라 변경, 새 비즈니스 features, GraphQL (V3 carry 유지). |

---

## §3. 격차 매트릭스 — source vs 현재 (정량)

### 3.1 디자인 토큰 매트릭스

| 토큰 | source | 현재 | 격차 |
|------|--------|------|:---:|
| `--ink-base` `#07070b` | ✅ | ✅ | OK |
| `--ink-elev` `#0e0e15` | ✅ | ✅ | OK |
| `--bronze` `#c89968` | ✅ | ✅ | OK |
| `--jade` `#7eb6a8` | ✅ | ✅ | OK |
| `--vermilion` `#c87870` | ✅ | ✅ | OK |
| `--indigo` `#8b8bc5` | ✅ | ✅ | OK |
| `--ease-out` cubic-bezier | ✅ | ⚠️ Tailwind 기본 ease 사용 | M |
| `--dur-fast/base/slow` 200/400/700ms | ✅ | ⚠️ Tailwind duration-* 사용 | M |
| `--rhythm` clamp(56px, 9vw, 96px) | ✅ | ❌ 미존재 | **MAJ** |
| `--container-max` 1140px | ✅ `max-w-screen-xl` (1280px) | ⚠️ 격차 | m |
| Pretendard Variable subset | ✅ CDN | ✅ 로컬 fonts | OK |
| JetBrains Mono | ✅ | ✅ | OK |
| Body 백그라운드 fixed radial gradient + dot pattern | ✅ `body::before/::after` | ❌ globals.css 미존재 | **MAJ** |
| 스크롤바 커스텀 (bronze 18%/35%) | ✅ | ❌ | m |
| `::selection` bronze | ✅ | ❌ | m |
| `prefers-reduced-motion` 가드 | ✅ 3건 | ⚠️ 부분 | m |
| Drift 30s ease-in-out 백그라운드 애니메이션 | ✅ | ❌ | m |

### 3.2 컴포넌트 매트릭스

| 컴포넌트 | source CSS class | 현재 React | 격차 |
|---------|------------------|----------|:---:|
| **TopBar** scroll blur | `.topbar.scrolled` | `<TopBar>` 정적 | **MAJ** |
| **Hero** backdrop 마퀴 (6 배너 듀얼) | `.hero-backdrop-row` | `<Image fill opacity-30>` 1장 | **CRIT** |
| **Hero** app icon + rating + stats | `.hero-app-icon` + `.hero-app-rating` + `.hero-stats` | 부재 | **MAJ** |
| **Hero** scroll hint (bob animation) | `.hero-scroll-hint` | 부재 | m |
| **Section** eyebrow ("01 · Overview") | `.section-eyebrow` | 부재 | **MAJ** |
| **GlassCard** mouse-following gradient | `.glass[data-interactive]` + `--mx/--my` | `<GlassCard interactive>` 기본 hover만 | **MAJ** |
| **Reveal on scroll** stagger 5단계 | `.reveal[data-delay]` | 부재 | **MAJ** |
| **TOC grid** | `.toc-grid` (auto-fill 240px) | 부재 | m |
| **Showcase marquee** (스크린샷) | `.showcase-marquee` 40s | 부재 | m |
| **Class banner + accent stripe** | `.class-card[data-class]` | `<ClassCard>` 단순 | **MAJ** |
| **Stat row** (4 cell grid) | `.stat-row` + `.stat-cell` | 부재 | **MAJ** |
| **Pros-cons** 2-column | `.pros-cons-col.pros/.cons` | 부재 | **MAJ** |
| **Combo tray** + chip-row | `.combo-tray` + `.chip` | 부재 | **MAJ** |
| **Featured Jinryeong** (280px+1fr) | `.featured-jinryeong` | 부재 | **CRIT** |
| **Tier stack** (0/1/2 stripe) | `.tier-row[data-tier]` | `<TierStripe>` 부분 | M |
| **Inline shot + caption** | `.inline-shot` | 부재 | **MAJ** |
| **Split (2/3 col)** | `.split.split-2/3` | 부재 | m |
| **Note 3 variant** info/warn/tip | `.note.info/.warn/.tip` | ✅ `<Note variant>` | OK |
| **Trap card** | `.trap-card` + `.trap-label.warn/.fix` | 부재 | **MAJ** |
| **Table-wrap** (가로 스크롤 + pill 등급) | `.table-wrap` + `.pill-rare/.ssr/.sr` | 부재 | **MAJ** |
| **Preset grid + rank** | `.preset` + `.preset-rank` | 부재 | m |
| **Priority flow** (1→2→3 step) | `.flow-step` | 부재 | **MAJ** |
| **Pay tier** (f2p/low/mid) + 누적 list | `.pay-tier[data-tier]` + `.pay-list` | 부재 | **CRIT** |
| **Event list** (jade tag + name + desc) | `.event` + `.event-tag` | 부재 | **MAJ** |
| **Tips grid** (4-col auto-fit) | `.tips-grid` + `.tip-card` | ✅ 부분 (3 preview만) | m |
| **Roadmap** (7-day list + DAY counter) | `.roadmap` | 부재 | **MAJ** |
| **Lightbox** (data-zoom 클릭 + ESC) | `.lightbox` + `data-zoom` | 부재 | **MAJ** |
| **Back-to-top** FAB (24px) | `.totop` | 부재 | m |
| **Footer** source-list (3-col auto-fit) + footnote | `footer.bottom` | ✅ 부분 | M |

**총 28 컴포넌트**: source 28종 vs 현재 ~6종 사용 → **22 항목 격차** (Critical 3, Major 13, Minor 6).

### 3.3 페이지 매트릭스

| 페이지 | source 섹션 | 현재 라우트 | 격차 |
|--------|------------|----------|:---:|
| 메인 | TOC + Overview + (모든 섹션 anchor) | `app/page.tsx` 위키 카테고리 그리드 + Tips 3 | **CRIT** |
| 직업 | Class (3 카드 × ~150줄 콘텐츠) | `app/class/page.tsx` 단순 리스트 | **MAJ** |
| 진령 | Jinryeong (tier 0/1/2 + 서해용왕 featured + catalog 이미지) | `app/jinryeong/page.tsx` 11 카드 | **MAJ** |
| 시스템 (스킬/제련) | Systems (스킬 3 계열 카드 + 제련) | `app/skill/page.tsx` (V2 시드) | **MAJ** |
| 던전 | Dungeon (협동/PvP/대마왕/백귀 4 카드 + 일과 표) | `app/content/page.tsx` 부분 | **MAJ** |
| 과금 | Payment (f2p/low/mid 3 tier + 우선순위 + 비용표) | 부재 | **CRIT** |
| 이벤트 | Event (이벤트 5건 + 쿠폰 안내) | `app/coupon/page.tsx` 쿠폰만 | **MAJ** |
| 팁 | Tips (4 카드 + 7-day roadmap) | `app/tips/page.tsx` (V2 시드) | M |
| 고급 | Advanced (메커니즘 6 sub-section, ~289줄) | 부재 | **CRIT** |
| Footer | 출처 리스트 + footnote | `<Footer>` 단순 | M |

**총 10 페이지**: 4 CRIT + 4 MAJ + 2 M.

### 3.4 자산 매트릭스

| 자산 | source | 현재 | 격차 |
|------|--------|------|:---:|
| `app-icon.webp` 512×512 | ✅ | ❌ | **CRIT** |
| `banner-fantasy-explore.webp` | ✅ | ✅ | OK |
| `banner-coop-battle.webp` | ✅ | ✅ | OK |
| `banner-demon-king.webp` | ✅ | ✅ | OK |
| `banner-infinite-gear.webp` | ✅ | ❌ | **MAJ** |
| `banner-baekgwi.webp` | ✅ | ❌ | **MAJ** |
| `banner-korean-carry.webp` | ✅ | ✅ | OK |
| `catalog-jinryeong-ssr.webp` | ✅ | ✅ | OK |
| `jinryeong-detail-yongwang.webp` | ✅ | ✅ | OK |
| `skills-list-swordsman.webp` | ✅ | ❌ | **MAJ** |
| Google Play 9장 screenshot-{01-09}.webp | spec only | ❌ | m (Showcase carry) |
| `favicon.ico` + `apple-touch-icon` + OG image | spec | ❌ | **CRIT** |

### 3.5 인터랙션 매트릭스

| 인터랙션 | source | 현재 | 격차 |
|----------|--------|------|:---:|
| Smooth scroll for in-page anchors (60px offset) | ✅ | CSS `scroll-behavior: smooth`만 | m |
| Topbar scroll blur (24px threshold) | ✅ | ❌ | **MAJ** |
| IntersectionObserver reveal-on-scroll (12% threshold, -8% rootMargin) | ✅ | ❌ | **MAJ** |
| Glass card mouse-following gradient (`--mx/--my` 비율) | ✅ | ❌ | **MAJ** |
| Lightbox (data-zoom 클릭, ESC, body scroll lock, hiRes URL swap) | ✅ | ❌ | **MAJ** |
| Back-to-top FAB (600px threshold) | ✅ | ❌ | m |
| Marquee animation (70s/90s linear infinite, pause on hover) | ✅ | ❌ | **MAJ** |
| Bob animation (scroll hint) | ✅ | ❌ | m |
| Hero app icon hover scale + rotate | ✅ | ❌ | m |
| Class banner hover scale 1.04 | ✅ | ❌ | m |
| `prefers-reduced-motion` 가드 | ✅ 3건 | ⚠️ 부분 | m |

---

## §4. Sprint V4 — 6 Phase WBS (단일 세션 압축 실행)

L4 자동 모드로 단일 세션 압축 실행 가능한 형태. 36주 분량을 단일 세션에 압축.

```
P0 사전 — V3 archive 확정 + V4 sprint state 등록
P1 Plan — 본 문서 + plan-execution.md + 자산 인벤토리
P2 Design — 디자인 토큰 v3 매트릭스 + 28 컴포넌트 spec
P3 Do — 5 sub-phase:
  P3.A Foundation — favicon + OG + manifest + globals.css 격차 + container/rhythm 토큰
  P3.B Interaction — TopBar scroll blur + RevealOnScroll + GlassCard mouse-gradient + Lightbox + BackToTop + 마퀴
  P3.C Hero + Home — Hero backdrop 듀얼 마퀴 + app icon block + stats + section-eyebrow + 메인 페이지 재구성
  P3.D Class + Jinryeong 강화 — stat-row + pros-cons + combo-tray + featured-jinryeong + tier 강화
  P3.E Systems/Dungeon/Payment/Event/Tips/Advanced 페이지 — 6 신규/강화 페이지 + roadmap + trap card + pay-tier + event + advanced
P4 Check — gap-detector + Lighthouse + WCAG AA + 반응형 검증
P5 Act — Critical/Major iterate
P6 QA — 7-Layer (UI 흐름) + E2E 시나리오
P7 Report — V4 종합 + KPI
P8 Archive — tag v4.0.0-v4-archived
```

---

## §5. Phase 별 상세 WBS

### 5.1 Phase 0: 사전 (코드 0 / 문서 0.5h)

- [ ] V3 (`v3.0.0-v3-archived`) tag 확인 ✅ 이미 완료
- [ ] V4 sprint dir 생성 ✅ `docs/sprint/06-sprint-v4/`
- [ ] 본 master-plan + plan-execution.md 작성 (본 문서)

### 5.2 Phase 1: Plan (문서 1h)

- [ ] **MASTER-PLAN.md** (본 문서) ← 완료 시
- [ ] **plan-execution.md** — 단일 세션 압축 실행 범위 정의
- [ ] **asset-inventory.md** — source 11 이미지 + 누락 5장 식별 + 변환 절차
- [ ] **design-token-diff.md** — source vs Tailwind config 토큰 매핑

### 5.3 Phase 2: Design (문서 2h)

- [ ] **`docs/sprint/06-sprint-v4/design.md`** — 28 컴포넌트 spec (props + variants + accessibility + reduced-motion)
- [ ] **`phase-2-design/interactions-spec.md`** — 5 client hooks (useScrollBlur / useReveal / useMouseGradient / useLightbox / useBackToTop) + marquee CSS animation 명세
- [ ] **`phase-2-design/content-port-plan.md`** — source 11 sections → Next.js 라우트 매핑 + 콘텐츠 검수 정책 (D2 70/30: 운영자 30% + UGC 70% 유지)

### 5.4 Phase 3: Do — 5 Sub-Phase

#### 5.4.1 Sub-Phase 3.A — Foundation (코드 2h)

**산출물**:
- [ ] `app/icon.tsx` (Next.js 16 metadata file) — app-icon.webp 기반 256×256
- [ ] `app/apple-icon.tsx` — 180×180
- [ ] `app/opengraph-image.tsx` — 1200×630 (Hero 배너 + 텍스트)
- [ ] `app/manifest.ts` (PWA manifest) — icons + theme_color + display=standalone
- [ ] `public/images/wiki/app-icon.webp` (source 복사)
- [ ] `public/images/wiki/banner-baekgwi.webp` (source 복사)
- [ ] `public/images/wiki/banner-infinite-gear.webp` (source 복사)
- [ ] `public/images/wiki/skills-list-swordsman.webp` (source 복사)
- [ ] `app/globals.css` 확장 — body::before 듀얼 radial gradient + ::after dot pattern + 스크롤바 + ::selection + drift 애니메이션 + reduced-motion 가드
- [ ] `tailwind.config.ts` 확장 — `--rhythm`, `--container-max`, `--ease-out`, `--dur-fast/base/slow` 토큰 등록

#### 5.4.2 Sub-Phase 3.B — Interaction Primitives (코드 3h)

**산출물**:
- [ ] `hooks/use-scroll-blur.ts` — Topbar blur (24px threshold) + reduced-motion 가드
- [ ] `hooks/use-reveal-on-scroll.ts` — IntersectionObserver (12% threshold, -8% rootMargin)
- [ ] `hooks/use-mouse-gradient.ts` — `--mx/--my` percent 계산 + ref attach
- [ ] `hooks/use-lightbox.ts` — open/close + body scroll lock + ESC + click outside
- [ ] `hooks/use-back-to-top.ts` — 600px threshold visibility
- [ ] `components/ui/marquee.tsx` — CSS animation 단일 row + dual row props (gap / duration / direction / pause-on-hover)
- [ ] `components/feature/scroll-blur-topbar.tsx` — 기존 `<TopBar>` 강화
- [ ] `components/feature/reveal.tsx` — `<Reveal delay={1..5}>` wrapper (`opacity/translateY` Tailwind transition)
- [ ] `components/feature/lightbox-provider.tsx` — Context + `<LightboxRoot>` (Next.js Image 호환)
- [ ] `components/feature/back-to-top.tsx` — FAB (24px bottom-right)

#### 5.4.3 Sub-Phase 3.C — Hero + Home 재구성 (코드 3h)

**산출물**:
- [ ] `components/domain/hero-backdrop.tsx` — 듀얼 row 마퀴 (r1 70s + r2 90s reverse + -6deg rotate + radial overlay)
- [ ] `components/domain/hero-app-block.tsx` — app-icon 86×86 + name + rating (★ 4.8 + dot + 64K reviews + 500K+ 다운로드)
- [ ] `components/domain/hero-stats.tsx` — 4 cell grid (직업/진령/시스템/도전)
- [ ] `components/domain/section-head.tsx` — `<SectionEyebrow num="01" label="Overview" />` + `<SectionTitle>` + `<SectionLead>`
- [ ] `app/page.tsx` 재구성 — Hero (backdrop+app-block+stats) + TOC + Overview (split 2-col + 카드 2 + Note tip) + 위키 카테고리 grid (보존) + Featured Tips (확장) + Roadmap preview link
- [ ] 모바일 fine-tuning — `@media (max-width:600px)` hero-stats 1fr 1fr / hero-app-icon 70px

#### 5.4.4 Sub-Phase 3.D — Class + Jinryeong 강화 (코드 4h)

**산출물 — Class 페이지**:
- [ ] `components/domain/class-card-v3.tsx` — banner (140px image + accent stripe 3px + 90deg accent overlay) + body (header + desc + stat-row 4-cell + pros-cons 2-col + combo-tray + chip-row)
- [ ] `data/wiki/class-detail.ts` — 3 직업 (전사/검객/영매) × 콘텐츠 (subtitle/desc/stats/pros/cons/combo/note) 1:1 source 이식
- [ ] `app/class/page.tsx` 재구성 — section-head + 3 ClassCardV3 + 결론 Note + 진단 CTA
- [ ] `app/class/[slug]/page.tsx` (선택) — 개별 직업 상세 (skills-list 이미지 + 추천 빌드 templates)

**산출물 — Jinryeong 페이지**:
- [ ] `components/domain/featured-jinryeong.tsx` — `featured-jinryeong-img` (280px+1fr / mobile aspect-ratio 16:9) + body
- [ ] `components/domain/tier-stack.tsx` — `tier-row[data-tier]` 0/1/2 stripe + tier-color CSS variable + tier-chars grid
- [ ] `components/domain/jinryeong-catalog-image.tsx` — Inline shot + caption + lightbox 호환
- [ ] `data/wiki/tier-list.ts` — 2026.05 메타 기준 tier 0 (홍길동), 1 (서해용왕/항아/...), 2 (...)
- [ ] `app/jinryeong/page.tsx` 재구성 — section-head + 티어 + featured (서해용왕) + split (catalog 이미지 + 핵심 진령 카드) + 시너지 Note
- [ ] `app/jinryeong/[id]/page.tsx` (선택) — 11 진령 개별 상세 (현재 보존 + 강화)

#### 5.4.5 Sub-Phase 3.E — 6 신규/강화 페이지 (코드 5h)

**Systems (`app/systems/page.tsx` 또는 `app/skill/page.tsx` 강화)**:
- [ ] section-head + 인라인 스킬 list image + 3 계열 카드 (격투/원소/지원) + 제련 시스템 explainer + 우선순위 flow (1→2→3→4)

**Dungeon (`app/dungeon/page.tsx` 또는 `app/content/page.tsx` 강화)**:
- [ ] section-head + 인라인 협동 image + 4 모드 카드 2×2 grid (협동/PvP/대마왕/백귀) + 일과 표 (table-wrap + pill 등급)

**Payment (`app/payment/page.tsx` NEW)**:
- [ ] section-head + 3 pay-tier (f2p/low/mid + jade/bronze/vermilion accent) + 우선순위 counter list + 비용표 (table)
- [ ] V2 프리미엄 ₩4,900/월 통합 안내 + 외부 패키지 비교 표
- [ ] `components/domain/pay-tier-card.tsx` + `pay-list` counter pattern

**Event (`app/event/page.tsx` NEW)**:
- [ ] section-head + 이벤트 list 5건 (event-tag + name + desc) + 쿠폰 CTA (V2 `/coupon` 통합)
- [ ] `components/domain/event-card.tsx` (jade tag + name + desc)

**Tips (`app/tips/page.tsx` 확장)**:
- [ ] section-head + 4 tip-card grid (auto-fit 260px) + **7-day roadmap** (counter "DAY 1" border-top stack)
- [ ] `data/wiki/roadmap.ts` — 7일 운영 일과 (DAY 1: 빠른 진도, DAY 2: 쿠폰 + 진령 뽑기, ...)
- [ ] `components/domain/roadmap.tsx` (`<ol class="roadmap">` semantic)

**Advanced (`app/advanced/page.tsx` NEW)**:
- [ ] source 2087-2380줄 (289줄) — 메커니즘 디테일 6 sub-section
  - 직업별 핵심 스킬 (검객 skills-list 이미지 + 검기/공중 칼 메커니즘)
  - 진령 시너지 디테일 (서해용왕 치명타 회심 발동 조건)
  - 자동 사냥 함정 (trap-card 5-7건)
  - 명왕 vs 음영귀 보스전 선택
  - 제련 강화 확률 + 비용 누적 표
  - 결투장 메타 카운터 (table)
- [ ] `components/domain/trap-card.tsx` (warn / fix 2 variant)
- [ ] `data/wiki/advanced.ts` (서브 섹션별 콘텐츠)

### 5.5 Phase 4: Check (검증 2h)

- [ ] gap-detector — source 28 컴포넌트 vs V4 구현
- [ ] code-analyzer — 보안/성능/Clean Architecture
- [ ] Lighthouse Mobile (≥85)
- [ ] WCAG AA (axe-core 자동 또는 수동 5 페이지)
- [ ] **반응형 검증** — Chrome MCP DevTools 480px / 720px / 1024px / 1440px 4-breakpoint screenshot
- [ ] **prefers-reduced-motion 검증** — 마퀴/reveal/drift 모두 정지
- [ ] **i18n 페이지 마이그레이션** (V2 carry) — `app/[locale]/*` 구조 도입 또는 V4 carry 결정

### 5.6 Phase 5: Act (iterate 1-2h)

P4 Critical/Major iterate.

### 5.7 Phase 6: QA (검증 1h)

- [ ] 7-Layer dataFlowIntegrity (UI 흐름 — Server Component → Client hooks → Firestore read → revalidate)
- [ ] E2E 5 시나리오:
  - 첫 방문 → favicon 표시 → Hero 마퀴 → reveal 애니메이션 → 위키 카테고리 클릭
  - Class 페이지 → mouse-following gradient → combo-tray chip → 결론 Note
  - Jinryeong → featured 서해용왕 클릭 → lightbox 확대 → ESC 닫기
  - Mobile (480px) → hamburger menu (현재 hidden) → TOC scroll → bottom totop
  - Advanced trap-card warn/fix 5건 + 메커니즘 table

### 5.8 Phase 7: Report (문서 1h)

- [ ] V4 종합 보고서
- [ ] KPI: Lighthouse / WCAG / 콘텐츠 풍부도 / 마퀴 + reveal + lightbox 작동 수
- [ ] V5 carry (i18n 페이지 마이그, Google Play 9 스크린샷 이식 등)

### 5.9 Phase 8: Archive (0.5h)

- [ ] tag `v4.0.0-v4-archived`
- [ ] README ARCHIVED 상태 반영
- [ ] V5 인풋 정리 (i18n 마이그 + 콘텐츠 추가 + GraphQL)

---

## §6. Quality Gates (V4 신규)

| Gate | 목표 | 검증 방법 |
|:----:|------|----------|
| M0 TypeScript strict | 0 errors | pnpm typecheck |
| M1 Firestore rules 변동 | 0 (인프라 보존) | grep diff |
| M2 Server Action 표준 | 변동 0 (인프라 보존) | grep diff |
| M3 보안 | XSS 방어 (lightbox img src sanitize 등) | code-analyzer |
| **M4 디자인 토큰 정합** (V4 신규) | source vs Tailwind 1:1 매핑 | design-token-diff.md |
| M5 Match Rate ≥90% | source 28 컴포넌트 → V4 구현 매핑 ≥25/28 | gap-detector |
| **M6 Lighthouse Mobile ≥85** | desktop ≥90 | lighthouse-cli |
| **M7 반응형 검증** (V4 핵심) | 480/720/1024/1440 4-breakpoint 통과 | Chrome MCP screenshot |
| M7 WCAG AA | axe-core 0 critical | axe-core 또는 manual 5 페이지 |
| **M8 Interaction 5종** (V4 핵심) | 마퀴 + reveal + mouse-gradient + lightbox + totop 모두 동작 + reduced-motion 가드 | E2E |
| M9 GA4 새 이벤트 | `hero_marquee_pause` / `lightbox_open` / `class_combo_hover` / `roadmap_day_view` 4종 신규 (선택) | logEvent 검증 |
| **M11 favicon + OG image** (V4 핵심) | Next.js metadata files 4종 모두 생성 | 빌드 output 확인 |
| M10 Budget ≤$100/월 | 변동 0 (이미지 자산 정적) | - |

---

## §7. 컴포넌트 인벤토리 (28종 신규/강화)

### 7.1 Interaction primitives (5 hooks + 5 components — Sub-Phase 3.B)

| ID | 이름 | 위치 | 의존 |
|----|------|------|------|
| H1 | useScrollBlur | hooks/ | none |
| H2 | useRevealOnScroll | hooks/ | none |
| H3 | useMouseGradient | hooks/ | none |
| H4 | useLightbox | hooks/ | next/navigation |
| H5 | useBackToTop | hooks/ | none |
| C1 | ScrollBlurTopBar | components/feature/ | H1 |
| C2 | Reveal | components/feature/ | H2 |
| C3 | LightboxProvider + LightboxRoot | components/feature/ | H4 |
| C4 | BackToTop | components/feature/ | H5 |
| C5 | Marquee (dual row) | components/ui/ | CSS only |

### 7.2 Domain components (15 신규/강화 — Sub-Phase 3.C-E)

| ID | 이름 | 위치 |
|----|------|------|
| D1 | HeroBackdrop | components/domain/ |
| D2 | HeroAppBlock | components/domain/ |
| D3 | HeroStats | components/domain/ |
| D4 | SectionHead (Eyebrow + Title + Lead) | components/domain/ |
| D5 | ClassCardV3 (banner + stat-row + pros-cons + combo-tray) | components/domain/ |
| D6 | FeaturedJinryeong | components/domain/ |
| D7 | TierStack | components/domain/ |
| D8 | InlineShot (caption + lightbox 호환) | components/domain/ |
| D9 | TrapCard (warn/fix) | components/domain/ |
| D10 | PayTierCard (f2p/low/mid) | components/domain/ |
| D11 | EventCard | components/domain/ |
| D12 | Roadmap (DAY counter) | components/domain/ |
| D13 | PriorityFlow (1→2→3 step) | components/domain/ |
| D14 | ChipRow (chip + role) | components/domain/ |
| D15 | TocItem (num + text + desc) | components/domain/ |

### 7.3 Layout enhancements (3)

| ID | 이름 |
|----|------|
| L1 | `app/icon.tsx` + `app/apple-icon.tsx` + `app/opengraph-image.tsx` + `app/manifest.ts` |
| L2 | `app/globals.css` 확장 (body bg + 스크롤바 + selection + drift) |
| L3 | `tailwind.config.ts` 확장 (rhythm/container-max/ease/duration) |

---

## §8. 페이지 매트릭스 (10 페이지 신규/강화)

| 페이지 | 경로 | 사용 컴포넌트 | source 라인 | 추정 코드 |
|--------|------|--------------|----------:|---------:|
| Home | `/` | Hero (D1-D3) + SectionHead + ClassCard preview + TocItem + Reveal | 1218-1325 | 250줄 |
| Class | `/class` | SectionHead + ClassCardV3 ×3 + Reveal + Note | 1326-1527 | 320줄 |
| Class detail | `/class/[slug]` | ClassCardV3 expanded + skill list image + 추천 빌드 | (carry from /skill) | 180줄 |
| Jinryeong | `/jinryeong` | SectionHead + TierStack + FeaturedJinryeong + InlineShot + Reveal | 1528-1721 | 300줄 |
| Systems | `/systems` (또는 `/skill` 확장) | SectionHead + InlineShot + 3 ClassCard 변형 + PriorityFlow | 1723-1835 | 250줄 |
| Dungeon | `/dungeon` (또는 `/content` 확장) | SectionHead + InlineShot + 4 카드 grid + table + pill | 1837-1900 | 220줄 |
| Payment | `/payment` (NEW) | SectionHead + 3 PayTierCard + PriorityFlow + 비용 table | 1902-1977 | 240줄 |
| Event | `/event` (NEW) | SectionHead + EventCard ×5 + 쿠폰 CTA (V2 통합) | 1979-2012 | 180줄 |
| Tips | `/tips` (확장) | SectionHead + 4 TipCard + Roadmap | 2014-2085 | 200줄 |
| Advanced | `/advanced` (NEW) | SectionHead + 6 sub-section + InlineShot + TrapCard ×7 + table | 2087-2378 | 380줄 |

**총 신규/강화**: 10 페이지 / ~2520줄 코드.

---

## §9. 작업 시간 추정 (단일 세션 압축)

| Phase | 시간 (h) | 운영자 | AI |
|-------|---------|------|-----|
| P0 사전 | 0.5 | 0.5 | 0 |
| P1 Plan | 1 | 0.5 | 0.5 |
| P2 Design | 2 | 0.5 | 1.5 |
| P3.A Foundation | 2 | 0.5 | 1.5 |
| P3.B Interaction | 3 | 0 | 3 |
| P3.C Hero + Home | 3 | 0.5 | 2.5 |
| P3.D Class + Jinryeong | 4 | 0.5 | 3.5 |
| P3.E 6 페이지 | 5 | 0.5 | 4.5 |
| P4 Check | 2 | 0.5 | 1.5 |
| P5 Act | 1.5 | 0 | 1.5 |
| P6 QA | 1 | 0 | 1 |
| P7 Report | 1 | 0 | 1 |
| P8 Archive | 0.5 | 0.5 | 0 |
| **합계** | **26.5** | **4** | **22.5** |

L4 자동 모드 단일 세션 압축 시 운영자 부담은 ~4h (master-plan 검토 + Phase gate 승인 + tag).

---

## §10. Auto-Pause Triggers (V4 임계값)

| Trigger | V4 임계값 | 액션 |
|---------|---------|----|
| QUALITY_GATE_FAIL | M5 Match Rate <90% | iterate (P5) |
| ITERATION_EXHAUSTED | P5 iterate 5회 후 Match <90% | 우선순위 재조정 + V5 carry |
| BUDGET_EXCEEDED | 인프라 비용 +$10/월 | 이미지 CDN 정책 재검토 |
| PHASE_TIMEOUT | P3.E 8h 초과 | sub-feature carry로 강등 |

---

## §11. 운영자 수동 게이트

| Phase 전환 | 결정 |
|---------|----|
| P1 → P2 | 본 master-plan 운영자 검토 + scope 확정 |
| P2 → P3 | design.md 28 컴포넌트 spec 검토 |
| P3.A → P3.B | favicon / OG image 시각 검증 (browser tab + LinkedIn preview) |
| P3.C → P3.D | Hero + Home 시각 검증 (Chrome MCP screenshot 4-breakpoint) |
| P3.D → P3.E | Class + Jinryeong 시각 검증 |
| P3.E → P4 | 5 신규 페이지 시각 검증 |
| P5 → P6 | iterate 결과 검토 |
| P7 → P8 | V4 종합 보고서 검토 + tag |

---

## §12. V4 졸업 조건 (PASS / 보류 / 폐기)

| 항목 | PASS | 보류 | 폐기 |
|------|------|------|------|
| Match Rate | ≥90% | 80-90% | <80% |
| Lighthouse Mobile | ≥85 | 75-85 | <75 |
| 반응형 4-breakpoint | 4/4 통과 | 3/4 | <3 |
| Interaction 5종 | 5/5 + reduced-motion 가드 | 4/5 | <4 |
| favicon + OG image | 4 metadata files 생성 + tab 노출 검증 | 3/4 | <3 |
| Critical issues | 0 | 1 | ≥2 |

PASS 시 V5 진입 또는 운영자 영업 단계 재개. 보류 시 V4.5 iterate. 폐기 시 source 디자인 부분만 carry (V5에서 다시).

---

## §13. V5 carry (V4 종료 후)

| # | 항목 | 비고 |
|--:|------|------|
| 1 | i18n 페이지 마이그레이션 (`app/[locale]/*`) | V2 carry 누적 |
| 2 | Google Play 9 screenshot 이식 + Showcase marquee 추가 | source ASSETS.md C |
| 3 | GraphQL endpoint (Pro+ 라이선스 협상 카드) | V3 carry |
| 4 | LinkedIn CSV / 잡코리아 RSS / Sensor Tower PDF adapter | V3 운영자 게이트 |
| 5 | Slack/이메일 alarm (Vercel cron + Resend) | V3 carry |
| 6 | a11y axe-core 자동 테스트 | V3 carry |
| 7 | B2B API IP brute force 한도 | V3 carry |
| 8 | API Key JWT exchange (refresh token) | V3 carry |
| 9 | CA-m2 잔여 catch 표준화 | V2 carry |
| 10 | 콘텐츠 깊이 확장 — 직업별 빌드 가이드 × 3 + 진령 11 individual 페이지 | source 자체에 없는 추가 콘텐츠 |

---

## §14. 위험 + 완화

| Risk | 확률 | 영향 | 완화 |
|------|:---:|:---:|------|
| Hydration mismatch (Server vs Client useEffect) | 중 | 중 | 모든 interaction을 client component로 격리 + `use client` 명시 |
| Marquee bundle size 증가 | 중 | 저 | CSS animation only (JS 없음) + reduce-motion fallback |
| source 콘텐츠 운영자 미검증 정보 노출 | 저 | 중 | 운영자가 P3 단계마다 콘텐츠 검수 + D2 70/30 정책 유지 |
| Lighthouse 회귀 (이미지 + 애니메이션 증가) | 중 | 중 | Next.js Image priority/loading + CSS animation only (GPU accel) |
| WCAG AA 회귀 (텍스트 콘트라스트 + reduced-motion) | 저 | 중 | reduced-motion 가드 + 색상 검수 + axe-core P6 |
| 단일 세션 토큰 초과 | 중 | 중 | Sub-Phase 단위 commit + sprint state 보존 |
| 운영자 부담 (콘텐츠 검수 4h) | 중 | 저 | 미검증 콘텐츠는 V4 baseline + V5 운영자 보강 |

---

## §15. 다음 단계

운영자가 본 master-plan을 검토 후:

1. ✅ **scope OK** → P1 plan-execution.md + asset-inventory.md + design-token-diff.md 작성 진행
2. ⚠️ **scope 축소** → 우선순위 재산정 (Foundation + Interaction + Hero/Home만 V4, 나머지 V5 carry)
3. ❌ **scope 확장** → V4 + Showcase + Google Play 9장 이식 + 직업/진령 individual 페이지 모두 포함

권고: **option 1 (full scope)** — L4 자동 모드 단일 세션 ~26.5h로 source 100% 회수 가능.

---

> **Status**: Draft v1.0 (운영자 검토 대기) — 2026-05-16
> 다음 산출물: `plan-execution.md` (단일 세션 압축 실행 범위 확정) + `phase-2-design/{interactions-spec,content-port-plan,asset-inventory,design-token-diff}.md`
